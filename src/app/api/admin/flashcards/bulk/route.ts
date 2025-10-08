import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import UserModel from '@/models/User';
import { createAuditLog } from '@/lib/audit-log';

// Limit bulk operations to 100 items maximum
const BulkDeleteSchema = z.object({
  ids: z
    .array(z.string())
    .min(1)
    .max(100, 'Maximum 100 items can be deleted at once'),
});

const BulkUpdateSchema = z.object({
  ids: z
    .array(z.string())
    .min(1)
    .max(100, 'Maximum 100 items can be updated at once'),
  updates: z.object({
    status: z.enum(['draft', 'published', 'archived']).optional(),
    visibility: z.enum(['public', 'unlisted', 'private']).optional(),
    tags: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
  }),
});

async function assertEditorOrAdmin(userId: string) {
  await connectToDatabase();
  const currentUser = await UserModel.findOne({ clerkId: userId });
  const userRole = (currentUser?.role as string) || 'user';
  if (!['editor', 'admin'].includes(userRole)) {
    return { ok: false as const };
  }
  return { ok: true as const };
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authz = await assertEditorOrAdmin(userId);
    if (!authz.ok)
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );

    const body = await request.json();
    const { ids } = BulkDeleteSchema.parse(body);

    const objectIds = ids
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    if (objectIds.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    const decks = await FlashcardDeckModel.find({ _id: { $in: objectIds } })
      .select(['_id', 'title'])
      .lean();
    const deckIds = decks.map(d => d._id);

    if (deckIds.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    // Create audit log before deletion
    await createAuditLog(
      {
        userId,
        action: 'delete',
        resource: 'FlashcardDeck',
        resourceId: 'bulk',
        changes: {
          before: {
            deckIds: deckIds.map(id => id.toString()),
            deckTitles: decks.map((d: any) => d.title),
            count: deckIds.length,
          },
        },
      },
      request
    );

    await Promise.all([
      FlashcardDeckModel.deleteMany({ _id: { $in: deckIds } }),
      FlashcardCardModel.deleteMany({ deckId: { $in: deckIds } }),
      CourseModel.updateMany(
        { flashcardDeckIds: { $in: deckIds } },
        { $pull: { flashcardDeckIds: { $in: deckIds } } }
      ),
      CourseModuleModel.updateMany(
        { flashcardDeckIds: { $in: deckIds } },
        { $pull: { flashcardDeckIds: { $in: deckIds } } }
      ),
      CourseLessonModel.updateMany(
        { flashcardDeckIds: { $in: deckIds } },
        { $pull: { flashcardDeckIds: { $in: deckIds } } }
      ),
    ]);

    return NextResponse.json({ deleted: deckIds.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Bulk delete flashcards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/flashcards/bulk
 * Bulk update flashcard decks
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const authz = await assertEditorOrAdmin(userId);
    if (!authz.ok)
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );

    const body = await request.json();
    const { ids, updates } = BulkUpdateSchema.parse(body);

    const objectIds = ids
      .filter(id => Types.ObjectId.isValid(id))
      .map(id => new Types.ObjectId(id));
    if (objectIds.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    // Build update object
    const updateObj: any = {};
    if (updates.status) {
      updateObj.status = updates.status;
      if (updates.status === 'published') {
        updateObj.publishedAt = new Date();
      }
    }
    if (updates.visibility) {
      updateObj.visibility = updates.visibility;
    }
    if (updates.tags !== undefined) {
      updateObj.tags = updates.tags;
    }
    if (updates.categories !== undefined) {
      updateObj.categories = updates.categories;
    }

    // Get decks before update for audit log
    const decksBefore = await FlashcardDeckModel.find({
      _id: { $in: objectIds },
    })
      .select(['_id', 'title', 'status', 'visibility', 'tags', 'categories'])
      .lean();

    if (decksBefore.length === 0) {
      return NextResponse.json({ updated: 0 });
    }

    // Update the decks
    const result = await FlashcardDeckModel.updateMany(
      { _id: { $in: objectIds } },
      { $set: updateObj }
    );

    // Create audit log
    await createAuditLog(
      {
        userId,
        action: 'update',
        resource: 'FlashcardDeck',
        resourceId: 'bulk',
        changes: {
          before: {
            deckIds: decksBefore.map((d: any) => d._id.toString()),
            deckTitles: decksBefore.map((d: any) => d.title),
            count: decksBefore.length,
          },
          after: {
            updates: updateObj,
          },
        },
      },
      request
    );

    return NextResponse.json({
      updated: result.modifiedCount,
      message: `Successfully updated ${result.modifiedCount} deck(s)`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Bulk update flashcards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
