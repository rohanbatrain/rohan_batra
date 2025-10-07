import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import TryHackMeRoomModel from '@/models/TryHackMeRoom';
import UserModel from '@/models/User';
import { createAuditLog } from '@/lib/audit-log';

// Input validation schema for updates
const RoomUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  thmRoomId: z.string().min(1).max(100).optional(),
  slug: z.string().min(1).max(200).optional(),
  link: z.string().url().max(500).optional(),
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
    const parsed = RoomUpdateSchema.parse(body);

    // Only update provided fields
    const update: any = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (value !== undefined) {
        update[key] = value;
      }
    }

    const updated = await TryHackMeRoomModel.findByIdAndUpdate(
      params.id,
      update,
      { new: true }
    );
    if (!updated)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      room: { ...(updated.toJSON() as any), _id: updated._id.toString() },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Update room error:', error);
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

    // Get room info before deletion for audit log
    const room = await TryHackMeRoomModel.findById(params.id).lean();
    if (!room)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Create audit log
    await createAuditLog(
      {
        userId,
        action: 'delete',
        resource: 'TryHackMeRoom',
        resourceId: params.id,
        changes: {
          before: {
            title: (room as any).title,
            thmRoomId: (room as any).thmRoomId,
          },
        },
      },
      request
    );

    const res = await TryHackMeRoomModel.deleteOne({ _id: params.id });
    if (res.deletedCount === 0)
      return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ deleted: 1 });
  } catch (error) {
    console.error('Delete room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
