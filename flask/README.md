# Friday Backend

```
curl -X POST \
  https://friday-images.vercel.app/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A close-up portrait of an astronaut, photorealistic, 4k", "model": "imagen-3.0-fast-generate-001", "aspect_ratio": "1:1"}'

curl -X POST https://friday-images.vercel.app/api/generate-image -H "Content-Type: application/json" -d '{
    "prompt": "A highly detailed, cinematic shot of a boat on the Padma River at sunset, current time is evening in Bangladesh",
    "model": "imagen-3.0-fast-generate-001",
    "aspect_ratio": "16:9"
}'

curl -X POST http://127.0.0.1:5000/api/generate-image -H "Content-Type: application/json" -d '{
    "prompt": "A highly detailed, cinematic shot of a boat on the Padma River at sunset, current time is evening in Bangladesh",
    "model": "imagen-4.0-fast-generate-preview-06-06",
    "aspect_ratio": "16:9"
}'

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "An epic orchestral soundtrack for a space battle"}' \
  http://127.0.0.1:5000/api/generate-music

curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"prompt": "An epic orchestral soundtrack for a space battle"}' \
  https://friday-images.vercel.app/api/generate-music
```

```
gitpod /workspace/friday-beta (main) $ curl -X POST http://127.0.0.1:5000/api/generate-image -H "Content-Type: application/json" -d '{
    "prompt": "A highly detailed, cinematic shot of a boat on the Padma River at sunset, current time is evening in Bangladesh",
    "model": "imagen-3.0-fast-generate-001",
    "aspect_ratio": "16:9"
}'
{"aspect_ratio_used":"16:9","image_url":"https://i.ibb.co/Ps8DRtyt/361957a5b523.png","model_used":"imagen-3.0-fast-generate-001","prompt":"A highly detailed, cinematic shot of a boat on the Padma River at sunset, current time is evening in Bangladesh"}
```

<!-- # VERTEX_PROJECT_ID = os.getenv("VERTEX_PROJECT_ID")
# VERTEX_LOCATION = os.getenv("VERTEX_LOCATION", "us-central1")
# GOOGLE_CREDENTIALS_BASE64 = os.getenv("GOOGLE_CREDENTIALS_BASE64")
# IMGBB_API_KEY = os.getenv("IMGBB_API_KEY")
# GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
# DEFAULT_VERTEX_IMAGE_MODEL = "imagen-4.0-generate-preview-05-20" -->
