import { Metadata } from 'next';
import LessonForm from '@/components/admin/courses/LessonForm';

export const metadata: Metadata = {
  title: 'Add Lesson | Admin',
};

type PageParams = { params: { courseId: string; moduleId: string } };

export default function NewLessonPage({ params }: PageParams) {
  const { courseId, moduleId } = params;
  return <LessonForm courseId={courseId} moduleId={moduleId} mode='create' />;
}
