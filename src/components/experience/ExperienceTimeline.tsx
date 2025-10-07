'use client';

import { Experience } from '@/types/experience';
import ExperienceCard from './ExperienceCard';
import { motion } from 'framer-motion';

interface ExperienceTimelineProps {
  experiences: Experience[];
  className?: string;
}

export default function ExperienceTimeline({
  experiences,
  className = '',
}: ExperienceTimelineProps) {
  if (experiences.length === 0) {
    return (
      <div className='py-12 text-center'>
        <p className='text-muted-foreground dark:text-gray-400'>
          No professional experience to display yet.
        </p>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Timeline Line */}
      <div className='absolute left-0 top-0 bottom-0 w-px bg-border dark:bg-gray-800 md:left-6' />

      {/* Timeline Items */}
      <div className='space-y-8'>
        {experiences.map((experience, index) => (
          <motion.div
            key={experience._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className='relative pl-8 md:pl-16'
          >
            {/* Timeline Dot */}
            <div className='absolute left-0 top-6 h-3 w-3 rounded-full bg-primary ring-4 ring-background dark:bg-blue-500 dark:ring-gray-950 md:left-6' />

            {/* Experience Card */}
            <ExperienceCard experience={experience} variant='full' />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
