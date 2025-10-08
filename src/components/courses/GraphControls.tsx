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
    <div className='flex items-center gap-2'>
      {/* Depth Selector */}
      <div className='flex items-center gap-2'>
        <label htmlFor='graph-depth' className='text-sm font-medium whitespace-nowrap'>
          Depth:
        </label>
        <Select
          value={depth.toString()}
          onValueChange={value => onDepthChange(parseInt(value))}
        >
          <SelectTrigger id='graph-depth' className='w-[110px] h-9 bg-background hover:bg-muted/50 transition-colors'>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='1'>1 Level</SelectItem>
            <SelectItem value='2'>2 Levels</SelectItem>
            <SelectItem value='3'>3 Levels</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Zoom Controls */}
      {(onZoomIn || onZoomOut || onResetZoom) && (
        <>
          <div className='h-6 w-px bg-border mx-1' />
          <TooltipProvider>
            <div className='flex items-center gap-1'>
              {onZoomIn && (
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-9 w-9 hover:bg-primary/10 transition-all'
                      onClick={onZoomIn}
                      aria-label='Zoom in'
                    >
                      <ZoomIn className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='text-xs'>Zoom In <kbd className='ml-1 px-1 bg-muted rounded'>+</kbd></p>
                  </TooltipContent>
                </TooltipRoot>
              )}

              {onZoomOut && (
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-9 w-9 hover:bg-primary/10 transition-all'
                      onClick={onZoomOut}
                      aria-label='Zoom out'
                    >
                      <ZoomOut className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='text-xs'>Zoom Out <kbd className='ml-1 px-1 bg-muted rounded'>-</kbd></p>
                  </TooltipContent>
                </TooltipRoot>
              )}

              {onResetZoom && (
                <TooltipRoot>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='icon'
                      className='h-9 w-9 hover:bg-primary/10 transition-all'
                      onClick={onResetZoom}
                      aria-label='Reset zoom'
                    >
                      <Maximize className='h-4 w-4' />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='text-xs'>Reset View <kbd className='ml-1 px-1 bg-muted rounded'>0</kbd></p>
                  </TooltipContent>
                </TooltipRoot>
              )}
            </div>
          </TooltipProvider>
        </>
      )}
    </div>
  );
}
