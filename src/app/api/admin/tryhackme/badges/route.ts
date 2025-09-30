import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import TryHackMeBadgeModel from '@/models/TryHackMeBadge';
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
  const visibility = searchParams.get('visibility');
  const search = searchParams.get('search');

  const filter: any = {};
  if (visibility && ['public', 'private'].includes(visibility)) filter.visibility = visibility;
  if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { thmBadgeId: { $regex: search, $options: 'i' } }];

  const total = await TryHackMeBadgeModel.countDocuments(filter);
  const docs = await TryHackMeBadgeModel.find(filter)
    .sort({ earnedAt: -1, updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  return NextResponse.json({
    badges: docs.map(d => ({ ...d, _id: (d as any)._id?.toString?.() })),
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
  const badge = await TryHackMeBadgeModel.create({
    title: body.title,
    thmBadgeId: body.thmBadgeId,
    imageUrl: body.imageUrl,
    link: body.link,
    description: body.description,
    category: body.category,
    tags: body.tags || [],
    earnedAt: body.earnedAt,
    visibility: body.visibility || 'public',
  });
  return NextResponse.json({ badge: { ...(badge.toJSON() as any), _id: badge._id.toString() } });
}
