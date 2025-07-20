import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio = '16:9', duration = '8' } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new NextResponse('Missing GEMINI_API_KEY environment variable', { status: 500 });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    console.log(`Starting video generation with prompt: ${prompt}`);

    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt,
      config: {
        numberOfVideos: 1,
        aspectRatio,
        personGeneration: 'dont_allow',
        durationSeconds: parseInt(duration, 10),
      },
    });

    const startTime = Date.now();
    const maxWaitTime = 5 * 60 * 1000;
    
    while (!operation.done) {
      console.log(`Video ${operation.name} is still generating. Checking again in 10 seconds...`);
      
      if (Date.now() - startTime > maxWaitTime) {
        return new NextResponse('Video generation timeout exceeded', { status: 504 });
      }
      
      await new Promise((resolve) => setTimeout(resolve, 10000));
      
      operation = await ai.operations.getVideosOperation({
        operation: operation,
      });
    }

    console.log(`Generated ${operation.response?.generatedVideos?.length ?? 0} video(s).`);

    if (!operation.response?.generatedVideos?.length) {
      return new NextResponse('No videos were generated', { status: 500 });
    }

    const generatedVideo = operation.response.generatedVideos[0];
    
    return NextResponse.json({
      url: `${generatedVideo?.video?.uri}&key=${apiKey}`,
      // thumbnailUrl: generatedVideo?.thumbnail?.uri ? `${generatedVideo.thumbnail.uri}&key=${apiKey}` : null,
    });
    
  } catch (error) {
    console.error('Video generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(`Video generation error: ${errorMessage}`, { status: 500 });
  }
}
