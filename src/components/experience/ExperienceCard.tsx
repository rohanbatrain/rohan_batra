'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Experience } from '@/types/experience';
import { Calendar, MapPin, Briefcase } from 'lucide-react';

interface ExperienceCardProps {
  experience: Experience;
  variant?: 'compact' | 'full';
  className?: string;
}

export default function ExperienceCard({
  experience,
  variant = 'full',
  className = '',
}: ExperienceCardProps) {
  const isCompact = variant === 'compact';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`group rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-gray-900 ${className}`}
    >
      <div className='flex items-start gap-4'>
        {/* Company Logo */}
        {experience.companyLogo && (
          <div className='flex-shrink-0'>
            <div className='relative h-12 w-12 overflow-hidden rounded-md border border-border dark:border-gray-800'>
              <Image
                src={experience.companyLogo}
                alt={`${experience.company} logo`}
                fill
                className='object-cover'
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className='flex-1 space-y-2'>
          {/* Title */}
          <h3 className='text-lg font-semibold text-foreground dark:text-white'>
            {experience.title}
          </h3>

          {/* Company */}
          <div className='flex items-center gap-2'>
            {experience.companyWebsite ? (
              <Link
                href={experience.companyWebsite}
                target='_blank'
                rel='noopener noreferrer'
                className='font-medium text-primary hover:underline dark:text-blue-400'
              >
                {experience.company}
              </Link>
            ) : (
              <span className='font-medium text-foreground dark:text-gray-200'>
                {experience.company}
              </span>
            )}
            <span className='text-sm text-muted-foreground dark:text-gray-400'>
              • {experience.employmentType}
            </span>
          </div>

          {/* Date Range & Location */}
          <div className='flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground dark:text-gray-400'>
            <div className='flex items-center gap-1'>
              <Calendar className='h-4 w-4' />
              <span>{experience.dateRange}</span>
              {experience.duration && (
                <span className='ml-1'>({experience.duration})</span>
              )}
            </div>
            <div className='flex items-center gap-1'>
              <MapPin className='h-4 w-4' />
              <span>{experience.location}</span>
            </div>
          </div>

          {/* Description */}
          {!isCompact && (
            <div className='pt-2'>
              {experience.descriptionFormat === 'markdown' ? (
                <div
                  className='prose prose-sm dark:prose-invert max-w-none'
                  dangerouslySetInnerHTML={{ __html: experience.description }}
                />
              ) : (
                <div
                  className='text-sm text-muted-foreground dark:text-gray-300'
                  dangerouslySetInnerHTML={{ __html: experience.description }}
                />
              )}
            </div>
          )}

          {/* Skills */}
          {!isCompact && experience.skills && experience.skills.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-2'>
              {experience.skills.map((skill, index) => (
                <span
                  key={index}
                  className='rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground dark:bg-gray-800 dark:text-gray-200'
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
