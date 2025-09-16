'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900'>
      <div className='max-w-md w-full px-6 text-center'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className='text-6xl font-bold text-gray-900 dark:text-gray-100 mb-4'>
            404
          </div>
          <h1 className='text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4'>
            Page Not Found
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mb-8'>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
          <div className='space-y-4'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href='/'
                className='inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors'
              >
                Go Home
              </Link>
            </motion.div>
            <div className='flex justify-center space-x-4 text-sm'>
              <Link
                href='/blog'
                className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              >
                Visit Blog
              </Link>
              <span className='text-gray-400'>•</span>
              <Link
                href='/portfolio'
                className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              >
                View Portfolio
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
