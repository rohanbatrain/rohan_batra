import { Metadata } from 'next';
import CourseCreateContent from '@/components/admin/courses/CourseCreateContent';

export const metadata: Metadata = {
  title: 'Create Course | Admin',
  description: 'Create a new course and then add modules and lessons.',
};

export default function CreateCoursePage() {
  return <CourseCreateContent />;
}
