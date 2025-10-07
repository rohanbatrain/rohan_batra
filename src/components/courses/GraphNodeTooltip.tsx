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
    <TooltipProvider delayDuration={300}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="max-w-xs p-3 space-y-2"
          sideOffset={5}
        >
          {/* Node Title */}
          <div className="font-semibold text-sm">{node.label}</div>

          {/* Node Type Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-xs capitalize">
              {node.type}
            </Badge>

            {/* Content Type Badge */}
            {node.contentType && (
              <Badge variant="outline" className="text-xs capitalize">
                {node.contentType}
              </Badge>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-1 text-xs text-muted-foreground">
            {/* Duration */}
            {node.duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3" />
                <span>{formatDuration(node.duration)}</span>
              </div>
            )}

            {/* Completion Status */}
            {node.completed !== undefined && (
              <div className="flex items-center gap-1.5">
                {node.completed ? (
                  <>
                    <Check className="h-3 w-3 text-green-500" />
                    <span className="text-green-500">Completed</span>
                  </>
                ) : (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                    <span>Not completed</span>
                  </>
                )}
              </div>
            )}

            {/* Locked Status */}
            {node.locked && (
              <div className="flex items-center gap-1.5 text-amber-500">
                <Lock className="h-3 w-3" />
                <span>Prerequisites required</span>
              </div>
            )}

            {/* Progress */}
            {node.progress !== undefined && node.progress > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${node.progress}%` }}
                  />
                </div>
                <span className="text-xs">{node.progress}%</span>
              </div>
            )}

            {/* Module Name */}
            {node.moduleName && (
              <div className="text-xs italic">
                Module: {node.moduleName}
              </div>
            )}
          </div>

          {/* Click hint */}
          {node.href && (
            <div className="text-xs text-muted-foreground pt-1 border-t">
              Click to navigate →
            </div>
          )}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}
