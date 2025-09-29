import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import CharacterJournal from '@/models/CharacterJournal';
import { z } from 'zod';

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  content: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  // Accept either ISO datetime or simple YYYY-MM-DD; null clears value
  entryDate: z
    .union([z.string().regex(/^\d{4}-\d{2}-\d{2}$/), z.string().datetime()])
    .nullable()
    .optional(),
  mood: z.string().optional(),
  location: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPrivate: z.boolean().optional(),
  publishedAt: z.string().datetime().nullable().optional(),
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
    const { id } = await params;
    const doc = await CharacterJournal.findById(id);
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    return NextResponse.json({ success: true, journal: doc });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch journal' },
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
    const { id } = await params;
    const body = await request.json();
    const data = UpdateSchema.parse(body);
    const update: any = { ...data };
    if (data.entryDate !== undefined) {
      if (data.entryDate === null) {
        update.entryDate = undefined;
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(data.entryDate)) {
        const [y, m, d] = (data.entryDate as string).split('-').map(Number);
        update.entryDate = new Date(
          Date.UTC(y, (m as number) - 1, d as number)
        );
      } else {
        update.entryDate = new Date(data.entryDate as string);
      }
    }
    if (data.publishedAt !== undefined)
      update.publishedAt = data.publishedAt
        ? new Date(data.publishedAt)
        : undefined;
    if (data.status === 'published' && !update.publishedAt)
      update.publishedAt = new Date();
    const doc = await CharacterJournal.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    return NextResponse.json({ success: true, journal: doc });
  } catch (e) {
    if (e instanceof z.ZodError)
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: e.issues },
        { status: 400 }
      );
    return NextResponse.json(
      { success: false, error: 'Failed to update journal' },
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
    const doc = await CharacterJournal.findById(id);
    if (!doc)
      return NextResponse.json(
        { success: false, error: 'Not found' },
        { status: 404 }
      );
    if (permanent && doc.deletedAt) {
      await CharacterJournal.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: 'Journal permanently deleted',
      });
    }
    await CharacterJournal.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date(), deletedBy: me._id },
    });
    return NextResponse.json({
      success: true,
      message: toTrash ? 'Moved to trash' : 'Journal soft deleted',
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to delete journal' },
      { status: 500 }
    );
  }
}
