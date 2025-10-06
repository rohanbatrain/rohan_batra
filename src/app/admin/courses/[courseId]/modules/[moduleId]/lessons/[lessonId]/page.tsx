import { Metadata } from 'next';
import LessonForm from '@/components/admin/courses/LessonForm';

export const metadata: Metadata = {
  title: 'Edit Lesson | Admin',
};

type PageParams = { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> };

export default async function EditLessonPage({ params }: PageParams) {
  const { courseId, moduleId, lessonId } = await params;
  return (
    <LessonForm courseId={courseId} moduleId={moduleId} mode='edit' lessonId={lessonId} />
  );
}
