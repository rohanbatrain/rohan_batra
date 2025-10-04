import { Metadata } from 'next';
import NewLessonForm from '@/components/admin/courses/NewLessonForm';

export const metadata: Metadata = {
  title: 'Add Lesson | Admin',
};

type PageParams = { params: Promise<{ courseId: string; moduleId: string }> };

export default async function NewLessonPage({ params }: PageParams) {
  const { courseId, moduleId } = await params;
  return <NewLessonForm courseId={courseId} moduleId={moduleId} />;
}
