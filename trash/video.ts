import {
  GoogleGenAI
} from '@google/genai';

import {writeFile} from 'fs/promises';
import fetch from 'node-fetch';

async function main() {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  let operation = await ai.models.generateVideos({
    model: 'veo-2.0-generate-001',
    prompt: `INSERT_INPUT_HERE`,
    config: {
        numberOfVideos: 1,
        aspectRatio: '16:9',
        personGeneration: 'dont_allow',
        durationSeconds: 8,
    },
  });

  while (!operation.done) {
    console.log(`Video ${operation.name} has not been generated yet. Check again in 10 seconds...`);
    await new Promise((resolve) => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({
      operation: operation,
    });
  }

  console.log(`Generated ${operation.response?.generatedVideos?.length ?? 0} video(s).`);

  operation.response?.generatedVideos?.forEach(async (generatedVideo, i) => {
    console.log(`Video has been generated: ${generatedVideo?.video?.uri}`);
    const response = await fetch(`${generatedVideo?.video?.uri}&key=${process.env.GEMINI_API_KEY}`);
    const buffer = await response.arrayBuffer();
    await writeFile(`video_${i}.mp4`, Buffer.from(buffer));
    console.log(`Video ${generatedVideo?.video?.uri} has been downloaded to video_${i}.mp4.`);
  });
}

main();
