import { NextResponse } from 'next/server';
import { GoogleDriveService } from '@/services/google-drive-service';
import Busboy from 'busboy';
import fs from 'fs/promises';
import { Readable } from 'stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(request: Request) {
  try {
    const busboy = Busboy({
      headers: {
        'content-type': request.headers.get('content-type') || 'multipart/form-data',
      },
    });

    let folderName: string | undefined;
    let folderId: string | undefined;
    let fileData: Buffer | undefined;
    let fileName: string | undefined;
    let mimeType: string | undefined;

    const readableStream = Readable.fromWeb(request.body as any);

    await new Promise<void>((resolve, reject) => {
      busboy.on('field', (name, value) => {
        if (name === 'folderName') folderName = value;
        if (name === 'folderId') folderId = value;
      });

      busboy.on('file', (name, file, info) => {
        const { filename, mimeType: fileMimeType } = info;
        fileName = filename;
        mimeType = fileMimeType || 'application/octet-stream';
        const chunks: Buffer[] = [];
        file.on('data', (data) => chunks.push(data));
        file.on('end', () => {
          fileData = Buffer.concat(chunks);
        });
      });

      busboy.on('finish', () => resolve());
      busboy.on('error', (err) => reject(err));

      readableStream.pipe(busboy);
    });

    const driveService = new GoogleDriveService(
      process.env.GOOGLE_CLIENT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!
    );

    if (folderName) {
      const folder = await driveService.createFolder(folderName, folderId);
      return NextResponse.json({ message: 'Folder created', file: folder });
    }

    if (!fileData || !fileName) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const createdFile = await driveService.createFile(fileName, fileData, mimeType, folderId);

    return NextResponse.json({ message: 'File created', file: createdFile });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folderId = searchParams.get('folderId');

    const driveService = new GoogleDriveService(
      process.env.GOOGLE_CLIENT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!
    );

    const items = await driveService.listItems(folderId || undefined);
    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error listing items:', error);
    return NextResponse.json({ error: 'Failed to list items' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { fileId } = await request.json();

    if (!fileId) {
      return NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
    }

    const driveService = new GoogleDriveService(
      process.env.GOOGLE_CLIENT_EMAIL!,
      process.env.GOOGLE_PRIVATE_KEY!
    );

    await driveService.deleteFile(fileId);
    return NextResponse.json({ message: 'Item deleted' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}