/**
 * T020: Graph Node Tooltip Component
 *
 * Displays node details on hover/focus.
 */

'use client';

import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, Lock } from 'lucide-react';
import type { GraphNode } from '@/lib/graph/types';

interface GraphNodeTooltipProps {
  node: GraphNode;
  children: React.ReactNode;
}

/**
 * Format duration in seconds to readable string
 */
function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Graph Node Tooltip Component
 *
 * Shows detailed information about a node when hovering or focusing.
 */
export function GraphNodeTooltip({ node, children }: GraphNodeTooltipProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side='top'
          className='max-w-sm p-4 space-y-3 bg-popover/95 backdrop-blur-sm border-2 shadow-xl'
          sideOffset={8}
        >
          {/* Node Title with icon */}
          <div className='flex items-start gap-2'>
            <div className='flex-1'>
              <div className='font-semibold text-sm leading-tight'>{node.label}</div>
            </div>
            {node.locked && <Lock className='h-4 w-4 text-amber-500 flex-shrink-0' />}
            {node.completed && <Check className='h-4 w-4 text-green-500 flex-shrink-0' />}
          </div>

          {/* Node Type Badges */}
          <div className='flex items-center gap-2 flex-wrap'>
            <Badge 
              variant='secondary' 
              className='text-xs capitalize font-medium'
            >
              {node.type === 'sublesson' ? 'Sub-Lesson' : node.type}
            </Badge>

            {/* Content Type Badge */}
            {node.contentType && (
              <Badge variant='outline' className='text-xs capitalize'>
                {node.contentType}
              </Badge>
            )}
          </div>

          {/* Metadata Grid */}
          <div className='space-y-2 text-xs'>
            {/* Duration */}
            {node.duration && (
              <div className='flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50'>
                <div className='flex items-center gap-1.5 text-muted-foreground'>
                  <Clock className='h-3.5 w-3.5' />
                  <span>Duration</span>
                </div>
                <span className='font-medium'>{formatDuration(node.duration)}</span>
              </div>
            )}

            {/* Progress Bar */}
            {node.progress !== undefined && node.progress > 0 && !node.completed && (
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between text-muted-foreground'>
                  <span>Progress</span>
                  <span className='font-medium'>{node.progress}%</span>
                </div>
                <div className='h-2 bg-muted rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300'
                    style={{ width: `${node.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Completion Status */}
            {node.completed !== undefined && (
              <div className='flex items-center justify-between gap-2 p-2 rounded-md bg-muted/50'>
                <div className='flex items-center gap-1.5'>
                  {node.completed ? (
                    <>
                      <Check className='h-3.5 w-3.5 text-green-500' />
                      <span className='text-green-600 dark:text-green-400 font-medium'>Completed</span>
                    </>
                  ) : (
                    <>
                      <div className='h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/50' />
                      <span className='text-muted-foreground'>Not completed</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Locked Status */}
            {node.locked && (
              <div className='flex items-center gap-2 p-2 rounded-md bg-amber-500/10 border border-amber-500/20'>
                <Lock className='h-3.5 w-3.5 text-amber-600 dark:text-amber-500' />
                <span className='text-amber-700 dark:text-amber-400 text-xs font-medium'>
                  Complete prerequisites first
                </span>
              </div>
            )}

            {/* Module Name */}
            {node.moduleName && (
              <div className='flex items-center gap-2 p-2 rounded-md bg-muted/30 text-muted-foreground'>
                <svg className='h-3.5 w-3.5' fill='currentColor' viewBox='0 0 20 20'>
                  <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
                </svg>
                <span className='text-xs'>
                  <span className='opacity-70'>Module:</span> {node.moduleName}
                </span>
              </div>
            )}
          </div>

          {/* Click hint */}
          {node.href && (
            <div className='flex items-center gap-1.5 text-xs text-primary pt-2 border-t border-border/50 font-medium'>
              <span>Click to navigate</span>
              <svg className='h-3 w-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 7l5 5m0 0l-5 5m5-5H6' />
              </svg>
            </div>
          )}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
