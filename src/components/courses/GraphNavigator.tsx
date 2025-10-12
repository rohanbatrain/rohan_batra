/**
 * GraphNavigator Component
 * 
 * A breadcrumb-style navigation component that shows the user's position
 * within the course knowledge graph and allows quick navigation between nodes.
 * 
 * @pattern Based on breadcrumb navigation patterns with graph-awareness
 */

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  ChevronRight,
  Home,
  BookOpen,
  FileText,
  Video,
  CheckCircle2,
  Lock,
  Navigation,
  Map,
} from 'lucide-react';
import type { GraphNode } from '@/lib/graph/types';

interface GraphNavigatorProps {
  /** Current course slug */
  courseSlug: string;
  /** Course title */
  courseTitle?: string;
  /** Current node (lesson/module) in the graph */
  currentNode?: GraphNode;
  /** Path of nodes from root to current (breadcrumb trail) */
  path?: GraphNode[];
  /** Available sibling nodes at the same level */
  siblings?: GraphNode[];
  /** Child nodes of the current node */
  children?: GraphNode[];
  /** Callback when a node is clicked */
  onNavigate?: (href: string) => void;
  /** Compact mode (smaller size) */
  compact?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Get icon for node type
 */
function getNodeIcon(node: GraphNode) {
  if (node.completed) return CheckCircle2;
  if (node.locked) return Lock;
  
  switch (node.type) {
    case 'module':
      return BookOpen;
    case 'lesson':
      if (node.contentType === 'video') return Video;
      return FileText;
    case 'sublesson':
      return FileText;
    default:
      return FileText;
  }
}

/**
 * Get color class for node type
 */
function getNodeColor(node: GraphNode): string {
  if (node.completed) return 'text-green-600 dark:text-green-400';
  if (node.locked) return 'text-gray-400 dark:text-gray-600';
  
  switch (node.type) {
    case 'module':
      return 'text-blue-600 dark:text-blue-400';
    case 'lesson':
      return 'text-violet-600 dark:text-violet-400';
    case 'sublesson':
      return 'text-purple-600 dark:text-purple-400';
    default:
      return 'text-foreground';
  }
}

/**
 * GraphNavigator Component
 * 
 * Displays a breadcrumb-style navigation with graph context:
 * - Shows hierarchical path (Course > Module > Lesson)
 * - Quick access to siblings and children
 * - Visual indicators for completion and locks
 * - Dropdown menus for related content
 */
export function GraphNavigator({
  courseSlug,
  courseTitle = 'Course',
  currentNode,
  path = [],
  siblings = [],
  children = [],
  onNavigate,
  compact = false,
  className = '',
}: GraphNavigatorProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleNavigate = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else if (isClient) {
      window.location.href = href;
    }
  };

  // Get available siblings (excluding current node)
  const availableSiblings = siblings.filter(
    sibling => sibling.id !== currentNode?.id
  );

  return (
    <Card className={`border-2 border-primary/10 bg-gradient-to-r from-card to-muted/20 ${className}`}>
      <div className={`flex items-center ${compact ? 'p-2' : 'p-3'} gap-2`}>
        {/* Map Icon */}
        <div className='flex items-center gap-2'>
          <div className='p-1.5 rounded-md bg-primary/10'>
            <Map className={`${compact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-primary`} />
          </div>
          {!compact && (
            <span className='text-xs font-medium text-muted-foreground hidden sm:inline'>
              Navigation:
            </span>
          )}
        </div>

        {/* Breadcrumb Trail */}
        <nav aria-label='Breadcrumb' className='flex items-center gap-1 flex-1 overflow-x-auto'>
          {/* Home / Course Link */}
          <Button
            variant='ghost'
            size={compact ? 'sm' : 'default'}
            className={`${compact ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm'} hover:bg-primary/10 transition-colors flex-shrink-0`}
            onClick={() => handleNavigate(`/courses/${courseSlug}`)}
          >
            <Home className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1`} />
            <span className='hidden sm:inline'>{courseTitle}</span>
            <span className='sm:hidden'>Home</span>
          </Button>

          {/* Path Segments */}
          {path.map((node, index) => {
            const Icon = getNodeIcon(node);
            const colorClass = getNodeColor(node);
            const isLast = index === path.length - 1;

            return (
              <div key={node.id} className='flex items-center gap-1 flex-shrink-0'>
                <ChevronRight className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} text-muted-foreground`} />
                
                {isLast && currentNode?.id === node.id ? (
                  // Current node (not clickable)
                  <div className={`${compact ? 'px-2 py-1' : 'px-3 py-1.5'} rounded-md bg-primary/10 flex items-center gap-1.5`}>
                    <Icon className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} ${colorClass}`} />
                    <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium truncate max-w-[150px]`}>
                      {node.label}
                    </span>
                    {node.completed && (
                      <CheckCircle2 className='h-3 w-3 text-green-600 ml-1' />
                    )}
                  </div>
                ) : (
                  // Clickable ancestor node
                  <Button
                    variant='ghost'
                    size={compact ? 'sm' : 'default'}
                    className={`${compact ? 'h-7 px-2 text-xs' : 'h-8 px-3 text-sm'} hover:bg-primary/10 transition-colors`}
                    onClick={() => node.href && handleNavigate(node.href)}
                    disabled={!node.href}
                  >
                    <Icon className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'} mr-1 ${colorClass}`} />
                    <span className='truncate max-w-[120px]'>{node.label}</span>
                  </Button>
                )}
              </div>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className='flex items-center gap-1 flex-shrink-0'>
          {/* Siblings Dropdown */}
          {availableSiblings.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size={compact ? 'sm' : 'icon'}
                  className={`${compact ? 'h-7 w-7' : 'h-8 w-8'} hover:bg-primary/10 transition-all`}
                  aria-label='View related lessons'
                >
                  <Navigation className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel className='text-xs font-medium text-muted-foreground'>
                  Related Lessons ({availableSiblings.length})
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {availableSiblings.slice(0, 10).map(sibling => {
                  const Icon = getNodeIcon(sibling);
                  const colorClass = getNodeColor(sibling);
                  
                  return (
                    <DropdownMenuItem
                      key={sibling.id}
                      onClick={() => sibling.href && handleNavigate(sibling.href)}
                      disabled={sibling.locked || !sibling.href}
                      className='cursor-pointer'
                    >
                      <Icon className={`h-4 w-4 mr-2 ${colorClass}`} />
                      <span className='flex-1 truncate'>{sibling.label}</span>
                      {sibling.completed && (
                        <CheckCircle2 className='h-3 w-3 text-green-600 ml-2' />
                      )}
                      {sibling.locked && (
                        <Lock className='h-3 w-3 text-gray-400 ml-2' />
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Children/Sub-lessons Badge */}
          {children.length > 0 && (
            <Badge
              variant='secondary'
              className={`${compact ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'} bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-default`}
            >
              {children.length} {children.length === 1 ? 'sub-lesson' : 'sub-lessons'}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
