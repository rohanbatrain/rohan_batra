'use client';

import { Project } from '@/types/project';
import Image from 'next/image';
import { resolveAssetUrl } from '@/lib/assets';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github, ExternalLink, Calendar, GitFork } from 'lucide-react';
import { formatTechLabel } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  index?: number;
  activeCategory?: string;
}

export function ProjectCard({
  project,
  index = 0,
  activeCategory,
}: ProjectCardProps) {
  const allCategories: string[] = Array.from(
    new Set(
      [
        ...(Array.isArray((project as any).categories)
          ? ((project as any).categories as string[])
          : []),
        project.category,
      ]
        .filter(Boolean)
        .map(c => String(c))
    )
  );

  const categoryPriority = (label: string): number => {
    const l = label.toLowerCase();
    if (l === 'sre' || l.includes('site reliability')) return 1;
    if (l === 'cloud' || l.includes('cloud solution')) return 2;
    if (l === 'backend' || l.includes('python') || l.includes('backend'))
      return 3;
    return 999; // deprioritize unknowns
  };

  const primaryCategory = (() => {
    const hint = (activeCategory || '').toLowerCase();
    if (hint && allCategories.map(c => c.toLowerCase()).includes(hint)) {
      return allCategories.find(c => c.toLowerCase() === hint) as string;
    }
    if (allCategories.length) {
      return allCategories
        .slice()
        .sort((a, b) => categoryPriority(a) - categoryPriority(b))[0];
    }
    return project.category;
  })();
  const rawTitle = project.title || '';
  const colonIdx = rawTitle.indexOf(':');
  const prefix = colonIdx > -1 ? rawTitle.slice(0, colonIdx) : '';
  const shouldStrip =
    /developer|engineer|architect|administrator|systems|cloud|android|open\s*source|backend|full|devops|sre|security/i.test(
      prefix
    );
  const base =
    shouldStrip && colonIdx > -1 ? rawTitle.slice(colonIdx + 1) : rawTitle;
  const displayTitle = base
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: 'easeOut',
      }}
      className='group relative overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 flex flex-col h-full'
    >
      {/* no admin/public selection in this card - selection handled in admin UI only */}
      {/* Featured Image */}
      {project.images && project.images.length > 0 && (
        <div className='relative h-48 overflow-hidden'>
          <Image
            src={resolveAssetUrl(project.images[0]) as string}
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
      <div className='p-6 flex flex-col flex-1'>
        {/* Title Row */}
        <div className='flex items-start justify-between mb-3'>
          <div>
            <div className='flex items-center gap-2 mb-1'>
              {/* Primary category slot (render invisible placeholder when missing) */}
              {primaryCategory ? (
                <span className='inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'>
                  {primaryCategory}
                </span>
              ) : (
                <span className='inline-flex items-center justify-center min-w-[3.5rem] text-[10px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 invisible'>
                  &nbsp;
                </span>
              )}

              {/* Forked slot (render invisible placeholder when not forked) */}
              {project.tags?.includes('forked') ? (
                <span className='inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'>
                  <GitFork className='w-3 h-3' /> Forked
                </span>
              ) : (
                <span className='inline-flex items-center justify-center min-w-[3.5rem] text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 invisible'>
                  &nbsp;
                </span>
              )}
            </div>
            <h3 className='text-xl font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
              {displayTitle}
            </h3>
          </div>
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
          <div className='flex gap-2 mb-4 overflow-x-auto no-scrollbar pr-1'>
            {project.technologies.map((tech, techIndex) => (
              <span
                key={techIndex}
                className='px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded-full font-medium'
              >
                {formatTechLabel(tech)}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className='mt-auto flex items-center justify-between'>
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

      {/* (checkbox moved earlier) */}

      {/* Hover overlay */}
      <div className='absolute inset-0 bg-gradient-to-t from-black/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none' />
    </motion.div>
  );
}

export default ProjectCard;
