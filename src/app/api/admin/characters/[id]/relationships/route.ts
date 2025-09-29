import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Character from '@/models/Character';
import { z } from 'zod';

const CreateRelSchema = z.object({
  targetId: z.string().min(1),
  relationshipType: z.string().min(1),
  description: z.string().optional(),
  strength: z.number().min(0).max(10).optional(),
  direction: z.enum(['one-way', 'mutual']).optional(),
  inverseType: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  reciprocal: z.boolean().optional(),
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
    const doc = await Character.findById(id)
      .populate('relationships.characterId', 'name slug')
      .lean();
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    const d: any = doc as any;
    const relationships = (d.relationships || []).map((r: any) => ({
      id: r._id?.toString(),
      characterId: r.characterId?._id?.toString() || r.characterId?.toString(),
      characterName: r.characterId?.name,
      characterSlug: r.characterId?.slug,
      relationshipType: r.relationshipType,
      description: r.description,
      strength: r.strength,
      direction: r.direction,
      inverseType: r.inverseType,
      startedAt: r.startedAt,
      endedAt: r.endedAt,
    }));
    return NextResponse.json({ success: true, relationships });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Failed to list relationships' },
      { status: 500 }
    );
  }
}

export async function POST(
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
    const data = CreateRelSchema.parse(body);

    const source = await Character.findById(id);
    const target = await Character.findById(data.targetId);
    if (!source || !target)
      return NextResponse.json(
        { success: false, error: 'Character not found' },
        { status: 404 }
      );

    const rel = {
      characterId: target._id,
      relationshipType: data.relationshipType,
      description: data.description,
      strength: data.strength ?? 5,
      direction: data.direction ?? 'mutual',
      inverseType: data.inverseType,
      startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
      endedAt: data.endedAt ? new Date(data.endedAt) : undefined,
    } as any;

    source.relationships.push(rel);
    await source.save();

    let reciprocalCreated = false;
    if (data.reciprocal && (data.direction ?? 'mutual') === 'mutual') {
      const inverse = {
        characterId: source._id,
        relationshipType: data.inverseType || data.relationshipType,
        description: data.description,
        strength: data.strength ?? 5,
        direction: 'mutual',
        inverseType: data.relationshipType,
        startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
        endedAt: data.endedAt ? new Date(data.endedAt) : undefined,
      } as any;
      target.relationships.push(inverse);
      await target.save();
      reciprocalCreated = true;
    }

    try {
      const AuditLog = (await import('@/models/AuditLog')).default;
      await AuditLog.create({
        action: 'character.relationship.create',
        entityType: 'Character',
        entityId: source._id.toString(),
        userId: me._id.toString(),
        userEmail: me.email,
        meta: {
          targetId: target._id.toString(),
          relationshipType: data.relationshipType,
          reciprocal: reciprocalCreated,
        },
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
      { success: false, error: 'Failed to create relationship' },
      { status: 500 }
    );
  }
}
