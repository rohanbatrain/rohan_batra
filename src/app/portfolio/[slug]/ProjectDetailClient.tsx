'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calendar,
  Eye,
  ArrowLeft,
  Tag,
  ExternalLink,
  Github,
  Globe,
  Lightbulb,
  Target,
  Users,
  Zap,
} from 'lucide-react';
import { ProjectWithAuthor } from '@/types/project';

interface ProjectDetailClientProps {
  project: ProjectWithAuthor;
}

export default function ProjectDetailClient({
  project,
}: ProjectDetailClientProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  return (
    <div className='min-h-screen bg-white dark:bg-gray-900'>
      {/* Back Navigation */}
      <div className='border-b border-gray-200 dark:border-gray-700'>
        <div className='max-w-6xl mx-auto px-6 py-4'>
          <Link
            href='/portfolio'
            className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Portfolio
          </Link>
        </div>
      </div>

      <div className='max-w-6xl mx-auto px-6 py-16'>
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className='mb-12'
        >
          {/* Category Badge */}
          <div className='mb-4'>
            <span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
              <Tag className='h-3 w-3 mr-1' />
              {project.category}
            </span>
          </div>

          {/* Title */}
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight'>
            {project.title}
          </h1>

          {/* Description */}
          <p className='text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed'>
            {project.description}
          </p>

          {/* Meta Information */}
          <div className='flex flex-wrap items-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-8'>
            {/* Date Range */}
            {project.startDate && (
              <div className='flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                <span>
                  {new Date(project.startDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                  })}
                  {project.endDate &&
                    ` - ${new Date(project.endDate).toLocaleDateString(
                      'en-US',
                      {
                        year: 'numeric',
                        month: 'short',
                      }
                    )}`}
                </span>
              </div>
            )}

            {/* View Count */}
            <div className='flex items-center gap-2'>
              <Eye className='h-4 w-4' />
              <span>{project.viewCount.toLocaleString()} views</span>
            </div>
          </div>

          {/* Technologies */}
          <div className='flex flex-wrap gap-2 mb-8'>
            {project.technologies.map(tech => (
              <span
                key={tech}
                className='px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium'
              >
                {tech}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap gap-4'>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium'
              >
                <Globe className='h-4 w-4' />
                View Live Demo
              </a>
            )}

            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium'
              >
                <Github className='h-4 w-4' />
                View Source
              </a>
            )}
          </div>
        </motion.header>

        {/* Images */}
        {project.images.length > 0 && (
          <motion.section
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className='mb-16'
          >
            {/* Main Image */}
            <div className='relative aspect-video rounded-xl overflow-hidden mb-6'>
              <Image
                src={project.images[selectedImageIndex]}
                alt={`${project.title} screenshot ${selectedImageIndex + 1}`}
                fill
                className='object-cover'
                priority
              />
            </div>

            {/* Image Thumbnails */}
            {project.images.length > 1 && (
              <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                {project.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-video rounded-lg overflow-hidden transition-all ${
                      selectedImageIndex === index
                        ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900'
                        : 'hover:opacity-80'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${project.title} screenshot ${index + 1}`}
                      fill
                      className='object-cover'
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.section>
        )}

        {/* Project Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className='mb-16'
        >
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2'>
            <Lightbulb className='h-6 w-6' />
            Project Overview
          </h2>

          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Challenge */}
            <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Target className='h-6 w-6 text-blue-600 dark:text-blue-400' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Challenge
                </h3>
              </div>
              <p className='text-gray-600 dark:text-gray-300'>
                Build a scalable, modern web application that demonstrates
                advanced development techniques and best practices.
              </p>
            </div>

            {/* Solution */}
            <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Zap className='h-6 w-6 text-green-600 dark:text-green-400' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Solution
                </h3>
              </div>
              <p className='text-gray-600 dark:text-gray-300'>
                Implemented a full-stack solution using modern technologies with
                focus on performance, security, and user experience.
              </p>
            </div>

            {/* Impact */}
            <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <Users className='h-6 w-6 text-purple-600 dark:text-purple-400' />
                <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                  Impact
                </h3>
              </div>
              <p className='text-gray-600 dark:text-gray-300'>
                Created a robust foundation that can be extended and adapted for
                various use cases and business requirements.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Detailed Description */}
        {project.longDescription && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className='mb-16'
          >
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-8'>
              Project Details
            </h2>
            <div
              className='prose prose-lg dark:prose-invert max-w-none'
              dangerouslySetInnerHTML={{
                __html: project.longDescription.replace(/\n/g, '<br>'),
              }}
            />
          </motion.section>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className='mb-16'
          >
            <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-6'>
              Tags
            </h2>
            <div className='flex flex-wrap gap-3'>
              {project.tags.map(tag => (
                <span
                  key={tag}
                  className='px-4 py-2 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-lg text-sm font-medium'
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.section>
        )}

        {/* Related Projects */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className='mb-16'
        >
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white mb-8'>
            More Projects
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Placeholder for related projects */}
            <div className='p-6 bg-gray-50 dark:bg-gray-800 rounded-xl'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>
                Explore More Projects
              </h3>
              <p className='text-gray-600 dark:text-gray-300 mb-4'>
                Check out my other work and projects in the portfolio.
              </p>
              <Link
                href='/portfolio'
                className='inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors'
              >
                View Portfolio
                <ExternalLink className='h-4 w-4 ml-1' />
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
