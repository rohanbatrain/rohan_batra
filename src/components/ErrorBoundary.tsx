'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // In production, you would send this to your error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error, { extra: errorInfo });
    }
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error!}
          reset={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className='min-h-[400px] flex items-center justify-center p-8'>
      <div className='max-w-md w-full text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
          <h3 className='text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2'>
            Something went wrong
          </h3>
          <p className='text-gray-600 dark:text-gray-300 mb-6'>
            We encountered an error while loading this content.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <details className='text-left mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg'>
              <summary className='cursor-pointer text-sm font-medium text-red-700 dark:text-red-300 mb-2'>
                Error Details
              </summary>
              <pre className='text-xs text-red-600 dark:text-red-400 overflow-auto'>
                {error.message}
                {error.stack && (
                  <>
                    {'\n\n'}
                    {error.stack}
                  </>
                )}
              </pre>
            </details>
          )}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className='inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
          >
            <RefreshCw className='w-4 h-4' />
            <span>Try Again</span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

// Specialized error boundaries for different sections
export function BlogErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary fallback={BlogErrorFallback}>{children}</ErrorBoundary>;
}

export function PortfolioErrorBoundary({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary fallback={PortfolioErrorFallback}>{children}</ErrorBoundary>
  );
}

function BlogErrorFallback({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700'>
      <div className='text-center'>
        <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
          Failed to load blog content
        </h3>
        <p className='text-gray-600 dark:text-gray-300 mb-4'>
          There was an error loading the blog posts.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className='inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
        >
          <RefreshCw className='w-4 h-4' />
          <span>Retry</span>
        </motion.button>
      </div>
    </div>
  );
}

function PortfolioErrorFallback({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700'>
      <div className='text-center'>
        <AlertCircle className='w-12 h-12 text-red-500 mx-auto mb-4' />
        <h3 className='text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2'>
          Failed to load portfolio content
        </h3>
        <p className='text-gray-600 dark:text-gray-300 mb-4'>
          There was an error loading the portfolio projects.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={reset}
          className='inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors'
        >
          <RefreshCw className='w-4 h-4' />
          <span>Retry</span>
        </motion.button>
      </div>
    </div>
  );
}
