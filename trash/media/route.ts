import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { type, prompt, aspectRatio, model, duration } = await req.json();

    let apiEndpoint = '';
    let requestBody = {};
    
    console.log(`Processing ${type} generation with prompt: "${prompt}"`);
    
    switch (type) {
      case 'image':
        apiEndpoint = 'https://friday-images.vercel.app/api/generate-image';
        requestBody = {
          prompt,
          model: 'imagen-3.0-fast-generate-001',
          aspect_ratio: aspectRatio || '1:1'
        };
        break;
        
      case 'audio':
        apiEndpoint = 'https://friday-images.vercel.app/api/generate-music';
        requestBody = { 
          prompt,
          type: 'music'
        };
        break;
        
      case 'video':
        apiEndpoint = '/api/media/generate-video';
        requestBody = {
          prompt,
          aspectRatio: aspectRatio || '16:9',
          duration: duration || '8'
        };
        break;
        
      default:
        return new NextResponse(`Invalid media type: ${type}`, { status: 400 });
    }
    
    console.log(`Sending ${type} generation request to: ${apiEndpoint}`, requestBody);
    
    if (process.env.MOCK_MEDIA === 'true') {
      console.log('Using mock media data for testing');

      const mockData = {
        image: {
          url: 'https://picsum.photos/800/600',
          thumbnailUrl: 'https://picsum.photos/200/150',
          type: 'image'
        },
        audio: {
          url: 'https://file-examples.com/storage/fee8554e0a5d0e1e32c0c6b/2017/11/file_example_MP3_700KB.mp3',
          thumbnailUrl: null,
          type: 'audio'
        },
        video: {
          url: 'https://file-examples.com/storage/fee8554e0a5d0e1e32c0c6b/2017/04/file_example_MP4_480_1_5MG.mp4',
          thumbnailUrl: 'https://picsum.photos/320/240',
          type: 'video'
        }
      };
      
      return NextResponse.json(mockData[type as keyof typeof mockData]);
    }
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Media generation error: ${errorText}`);
      return new NextResponse(`Media generation error: ${errorText}`, { status: response.status });
    }
    
    const data = await response.json();
    console.log(`Successfully generated ${type}:`, data);
    
    const standardizedResponse = {
      url: data.url || data.imageUrl || data.image_url || data.audioUrl || data.videoUrl,
      type: type
    };
    
    console.log('Returning standardized response:', standardizedResponse);
    return NextResponse.json(standardizedResponse);
    
  } catch (error) {
    console.error('Media generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new NextResponse(errorMessage, { status: 500 });
  }
}
