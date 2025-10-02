'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, FileText, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface DocsSidebarProps {
  project: any;
  sections: any[];
}

export default function DocsSidebar({ project, sections }: DocsSidebarProps) {
  const pathname = usePathname();
  
  // Group sections by parent
  const rootSections = sections.filter((s: any) => !s.parentSectionId).sort((a: any, b: any) => a.order - b.order);
  
  const getSectionChildren = (sectionId: string) => {
    return sections.filter((s: any) => s.parentSectionId === sectionId).sort((a: any, b: any) => a.order - b.order);
  };

  return (
    <nav className='py-6 px-4 space-y-2'>
      <Link
        href={`/docs/${project.slug}`}
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
        <SectionItem
          key={section._id}
          section={section}
          project={project}
          getSectionChildren={getSectionChildren}
          currentPath={pathname || ''}
        />
      ))}
    </nav>
  );
}

function SectionItem({
  section,
  project,
  getSectionChildren,
  currentPath,
  depth = 0,
}: {
  section: any;
  project: any;
  getSectionChildren: (id: string) => any[];
  currentPath: string;
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
        {hasChildren && (
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform flex-shrink-0',
              isExpanded && 'rotate-90'
            )}
          />
        )}
        <FolderOpen className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
        <span className='truncate'>{section.title}</span>
      </button>

      {hasChildren && isExpanded && (
        <div className='space-y-1 mt-1'>
          {children.map((child: any) => (
            <SectionItem
              key={child._id}
              section={child}
              project={project}
              getSectionChildren={getSectionChildren}
              currentPath={currentPath}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
