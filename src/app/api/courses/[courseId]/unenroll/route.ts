import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import User from '@/models/User';

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.redirect('/sign-in');

    await connectToDatabase();
    const { courseId } = await ctx.params;
    const query = Types.ObjectId.isValid(courseId)
      ? { _id: new Types.ObjectId(courseId) }
      : { slug: courseId };
    const course = await CourseModel.findOne(query);
    if (!course) return NextResponse.redirect('/courses');

    const userDoc = (await User.findOne({ clerkId: userId }).lean()) as { _id: any } | null;
    if (!userDoc || !userDoc._id) return NextResponse.redirect(`/courses/${course.slug}`);

    const enrollment = await CourseEnrollmentModel.findOne({ courseId: course._id, userId: userDoc._id });
    if (enrollment) {
      await Promise.all([
        CourseProgressModel.deleteOne({ enrollmentId: enrollment._id }),
        CourseEnrollmentModel.deleteOne({ _id: enrollment._id }),
      ]);
    }

    return NextResponse.redirect(`/courses/${course.slug}`);
  } catch (err) {
    // Always redirect back; errors can be logged server-side
    return NextResponse.redirect('/courses');
  }
}

export const dynamic = 'force-dynamic';
