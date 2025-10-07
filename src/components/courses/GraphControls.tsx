/**
 * T019: Graph Controls Component
 * 
 * UI controls for graph interaction (depth, zoom, filters).
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import {
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

interface GraphControlsProps {
  depth: number;
  onDepthChange: (depth: number) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}

/**
 * Graph Controls Component
 * 
 * Provides UI controls for adjusting graph view and layout.
 */
export function GraphControls({
  depth,
  onDepthChange,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: GraphControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-3 bg-muted/30 rounded-lg border">
      {/* Depth Selector */}
      <div className="flex items-center gap-2">
        <label htmlFor="graph-depth" className="text-sm font-medium">
          Depth:
        </label>
        <Select
          value={depth.toString()}
          onValueChange={(value) => onDepthChange(parseInt(value))}
        >
          <SelectTrigger id="graph-depth" className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 Level</SelectItem>
            <SelectItem value="2">2 Levels</SelectItem>
            <SelectItem value="3">3 Levels</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Zoom Controls */}
      <TooltipProvider>
        <div className="flex items-center gap-1">
          {onZoomIn && (
            <TooltipRoot>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onZoomIn}
                  aria-label="Zoom in"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom In (+ key)</p>
              </TooltipContent>
            </TooltipRoot>
          )}

          {onZoomOut && (
            <TooltipRoot>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onZoomOut}
                  aria-label="Zoom out"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Zoom Out (- key)</p>
              </TooltipContent>
            </TooltipRoot>
          )}

          {onResetZoom && (
            <TooltipRoot>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetZoom}
                  aria-label="Reset zoom"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Reset View (0 key)</p>
              </TooltipContent>
            </TooltipRoot>
          )}
        </div>
      </TooltipProvider>

      {/* Help Text */}
      <div className="ml-auto text-xs text-muted-foreground hidden sm:block">
        Click nodes to navigate · Drag to move · Scroll to zoom
      </div>
    </div>
  );
}
