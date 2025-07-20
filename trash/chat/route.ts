import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { modelId, contents } = await req.json();

    const apiKey = "AIzaSyAT0Zs3D_bBf_jaxgc2ZpdjbFsI1auvpFA";
    if (!apiKey) {
      return new NextResponse('API key not configured', { status: 500 });
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:streamGenerateContent?key=${apiKey}&alt=sse`;

    const geminiResponse = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
        generationConfig: { maxOutputTokens: 2048 },
      }),
    });

    if (!geminiResponse.ok) {
        const errorText = await geminiResponse.text();
        return new NextResponse(`Gemini API Error: ${errorText}`, { status: geminiResponse.status });
    }

    const stream = new ReadableStream({
      async start(controller) {
        if (!geminiResponse.body) {
          controller.close();
          return;
        }
        const reader = geminiResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const jsonString = line.substring(6);
                const parsed = JSON.parse(jsonString);
                const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) {
                  // Re-format the data chunk for the client
                  const clientChunk = `data: ${JSON.stringify({ text })}\n\n`;
                  controller.enqueue(new TextEncoder().encode(clientChunk));
                }
              } catch (e) {
              }
            }
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
