import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import TryHackMeBadgeModel from '@/models/TryHackMeBadge';
import UserModel from '@/models/User';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitResponse,
} from '@/lib/rate-limit';

// Input validation schema
const BadgeInputSchema = z.object({
  title: z.string().min(1).max(200),
  thmBadgeId: z.string().min(1).max(100),
  imageUrl: z.string().url().max(500),
  link: z.string().url().max(500).optional(),
  description: z.string().max(1000).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  earnedAt: z.string().datetime().optional(),
  visibility: z.enum(['public', 'private']).optional(),
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
  const visibility = searchParams.get('visibility');
  const search = searchParams.get('search');

  const filter: any = {};
  if (visibility && ['public', 'private'].includes(visibility))
    filter.visibility = visibility;
  if (search)
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { thmBadgeId: { $regex: search, $options: 'i' } },
    ];

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
    const parsed = BadgeInputSchema.parse(body);

    const badge = await TryHackMeBadgeModel.create({
      title: parsed.title,
      thmBadgeId: parsed.thmBadgeId,
      imageUrl: parsed.imageUrl,
      link: parsed.link,
      description: parsed.description,
      category: parsed.category,
      tags: parsed.tags || [],
      earnedAt: parsed.earnedAt,
      visibility: parsed.visibility || 'public',
    });

    return NextResponse.json({
      badge: { ...(badge.toJSON() as any), _id: badge._id.toString() },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Create badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
