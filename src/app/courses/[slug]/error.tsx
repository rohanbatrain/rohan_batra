'use client';

import Link from 'next/link';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isMongoError = error.message?.includes('Database connection') || 
                       error.message?.includes('timed out') ||
                       error.message?.includes('ECONNREFUSED') ||
                       error.message?.includes('MongoServerSelectionError');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Error Icon */}
        <div className="mx-auto h-24 w-24 rounded-full bg-destructive/10 flex items-center justify-center">
          <svg
            className="h-12 w-12 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Error Title */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isMongoError ? 'Database Connection Issue' : 'Something went wrong'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {isMongoError 
              ? 'We encountered a problem connecting to our database. This has been logged and we\'ll look into it.'
              : 'We encountered an unexpected error. This has been logged and we\'ll look into it.'}
          </p>
        </div>

        {/* Error Details (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono text-muted-foreground">
              <strong>Error Details:</strong>
            </p>
            <p className="mt-2 text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="mt-2 text-xs text-muted-foreground">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Try again
          </button>
          
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 border border-input bg-background rounded-lg hover:bg-accent transition-colors"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Go home
          </Link>
        </div>

        {/* MongoDB Troubleshooting Tips (development only) */}
        {isMongoError && process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-left">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
              💡 Troubleshooting Tips:
            </p>
            <ul className="text-xs text-yellow-700 dark:text-yellow-400 space-y-1 list-disc list-inside">
              <li>Check if MongoDB is running (local) or accessible (Atlas)</li>
              <li>Verify MONGODB_URI in .env.local is correct</li>
              <li>Check if your IP is whitelisted in MongoDB Atlas Network Access</li>
              <li>Ensure your connection string includes retry options</li>
              <li>Check MongoDB Atlas cluster status (may be paused/suspended)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
