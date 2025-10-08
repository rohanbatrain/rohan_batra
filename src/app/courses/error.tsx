/**
 * Course Error Boundary
 * Handles errors in course pages
 */

'use client';

import { useEffect } from 'react';
import { AlertTriangle, BookOpen, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CourseError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Course error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
        </div>

        {/* Error Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Failed to Load Course
          </h1>
          <p className="text-lg text-muted-foreground">
            We encountered an error while loading this course.
          </p>
        </div>

        {/* Error Details (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="p-4 bg-muted rounded-lg text-left max-w-lg mx-auto">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-muted-foreground mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/courses" className="gap-2">
              <BookOpen className="w-4 h-4" />
              All Courses
            </Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/" className="gap-2">
              <Home className="w-4 h-4" />
              Home
            </Link>
          </Button>
        </div>

        {/* Help Text */}
        <p className="text-sm text-muted-foreground">
          This might be a temporary issue. If it continues, please try again later
          or visit our{' '}
          <Link
            href="/courses"
            className="text-primary underline underline-offset-4"
          >
            course catalog
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
