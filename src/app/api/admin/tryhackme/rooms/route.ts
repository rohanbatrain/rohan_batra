import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import TryHackMeRoomModel from '@/models/TryHackMeRoom';
import UserModel from '@/models/User';

async function assertEditorOrAdmin(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId }).select(['role']).lean();
  const role = (currentUser as any)?.role || 'user';
  return { ok: role === 'editor' || role === 'admin' } as const;
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authz = await assertEditorOrAdmin(userId);
  if (!authz.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectToDatabase();
  const { searchParams } = new URL(request.url);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '24', 10), 1), 100);
  const search = searchParams.get('search');
  const difficulty = searchParams.get('difficulty');

  const filter: any = {};
  if (difficulty && ['easy', 'medium', 'hard', 'insane', 'unknown'].includes(difficulty))
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
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const authz = await assertEditorOrAdmin(userId);
  if (!authz.ok) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await connectToDatabase();
  const body = await request.json();
  const room = await TryHackMeRoomModel.create({
    title: body.title,
    thmRoomId: body.thmRoomId,
    slug: body.slug,
    link: body.link,
    difficulty: body.difficulty || 'unknown',
    points: body.points || 0,
    completedAt: body.completedAt,
    tags: body.tags || [],
  });
  return NextResponse.json({ room: { ...(room.toJSON() as any), _id: room._id.toString() } });
}
