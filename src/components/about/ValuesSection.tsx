/**
 * ValuesSection Component
 * 
 * Displays core values and principles.
 * Features icon-based cards with descriptions.
 * 
 * @pattern Based on feature grid patterns
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Lightbulb, 
  Users, 
  Target, 
  Heart, 
  Zap, 
  BookOpen,
  Code2,
  Sparkles
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Value {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

interface ValuesSectionProps {
  values?: Value[];
  title?: string;
  subtitle?: string;
}

const defaultValues: Value[] = [
  {
    title: 'Continuous Learning',
    description: 'Always exploring new technologies and methodologies to stay ahead in the ever-evolving tech landscape.',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
  },
  {
    title: 'Clean Code',
    description: 'Writing maintainable, well-documented code that others can understand and build upon.',
    icon: Code2,
    color: 'text-green-600 dark:text-green-400',
  },
  {
    title: 'User-Centric Design',
    description: 'Building products with the end-user in mind, focusing on intuitive interfaces and seamless experiences.',
    icon: Heart,
    color: 'text-red-600 dark:text-red-400',
  },
  {
    title: 'Innovation',
    description: 'Pushing boundaries and exploring creative solutions to complex problems.',
    icon: Lightbulb,
    color: 'text-yellow-600 dark:text-yellow-400',
  },
  {
    title: 'Collaboration',
    description: 'Working effectively in teams, sharing knowledge, and growing together.',
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
  },
  {
    title: 'Goal-Oriented',
    description: 'Setting clear objectives and working systematically to achieve them.',
    icon: Target,
    color: 'text-orange-600 dark:text-orange-400',
  },
  {
    title: 'Performance',
    description: 'Optimizing for speed, efficiency, and scalability in every project.',
    icon: Zap,
    color: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Excellence',
    description: 'Striving for quality and attention to detail in every line of code.',
    icon: Sparkles,
    color: 'text-pink-600 dark:text-pink-400',
  },
];

/**
 * ValuesSection Component
 * 
 * Displays a grid of value cards with:
 * - Icon and title
 * - Description
 * - Color-coded design
 * - Responsive layout
 */
export function ValuesSection({
  values = defaultValues,
  title = 'Core Values',
  subtitle = 'The principles that guide my work and approach to software development.',
}: ValuesSectionProps) {
  return (
    <section className='py-16 md:py-24 bg-muted/30'>
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

        {/* Values Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto'>
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <Card
                key={index}
                className='border-2 hover:border-primary/50 transition-all hover:shadow-lg group'
              >
                <CardHeader>
                  <div className='mb-3'>
                    <div className='inline-flex p-3 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors'>
                      <Icon className={`h-6 w-6 ${value.color} group-hover:scale-110 transition-transform`} />
                    </div>
                  </div>
                  <CardTitle className='text-xl'>{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-muted-foreground leading-relaxed'>
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bottom Accent */}
        <div className='mt-12 text-center'>
          <div className='inline-block'>
            <div className='h-1 w-32 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full' />
          </div>
        </div>
      </div>
    </section>
  );
}
