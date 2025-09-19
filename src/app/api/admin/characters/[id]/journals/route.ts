import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import CharacterJournal from '@/models/CharacterJournal';
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
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const status = url.searchParams.get('status');

    const filter: Record<string, unknown> = { characterId: id, deletedAt: { $exists: false } };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      CharacterJournal.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CharacterJournal.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, journals: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to list journals' }, { status: 500 });
  }
}

const CreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  content: z.string().min(1),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  entryDate: z.string().datetime().optional(),
  mood: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
});

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
    const journal = await CharacterJournal.create({
      characterId: character._id,
      bookId: character.bookId,
      title: data.title,
      slug: data.slug,
      content: data.content,
      status: data.status || 'draft',
      entryDate: data.entryDate ? new Date(data.entryDate) : undefined,
      mood: data.mood,
      location: data.location,
      tags: data.tags || [],
      isPrivate: data.isPrivate ?? false,
      publishedAt: data.status === 'published' ? new Date() : undefined,
    });
    return NextResponse.json({ success: true, journal });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, error: 'Validation failed', details: e.issues }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to create journal' }, { status: 500 });
  }
}
