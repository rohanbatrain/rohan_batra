import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import LottieAsset from '@/models/LottieAsset';
import User from '@/models/User';
import { z } from 'zod';

const ImportSchema = z.object({
  url: z.string().url(),
  name: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  category: z
    .enum(['hero', 'section', 'interactive', 'background', 'icon', 'other'])
    .default('other')
    .optional(),
  tags: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ clerkId: userId });

    if (!user || !['admin', 'editor'].includes(user.role)) {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      url,
      name,
      description,
      category = 'other',
      tags = [],
    } = ImportSchema.parse(body);

    // Fetch the remote JSON (supports GitHub raw URLs, generic HTTPS)
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch remote file: ${res.status} ${res.statusText}`,
        },
        { status: 400 }
      );
    }

    const text = await res.text();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      return NextResponse.json(
        { success: false, error: 'Remote file is not valid JSON' },
        { status: 400 }
      );
    }

    // Basic Lottie metadata inference
    const frameRate = typeof parsed.fr === 'number' ? parsed.fr : undefined;
    const width = typeof parsed.w === 'number' ? parsed.w : undefined;
    const height = typeof parsed.h === 'number' ? parsed.h : undefined;
    const ip = typeof parsed.ip === 'number' ? parsed.ip : 0;
    const op = typeof parsed.op === 'number' ? parsed.op : 0;
    const duration = frameRate && op >= ip ? (op - ip) / frameRate : undefined;

    // Derive filename from URL
    const fileName = (url.split('/').pop() || 'animation.json').split('?')[0];

    const asset = await LottieAsset.create({
      name: name || (parsed.nm as string) || fileName.replace(/\.json$/i, ''),
      description,
      fileName,
      filePath: `remote://${url}`,
      fileSize: Buffer.byteLength(text, 'utf8'),
      mimeType: 'application/json',
      width,
      height,
      frameRate,
      duration,
      tags,
      category,
      uploadedBy: user._id,
    });

    return NextResponse.json(
      {
        success: true,
        asset: {
          id: asset._id.toString(),
          _id: asset._id.toString(),
          name: asset.name,
          description: asset.description,
          fileName: asset.fileName,
          fileSize: asset.fileSize,
          mimeType: asset.mimeType,
          url, // direct remote URL for preview
          metadata: {
            width: asset.width,
            height: asset.height,
            duration: asset.duration,
            frameRate: asset.frameRate,
          },
          usageCount: 0,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt,
        },
        message: 'Lottie asset imported from URL',
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Admin lottie import error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to import Lottie asset' },
      { status: 500 }
    );
  }
}
