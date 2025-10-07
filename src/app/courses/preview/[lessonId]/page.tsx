import connectToDatabase from '@/lib/mongodb';
import CourseLesson from '@/models/CourseLesson';
import Course from '@/models/Course';
import { notFound, redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

// This route is deprecated - redirect to the unified lesson viewer
export default async function LessonPreviewRedirect({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  await connectToDatabase();

  const lesson = await CourseLesson.findById(lessonId).select('courseId').lean();
  if (!lesson) return notFound();

  const course = await Course.findById(lesson.courseId).select('slug').lean();
  if (!course?.slug) return notFound();

  // Redirect to the unified lesson viewer
  redirect(`/courses/${course.slug}/lesson/${lessonId}`);
}
