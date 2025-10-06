'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface MarkCompleteButtonProps {
  courseSlug: string;
  courseId: string;
  lessonId: string;
  isCompleted?: boolean;
  hasSubLessons?: boolean;
  allSubLessonsCompleted?: boolean;
}

export default function MarkCompleteButton({
  courseSlug,
  courseId,
  lessonId,
  isCompleted: initialCompleted = false,
  hasSubLessons = false,
  allSubLessonsCompleted = true,
}: MarkCompleteButtonProps) {
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Check if button should be disabled
  // Allow clicking when completed (for unmarking) or when can complete
  const canComplete = !hasSubLessons || allSubLessonsCompleted;
  const isDisabled = isLoading || (!isCompleted && !canComplete);

  const handleMarkComplete = async () => {
    if (!canComplete && !isCompleted) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/courses/${courseId}/progress/complete-lesson`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            lessonId,
            markAsComplete: !isCompleted // Toggle: if completed, mark as incomplete
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update lesson completion status');
      }

      const data = await response.json();
      setIsCompleted(!isCompleted);

      // Refresh the page to update UI
      router.refresh();
    } catch (error) {
      console.error('Error updating lesson completion:', error);
      // Optional: Show error toast
      // toast.error('Failed to update lesson completion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='flex flex-col items-end gap-2'>
      <button
        onClick={handleMarkComplete}
        disabled={isDisabled}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          isCompleted
            ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
            : isLoading
            ? 'bg-gray-400 text-white cursor-wait'
            : !canComplete
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={
          isCompleted 
            ? 'Click to mark as incomplete' 
            : !canComplete 
            ? 'Complete all sub-lessons first' 
            : 'Mark this lesson as complete'
        }
      >
        {isCompleted ? (
          <span className='flex items-center gap-2'>
            <svg className='h-4 w-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
            </svg>
            Completed
          </span>
        ) : isLoading ? (
          isCompleted ? 'Unmarking...' : 'Marking...'
        ) : (
          'Mark as Complete'
        )}
      </button>
      {!canComplete && !isCompleted && (
        <p className='text-xs text-orange-600 dark:text-orange-400'>
          ⚠️ Complete all sub-lessons first
        </p>
      )}
    </div>
  );
}
