'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Book, Github, Search } from 'lucide-react';
import DocMobileNav from './docs-mobile-nav';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DocsHeaderProps {
  project: any;
  sections?: any[];
}

export default function DocsHeader({ project, sections = [] }: DocsHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query
      router.push(`/docs/${project.slug}/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + K to open search
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setSearchOpen(!searchOpen);
    }
    // Escape to close
    if (e.key === 'Escape' && searchOpen) {
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

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
            onClick={() => setSearchOpen(true)}
            onKeyDown={handleKeyDown}
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

      {/* Search Modal */}
      {searchOpen && (
        <div 
          className='fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-20'
          onClick={() => setSearchOpen(false)}
        >
          <div 
            className='bg-background border rounded-lg shadow-lg w-full max-w-2xl mx-4'
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSearch} className='p-4'>
              <div className='flex items-center gap-2'>
                <Search className='h-5 w-5 text-muted-foreground' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={`Search ${project.title} documentation...`}
                  className='flex-1 bg-transparent border-none outline-none text-lg'
                  autoFocus
                  onKeyDown={handleKeyDown}
                />
                <kbd className='pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground'>
                  ESC
                </kbd>
              </div>
            </form>
            <div className='border-t p-4 text-sm text-muted-foreground'>
              Press <kbd className='px-1 border rounded'>Enter</kbd> to search
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
