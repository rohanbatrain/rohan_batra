import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import { CourseProgressUpdateSchema } from '@/lib/validators/courses';
import { recomputeProgress } from '@/lib/courses/progress';
import User from '@/models/User';

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const body = await req.json();
    const parsed = CourseProgressUpdateSchema.parse(body);

    const { courseId } = await ctx.params;
    const query = Types.ObjectId.isValid(courseId)
      ? { _id: new Types.ObjectId(courseId) }
      : { slug: courseId };

  const course = await CourseModel.findOne(query);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const userDoc = (await User.findOne({ clerkId: userId }).lean()) as { _id: any } | null;
  if (!userDoc || !userDoc._id) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });
  const enrollment = await CourseEnrollmentModel.findOne({ courseId: course._id, userId: userDoc._id });
    if (!enrollment)
      return NextResponse.json({ error: 'Not enrolled' }, { status: 403 });

    const progress = await CourseProgressModel.findOne({ enrollmentId: enrollment._id });
    if (!progress) return NextResponse.json({ error: 'Progress not found' }, { status: 404 });

    if (parsed.completedLessonIds) {
      const completed = new Set(parsed.completedLessonIds);
      progress.completedLessonIds = parsed.completedLessonIds.map(id => new Types.ObjectId(id));
      // Keep incomplete as complement of all lessons; local recompute handles percentages
      // We don't fetch all lessons here; previous initial set will be updated progressively by clients.
      // For accuracy, recomputation uses course structure and completed.
      // Remove any completed from incomplete list
      progress.incompleteLessonIds = (progress.incompleteLessonIds ?? []).filter(
        id => !completed.has(id.toString())
      );
    }

    if (parsed.currentLessonId !== undefined) {
      progress.currentLessonId = parsed.currentLessonId
        ? new Types.ObjectId(parsed.currentLessonId)
        : undefined;
    }

    // TODO: handle quizAttempts aggregation if needed later

    const recomputed = await recomputeProgress(
      course._id,
      progress.completedLessonIds as any
    );
    progress.moduleProgress = recomputed.moduleProgress as any;
    progress.percentageComplete = recomputed.percentageComplete;
    progress.lastUpdatedAt = new Date();

    await progress.save();
    return NextResponse.json({ success: true, percentage: progress.percentageComplete });
  } catch (err: any) {
    if (err?.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: err.issues }, { status: 400 });
    }
    console.error('[progress] error:', err);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
