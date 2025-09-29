import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import { z } from 'zod';

const UpdateSchema = z.object({
  name: z.string().min(1).optional(),
  fullName: z.string().optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  visibility: z.enum(['private', 'public']).optional(),
  role: z.enum(['protagonist', 'antagonist', 'supporting', 'minor']).optional(),
  significance: z.enum(['major', 'minor', 'background']).optional(),
  description: z.string().optional(),
  personality: z.string().optional(),
  background: z.string().optional(),
  birthdate: z.string().datetime().nullable().optional(),
  age: z.number().optional(),
  tags: z.array(z.string()).optional(),
  bookId: z.string().nullable().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const doc = await Character.findById(id);
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    return NextResponse.json({
      success: true,
      character: doc.toJSON?.() ?? doc,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch character' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { id } = await params;
    const body = await request.json();
    const data = UpdateSchema.parse(body);
    const before = await Character.findById(id).lean();
    const set: Record<string, unknown> = { ...data };
    if (data.birthdate !== undefined) {
      if (data.birthdate === null) {
        // Explicitly unset
        const unset: Record<string, 1> = { birthdate: 1, age: 1 };
        const updated = await Character.findByIdAndUpdate(
          id,
          { $unset: unset },
          { new: true, runValidators: true }
        );
        if (!updated)
          return NextResponse.json(
            { success: false, error: 'Not found' },
            { status: 404 }
          );
        // Audit log update for unset
        try {
          const AuditLog = (await import('@/models/AuditLog')).default;
          await AuditLog.create({
            action: 'character.update',
            entityType: 'Character',
            entityId: updated._id.toString(),
            userId: me._id.toString(),
            userEmail: me.email,
            meta: { before, after: updated.toObject?.() ?? updated },
          });
        } catch {}
        return NextResponse.json({
          success: true,
          character: updated.toJSON?.() ?? updated,
        });
      } else {
        const bd = new Date(data.birthdate);
        if (!isNaN(bd.getTime())) {
          set.birthdate = bd;
          // age will be computed by schema pre hook as well, but set here too
          const today = new Date();
          let age = today.getFullYear() - bd.getFullYear();
          const m = today.getMonth() - bd.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
          if (age < 0) age = 0;
          set.age = age;
        }
      }
    }
    const updated = await Character.findByIdAndUpdate(
      id,
      { $set: set },
      { new: true, runValidators: true }
    );
    if (!updated)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    // Audit log update
    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'character.update',
        entityType: 'Character',
        entityId: updated._id.toString(),
        userId: me._id.toString(),
        userEmail: me.email,
        meta: { before, after: updated.toObject?.() ?? updated },
      });
    } catch {}
    return NextResponse.json({
      success: true,
      character: updated.toJSON?.() ?? updated,
    });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: e.issues },
        { status: 400 }
      );
    return NextResponse.json(
      { success: false, error: 'Failed to update character' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json(
        { success: false, error: 'Auth required' },
        { status: 401 }
      );
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || me.role !== 'admin')
      return NextResponse.json(
        { success: false, error: 'Admin only' },
        { status: 403 }
      );
    const { id } = await params;
    const url = new URL(request.url);
    const permanent = url.searchParams.get('permanent') === 'true';
    const toTrash = url.searchParams.get('trash') === 'true';
    const doc = await Character.findById(id);
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    if (permanent && doc.deletedAt) {
      await Character.findByIdAndDelete(id);
      try {
        const AuditLog = (await import('@/models/AuditLog')).default;
        await AuditLog.create({
          action: 'character.delete',
          entityType: 'Character',
          entityId: id,
          userId: me._id.toString(),
          userEmail: me.email,
          meta: { permanent: true },
        });
      } catch {}
      return NextResponse.json({
        success: true,
        message: 'Character permanently deleted',
      });
    }
    const currentTime = new Date();
    await Character.findByIdAndUpdate(id, {
      $set: { deletedAt: currentTime, deletedBy: me._id },
    });
    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'character.trash',
        entityType: 'Character',
        entityId: id,
        userId: me._id.toString(),
        userEmail: me.email,
        meta: { permanent: false, toTrash },
      });
    } catch {}
    return NextResponse.json({
      success: true,
      message: toTrash ? 'Moved to trash' : 'Character soft deleted',
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete character' },
      { status: 500 }
    );
  }
}
