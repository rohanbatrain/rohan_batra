'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4'>
      <div className='max-w-md w-full text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Error Icon */}
          <div className='flex justify-center mb-6'>
            <div className='w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center'>
              <AlertTriangle className='w-10 h-10 text-red-600 dark:text-red-400' />
            </div>
          </div>

          {/* Error Message */}
          <h1 className='text-2xl font-bold text-gray-900 dark:text-white mb-4'>
            Something went wrong
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mb-8'>
            We encountered an unexpected error. This has been logged and
            we&apos;ll look into it.
          </p>

          {/* Error Details (in development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className='mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
                Error Details:
              </h3>
              <p className='text-xs text-gray-600 dark:text-gray-400 font-mono'>
                {error.message}
              </p>
              {error.digest && (
                <p className='text-xs text-gray-500 dark:text-gray-500 mt-2'>
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button
              onClick={reset}
              className='inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
            >
              <RefreshCw className='w-4 h-4' />
              Try again
            </button>
            <Link
              href='/'
              className='inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium'
            >
              <Home className='w-4 h-4' />
              Go home
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
