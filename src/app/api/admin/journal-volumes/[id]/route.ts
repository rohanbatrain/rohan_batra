import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import JournalVolume from '@/models/JournalVolume';
import { z } from 'zod';

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional(),
  coverImage: z.string().url().nullable().optional(),
  backCoverImage: z.string().url().nullable().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  isPrivate: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  publishedAt: z.string().datetime().nullable().optional(),
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const doc = await JournalVolume.findById(id);
    if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, journal: doc });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to fetch journal' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const { id } = await params;
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const body = await request.json();
    const data = UpdateSchema.parse(body);
    const update: any = { ...data };
    if (data.publishedAt !== undefined) update.publishedAt = data.publishedAt ? new Date(data.publishedAt) : undefined;
    if (data.status === 'published' && !update.publishedAt) update.publishedAt = new Date();
    const doc = await JournalVolume.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
    if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, journal: doc });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, error: 'Validation failed', details: e.issues }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to update journal' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || me.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });
    const { id } = await params;
    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';
    const toTrash = url.searchParams.get('trash') === 'true';
    const doc = await JournalVolume.findById(id);
    if (!doc) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    if (permanent && doc.deletedAt) {
      await JournalVolume.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: 'Journal permanently deleted' });
    }
    await JournalVolume.findByIdAndUpdate(id, { $set: { deletedAt: new Date(), deletedBy: me._id } });
    return NextResponse.json({ success: true, message: toTrash ? 'Moved to trash' : 'Journal soft deleted' });
  } catch {
    return NextResponse.json({ success: false, error: 'Failed to delete journal' }, { status: 500 });
  }
}
