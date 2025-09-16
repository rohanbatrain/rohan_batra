'use client';

import { Project } from '@/types/project';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Calendar } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className='group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700'
    >
      {/* Featured Image */}
      {project.images && project.images.length > 0 && (
        <div className='relative h-48 overflow-hidden'>
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            className='object-cover transition-transform duration-300 group-hover:scale-105'
            sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          />
          {project.featured && (
            <div className='absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium'>
              Featured
            </div>
          )}
        </div>
      )}

      {/* Content */}
      <div className='p-6'>
        {/* Title and Date */}
        <div className='flex items-start justify-between mb-3'>
          <h3 className='text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
            {project.title}
          </h3>
          {project.createdAt && (
            <div className='flex items-center text-xs text-gray-500 dark:text-gray-400 ml-2'>
              <Calendar className='w-3 h-3 mr-1' />
              {new Date(project.createdAt).getFullYear()}
            </div>
          )}
        </div>

        {/* Description */}
        <p className='text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3'>
          {project.description}
        </p>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {project.technologies.slice(0, 4).map((tech, techIndex) => (
              <span
                key={techIndex}
                className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium'
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 4 && (
              <span className='px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium'>
                +{project.technologies.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Links */}
        <div className='flex items-center justify-between'>
          <div className='flex space-x-3'>
            {project.sourceUrl && (
              <a
                href={project.sourceUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                aria-label='View source code'
              >
                <Github className='w-4 h-4' />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors'
                aria-label='View live demo'
              >
                <ExternalLink className='w-4 h-4' />
              </a>
            )}
          </div>

          <Link
            href={`/portfolio/${project.slug}`}
            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors'
          >
            View Details →
          </Link>
        </div>
      </div>

      {/* Hover overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
    </motion.div>
  );
}

export default ProjectCard;
