import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { z } from 'zod';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import UserModel from '@/models/User';

const BulkDeleteSchema = z.object({ ids: z.array(z.string()).min(1) });

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
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const authz = await assertEditorOrAdmin(userId);
    if (!authz.ok) return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });

    const body = await request.json();
    const { ids } = BulkDeleteSchema.parse(body);

    const objectIds = ids.filter(id => Types.ObjectId.isValid(id)).map(id => new Types.ObjectId(id));
    if (objectIds.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    // Collect all course ids found
    const courses = await CourseModel.find({ _id: { $in: objectIds } }).select(['_id']).lean();
    const courseIds = courses.map(c => c._id);
    if (courseIds.length === 0) {
      return NextResponse.json({ deleted: 0 });
    }

    await Promise.all([
      CourseLessonModel.deleteMany({ courseId: { $in: courseIds } }),
      CourseModuleModel.deleteMany({ courseId: { $in: courseIds } }),
      FlashcardDeckModel.updateMany(
        { 'linkTargets.courseId': { $in: courseIds } },
        { $pull: { linkTargets: { courseId: { $in: courseIds } } } }
      ),
      CourseModel.deleteMany({ _id: { $in: courseIds } }),
    ]);

    return NextResponse.json({ deleted: courseIds.length });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: error.issues }, { status: 400 });
    }
    console.error('Bulk delete courses error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
