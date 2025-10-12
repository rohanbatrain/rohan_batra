/**
 * AboutHero Component
 * 
 * Hero section for the about page.
 * Features a welcoming introduction with visual elements.
 * 
 * @pattern Based on modern hero section patterns
 */

'use client';

import { Button } from '@/components/ui/button';
import { Github, Linkedin, Twitter, Mail, ArrowDown } from 'lucide-react';
import Link from 'next/link';

interface AboutHeroProps {
  name?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
}

/**
 * AboutHero Component
 * 
 * Displays a professional hero section for the about page with:
 * - Profile image or placeholder
 * - Name and title
 * - Brief description
 * - Social media links
 * - Call-to-action
 */
export function AboutHero({
  name = 'Rohan Batra',
  title = 'Full-Stack Developer & Educator',
  description = 'Passionate about building elegant solutions and sharing knowledge through code.',
  imageUrl,
  socialLinks = {},
}: AboutHeroProps) {
  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth',
    });
  };

  return (
    <section className='relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background'>
      {/* Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]' />
      </div>

      {/* Content */}
      <div className='container relative z-10 px-4 py-12'>
        <div className='max-w-4xl mx-auto text-center space-y-8'>
          {/* Profile Image */}
          {imageUrl && (
            <div className='inline-block'>
              <div className='relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl'>
                <img
                  src={imageUrl}
                  alt={name}
                  className='w-full h-full object-cover'
                />
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className='space-y-4'>
            <h1 className='text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60'>
              {name}
            </h1>
            <p className='text-xl md:text-2xl text-muted-foreground font-medium'>
              {title}
            </p>
            <p className='text-base md:text-lg text-muted-foreground max-w-2xl mx-auto'>
              {description}
            </p>
          </div>

          {/* Social Links */}
          <div className='flex items-center justify-center gap-3 flex-wrap'>
            {socialLinks.github && (
              <Button variant='outline' size='icon' asChild className='hover:bg-primary/10 transition-all'>
                <Link href={socialLinks.github} target='_blank' rel='noopener noreferrer' aria-label='GitHub'>
                  <Github className='h-5 w-5' />
                </Link>
              </Button>
            )}
            {socialLinks.linkedin && (
              <Button variant='outline' size='icon' asChild className='hover:bg-primary/10 transition-all'>
                <Link href={socialLinks.linkedin} target='_blank' rel='noopener noreferrer' aria-label='LinkedIn'>
                  <Linkedin className='h-5 w-5' />
                </Link>
              </Button>
            )}
            {socialLinks.twitter && (
              <Button variant='outline' size='icon' asChild className='hover:bg-primary/10 transition-all'>
                <Link href={socialLinks.twitter} target='_blank' rel='noopener noreferrer' aria-label='Twitter'>
                  <Twitter className='h-5 w-5' />
                </Link>
              </Button>
            )}
            {socialLinks.email && (
              <Button variant='outline' size='icon' asChild className='hover:bg-primary/10 transition-all'>
                <Link href={`mailto:${socialLinks.email}`} aria-label='Email'>
                  <Mail className='h-5 w-5' />
                </Link>
              </Button>
            )}
          </div>

          {/* CTA Buttons */}
          <div className='flex items-center justify-center gap-4 flex-wrap'>
            <Button size='lg' asChild className='shadow-lg hover:shadow-xl transition-all'>
              <Link href='/portfolio'>
                View Portfolio
              </Link>
            </Button>
            <Button size='lg' variant='outline' asChild className='shadow-lg hover:shadow-xl transition-all'>
              <Link href='/contact'>
                Get in Touch
              </Link>
            </Button>
          </div>

          {/* Scroll Indicator */}
          <button
            onClick={scrollToContent}
            className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer group'
            aria-label='Scroll to content'
          >
            <span>Learn More</span>
            <ArrowDown className='h-4 w-4 animate-bounce group-hover:animate-none' />
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl' />
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl' />
    </section>
  );
}
