import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
    />
  );
}

// Card skeleton for blog posts and projects
export function CardSkeleton() {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
      <Skeleton className='h-48 w-full' />
      <div className='p-6'>
        <Skeleton className='h-4 w-1/4 mb-2' />
        <Skeleton className='h-6 w-3/4 mb-3' />
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-2/3 mb-4' />
        <div className='flex items-center justify-between'>
          <Skeleton className='h-4 w-1/3' />
          <Skeleton className='h-4 w-1/4' />
        </div>
      </div>
    </div>
  );
}

// Blog post detail skeleton
export function BlogPostSkeleton() {
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-4xl mx-auto px-6 py-4'>
          <Skeleton className='h-6 w-32' />
        </div>
      </div>
      <article className='max-w-4xl mx-auto px-6 py-16'>
        <div className='mb-12'>
          <Skeleton className='h-4 w-24 mb-4' />
          <Skeleton className='h-12 w-3/4 mb-6' />
          <Skeleton className='h-6 w-full mb-2' />
          <Skeleton className='h-6 w-2/3 mb-8' />
          <div className='flex flex-wrap gap-6 mb-8'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-28' />
          </div>
          <div className='flex flex-wrap gap-2 mb-8'>
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-6 w-20 rounded-full' />
            <Skeleton className='h-6 w-14 rounded-full' />
          </div>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-10 w-20' />
            <Skeleton className='h-10 w-16' />
            <Skeleton className='h-6 w-24' />
          </div>
        </div>
        <Skeleton className='h-96 w-full mb-12' />
        <div className='space-y-4'>
          {[...Array(12)].map((_, i) => (
            <Skeleton key={i} className='h-4 w-full' />
          ))}
        </div>
      </article>
    </div>
  );
}

// Project detail skeleton
export function ProjectDetailSkeleton() {
  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-6xl mx-auto px-6 py-4'>
          <Skeleton className='h-6 w-32' />
        </div>
      </div>
      <div className='max-w-6xl mx-auto px-6 py-16'>
        <div className='mb-12'>
          <Skeleton className='h-4 w-24 mb-4' />
          <Skeleton className='h-12 w-2/3 mb-6' />
          <Skeleton className='h-6 w-full mb-2' />
          <Skeleton className='h-6 w-3/4 mb-8' />
          <div className='flex flex-wrap gap-6 mb-8'>
            <Skeleton className='h-4 w-20' />
            <Skeleton className='h-4 w-28' />
          </div>
          <div className='flex flex-wrap gap-2 mb-8'>
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-6 w-20 rounded-full' />
            <Skeleton className='h-6 w-18 rounded-full' />
            <Skeleton className='h-6 w-14 rounded-full' />
          </div>
          <div className='flex gap-4'>
            <Skeleton className='h-12 w-32' />
            <Skeleton className='h-12 w-28' />
          </div>
        </div>
        <Skeleton className='h-80 w-full mb-6' />
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-16'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-24 w-full' />
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16'>
          {[...Array(3)].map((_, i) => (
            <div key={i} className='p-6'>
              <Skeleton className='h-6 w-3/4 mb-4' />
              <Skeleton className='h-4 w-full mb-2' />
              <Skeleton className='h-4 w-2/3' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Grid layout skeleton
export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
      {[...Array(count)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

// List layout skeleton
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className='space-y-6'>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className='flex gap-6 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm'
        >
          <Skeleton className='h-24 w-32 flex-shrink-0' />
          <div className='flex-1'>
            <Skeleton className='h-4 w-1/4 mb-2' />
            <Skeleton className='h-6 w-3/4 mb-3' />
            <Skeleton className='h-4 w-full mb-2' />
            <Skeleton className='h-4 w-2/3 mb-4' />
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-1/3' />
              <Skeleton className='h-4 w-1/4' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
