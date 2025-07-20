import { NextResponse } from 'next/server';
import { GoogleDriveService } from '@/services/google-drive-service';

export async function POST(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    const driveService = new GoogleDriveService(
      process.env.GOOGLE_CLIENT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!
    );

    const { url, mimeType } = await driveService.getFileUrl(fileId);

    // Define text MIME types
    const textMimeTypes = [
      'text/plain',
      'application/json',
      'text/csv',
      'text/html',
      'text/xml',
      'application/xml',
    ];

    if (textMimeTypes.includes(mimeType)) {
      const content = await driveService.getFile(fileId);
      return NextResponse.json({ content, mimeType, isText: true });
    }

    return NextResponse.json({ url, mimeType, isText: false });
  } catch (error) {
    console.error('Error reading file:', error);
    return NextResponse.json({ error: 'Failed to read file' }, { status: 500 });
  }
}