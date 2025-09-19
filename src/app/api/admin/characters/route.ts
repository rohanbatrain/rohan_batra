import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import { z } from 'zod';

const CreateSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().optional(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).optional(),
  visibility: z.enum(['private', 'public']).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']),
  significance: z.enum(['major', 'minor', 'background']).optional(),
  description: z.string().min(1),
  personality: z.string().min(1),
  background: z.string().min(1),
  age: z.number().optional(),
  tags: z.array(z.string()).optional(),
  bookId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 100);
    const visibility = url.searchParams.get('visibility');
    const search = url.searchParams.get('search');

    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (visibility) filter.visibility = visibility;
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { fullName: { $regex: search, $options: 'i' } }, { tags: { $in: [search] } }];

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Character.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Character.countDocuments(filter),
    ]);

    return NextResponse.json({ success: true, characters: items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to list characters' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || !['admin', 'editor'].includes(me.role)) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const data = CreateSchema.parse(body);
    const doc = await Character.create({
      name: data.name,
      fullName: data.fullName,
      slug: data.slug,
      visibility: data.visibility || 'private',
      role: data.role,
      significance: data.significance || 'minor',
      description: data.description,
      personality: data.personality,
      background: data.background,
      age: data.age,
      tags: data.tags || [],
      bookId: data.bookId,
    });
    return NextResponse.json({ success: true, character: doc });
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ success: false, error: 'Validation failed', details: e.issues }, { status: 400 });
    return NextResponse.json({ success: false, error: 'Failed to create character' }, { status: 500 });
  }
}
