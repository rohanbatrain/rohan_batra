import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import { z } from 'zod';

const CreateSchema = z.object({
  name: z.string().min(1),
  fullName: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  visibility: z.enum(['private', 'public']).optional(),
  role: z
    .enum(['protagonist', 'antagonist', 'supporting', 'minor'])
    .default('supporting'),
  significance: z.enum(['major', 'minor', 'background']).optional(),
  description: z.string().optional().default('<p></p>'),
  personality: z.string().optional().default('<p></p>'),
  background: z.string().optional().default('<p></p>'),
  physicalDescription: z.string().optional(),
  goals: z.string().optional(),
  conflicts: z.string().optional(),
  birthdate: z.string().datetime().optional(),
  age: z.number().optional(),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  avatar: z.string().url().optional(),
  bookId: z.string().optional(),
});

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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '20'),
      100
    );
    const visibility = url.searchParams.get('visibility');
    const search = url.searchParams.get('search');

    const filter: Record<string, unknown> = { deletedAt: { $exists: false } };
    if (visibility) filter.visibility = visibility;
    if (search)
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } },
        { tags: { $in: [search] } },
      ];

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Character.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Character.countDocuments(filter),
    ]);

    // Fetch book titles for attached characters
    const bookIds = Array.from(
      new Set(items.map((c: any) => c.bookId?.toString()).filter(Boolean))
    );
    let bookMap: Record<string, { title: string }> = {};
    if (bookIds.length) {
      try {
        const Book = (await import('@/models/Book')).default;
        const books = await Book.find({ _id: { $in: bookIds } })
          .select('_id title')
          .lean();
        bookMap = Object.fromEntries(
          books.map((b: any) => [b._id.toString(), { title: b.title }])
        );
      } catch {}
    }

    const characters = items.map((c: any) => ({
      id: c._id?.toString(),
      name: c.name,
      fullName: c.fullName,
      slug: c.slug,
      visibility: c.visibility,
      role: c.role,
      significance: c.significance,
      age: c.age,
      tags: c.tags,
      bookId: c.bookId?.toString() || null,
      bookTitle: c.bookId ? bookMap[c.bookId.toString()]?.title || null : null,
      createdAt: c.createdAt,
    }));

    return NextResponse.json({
      success: true,
      characters,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to list characters' },
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

    const body = await request.json();
    const data = CreateSchema.parse(body);
    let birthdate: Date | undefined;
    if (data.birthdate) {
      const bd = new Date(data.birthdate);
      if (!isNaN(bd.getTime())) birthdate = bd;
    }
    const computeAgeFromDate = (date?: Date) => {
      if (!date) return undefined;
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const m = today.getMonth() - date.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < date.getDate())) age--;
      return age < 0 ? 0 : age;
    };
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
      physicalDescription: data.physicalDescription,
      goals: data.goals,
      conflicts: data.conflicts,
      birthdate,
      age: birthdate ? computeAgeFromDate(birthdate) : data.age,
      tags: data.tags || [],
      featured: data.featured,
      avatar: data.avatar,
      bookId: data.bookId,
    });
    // Audit log create
    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'character.create',
        entityType: 'Character',
        entityId: doc._id.toString(),
        userId: me._id.toString(),
        userEmail: me.email,
        meta: { name: doc.name, slug: doc.slug },
      });
    } catch {}
    return NextResponse.json({
      success: true,
      character: doc.toJSON?.() ?? doc,
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: e.issues },
        { status: 400 }
      );
    return NextResponse.json(
      { success: false, error: 'Failed to create character' },
      { status: 500 }
    );
  }
}
