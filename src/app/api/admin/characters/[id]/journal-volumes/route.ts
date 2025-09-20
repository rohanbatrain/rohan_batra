import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import JournalVolume from '@/models/JournalVolume';
import { z } from 'zod';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = { characterId: id, deletedAt: { $exists: false } };
    const [items, total] = await Promise.all([
      JournalVolume.find(filter).sort({ displayOrder: 1, createdAt: -1 }).skip(skip).limit(limit),
      JournalVolume.countDocuments(filter),
    ]);
    return NextResponse.json({ success: true, journals: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to list journals' }, { status: 500 });
  }
}

const CreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  description: z.string().optional(),
  coverImage: z.string().url().optional(),
  backCoverImage: z.string().url().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  isPrivate: z.boolean().optional(),
  displayOrder: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
});

function slugify(input: string) {
  return input.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    const { id } = await params;
    const character = await Character.findById(id);
    if (!character) return NextResponse.json({ success: false, error: 'Character not found' }, { status: 404 });

    const body = await request.json();
    const data = CreateSchema.parse(body);
    let slug = data.slug || slugify(data.title) || `journal-${Date.now()}`;
    let candidate = slug; let n = 2;
    while (await JournalVolume.exists({ slug: candidate })) candidate = `${slug}-${n++}`;

    const journal = await JournalVolume.create({
      characterId: character._id,
      title: data.title,
      slug: candidate,
      description: data.description,
      coverImage: data.coverImage,
      backCoverImage: data.backCoverImage,
      status: data.status || 'draft',
      isPrivate: data.isPrivate ?? false,
      displayOrder: data.displayOrder ?? 0,
      tags: data.tags || [],
      publishedAt: data.status === 'published' ? new Date() : undefined,
    });
    return NextResponse.json({ success: true, journal });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, error: 'Validation failed', details: e.issues }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to create journal' }, { status: 500 });
  }
}
