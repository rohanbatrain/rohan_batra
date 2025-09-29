import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import AssetLink from '@/models/AssetLink';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'Auth required' },
        { status: 401 }
      );
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role))
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const type = searchParams.get('type');
    const filter: Record<string, unknown> = {};
    if (q)
      filter.$or = [
        { name: new RegExp(q, 'i') },
        { description: new RegExp(q, 'i') },
      ];
    if (type) filter.type = type;
    const links = await AssetLink.find(filter).sort({ updatedAt: -1 }).lean();
    return NextResponse.json({ success: true, data: { links } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to list links' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'Auth required' },
        { status: 401 }
      );
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role))
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );

    const body = (await request.json()) as any;
    // 'type' and 'thumbnailUrl' may be reassigned below, keep them as let.
    let type: string | undefined = body?.type;
    let thumbnailUrl: string | undefined = body?.thumbnailUrl;
    // The remaining fields are not reassigned; prefer const.
    const name: string | undefined = body?.name;
    const url: string | undefined = body?.url;
    const description: string | undefined = body?.description;
    const tags: string[] | undefined = body?.tags;
    if (!name || !url)
      return NextResponse.json(
        { success: false, error: 'name and url are required' },
        { status: 400 }
      );

    // Try to fetch HEAD to enrich metadata
    let mimeType: string | undefined;
    let size: number | undefined;
    try {
      const head = await fetch(url, { method: 'HEAD' });
      if (head.ok) {
        mimeType = head.headers.get('content-type') || undefined;
        const len = head.headers.get('content-length');
        size = len ? parseInt(len) : undefined;
      }
    } catch {}

    // Infer type if missing
    if (!type) {
      const ext = url
        .split('?')[0]
        .split('#')[0]
        .split('.')
        .pop()
        ?.toLowerCase();
      if (
        mimeType?.startsWith('image/') ||
        ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext || '')
      )
        type = 'image';
      else if (
        mimeType?.startsWith('video/') ||
        ['mp4', 'mov', 'webm', 'avi', 'mkv'].includes(ext || '')
      )
        type = 'video';
      else type = 'other';
    }

    if (!thumbnailUrl && type === 'image') thumbnailUrl = url; // simple default

    const doc = await AssetLink.create({
      type,
      name,
      url,
      thumbnailUrl,
      description,
      tags,
      mimeType,
      size,
    });
    return NextResponse.json({ success: true, data: { link: doc } });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to create link' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'Auth required' },
        { status: 401 }
      );
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role))
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id)
      return NextResponse.json(
        { success: false, error: 'id required' },
        { status: 400 }
      );
    await AssetLink.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Deleted link' });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete link' },
      { status: 500 }
    );
  }
}
