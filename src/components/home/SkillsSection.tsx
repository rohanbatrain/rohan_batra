'use client';

import { motion } from 'framer-motion';
import { Code, Palette, Rocket } from 'lucide-react';

export default function SkillsSection() {
  return (
    <section className='py-16 px-6 lg:px-8'>
      <div className='mx-auto max-w-6xl'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
            What I Do
          </h2>
          <p className='text-gray-600 dark:text-gray-300 max-w-2xl mx-auto'>
            Specializing in modern web development with a focus on performance,
            accessibility, and user experience.
          </p>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            viewport={{ once: true }}
            className='text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg'
          >
            <Code className='w-12 h-12 mx-auto mb-4 text-blue-600' />
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              Full-Stack Development
            </h3>
            <p className='text-gray-600 dark:text-gray-300'>
              Building end-to-end web applications with modern frameworks and
              technologies.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className='text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg'
          >
            <Palette className='w-12 h-12 mx-auto mb-4 text-purple-600' />
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              UI/UX Design
            </h3>
            <p className='text-gray-600 dark:text-gray-300'>
              Creating beautiful, intuitive interfaces that users love to
              interact with.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className='text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg'
          >
            <Rocket className='w-12 h-12 mx-auto mb-4 text-green-600' />
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white mb-2'>
              Performance Optimization
            </h3>
            <p className='text-gray-600 dark:text-gray-300'>
              Optimizing applications for speed, accessibility, and search
              engine visibility.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
