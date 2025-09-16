import { GridSkeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='text-center mb-12'>
          <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-4 animate-pulse' />
          <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto animate-pulse' />
        </div>
        <div className='mb-8'>
          <div className='flex gap-4 justify-center'>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse' />
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-24 animate-pulse' />
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse' />
          </div>
        </div>
        <GridSkeleton count={6} />
      </div>
    </div>
  );
}
