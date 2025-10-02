'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, FolderOpen, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface DocMobileNavProps {
  project: any;
  sections: any[];
}

export default function DocMobileNav({ project, sections }: DocMobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const rootSections = sections
    .filter((s: any) => !s.parentSectionId)
    .sort((a: any, b: any) => a.order - b.order);

  const getSectionChildren = (sectionId: string) => {
    return sections
      .filter((s: any) => s.parentSectionId === sectionId)
      .sort((a: any, b: any) => a.order - b.order);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='icon' className='lg:hidden'>
          <Menu className='h-5 w-5' />
          <span className='sr-only'>Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side='left' className='w-80 overflow-y-auto'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            {project.logoUrl ? (
              <img src={project.logoUrl} alt={project.title} className='h-6 w-6 rounded' />
            ) : (
              <Home className='h-5 w-5' />
            )}
            {project.title}
          </SheetTitle>
        </SheetHeader>

        <nav className='mt-6 space-y-2'>
          <Link
            href={`/docs/${project.slug}`}
            onClick={() => setOpen(false)}
            className={cn(
              'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
              pathname === `/docs/${project.slug}`
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            Overview
          </Link>

          {rootSections.map((section: any) => (
            <MobileSectionItem
              key={section._id}
              section={section}
              project={project}
              getSectionChildren={getSectionChildren}
              currentPath={pathname || ''}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}

function MobileSectionItem({
  section,
  project,
  getSectionChildren,
  currentPath,
  onNavigate,
  depth = 0,
}: {
  section: any;
  project: any;
  getSectionChildren: (id: string) => any[];
  currentPath: string;
  onNavigate: () => void;
  depth?: number;
}) {
  const [isExpanded, setIsExpanded] = useState(section.isExpanded ?? true);
  const children = getSectionChildren(section._id);
  const hasChildren = children.length > 0;

  return (
    <div>
      <button
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left',
          hasChildren ? 'cursor-pointer hover:bg-muted' : 'cursor-default'
        )}
        style={{ paddingLeft: `${depth * 12 + 12}px` }}
      >
        <FolderOpen className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
        <span className='truncate'>{section.title}</span>
      </button>

      {hasChildren && isExpanded && (
        <div className='space-y-1 mt-1'>
          {children.map((child: any) => (
            <MobileSectionItem
              key={child._id}
              section={child}
              project={project}
              getSectionChildren={getSectionChildren}
              currentPath={currentPath}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
