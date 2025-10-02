'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, Github, Search } from 'lucide-react';
import DocMobileNav from './docs-mobile-nav';

interface DocsHeaderProps {
  project: any;
  sections?: any[];
}

export default function DocsHeader({ project, sections = [] }: DocsHeaderProps) {
  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container mx-auto max-w-7xl flex h-16 items-center justify-between px-6'>
        <div className='flex items-center gap-4'>
          <DocMobileNav project={project} sections={sections} />
          <Link href={`/docs/${project.slug}`} className='flex items-center gap-2'>
            {project.logoUrl ? (
              <img src={project.logoUrl} alt={project.title} className='h-8 w-8 rounded' />
            ) : (
              <Book className='h-6 w-6' />
            )}
            <span className='text-lg font-semibold'>{project.title}</span>
          </Link>
          <Badge variant='outline'>v{project.version || '1.0.0'}</Badge>
        </div>

        <div className='flex items-center gap-4'>
          <Button
            variant='outline'
            size='sm'
            className='hidden sm:flex'
            onClick={() => {
              // TODO: Implement search modal
            }}
          >
            <Search className='mr-2 h-4 w-4' />
            Search
            <kbd className='ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium'>
              <span className='text-xs'>⌘</span>K
            </kbd>
          </Button>

          {project.gitIntegration?.enabled && project.gitIntegration?.repoUrl && (
            <Button
              variant='ghost'
              size='sm'
              asChild
            >
              <a href={project.gitIntegration.repoUrl} target='_blank' rel='noopener noreferrer'>
                <Github className='h-5 w-5' />
              </a>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
