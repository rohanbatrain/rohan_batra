import { google } from 'googleapis';

export interface DriveUploadResult {
  id: string;
  url: string;
  name?: string;
  size?: number;
  mimeType?: string;
}

export function isDriveConfigured() {
  return Boolean(
    process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY &&
      process.env.GOOGLE_DRIVE_FOLDER_ID
  );
}

function getDriveClient() {
  const email = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_EMAIL as string;
  let key = process.env.GOOGLE_DRIVE_SERVICE_ACCOUNT_KEY as string;
  if (!email || !key) throw new Error('Google Drive is not configured');
  // Handle escaped newlines in env
  key = key.replace(/\\n/g, '\n');
  const jwt = new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });
  const drive = google.drive({ version: 'v3', auth: jwt });
  return drive;
}

export async function uploadBufferResumable(
  buffer: Buffer,
  mimeType: string,
  name: string
): Promise<DriveUploadResult> {
  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID as string;
  const fileMetadata: any = {
    name,
    parents: [folderId],
  };

  // Use multipart if small; for large files, media upload also works, but Drive SDK supports resumable via uploadType
  const res = await drive.files.create({
    requestBody: fileMetadata,
    media: { mimeType, body: Buffer.from(buffer) },
    supportsAllDrives: true,
    fields: 'id, name, size, mimeType',
  });

  const id = res.data.id as string;

  // Make file accessible (link-only) if configured
  if (process.env.GOOGLE_DRIVE_SHARE_PUBLIC === 'true') {
    try {
      await drive.permissions.create({
        fileId: id,
        requestBody: { role: 'reader', type: 'anyone' },
      });
    } catch {}
  }

  // Build a view URL
  const url = `https://drive.google.com/uc?id=${id}`;

  return {
    id,
    url,
    name: res.data.name || name,
    size: res.data.size ? Number(res.data.size) : undefined,
    mimeType: res.data.mimeType || mimeType,
  };
}
