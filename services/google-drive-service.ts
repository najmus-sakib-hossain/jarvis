import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { Readable } from 'stream';

interface DriveItem {
  id: string;
  name: string;
  mimeType: string;
}

export class GoogleDriveService {
  private driveClient;

  constructor(clientEmail: string, privateKey: string) {
    const auth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.driveClient = google.drive({
      version: 'v3',
      auth,
    });
  }

  async createFile(fileName: string, content: string | Buffer, mimeType = 'application/octet-stream', folderId?: string): Promise<DriveItem> {
    try {
      const fileMetadata: any = {
        name: fileName,
        mimeType,
      };

      if (folderId || process.env.GOOGLE_DRIVE_FOLDER_ID) {
        fileMetadata.parents = [folderId || process.env.GOOGLE_DRIVE_FOLDER_ID];
      }

      const media = {
        mimeType,
        body: typeof content === 'string' ? content : Readable.from(content),
      };

      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media,
        fields: 'id, name, mimeType',
      });

      // Set file permissions to "Anyone with the link"
      await this.driveClient.permissions.create({
        fileId: response.data.id!,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      return response.data as DriveItem;
    } catch (error: any) {
      if (error.code === 429) {
        console.warn('Rate limit exceeded, retrying after delay...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.createFile(fileName, content, mimeType, folderId);
      }
      throw error;
    }
  }

  async createFolder(folderName: string, folderId?: string): Promise<DriveItem> {
    try {
      const fileMetadata: any = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      if (folderId || process.env.GOOGLE_DRIVE_FOLDER_ID) {
        fileMetadata.parents = [folderId || process.env.GOOGLE_DRIVE_FOLDER_ID];
      }

      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, mimeType',
      });

      return response.data as DriveItem;
    } catch (error: any) {
      if (error.code === 429) {
        console.warn('Rate limit exceeded, retrying after delay...');
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return this.createFolder(folderName, folderId);
      }
      throw error;
    }
  }

  async getFile(fileId: string): Promise<string> {
    const response = await this.driveClient.files.get(
      { fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    let data = '';
    for await (const chunk of response.data) {
      data += chunk;
    }
    return data;
  }

  async getFileUrl(fileId: string): Promise<{ url: string; mimeType: string }> {
    const response = await this.driveClient.files.get({
      fileId,
      fields: 'mimeType',
    });
    // Use direct download URL for media files
    const url = `https://drive.google.com/uc?export=download&id=${fileId}`;
    return {
      url,
      mimeType: response.data.mimeType || 'application/octet-stream',
    };
  }

  async listItems(folderId?: string): Promise<DriveItem[]> {
    const query = folderId || process.env.GOOGLE_DRIVE_FOLDER_ID
      ? `'${folderId || process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`
      : undefined;

    const response = await this.driveClient.files.list({
      q: query,
      fields: 'files(id, name, mimeType)',
    });

    return response.data.files as DriveItem[];
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.driveClient.files.delete({ fileId });
  }
}