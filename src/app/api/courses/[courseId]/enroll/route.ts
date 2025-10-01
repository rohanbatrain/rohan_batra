import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import { buildInitialProgress } from '@/lib/courses/progress';
import User from '@/models/User';

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const { courseId } = await ctx.params;
    const query = Types.ObjectId.isValid(courseId)
      ? { _id: new Types.ObjectId(courseId) }
      : { slug: courseId };

    const course = await CourseModel.findOne({ ...query, status: 'published', visibility: 'public' });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const userDoc = (await User.findOne({ clerkId: userId }).lean()) as { _id: any } | null;
  if (!userDoc || !userDoc._id) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existing = await CourseEnrollmentModel.findOne({ courseId: course._id, userId: userDoc._id });
    if (existing) {
      // idempotent
      const { pathname } = new URL(req.url);
      // redirect back to course page if slug, otherwise to /courses
      const backTo = pathname.includes('/courses/') ? pathname.replace('/api/courses/', '/courses/').replace('/enroll', '') : `/courses/${course.slug}`;
      return NextResponse.redirect(backTo);
    }

    const enrollment = await CourseEnrollmentModel.create({
      courseId: course._id,
  userId: userDoc._id,
      status: 'in_progress',
      origin: 'self_enroll',
      enrolledAt: new Date(),
      lastAccessedAt: new Date(),
    } as any);

    const initial = await buildInitialProgress(course._id);
    await CourseProgressModel.create({
      courseId: course._id,
  userId: userDoc._id,
      enrollmentId: enrollment._id,
      ...initial,
      lastUpdatedAt: new Date(),
    } as any);

  const { pathname } = new URL(req.url);
  const backTo = pathname.includes('/courses/') ? pathname.replace('/api/courses/', '/courses/').replace('/enroll', '') : `/courses/${course.slug}`;
  return NextResponse.redirect(backTo);
  } catch (err) {
    console.error('[enroll] error:', err);
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { courseId } = await ctx.params;
    const query = Types.ObjectId.isValid(courseId)
      ? { _id: new Types.ObjectId(courseId) }
      : { slug: courseId };

    const course = await CourseModel.findOne(query);
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });

  const userDoc = (await User.findOne({ clerkId: userId }).lean()) as { _id: any } | null;
  if (!userDoc || !userDoc._id) return NextResponse.json({ removed: true });
  const enrollment = await CourseEnrollmentModel.findOne({ courseId: course._id, userId: userDoc._id });
    if (!enrollment) return NextResponse.json({ removed: true });

    await Promise.all([
      CourseProgressModel.deleteOne({ enrollmentId: enrollment._id }),
      CourseEnrollmentModel.deleteOne({ _id: enrollment._id }),
    ]);

    return NextResponse.json({ removed: true });
  } catch (err) {
    console.error('[unenroll] error:', err);
    return NextResponse.json({ error: 'Failed to unenroll' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
