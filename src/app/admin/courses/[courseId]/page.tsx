import { Metadata } from 'next';
import CourseManagerContent from '@/components/admin/courses/CourseManagerContent';

export const metadata: Metadata = {
  title: 'Manage Course | Admin',
};

export default function ManageCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  return <CourseManagerContent courseId={params.courseId} />;
}
