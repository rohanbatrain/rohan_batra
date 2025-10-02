'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import DocEditor from '@/components/admin/doc-editor';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

const fetcher = (url: string) =>
  fetch(url).then(res => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  });

export default function EditDocPagePage() {
  const params = useParams();
  const pageId = params?.id as string;

  const { data, error, isLoading } = useSWR(`/api/admin/docs/pages/${pageId}`, fetcher);

  if (isLoading) {
    return (
      <div className='container mx-auto max-w-7xl space-y-6 p-6'>
        <Skeleton className='h-12 w-3/4' />
        <Skeleton className='h-96 w-full' />
      </div>
    );
  }

  if (error || !data?.page) {
    return (
      <div className='container mx-auto max-w-7xl space-y-6 p-6'>
        <Alert variant='destructive'>
          <AlertTriangle className='h-4 w-4' />
          <AlertDescription>
            {error?.message || 'Page not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const page = data.page;

  return (
    <DocEditor
      projectId={page.docProjectId}
      pageId={page._id}
      initialData={{
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt,
        sectionId: page.sectionId,
        parentPageId: page.parentPageId,
        status: page.status,
        order: page.order,
        seo: page.seo,
      }}
    />
  );
}
