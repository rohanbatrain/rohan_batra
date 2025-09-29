import { Metadata } from 'next';
import CoursesManagement from '@/components/admin/courses/CoursesManagement';

export const metadata: Metadata = {
  title: 'Courses | Admin Dashboard',
  description: 'Manage courses, modules, lessons, and flashcard relationships.',
};

export default function AdminCoursesPage() {
  return <CoursesManagement />;
}
