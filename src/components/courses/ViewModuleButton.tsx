'use client';

import Link from 'next/link';

interface ViewModuleButtonProps {
  courseSlug: string;
  moduleId: string;
  moduleTitle: string;
}

export function ViewModuleButton({
  courseSlug,
  moduleId,
  moduleTitle,
}: ViewModuleButtonProps) {
  return (
    <Link
      href={`/courses/${courseSlug}/module/${moduleId}`}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label={`View module: ${moduleTitle}`}
    >
      View Module
    </Link>
  );
}
