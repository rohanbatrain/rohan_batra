'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Experience } from '@/types/experience';
import ExperienceCard from './ExperienceCard';
import { ArrowRight, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExperienceSectionProps {
  experiences: Experience[];
  limit?: number;
}

export default function ExperienceSection({
  experiences,
  limit = 3,
}: ExperienceSectionProps) {
  const displayedExperiences = experiences.slice(0, limit);

  if (experiences.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-blue-500/10">
              <Briefcase className="h-6 w-6 text-primary dark:text-blue-500" />
            </div>
          </div>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground dark:text-white md:text-4xl">
            Professional Experience
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-gray-400">
            {experiences.length > limit
              ? `Here are my ${limit} most recent positions. View all ${experiences.length} experiences below.`
              : 'My professional journey and career highlights.'}
          </p>
        </motion.div>

        {/* Experience Cards */}
        <div className="space-y-6">
          {displayedExperiences.map((experience, index) => (
            <motion.div
              key={experience._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ExperienceCard experience={experience} variant="compact" />
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        {experiences.length > limit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 text-center"
          >
            <Button asChild size="lg">
              <Link href="/experience" className="group">
                View All Experience
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
