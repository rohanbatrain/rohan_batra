import { Metadata } from 'next';
import LessonForm from '@/components/admin/courses/LessonForm';

export const metadata: Metadata = {
  title: 'Edit Lesson | Admin',
};

type PageParams = { params: { courseId: string; moduleId: string; lessonId: string } };

export default function EditLessonPage({ params }: PageParams) {
  const { courseId, moduleId, lessonId } = params;
  return (
    <LessonForm courseId={courseId} moduleId={moduleId} mode='edit' lessonId={lessonId} />
  );
}
