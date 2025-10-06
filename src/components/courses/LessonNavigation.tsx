'use client';

import Link from 'next/link';

interface LessonNavigationProps {
  courseSlug: string;
  currentLessonId: string;
  previousLesson?: {
    id: string;
    title: string;
  } | null;
  nextLesson?: {
    id: string;
    title: string;
  } | null;
}

export default function LessonNavigation({
  courseSlug,
  currentLessonId,
  previousLesson,
  nextLesson,
}: LessonNavigationProps) {
  return (
    <div className='mt-8 flex items-center justify-between gap-4'>
      {previousLesson ? (
        <Link
          href={`/courses/${courseSlug}/lesson/${previousLesson.id}`}
          className='group flex flex-1 items-center gap-3 rounded-lg border border-gray-300 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-600'
        >
          <svg
            className='h-6 w-6 flex-shrink-0 text-gray-400 transition-transform group-hover:-translate-x-1 dark:text-gray-500'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M15 19l-7-7 7-7'
            />
          </svg>
          <div className='min-w-0 flex-1'>
            <div className='text-xs font-medium text-gray-500 dark:text-gray-400'>
              Previous
            </div>
            <div className='truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
              {previousLesson.title}
            </div>
          </div>
        </Link>
      ) : (
        <div className='flex-1' />
      )}

      {nextLesson ? (
        <Link
          href={`/courses/${courseSlug}/lesson/${nextLesson.id}`}
          className='group flex flex-1 items-center gap-3 rounded-lg border border-gray-300 bg-white p-4 text-right transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-600'
        >
          <div className='min-w-0 flex-1'>
            <div className='text-xs font-medium text-gray-500 dark:text-gray-400'>
              Next
            </div>
            <div className='truncate text-sm font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
              {nextLesson.title}
            </div>
          </div>
          <svg
            className='h-6 w-6 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 dark:text-gray-500'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </Link>
      ) : (
        <div className='flex-1' />
      )}
    </div>
  );
}
