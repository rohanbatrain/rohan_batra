'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Home, LogIn, ArrowLeft, User, Settings } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function AccessDeniedContent() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('return_url');
  
  // Determine the type of access denial based on the return URL
  const isAdminOnly =
    returnUrl?.includes('/admin/users') ||
    returnUrl?.includes('/admin/settings');
  const requiredRole = isAdminOnly ? 'Admin' : 'Editor or Admin';
  const description = isAdminOnly
    ? "You don't have permission to access this resource. Admin role is required."
    : "You don't have permission to access this resource. Editor or Admin role is required.";

  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-red-950 dark:to-orange-950'>
      {/* Background Decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -top-1/2 -left-1/2 w-96 h-96 bg-gradient-to-br from-red-200/30 to-orange-200/30 dark:from-red-800/20 dark:to-orange-800/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute -bottom-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-amber-200/30 dark:from-orange-800/20 dark:to-amber-800/20 rounded-full blur-3xl animate-pulse' />
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-red-100/40 to-orange-100/40 dark:from-red-900/30 dark:to-orange-900/30 rounded-full blur-2xl' />
      </div>

      {/* Main Content */}
      <div className='relative z-10 min-h-screen flex items-center justify-center px-4 py-12'>
        <div className='max-w-lg w-full'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 text-center'
          >
            {/* Access Denied Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.2,
                type: 'spring',
                stiffness: 200,
              }}
              className='flex justify-center mb-8'
            >
              <div className='relative'>
                <div className='w-24 h-24 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 rounded-full flex items-center justify-center shadow-lg'>
                  <Shield className='w-12 h-12 text-red-600 dark:text-red-400' />
                </div>
                <div className='absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center'>
                  <span className='text-white text-xs font-bold'>!</span>
                </div>
              </div>
            </motion.div>

            {/* Status Code */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className='text-7xl font-black text-transparent bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 bg-clip-text mb-6'
            >
              403
            </motion.div>

            {/* Error Title */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className='text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4'
            >
              Access Denied
            </motion.h1>

            {/* Required Role Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className='inline-flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-4 py-2 rounded-full text-sm font-semibold mb-6'
            >
              {isAdminOnly ? (
                <Settings className='w-4 h-4' />
              ) : (
                <User className='w-4 h-4' />
              )}
              {requiredRole} Role Required
            </motion.div>

            {/* Error Description */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className='text-gray-600 dark:text-gray-300 mb-8 leading-relaxed'
            >
              {description}
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className='space-y-4'
            >
              {/* Primary Actions */}
              <div className='flex flex-col sm:flex-row gap-3 justify-center'>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href='/'
                    className='inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl min-w-[140px]'
                  >
                    <Home className='w-4 h-4' />
                    Go Home
                  </Link>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link
                    href={`/sign-in${returnUrl ? `?redirect_url=${encodeURIComponent(returnUrl)}` : ''}`}
                    className='inline-flex items-center justify-center gap-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-gray-700 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl border border-gray-200 dark:border-gray-600 hover:bg-white/90 dark:hover:bg-gray-800/90 transition-all duration-200 shadow-lg hover:shadow-xl min-w-[140px]'
                  >
                    <LogIn className='w-4 h-4' />
                    Sign In
                  </Link>
                </motion.div>
              </div>

              {/* Return to Previous Page */}
              {returnUrl && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    onClick={() => window.history.back()}
                    className='inline-flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors duration-200'
                  >
                    <ArrowLeft className='w-4 h-4' />
                    Go Back
                  </button>
                </motion.div>
              )}

              {/* Quick Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className='flex justify-center space-x-6 text-sm pt-4 border-t border-gray-200/50 dark:border-gray-700/50'
              >
                <Link
                  href='/blog'
                  className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200 font-medium'
                >
                  Visit Blog
                </Link>
                <span className='text-gray-300 dark:text-gray-600'>•</span>
                <Link
                  href='/portfolio'
                  className='text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors duration-200 font-medium'
                >
                  View Portfolio
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Loading State
function AccessDeniedLoading() {
  return (
    <div className='min-h-screen relative overflow-hidden bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 dark:from-gray-900 dark:via-red-950 dark:to-orange-950'>
      <div className='relative z-10 min-h-screen flex items-center justify-center px-4 py-12'>
        <div className='max-w-lg w-full'>
          <div className='bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 text-center'>
            <div className='flex justify-center mb-8'>
              <div className='w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse' />
            </div>
            <div className='h-16 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse' />
            <div className='h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse' />
            <div className='h-4 bg-gray-200 dark:bg-gray-700 rounded mb-8 animate-pulse' />
            <div className='flex gap-3 justify-center'>
              <div className='h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse' />
              <div className='h-12 w-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse' />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AccessDenied() {
  return (
    <Suspense fallback={<AccessDeniedLoading />}>
      <AccessDeniedContent />
    </Suspense>
  );
}
