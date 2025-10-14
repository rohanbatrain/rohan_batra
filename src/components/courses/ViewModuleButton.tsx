'use client';

import Link from 'next/link';

interface ViewModuleButtonProps {
  courseSlug: string;
  moduleId: string;
  moduleTitle: string;
  isLocked?: boolean;
  isEnrolled?: boolean;
}

export function ViewModuleButton({
  courseSlug,
  moduleId,
  moduleTitle,
  isLocked = false,
  isEnrolled = false,
}: ViewModuleButtonProps) {
  // Non-enrolled users can preview any module (exploration before enrolling)
  // Enrolled users cannot access locked modules (must complete previous modules first)
  const buttonText = isLocked && isEnrolled ? '🔒 Locked Module' : 'View Module';
  const isDisabled = isLocked && isEnrolled;

  if (isDisabled) {
    return (
      <button
        disabled
        className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-400 cursor-not-allowed dark:border-gray-600 dark:bg-gray-700 dark:text-gray-500"
        aria-label={`Module locked: ${moduleTitle}`}
        title="Complete previous modules to unlock"
      >
        {buttonText}
      </button>
    );
  }

  return (
    <Link
      href={`/courses/${courseSlug}/module/${moduleId}`}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={`View module: ${moduleTitle}`}
    >
      {buttonText}
    </Link>
  );
}
