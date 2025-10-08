/**
 * T017: Knowledge Graph Container Component
 *
 * Main container component with SWR data fetching.
 *
 * @pattern Follows /src/components/courses/QuizTaker.tsx SWR pattern
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Network, X, ChevronDown, ChevronUp } from 'lucide-react';
import { GraphCanvasEnhanced as GraphCanvas } from './GraphCanvasEnhanced';
import { GraphControls } from './GraphControls';
import type { KnowledgeGraph } from '@/lib/graph/types';

interface KnowledgeGraphProps {
  courseSlug: string;
  lessonSlug?: string;
  includeProgress?: boolean;
}

/**
 * Fetcher function for SWR
 */
const fetcher = async (url: string): Promise<KnowledgeGraph> => {
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch graph');
  }
  return res.json();
};

/**
 * Knowledge Graph Component
 *
 * Displays an interactive knowledge graph for course navigation.
 * Can be toggled open/closed to save screen space.
 */
export function KnowledgeGraph({
  courseSlug,
  lessonSlug,
  includeProgress = false,
}: KnowledgeGraphProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [depth, setDepth] = useState(2);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Build API URL
  const apiUrl = lessonSlug
    ? `/api/courses/${courseSlug}/lessons/${lessonSlug}/graph?depth=${depth}&includeProgress=${includeProgress}`
    : `/api/courses/${courseSlug}/graph?depth=${depth}&includeProgress=${includeProgress}`;

  // Fetch graph data only when open
  const {
    data: graph,
    error,
    isLoading,
  } = useSWR<KnowledgeGraph>(
    isOpen && apiUrl ? apiUrl : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Handle errors in useEffect to avoid render-time side effects
  useEffect(() => {
    if (error && isOpen) {
      toast({
        title: 'Error loading graph',
        description: error.message || 'Failed to load knowledge graph',
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

  return (
    <Card className='w-full border-2 border-primary/20 shadow-lg bg-gradient-to-br from-card to-card/50'>
      <CardHeader className='pb-3 bg-gradient-to-r from-primary/5 to-transparent'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <div className='p-2 rounded-lg bg-primary/10'>
              <Network className='h-5 w-5 text-primary' />
            </div>
            <div>
              <CardTitle className='text-lg flex items-center gap-2'>
                {lessonSlug ? 'Lesson Knowledge Graph' : 'Course Knowledge Graph'}
                {graph && graph.nodes.length > 0 && (
                  <span className='text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full'>
                    {graph.nodes.length} {graph.nodes.length === 1 ? 'node' : 'nodes'}
                  </span>
                )}
              </CardTitle>
              {!isOpen && (
                <p className='text-xs text-muted-foreground mt-1'>
                  Interactive visualization of course structure and your progress
                </p>
              )}
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close graph' : 'Open graph'}
            className='hover:bg-primary/10 transition-all'
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
          <div className='flex items-center justify-between p-3 rounded-lg bg-muted/50 border'>
            <GraphControls depth={depth} onDepthChange={handleDepthChange} />
            {graph && graph.nodes.length > 0 && (
              <div className='flex items-center gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => window.location.reload()}
                  className='text-xs'
                >
                  <svg className='w-3 h-3 mr-1' fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </Button>
              </div>
            )}
          </div>

          {/* Graph Canvas */}
          <div className='relative border-2 rounded-xl bg-gradient-to-br from-background to-muted/20 overflow-hidden shadow-inner'>
            {isLoading && (
              <div className='space-y-2 p-4'>
                <Skeleton className='h-[400px] w-full rounded-lg' />
                <div className='flex justify-center'>
                  <Skeleton className='h-4 w-48' />
                </div>
              </div>
            )}

            {error && (
              <div className='flex items-center justify-center h-[400px] text-muted-foreground'>
                <div className='text-center space-y-3 p-6'>
                  <div className='mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center'>
                    <X className='h-8 w-8 text-destructive' />
                  </div>
                  <div>
                    <p className='font-semibold text-foreground mb-1'>Failed to load knowledge graph</p>
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
                  <div className='flex items-center justify-center h-[400px] text-muted-foreground'>
                    <div className='text-center space-y-3 p-6'>
                      <div className='mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center'>
                        <Network className='h-8 w-8 opacity-50' />
                      </div>
                      <div>
                        <p className='font-semibold text-foreground mb-1'>No content to visualize</p>
                        <p className='text-sm'>Add modules and lessons to see the knowledge graph</p>
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

          {/* Legend */}
          {graph && graph.nodes.length > 0 && (
            <div className='p-4 rounded-lg bg-muted/30 border'>
              <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm'>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded-full bg-blue-500 ring-2 ring-blue-500/20' />
                  <span className='font-medium'>Module</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded-full bg-violet-500 ring-2 ring-violet-500/20' />
                  <span className='font-medium'>Lesson</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded-full bg-purple-500 ring-2 ring-purple-500/20' />
                  <span className='font-medium'>Sub-Lesson</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded-full bg-green-500 ring-2 ring-green-500/20' />
                  <span className='font-medium'>Completed</span>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='w-4 h-4 rounded-full bg-gray-500 ring-2 ring-gray-500/20' />
                  <span className='font-medium'>Locked</span>
                </div>
                <div className='flex items-center gap-2'>
                  <svg className='w-4 h-4' stroke='currentColor' fill='none' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 8l4 4m0 0l-4 4m4-4H3' className='stroke-amber-500' />
                  </svg>
                  <span className='font-medium text-amber-600 dark:text-amber-400'>Prerequisite</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          {graph && graph.nodes.length > 0 && (
            <div className='flex items-center justify-between text-xs text-muted-foreground px-4 py-3 rounded-lg bg-muted/20 border'>
              <div className='flex items-center gap-4'>
                <span className='flex items-center gap-1'>
                  <svg className='w-3 h-3' fill='currentColor' viewBox='0 0 20 20'>
                    <path d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z' />
                  </svg>
                  <strong>{graph.metadata.nodeCount}</strong> nodes
                </span>
                <span className='flex items-center gap-1'>
                  <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M13 10V3L4 14h7v7l9-11h-7z' />
                  </svg>
                  <strong>{graph.metadata.edgeCount}</strong> connections
                </span>
              </div>
              <span className='text-[10px] opacity-60'>
                Depth: {depth} {depth === 1 ? 'level' : 'levels'}
              </span>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
