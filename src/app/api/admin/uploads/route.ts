import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Asset from '@/models/Asset';
import { uploadToCloudinary, isCloudinaryConfigured } from '@/lib/cloudinary';
import SiteSetting from '@/models/SiteSetting';
import { isDriveConfigured, uploadBufferResumable } from '@/lib/google-drive';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // Determine backend: default Cloudinary, optional Google Drive via settings
    let useDrive = false;
    try {
      const driveSetting = await SiteSetting.findOne({ key: 'features.googledrive' });
      useDrive = Boolean(driveSetting?.value === true || driveSetting?.value === 'true');
    } catch {}

    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || typeof file === 'string') return NextResponse.json({ error: 'file required' }, { status: 400 });

  const arrayBuffer = await (file as File).arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const mimeType = (file as File).type || 'application/octet-stream';
  const base64 = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64}`;
  // Upload with backend selection with retry and fallback
  let uploadUrl = '';
  let width: number | undefined;
  let height: number | undefined;
  let cloudinaryId: string | undefined;
  let driveFileId: string | undefined;
  let storageBackend: 'cloudinary' | 'google_drive' = 'cloudinary';

  const tryCloudinary = async () => {
    if (!isCloudinaryConfigured()) throw new Error('Cloudinary is not configured');
    const up = await uploadToCloudinary(dataUri, { folder: 'portfolio' });
    uploadUrl = up.url;
    width = up.width;
    height = up.height;
    cloudinaryId = up.id;
    storageBackend = 'cloudinary';
  };

  const tryDrive = async () => {
    if (!isDriveConfigured()) throw new Error('Google Drive is not configured');
    const up = await uploadBufferResumable(buffer, mimeType, (file as File).name);
    uploadUrl = up.url;
    driveFileId = up.id;
    storageBackend = 'google_drive';
  };

  try {
    if (useDrive) {
      try {
        await tryDrive();
      } catch (driveErr) {
        // Fallback to Cloudinary
        await tryCloudinary();
      }
    } else {
      await tryCloudinary();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload error';
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 502 });
  }

    const asset = await Asset.create({
  filename: (file as File).name,
      originalFilename: (file as File).name,
  url: uploadUrl,
  cloudinaryId,
  driveFileId,
      type: (file as File).type.startsWith('image/') ? 'image' : 'other',
      mimeType: (file as File).type,
      size: (file as File).size,
      width,
      height,
      uploadedBy: me._id,
      folder: 'portfolio',
      metadata: {},
      storageBackend,
    });

    return NextResponse.json({ success: true, data: { asset } });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: `Upload failed: ${message}` }, { status: 500 });
  }
}
