import base64
import json
import logging
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict

import cloudinary
import cloudinary.uploader
import requests
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.genai import Client as GeminiClient
from google.genai import types as genai_types
from google.oauth2 import service_account

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

class ConfigurationError(ValueError):
    pass

class ApiServiceError(Exception):
    pass

class AppConfig:
    def __init__(self):
        def _get_env(key: str) -> str:
            value = os.getenv(key)
            if not value:
                raise ConfigurationError(f"Environment variable '{key}' is not set.")
            return value

        self.vertex_project_id = _get_env("VERTEX_PROJECT_ID")
        self.vertex_location = _get_env("VERTEX_LOCATION")
        self.google_credentials_base64 = _get_env("GOOGLE_CREDENTIALS_BASE64")
        self.gemini_api_key = _get_env("GEMINI_API_KEY")
        self.cloudinary_cloud_name = _get_env("CLOUDINARY_CLOUD_NAME")
        self.cloudinary_api_key = _get_env("CLOUDINARY_API_KEY")
        self.cloudinary_api_secret = _get_env("CLOUDINARY_API_SECRET")

        self.models = {
            "vertex_image": "imagen-4.0-fast-generate-preview-06-06",
            "gemini_image": "gemini-2.0-flash-preview-image-generation",
            "music": "lyria-002",
            "video": "veo-3.0-generate-preview",
        }
        self.limits = {
            "max_music_duration": 30,
            "default_music_duration": 20,
            "max_video_duration": 10,
            "default_video_duration": 8,
        }
        self.allowed_aspect_ratios = {
            "image": {"1:1", "9:16", "16:9", "3:4", "4:3"},
            "video": {"16:9", "9:16", "1:1"},
        }
        self.cloudinary_config = {
            "cloud_name": self.cloudinary_cloud_name,
            "api_key": self.cloudinary_api_key,
            "api_secret": self.cloudinary_api_secret,
        }

class GoogleAuth:
    def __init__(self, credentials_base64: str):
        try:
            decoded_creds = base64.b64decode(credentials_base64)
            creds_info = json.loads(decoded_creds)
            self._credentials = service_account.Credentials.from_service_account_info(
                creds_info
            ).with_scopes(["https://www.googleapis.com/auth/cloud-platform"])
        except (json.JSONDecodeError, TypeError, ValueError, base64.binascii.Error) as e:
            raise ConfigurationError(f"Invalid Google credentials format: {e}")

    def get_token(self) -> str:
        self._credentials.refresh(GoogleAuthRequest())
        if not self._credentials.token:
            raise ApiServiceError("Failed to retrieve Google auth token.")
        return self._credentials.token

class CloudinaryClient:
    def __init__(self, config: Dict):
        cloudinary.config(**config)

    def upload_video(self, video_bytes: bytes) -> str:
        try:
            upload_result = cloudinary.uploader.upload(video_bytes, resource_type="video")
            return upload_result.get("secure_url")
        except Exception as e:
            raise ApiServiceError(f"Cloudinary video upload failed: {e}")

    def upload_image(self, image_bytes: bytes) -> str:
        try:
            upload_result = cloudinary.uploader.upload(image_bytes)
            return upload_result.get("secure_url")
        except Exception as e:
            raise ApiServiceError(f"Cloudinary image upload failed: {e}")

class VertexAIClient:
    def __init__(self, config: AppConfig, auth: GoogleAuth):
        self.config = config
        self.auth = auth
        self.base_url = (
            f"https://{config.vertex_location}-aiplatform.googleapis.com/v1/projects/"
            f"{config.vertex_project_id}/locations/{config.vertex_location}/publishers/google/models"
        )

    def _make_api_call(self, model_id: str, body: Dict, endpoint: str, timeout: int = 60) -> Dict:
        url = f"{self.base_url}/{model_id}:{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.auth.get_token()}",
            "Content-Type": "application/json; charset=utf-8",
        }
        try:
            response = requests.post(url, headers=headers, json=body, timeout=timeout)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            logger.error(f"Vertex AI HTTP Error: {e.response.status_code} - {e.response.text}")
            raise ApiServiceError(f"Vertex AI API request failed: {e.response.reason}")
        except requests.exceptions.RequestException as e:
            raise ApiServiceError(f"Could not connect to Vertex AI: {e}")

    def generate_image(self, prompt: str, aspect_ratio: str) -> bytes:
        body = {"instances": [{"prompt": prompt}], "parameters": {"aspectRatio": aspect_ratio, "sampleCount": 1}}
        result = self._make_api_call(self.config.models["vertex_image"], body, "predict")
        return base64.b64decode(result["predictions"][0]["bytesBase64Encoded"])

    def generate_music(self, prompt: str, duration: int) -> str:
        body = {"instances": [{"prompt": prompt}], "parameters": {"durationSeconds": str(duration), "sampleCount": 1}}
        result = self._make_api_call(self.config.models["music"], body, "predict", timeout=90)
        return result["predictions"][0]["bytesBase64Encoded"]

    def start_video_generation_job(self, prompt: str, duration: int, aspect_ratio: str) -> str:
        start_body = {
            "instances": [{"prompt": prompt}],
            "parameters": {
                "aspectRatio": aspect_ratio, "durationSeconds": str(duration), "sampleCount": 1,
                "personGeneration": "allow_all", "includeRaiReason": True,
                "addWatermark": True, "generateAudio": True,
            },
        }
        start_response = self._make_api_call(self.config.models["video"], start_body, "predictLongRunning")
        operation_name = start_response.get("name")
        if not operation_name:
            raise ApiServiceError("Failed to start video generation job.")
        return operation_name

    def check_video_generation_status(self, operation_name: str) -> Dict[str, Any]:
        fetch_response = self._make_api_call(self.config.models["video"], {"operationName": operation_name}, "fetchPredictOperation")
        if not fetch_response.get("done"):
            return {"status": "pending"}

        response_data = fetch_response.get("response", {})
        videos_list = response_data.get("videos", [])
        
        if videos_list and "bytesBase64Encoded" in videos_list[0]:
            video_bytes = base64.b64decode(videos_list[0]["bytesBase64Encoded"])
            return {"status": "completed", "data": video_bytes}
        
        rai_reason = response_data.get("raiReason", "Unknown error")
        return {"status": "failed", "reason": f"Video job finished with no data. Reason: {rai_reason}"}

class GeminiImageGenerator:
    def __init__(self, gemini_api_key: str, cloudinary_client: CloudinaryClient, model_name: str):
        self.client = GeminiClient(api_key=gemini_api_key)
        self.cloudinary_client = cloudinary_client
        self.model_name = model_name

    def generate_and_upload(self, prompt: str) -> str:
        contents = [genai_types.Content(role="user", parts=[genai_types.Part.from_text(text=prompt)])]
        config = genai_types.GenerateContentConfig(response_modalities=["IMAGE", "TEXT"], response_mime_type="text/plain")
        try:
            response_stream = self.client.models.generate_content_stream(model=self.model_name, contents=contents, config=config)
            for chunk in response_stream:
                if chunk.candidates and chunk.candidates[0].content.parts[0].inline_data:
                    image_bytes = chunk.candidates[0].content.parts[0].inline_data.data
                    return self.cloudinary_client.upload_image(image_bytes)
        except Exception as e:
            raise ApiServiceError(f"Gemini image generation failed: {e}")
        raise ApiServiceError("No image data was generated by Gemini.")

app = Flask(__name__)
CORS(app)

try:
    config = AppConfig()
    auth = GoogleAuth(config.google_credentials_base64)
    cloudinary_client = CloudinaryClient(config.cloudinary_config)
    vertex = VertexAIClient(config, auth)
    gemini_img = GeminiImageGenerator(config.gemini_api_key, cloudinary_client, config.models["gemini_image"])
except ConfigurationError as e:
    logger.critical(f"FATAL: Application configuration failed. {e}")
    config = auth = vertex = gemini_img = cloudinary_client = None

@app.before_request
def check_config():
    if not config:
        return jsonify({"error": "Server configuration error. See logs for details."}), 503

@app.route("/", methods=["GET"])
def home():
    guide = (
        "Multimodal Generation API\n"
        "Endpoints:\n"
        "  POST /api/generate-image  (prompt, aspect_ratio?)\n"
        "  POST /api/generate-music  (prompt, duration_seconds?)\n"
        "  POST /api/video/start      (prompt, duration_seconds?, aspect_ratio?)\n"
        "  GET  /api/video/status/<operation_id>\n"
    )
    return Response(guide, mimetype="text/plain")

@app.route("/api/generate-image", methods=["POST"])
def generate_image_route():
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Bad Request: 'prompt' is required."}), 400
    prompt = data["prompt"]
    aspect_ratio = data.get("aspect_ratio", "1:1")
    if aspect_ratio not in config.allowed_aspect_ratios["image"]:
        return jsonify({"error": f"Invalid 'aspect_ratio'. Allowed: {config.allowed_aspect_ratios['image']}"}), 400
    try:
        image_bytes = vertex.generate_image(prompt, aspect_ratio)
        image_url = cloudinary_client.upload_image(image_bytes)
        return jsonify({"prompt": prompt, "image_url": image_url, "model_used": config.models["vertex_image"], "aspect_ratio_used": aspect_ratio})
    except (ApiServiceError, Exception) as e:
        logger.error(f"Image generation failed: {e}", exc_info=True)
        return jsonify({"error": "Image generation service failed.", "details": str(e)}), 502

@app.route("/api/generate-music", methods=["POST"])
def generate_music_route():
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Bad Request: 'prompt' is required."}), 400
    prompt = data["prompt"]
    try:
        duration = int(data.get("duration_seconds", config.limits["default_music_duration"]))
        if not 0 < duration <= config.limits["max_music_duration"]:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": f"Invalid 'duration_seconds'. Must be 1-{config.limits['max_music_duration']}."}), 400
    
    results = {}
    errors = {}
    with ThreadPoolExecutor(max_workers=2) as executor:
        future_to_task = {
            executor.submit(gemini_img.generate_and_upload, prompt): "image",
            executor.submit(vertex.generate_music, prompt, duration): "music",
        }
        for future in as_completed(future_to_task):
            task_name = future_to_task[future]
            try:
                results[task_name] = future.result()
            except Exception as e:
                logger.error(f"Error in {task_name} task: {e}", exc_info=True)
                errors[task_name] = str(e)

    if errors:
        return jsonify({"error": "One or more generation tasks failed.", "details": errors}), 502

    return jsonify({
        "prompt": prompt, "image_url": results.get("image"),
        "audio_data_uri": f"data:audio/wav;base64,{results.get('music')}",
        "image_model_used": config.models["gemini_image"], "music_model_used": config.models["music"],
        "duration_used_seconds": duration,
    })

@app.route("/api/video/start", methods=["POST"])
def start_video_route():
    data = request.get_json()
    if not data or "prompt" not in data:
        return jsonify({"error": "Bad Request: 'prompt' is required."}), 400
    
    prompt = data["prompt"]
    aspect_ratio = data.get("aspect_ratio", "16:9")
    if aspect_ratio not in config.allowed_aspect_ratios["video"]:
        return jsonify({"error": f"Invalid 'aspect_ratio'. Allowed: {config.allowed_aspect_ratios['video']}"}), 400
    
    try:
        duration = int(data.get("duration_seconds", config.limits["default_video_duration"]))
        if not 0 < duration <= config.limits["max_video_duration"]:
            raise ValueError()
    except (ValueError, TypeError):
        return jsonify({"error": f"Invalid 'duration_seconds'. Must be 1-{config.limits['max_video_duration']}."}), 400
    
    try:
        full_operation_name = vertex.start_video_generation_job(prompt, duration, aspect_ratio)
        operation_id = full_operation_name.split('/')[-1]
        return jsonify({"operation_id": operation_id})
    except (ApiServiceError, Exception) as e:
        logger.error(f"Video start failed: {e}", exc_info=True)
        return jsonify({"error": "Failed to start video generation job.", "details": str(e)}), 502

@app.route("/api/video/status/<operation_id>", methods=["GET"])
def check_video_status_route(operation_id):
    try:
        full_operation_name = (
            f"projects/{config.vertex_project_id}/locations/{config.vertex_location}/"
            f"publishers/google/models/{config.models['video']}/operations/{operation_id}"
        )
        result = vertex.check_video_generation_status(full_operation_name)

        if result["status"] == "pending":
            return jsonify({"status": "pending"}), 202
        
        if result["status"] == "failed":
            raise ApiServiceError(result["reason"])

        video_bytes = result["data"]
        video_url = cloudinary_client.upload_video(video_bytes)
        return jsonify({"status": "completed", "video_url": video_url})
    except (ApiServiceError, Exception) as e:
        logger.error(f"Video status check failed for {operation_id}: {e}", exc_info=True)
        return jsonify({"error": "Failed to get video status or process result.", "details": str(e)}), 502

if __name__ == "__main__":
    if config:
        app.run(port=int(os.getenv("PORT", 5001)), host="0.0.0.0", debug=False)
    else:
        logger.critical("Application cannot start due to configuration errors.")
