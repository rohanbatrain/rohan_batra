'use client';

import { useParams } from 'next/navigation';
import SectionForm from '@/components/admin/section-form';

export default function NewSectionPage() {
  const params = useParams();
  const projectId = params?.id as string;

  return <SectionForm projectId={projectId} />;
}
