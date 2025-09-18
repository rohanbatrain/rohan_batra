'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className='relative px-6 lg:px-8 py-24 sm:py-32'>
      <div className='mx-auto max-w-4xl text-center'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl'
        >
          Full-Stack Developer &{' '}
          <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600'>
            Digital Creator
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300'
        >
          Building modern web experiences with cutting-edge technologies.
          Passionate about clean code, user experience, and innovative
          solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className='mt-10 flex items-center justify-center gap-x-6'
        >
          <Link
            href='/portfolio'
            className='rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-200'
          >
            View Portfolio
          </Link>
          <Link
            href='/blog'
            className='text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
          >
            Read Blog <ArrowRight className='inline w-4 h-4 ml-1' />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
