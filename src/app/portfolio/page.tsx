import { Suspense } from 'react';
import { ProjectWithAuthor } from '@/types/project';
import { headers } from 'next/headers';
import { getCurrentDeploymentConfig } from '@/lib/config';
import PortfolioPageClient from './PortfolioPageClient';
import { PortfolioErrorBoundary } from '@/components/ErrorBoundary';
import { GridSkeleton } from '@/components/ui/skeleton';

// Server-side data fetching
async function getProjectsFromApi(params?: { tag?: string; category?: string; technology?: string; page?: number; limit?: number; search?: string }): Promise<{
  projects: ProjectWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12; // server-side pagination default
  const qs = new URLSearchParams();
  qs.set('page', String(page));
  qs.set('limit', String(limit));
  if (params?.category) qs.set('category', params.category);
  if (params?.technology) qs.set('technology', params.technology);
  if (params?.tag) qs.set('tag', params.tag);
  if (params?.search) qs.set('search', params.search);

  // Build absolute URL for server-side fetch
  const hdrs = await headers();
  const xfProto = hdrs.get('x-forwarded-proto');
  const xfHost = hdrs.get('x-forwarded-host');
  const host = hdrs.get('host');
  const protocol = xfProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const originFromHeaders = (xfHost || host) ? `${protocol}://${xfHost || host}` : undefined;
  const configOrigin = getCurrentDeploymentConfig().siteUrl;
  const baseUrl = originFromHeaders || configOrigin || 'http://localhost:3000';

  const res = await fetch(`${baseUrl}/api/portfolio/projects?${qs.toString()}`, { cache: 'no-store' });
  const json = await res.json();
  const data = json?.data ?? { projects: [], totalProjects: 0, totalPages: 0, currentPage: page };

  return {
    projects: data.projects,
    pagination: {
      page: data.currentPage,
      limit,
      total: data.totalProjects,
      totalPages: data.totalPages,
      hasNext: data.currentPage < data.totalPages,
      hasPrev: data.currentPage > 1,
    },
  };
}

function LoadingSkeleton() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4 animate-pulse' />
          <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse' />
        </div>
        <div className='mb-8'>
          <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md animate-pulse' />
        </div>
        <GridSkeleton count={6} />
      </div>
    </div>
  );
}

export default async function PortfolioPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const sp = await searchParams;
  const initialTag = typeof sp?.tag === 'string' ? decodeURIComponent(sp.tag) : undefined;
  const category = typeof sp?.category === 'string' ? decodeURIComponent(sp.category) : undefined;
  const technology = typeof sp?.technology === 'string' ? decodeURIComponent(sp.technology) : undefined;
  const pageNum = sp?.page ? Number(sp.page) || 1 : 1;
  const search = typeof sp?.search === 'string' ? decodeURIComponent(sp.search) : undefined;
  const { projects, pagination } = await getProjectsFromApi({ tag: initialTag, category, technology, page: pageNum, limit: 12, search });

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <PortfolioErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <PortfolioPageClient
              initialProjects={projects}
              initialPagination={pagination}
              initialTag={initialTag}
              initialCategory={category}
              initialTechnology={technology}
              initialSearch={search}
            />
          </Suspense>
        </PortfolioErrorBoundary>
      </div>
    </div>
  );
}
