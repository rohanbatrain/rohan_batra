/**
 * LessonGraphView Component
 * 
 * A specialized view of the knowledge graph focused on a specific lesson
 * and its immediate context (prerequisites, sub-lessons, related content).
 * 
 * @pattern Based on KnowledgeGraph.tsx but optimized for lesson-level context
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Network, X, ChevronDown, ChevronUp, Focus } from 'lucide-react';
import { GraphCanvasEnhanced as GraphCanvas } from './GraphCanvasEnhanced';
import { GraphControls } from './GraphControls';
import type { KnowledgeGraph } from '@/lib/graph/types';

interface LessonGraphViewProps {
  courseSlug: string;
  lessonSlug: string;
  includeProgress?: boolean;
  className?: string;
}

/**
 * Fetcher function for SWR
 */
const fetcher = async (url: string): Promise<KnowledgeGraph> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch lesson graph');
  }
  return res.json();
};

/**
 * LessonGraphView Component
 * 
 * Displays a lesson-centric knowledge graph showing:
 * - Current lesson (highlighted)
 * - Prerequisites and dependencies
 * - Sub-lessons (if any)
 * - Related lessons within depth
 */
export function LessonGraphView({
  courseSlug,
  lessonSlug,
  includeProgress = false,
  className = '',
}: LessonGraphViewProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [depth, setDepth] = useState(1); // Default to 1 for lesson view (immediate context)
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Build API URL for lesson-specific graph
  const apiUrl = `/api/courses/${courseSlug}/lessons/${lessonSlug}/graph?depth=${depth}&includeProgress=${includeProgress}`;

  // Fetch graph data only when open
  const {
    data: graph,
    error,
    isLoading,
  } = useSWR<KnowledgeGraph>(
    isOpen ? apiUrl : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Handle errors
  useEffect(() => {
    if (error && isOpen) {
      toast({
        title: 'Error loading lesson graph',
        description: error.message || 'Failed to load lesson knowledge graph',
        variant: 'destructive',
      });
    }
  }, [error, isOpen, toast]);

  // Handle node click
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setSelectedNodeId(nodeId);
      const node = graph?.nodes.find(n => n.id === nodeId);

      if (node?.href) {
        // Navigate to the lesson/module
        window.location.href = node.href;
      }
    },
    [graph]
  );

  // Handle depth change
  const handleDepthChange = useCallback((newDepth: number) => {
    setDepth(newDepth);
  }, []);

  // Find the current lesson node
  const currentNode = graph?.nodes.find(n => n.isCurrent);

  return (
    <Card className={`w-full border-2 border-violet-500/30 shadow-lg bg-gradient-to-br from-card to-violet-50/5 dark:to-violet-950/5 ${className}`}>
      <CardHeader className='pb-3 bg-gradient-to-r from-violet-500/10 to-transparent'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-violet-500/10'>
              <Focus className='h-5 w-5 text-violet-600 dark:text-violet-400' />
            </div>
            <div>
              <CardTitle className='text-lg flex items-center gap-2'>
                Lesson Context Map
                {graph && graph.nodes.length > 0 && (
                  <span className='text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
                    {graph.nodes.length} related {graph.nodes.length === 1 ? 'item' : 'items'}
                  </span>
                )}
              </CardTitle>
              {!isOpen && currentNode && (
                <p className='text-xs text-muted-foreground mt-1'>
                  Explore lessons connected to: <span className='font-medium'>{currentNode.label}</span>
                </p>
              )}
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close lesson graph' : 'Open lesson graph'}
            className='hover:bg-violet-500/10 transition-all'
          >
            {isOpen ? (
              <>
                <ChevronUp className='h-4 w-4 mr-1' />
                Hide
              </>
            ) : (
              <>
                <ChevronDown className='h-4 w-4 mr-1' />
                Show
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className='space-y-4 animate-in fade-in-50 duration-300'>
          {/* Controls */}
          <div className='flex items-center justify-between p-3 rounded-lg bg-violet-500/5 border border-violet-500/20'>
            <GraphControls depth={depth} onDepthChange={handleDepthChange} />
            <div className='text-xs text-muted-foreground'>
              <span className='hidden sm:inline'>Depth controls the radius of related lessons shown</span>
            </div>
          </div>

          {/* Graph Canvas */}
          <div className='relative border-2 border-violet-500/20 rounded-xl bg-gradient-to-br from-background to-violet-500/5 overflow-hidden shadow-inner'>
            {isLoading && (
              <div className='space-y-2 p-4'>
                <Skeleton className='h-[350px] w-full rounded-lg' />
                <div className='flex justify-center'>
                  <Skeleton className='h-4 w-48' />
                </div>
              </div>
            )}

            {error && (
              <div className='flex items-center justify-center h-[350px] text-muted-foreground'>
                <div className='text-center space-y-3 p-6'>
                  <div className='mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
                    <X className='h-8 w-8 text-destructive' />
                  </div>
                  <div>
                    <p className='font-semibold text-foreground mb-1'>Failed to load lesson graph</p>
                    <p className='text-sm'>{error.message || 'Unknown error occurred'}</p>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => window.location.reload()}
                    className='mt-2'
                  >
                    <svg className='w-4 h-4 mr-2' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {graph && !isLoading && !error && (
              <>
                {graph.nodes.length === 0 ? (
                  <div className='flex items-center justify-center h-[350px] text-muted-foreground'>
                    <div className='text-center space-y-3 p-6'>
                      <div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
                        <Network className='h-8 w-8 opacity-50' />
                      </div>
                      <div>
                        <p className='font-semibold text-foreground mb-1'>No related content</p>
                        <p className='text-sm'>This lesson has no connected lessons at the current depth</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <GraphCanvas
                    graph={graph}
                    selectedNodeId={selectedNodeId}
                    onNodeClick={handleNodeClick}
                  />
                )}
              </>
            )}
          </div>

          {/* Legend (compact version for lesson view) */}
          {graph && graph.nodes.length > 0 && (
            <div className='p-3 rounded-lg bg-violet-500/5 border border-violet-500/20'>
              <div className='flex flex-wrap gap-x-4 gap-y-2 text-xs'>
                <div className='flex items-center gap-1.5'>
                  <div className='w-3 h-3 rounded-full bg-violet-500 ring-2 ring-violet-500/20' />
                  <span className='font-medium'>Current</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <div className='w-3 h-3 rounded-full bg-purple-500 ring-2 ring-purple-500/20' />
                  <span className='font-medium'>Sub-lesson</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <div className='w-3 h-3 rounded-full bg-green-500 ring-2 ring-green-500/20' />
                  <span className='font-medium'>Completed</span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <svg className='w-3 h-3' stroke='currentColor' fill='none' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' className='stroke-amber-500' />
                  </svg>
                  <span className='font-medium text-amber-600 dark:text-amber-400'>Prerequisite</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {graph && graph.nodes.length > 0 && currentNode && (
            <div className='text-xs text-muted-foreground px-4 py-3 rounded-lg bg-violet-500/5 border border-violet-500/20'>
              <div className='flex items-center justify-between'>
                <span className='flex items-center gap-2'>
                  <strong className='text-violet-600 dark:text-violet-400'>{currentNode.label}</strong>
                  {currentNode.contentType && (
                    <span className='px-2 py-0.5 rounded-full bg-violet-500/10 text-[10px]'>
                      {currentNode.contentType}
                    </span>
                  )}
                </span>
                <span className='text-[10px] opacity-60'>
                  {graph.metadata.edgeCount} {graph.metadata.edgeCount === 1 ? 'connection' : 'connections'}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
