import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

interface ChatRequestBody {
  history: { role: string; parts: { text: string }[] }[];
  message: string;
  mediaCategory: "text" | "image" | "video" | "audio" | "video-status";
  model?: string;
  parentSubCategory?: "fast" | "think";
  aspectRatio?: "1:1" | "16:9" | "9:16";
  operationName?: string;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const createErrorResponse = (error: string, status: number): Response => {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
};

const handleTextGeneration = async (
  reqBody: ChatRequestBody,
): Promise<Response> => {
  const { history, message, model: requestedModel, parentSubCategory } = reqBody;

  const modelName =
    requestedModel ||
    (parentSubCategory === "think" ? "gemma-3-27b-it" : "gemma-3-1b-it");

  console.log(`Using model: ${modelName}`);

  try {
    const model = genAI.getGenerativeModel({
      model: modelName,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const chat = model.startChat({ history: history || [] });
    const result = await chat.sendMessageStream(message);

    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Error during stream processing:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in text generation:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    // Return the detailed error from the SDK for better debugging
    return createErrorResponse(
      `Failed to generate text response: ${errorMessage}`,
      500,
    );
  }
};

const handleImageGeneration = async (
  reqBody: ChatRequestBody,
): Promise<Response> => {
  const { message: prompt, aspectRatio, model: requestedModel } = reqBody;
  const apiEndpoint = "https://friday-images.vercel.app/api/generate-image";

  try {
    const requestBody = {
      prompt,
      model: requestedModel || "imagen-3.0-fast-generate-001",
      aspect_ratio: aspectRatio || "1:1",
    };

    const externalResponse = await fetch(apiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!externalResponse.ok) {
      const errorText = await externalResponse.text();
      console.error("Image API error:", errorText);
      return createErrorResponse(
        `Image generation failed: ${errorText}`,
        externalResponse.status,
      );
    }

    const responseData = await externalResponse.json();
    const imageUrl =
      responseData.url ||
      responseData.imageUrl ||
      responseData.uri ||
      responseData.image_url;

    if (!imageUrl) {
      console.error("No image URL in response:", responseData);
      return createErrorResponse(
        "Image generation failed: No URL found in the response.",
        500,
      );
    }

    return new Response(
      JSON.stringify({
        url: imageUrl,
        imageUrl: imageUrl,
        thumbnailUrl: responseData.thumbnailUrl || imageUrl,
        prompt,
        aspectRatio: aspectRatio || "1:1",
      }),
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Internal error during image generation:", error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred.";
    return createErrorResponse(`Internal error: ${message}`, 500);
  }
};

const handleVideoGeneration = async (
  reqBody: ChatRequestBody,
): Promise<Response> => {
  return createErrorResponse("Video generation is not yet implemented.", 501);
};

const handleAudioGeneration = async (
  reqBody: ChatRequestBody,
): Promise<Response> => {
  return createErrorResponse("Audio generation is not yet implemented.", 501);
};

const handleVideoStatusCheck = async (
  reqBody: ChatRequestBody,
): Promise<Response> => {
  return createErrorResponse(
    "Video status check is not yet implemented.",
    501,
  );
};

export async function POST(req: Request): Promise<Response> {
  try {
    const body: ChatRequestBody = await req.json();
    const mediaCategory = body.mediaCategory || "text";

    console.log(`Received request for media category: ${mediaCategory}`);

    switch (mediaCategory) {
      case "text":
        return handleTextGeneration(body);
      case "image":
        return handleImageGeneration(body);
      case "video":
        return handleVideoGeneration(body);
      case "audio":
        return handleAudioGeneration(body);
      case "video-status":
        return handleVideoStatusCheck(body);
      default:
        console.warn(
          `Invalid media category "${mediaCategory}", defaulting to text.`,
        );
        return handleTextGeneration(body);
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown parsing error occurred.";
    console.error("Failed to parse request body:", error);
    return createErrorResponse(`Bad Request: ${message}`, 400);
  }
}