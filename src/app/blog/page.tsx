import { Suspense } from 'react';
import { BlogPostWithAuthor } from '@/types/blog-post';
import { getBlogPostsWithPagination } from '@/lib/blog-service';
import BlogPageClient from './BlogPageClient';
import { BlogErrorBoundary } from '@/components/ErrorBoundary';
import { GridSkeleton } from '@/components/ui/skeleton';

// Server-side data fetching
async function getBlogPosts(): Promise<{
  posts: BlogPostWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}> {
  return getBlogPostsWithPagination({
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

export default async function BlogPage() {
  const { posts, pagination } = await getBlogPosts();

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <BlogErrorBoundary>
          <Suspense fallback={<LoadingSkeleton />}>
            <BlogPageClient
              initialPosts={posts}
              initialPagination={pagination}
            />
          </Suspense>
        </BlogErrorBoundary>
      </div>
    </div>
  );
}
