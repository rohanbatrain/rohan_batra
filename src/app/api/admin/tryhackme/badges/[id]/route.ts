import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import TryHackMeBadgeModel from '@/models/TryHackMeBadge';
import UserModel from '@/models/User';
import { createAuditLog } from '@/lib/audit-log';

// Input validation schema for updates
const BadgeUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  thmBadgeId: z.string().min(1).max(100).optional(),
  imageUrl: z.string().url().max(500).optional(),
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

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authz = await assertEditorOrAdmin(userId);
    if (!authz.ok)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();

    const body = await request.json();

    // Validate input
    const parsed = BadgeUpdateSchema.parse(body);

    // Only update provided fields
    const update: any = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== undefined) {
        update[key] = value;
      }
    }

    const updated = await TryHackMeBadgeModel.findByIdAndUpdate(
      params.id,
      update,
      { new: true }
    );
    if (!updated)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      badge: { ...(updated.toJSON() as any), _id: updated._id.toString() },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authz = await assertEditorOrAdmin(userId);
    if (!authz.ok)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await connectToDatabase();

    // Get badge info before deletion for audit log
    const badge = await TryHackMeBadgeModel.findById(params.id).lean();
    if (!badge)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Create audit log
    await createAuditLog(
      {
        userId,
        action: 'delete',
        resource: 'TryHackMeBadge',
        resourceId: params.id,
        changes: {
          before: {
            title: (badge as any).title,
            thmBadgeId: (badge as any).thmBadgeId,
          },
        },
      },
      request
    );

    const res = await TryHackMeBadgeModel.deleteOne({ _id: params.id });
    if (res.deletedCount === 0)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ deleted: 1 });
  } catch (error) {
    console.error('Delete badge error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
