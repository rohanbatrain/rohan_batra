/**
 * ExperienceTimeline Component
 * 
 * Displays professional experience in a timeline format.
 * Features chronological view with company details and achievements.
 * 
 * @pattern Based on vertical timeline patterns
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Briefcase } from 'lucide-react';

interface TimelineItem {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string | 'Present';
  description: string;
  achievements?: string[];
  technologies?: string[];
  logo?: string;
}

interface ExperienceTimelineProps {
  experiences?: TimelineItem[];
  title?: string;
  subtitle?: string;
}

const defaultExperiences: TimelineItem[] = [
  {
    company: 'Tech Company',
    position: 'Senior Full-Stack Developer',
    location: 'Remote',
    startDate: '2023',
    endDate: 'Present',
    description: 'Leading development of scalable web applications using modern technologies.',
    achievements: [
      'Architected and deployed microservices infrastructure',
      'Improved application performance by 40%',
      'Mentored junior developers and conducted code reviews',
    ],
    technologies: ['Next.js', 'TypeScript', 'Node.js', 'MongoDB', 'AWS'],
  },
  {
    company: 'Startup Inc',
    position: 'Full-Stack Developer',
    location: 'San Francisco, CA',
    startDate: '2021',
    endDate: '2023',
    description: 'Built and maintained core platform features for a growing SaaS product.',
    achievements: [
      'Developed real-time collaboration features',
      'Implemented CI/CD pipelines',
      'Reduced bug count by 60% through testing improvements',
    ],
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Redis'],
  },
];

/**
 * ExperienceTimeline Component
 * 
 * Displays a vertical timeline of professional experience with:
 * - Company and position details
 * - Date ranges
 * - Key achievements
 * - Technology stacks
 * - Visual timeline connector
 */
export function ExperienceTimeline({
  experiences = defaultExperiences,
  title = 'Professional Experience',
  subtitle = 'My journey through various roles and companies in the tech industry.',
}: ExperienceTimelineProps) {
  return (
    <section className='py-16 md:py-24'>
      <div className='container px-4 mx-auto'>
        {/* Header */}
        <div className='text-center mb-12 space-y-4'>
          <h2 className='text-3xl md:text-4xl font-bold tracking-tight'>
            {title}
          </h2>
          <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
            {subtitle}
          </p>
        </div>

        {/* Timeline */}
        <div className='max-w-4xl mx-auto'>
          <div className='relative'>
            {/* Timeline Line */}
            <div className='absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-border md:-ml-px' />

            {/* Timeline Items */}
            <div className='space-y-12'>
              {experiences.map((experience, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div
                    key={index}
                    className={`relative flex items-center ${
                      isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                    }`}
                  >
                    {/* Timeline Dot */}
                    <div className='absolute left-4 md:left-1/2 w-0 h-0 flex items-center justify-center md:-ml-3'>
                      <div className='w-6 h-6 rounded-full bg-primary border-4 border-background shadow-lg' />
                    </div>

                    {/* Content Card */}
                    <div className={`ml-12 md:ml-0 md:w-1/2 ${isEven ? 'md:pr-12' : 'md:pl-12'}`}>
                      <Card className='border-2 hover:border-primary/50 transition-all hover:shadow-lg'>
                        <CardHeader>
                          <div className='flex items-start justify-between gap-4 mb-2'>
                            <div className='flex-1'>
                              <CardTitle className='text-xl mb-1'>
                                {experience.position}
                              </CardTitle>
                              <div className='flex items-center gap-2 text-primary font-semibold'>
                                <Briefcase className='h-4 w-4' />
                                <span>{experience.company}</span>
                              </div>
                            </div>
                            {experience.logo && (
                              <div className='w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0'>
                                <img
                                  src={experience.logo}
                                  alt={experience.company}
                                  className='w-full h-full object-cover'
                                />
                              </div>
                            )}
                          </div>

                          <div className='flex flex-wrap gap-2 text-sm text-muted-foreground'>
                            <div className='flex items-center gap-1'>
                              <Calendar className='h-3.5 w-3.5' />
                              <span>{experience.startDate} - {experience.endDate || 'Present'}</span>
                            </div>
                            {experience.location && (
                              <div className='flex items-center gap-1'>
                                <MapPin className='h-3.5 w-3.5' />
                                <span>{experience.location}</span>
                              </div>
                            )}
                          </div>
                        </CardHeader>

                        <CardContent className='space-y-4'>
                          <p className='text-sm text-muted-foreground leading-relaxed'>
                            {experience.description}
                          </p>

                          {experience.achievements && experience.achievements.length > 0 && (
                            <div className='space-y-2'>
                              <h4 className='text-sm font-semibold'>Key Achievements:</h4>
                              <ul className='space-y-1.5 text-sm text-muted-foreground'>
                                {experience.achievements.map((achievement, i) => (
                                  <li key={i} className='flex items-start gap-2'>
                                    <span className='text-primary mt-0.5'>•</span>
                                    <span>{achievement}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {experience.technologies && experience.technologies.length > 0 && (
                            <div className='flex flex-wrap gap-1.5'>
                              {experience.technologies.map((tech, i) => (
                                <Badge key={i} variant='secondary' className='text-xs'>
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Accent */}
        <div className='mt-16 text-center'>
          <div className='inline-block'>
            <div className='h-1 w-32 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full' />
          </div>
        </div>
      </div>
    </section>
  );
}
