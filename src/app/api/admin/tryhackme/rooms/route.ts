import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import TryHackMeRoomModel from '@/models/TryHackMeRoom';
import UserModel from '@/models/User';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit';

// Input validation schema
const RoomInputSchema = z.object({
  title: z.string().min(1).max(200),
  thmRoomId: z.string().min(1).max(100),
  slug: z.string().min(1).max(200),
  link: z.string().url().max(500),
  difficulty: z
    .enum(['easy', 'medium', 'hard', 'insane', 'unknown'])
    .optional(),
  points: z.number().min(0).max(10000).optional(),
  completedAt: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

async function assertEditorOrAdmin(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId })
    .select(['role'])
    .lean();
  const role = (currentUser as any)?.role || 'user';
  return { ok: role === 'editor' || role === 'admin' } as const;
}

export async function GET(request: NextRequest) {
  // Apply rate limiting
  const identifier = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(identifier, {
    max: 100,
    windowMs: 60000,
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const authz = await assertEditorOrAdmin(userId);
  if (!authz.ok)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '24', 10), 1),
    100
  );
  const search = searchParams.get('search');
  const difficulty = searchParams.get('difficulty');

  const filter: any = {};
  if (
    difficulty &&
    ['easy', 'medium', 'hard', 'insane', 'unknown'].includes(difficulty)
  )
    filter.difficulty = difficulty;
  if (search)
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { slug: { $regex: search, $options: 'i' } },
      { thmRoomId: { $regex: search, $options: 'i' } },
    ];

  const total = await TryHackMeRoomModel.countDocuments(filter);
  const docs = await TryHackMeRoomModel.find(filter)
    .sort({ completedAt: -1, updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    rooms: docs.map(d => ({ ...d, _id: (d as any)._id?.toString?.() })),
    total,
    page,
    pageSize: limit,
  });
}

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for POST
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      max: 20,
      windowMs: 60000,
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult);
    }

    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authz = await assertEditorOrAdmin(userId);
    if (!authz.ok)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();
    const body = await request.json();

    // Validate input
    const parsed = RoomInputSchema.parse(body);

    const room = await TryHackMeRoomModel.create({
      title: parsed.title,
      thmRoomId: parsed.thmRoomId,
      slug: parsed.slug,
      link: parsed.link,
      difficulty: parsed.difficulty || 'unknown',
      points: parsed.points || 0,
      completedAt: parsed.completedAt,
      tags: parsed.tags || [],
    });

    return NextResponse.json({
      room: { ...(room.toJSON() as any), _id: room._id.toString() },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
