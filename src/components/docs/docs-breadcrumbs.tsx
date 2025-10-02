'use client';

import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DocBreadcrumbsProps {
  items: Breadcrumb[];
  className?: string;
}

export default function DocBreadcrumbs({ items, className }: DocBreadcrumbsProps) {
  return (
    <nav aria-label='Breadcrumb' className={cn('flex items-center gap-2 text-sm', className)}>
      <Link
        href='/docs'
        className='flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors'
      >
        <Home className='h-4 w-4' />
        <span className='sr-only'>Documentation Hub</span>
      </Link>

      {items.map((item, index) => (
        <div key={index} className='flex items-center gap-2'>
          <ChevronRight className='h-4 w-4 text-muted-foreground' />
          {item.href ? (
            <Link
              href={item.href}
              className='text-muted-foreground hover:text-foreground transition-colors'
            >
              {item.label}
            </Link>
          ) : (
            <span className='text-foreground font-medium'>{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
