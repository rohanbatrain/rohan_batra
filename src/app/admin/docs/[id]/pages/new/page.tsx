'use client';

import { useParams } from 'next/navigation';
import DocEditor from '@/components/admin/doc-editor';

export default function NewDocPagePage() {
  const params = useParams();
  const projectId = params?.id as string;

  return <DocEditor projectId={projectId} />;
}
