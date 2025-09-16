'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Palette, Rocket } from 'lucide-react';
import ProjectCard from '@/components/portfolio/ProjectCard';
import PostSummary from '@/components/blog/PostSummary';

// This would normally fetch from API or database
const mockProjects = [
  {
    _id: '1',
    title: 'E-Commerce Platform',
    slug: 'ecommerce-platform',
    description:
      'A full-stack e-commerce solution built with Next.js, TypeScript, and Stripe integration.',
    category: 'Web Development',
    technologies: ['Next.js', 'TypeScript', 'Stripe', 'MongoDB'],
    images: ['/placeholder-project.jpg'],
    demoUrl: 'https://ecommerce-demo.vercel.app',
    sourceUrl: 'https://github.com/example/ecommerce',
    featured: true,
    status: 'draft' as const,
    tags: ['Mobile', 'React Native', 'API'],
    viewCount: 50,
    authorId: '1',
    publishedAt: undefined,
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-05'),
  },
  // Add more mock projects...
];

const mockBlogPosts = [
  {
    _id: '1',
    title: 'Building Modern Web Applications with Next.js 14',
    slug: 'building-modern-web-apps-nextjs-14',
    excerpt:
      'Learn how to leverage the latest features in Next.js 14 to build fast, modern web applications with React Server Components.',
    content: '',
    featuredImage: '/placeholder-blog.jpg',
    images: [],
    category: 'Web Development',
    tags: ['Next.js', 'React', 'Web Development'],
    status: 'published' as const,
    featured: true,
    readingTime: 8,
    viewCount: 1250,
    likeCount: 42,
    commentCount: 15,
    authorId: '1',
    publishedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: '1',
      firstName: 'Rohan',
      lastName: 'Batra',
      avatar: '/placeholder-avatar.jpg',
    },
  },
  // Add more mock posts...
];

export default function Home() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'>
      {/* Hero Section */}
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

      {/* Skills Section */}
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
              Specializing in modern web development with a focus on
              performance, accessibility, and user experience.
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

      {/* Featured Projects */}
      <section className='py-16 px-6 lg:px-8 bg-white dark:bg-gray-800'>
        <div className='mx-auto max-w-6xl'>
          <div className='flex items-center justify-between mb-12'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
                Featured Projects
              </h2>
              <p className='text-gray-600 dark:text-gray-300'>
                A selection of my recent work and personal projects.
              </p>
            </div>
            <Link
              href='/portfolio'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors'
            >
              View All Projects →
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Suspense fallback={<div>Loading projects...</div>}>
              {mockProjects.slice(0, 3).map((project, index) => (
                <ProjectCard
                  key={project._id}
                  project={project}
                  index={index}
                />
              ))}
            </Suspense>
          </div>
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className='py-16 px-6 lg:px-8'>
        <div className='mx-auto max-w-6xl'>
          <div className='flex items-center justify-between mb-12'>
            <div>
              <h2 className='text-3xl font-bold text-gray-900 dark:text-white mb-4'>
                Latest Articles
              </h2>
              <p className='text-gray-600 dark:text-gray-300'>
                Thoughts on web development, design, and technology trends.
              </p>
            </div>
            <Link
              href='/blog'
              className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors'
            >
              View All Posts →
            </Link>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Suspense fallback={<div>Loading posts...</div>}>
              {mockBlogPosts.slice(0, 3).map((post, index) => (
                <PostSummary key={post._id} post={post} index={index} />
              ))}
            </Suspense>
          </div>
        </div>
      </section>
    </div>
  );
}
