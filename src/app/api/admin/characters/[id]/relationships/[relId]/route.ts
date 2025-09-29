import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import { z } from 'zod';

const UpdateRelSchema = z.object({
  relationshipType: z.string().min(1).optional(),
  description: z.string().optional(),
  strength: z.number().min(0).max(10).optional(),
  direction: z.enum(['one-way', 'mutual']).optional(),
  inverseType: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; relId: string }> }
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
    const { id, relId } = await params;
    const body = await request.json();
    const data = UpdateRelSchema.parse(body);
    const doc = await Character.findById(id);
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    const rel = doc.relationships.id(relId) as any;
    if (!rel)
      return NextResponse.json(
        { success: false, error: 'Relationship not found' },
        { status: 404 }
      );
    const before = { ...rel.toObject?.() };
    if (data.relationshipType !== undefined)
      rel.relationshipType = data.relationshipType;
    if (data.description !== undefined) rel.description = data.description;
    if (data.strength !== undefined) rel.strength = data.strength;
    if (data.direction !== undefined) rel.direction = data.direction;
    if (data.inverseType !== undefined) rel.inverseType = data.inverseType;
    if (data.startedAt !== undefined) rel.startedAt = new Date(data.startedAt);
    if (data.endedAt !== undefined) rel.endedAt = new Date(data.endedAt);
    await doc.save();

    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'character.relationship.update',
        entityType: 'Character',
        entityId: id,
        userId: me._id.toString(),
        userEmail: me.email,
        meta: { relId, before, after: rel.toObject?.() ?? rel },
      });
    } catch {}

    return NextResponse.json({ success: true, relationship: rel });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: e.issues },
        { status: 400 }
      );
    return NextResponse.json(
      { success: false, error: 'Failed to update relationship' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; relId: string }> }
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
    const { id, relId } = await params;
    const url = new URL(request.url);
    const removeReciprocal = url.searchParams.get('reciprocal') === 'true';
    const doc = await Character.findById(id);
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    const rel = (doc.relationships as any).id(relId);
    if (!rel)
      return NextResponse.json(
        { success: false, error: 'Relationship not found' },
        { status: 404 }
      );
    const targetId = rel.characterId.toString();
    rel.deleteOne();
    await doc.save();

    if (removeReciprocal) {
      const other = await Character.findById(targetId);
      if (other) {
        const match = other.relationships.find(
          (r: any) => r.characterId.toString() === id
        );
        if (match) {
          match.deleteOne();
          await other.save();
        }
      }
    }

    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'character.relationship.delete',
        entityType: 'Character',
        entityId: id,
        userId: me._id.toString(),
        userEmail: me.email,
        meta: { relId, targetId, removeReciprocal },
      });
    } catch {}

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete relationship' },
      { status: 500 }
    );
  }
}
