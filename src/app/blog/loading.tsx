import { GridSkeleton } from '@/components/ui/skeleton';

export default function BlogLoading() {
  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Header skeleton */}
        <div className='text-center mb-12'>
          <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-64 mx-auto mb-4 animate-pulse' />
          <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-96 mx-auto animate-pulse' />
        </div>

        {/* Search and filters skeleton */}
        <div className='mb-8'>
          <div className='flex flex-col lg:flex-row gap-4 items-center justify-between'>
            <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-full max-w-md animate-pulse' />
            <div className='flex gap-4'>
              <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse' />
              <div className='h-10 bg-gray-200 dark:bg-gray-700 rounded w-28 animate-pulse' />
            </div>
          </div>
        </div>

        {/* Results count skeleton */}
        <div className='mb-6'>
          <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-48 animate-pulse' />
        </div>

        {/* Featured posts skeleton */}
        <div className='mb-12'>
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-6 animate-pulse' />
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
              <div className='h-64 bg-gray-200 dark:bg-gray-700 animate-pulse' />
              <div className='p-6'>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse' />
                <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse' />
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse' />
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse' />
              </div>
            </div>
            <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
              <div className='h-64 bg-gray-200 dark:bg-gray-700 animate-pulse' />
              <div className='p-6'>
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2 animate-pulse' />
                <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3 animate-pulse' />
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2 animate-pulse' />
                <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse' />
              </div>
            </div>
          </div>
        </div>

        {/* All posts skeleton */}
        <div>
          <div className='h-8 bg-gray-200 dark:bg-gray-700 rounded w-36 mb-6 animate-pulse' />
          <GridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
