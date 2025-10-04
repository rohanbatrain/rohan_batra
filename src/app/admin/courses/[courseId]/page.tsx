import { Metadata } from 'next';
import CourseManagerContent from '@/components/admin/courses/CourseManagerContent';

export const metadata: Metadata = {
  title: 'Manage Course | Admin',
};

export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <CourseManagerContent courseId={courseId} />;
}
