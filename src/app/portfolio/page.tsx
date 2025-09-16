import { Suspense } from 'react';
import { ProjectWithAuthor } from '@/types/project';
import { getProjectsWithPagination } from '@/lib/portfolio-service';
import PortfolioPageClient from './PortfolioPageClient';
import { PortfolioErrorBoundary } from '@/components/ErrorBoundary';
import { GridSkeleton } from '@/components/ui/skeleton';

// Server-side data fetching
async function getProjects(): Promise<{
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
  return getProjectsWithPagination({
    status: 'published',
    limit: 12,
  });
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

export default async function PortfolioPage() {
  const { projects, pagination } = await getProjects();

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <PortfolioErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <PortfolioPageClient
              initialProjects={projects}
              initialPagination={pagination}
            />
          </Suspense>
        </PortfolioErrorBoundary>
      </div>
    </div>
  );
}
