/**
 * T017: Knowledge Graph Container Component
 *
 * Main container component with SWR data fetching.
 *
 * @pattern Follows /src/components/courses/QuizTaker.tsx SWR pattern
 */

'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Network, X, ChevronDown, ChevronUp } from 'lucide-react';
import { GraphCanvas } from './GraphCanvas';
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
  } = useSWR<KnowledgeGraph>(isOpen ? apiUrl : null, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000, // 1 minute
  });

  // Handle errors
  if (error && isOpen) {
    toast({
      title: 'Error loading graph',
      description: error.message || 'Failed to load knowledge graph',
      variant: 'destructive',
    });
  }

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
    <Card className='w-full border-2 border-primary/20'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Network className='h-5 w-5 text-primary' />
            <CardTitle className='text-lg'>
              {lessonSlug ? 'Lesson Knowledge Graph' : 'Course Knowledge Graph'}
            </CardTitle>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close graph' : 'Open graph'}
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
        {!isOpen && (
          <p className='text-sm text-muted-foreground mt-2'>
            Interactive visualization of course structure and your progress
          </p>
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className='space-y-4'>
          {/* Controls */}
          <GraphControls depth={depth} onDepthChange={handleDepthChange} />

          {/* Graph Canvas */}
          <div className='relative border rounded-lg bg-background/50 overflow-hidden'>
            {isLoading && (
              <div className='space-y-2 p-4'>
                <Skeleton className='h-[400px] w-full' />
                <div className='flex justify-center'>
                  <Skeleton className='h-4 w-48' />
                </div>
              </div>
            )}

            {error && (
              <div className='flex items-center justify-center h-[400px] text-muted-foreground'>
                <div className='text-center space-y-2'>
                  <X className='h-12 w-12 mx-auto text-destructive' />
                  <p>Failed to load knowledge graph</p>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            )}

            {graph && !isLoading && !error && (
              <>
                {graph.nodes.length === 0 ? (
                  <div className='flex items-center justify-center h-[400px] text-muted-foreground'>
                    <div className='text-center space-y-2'>
                      <Network className='h-12 w-12 mx-auto opacity-50' />
                      <p>No content to visualize yet</p>
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
            <div className='flex flex-wrap gap-4 text-sm text-muted-foreground pt-2 border-t'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-blue-500' />
                <span>Module</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-violet-500' />
                <span>Lesson</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-green-500' />
                <span>Completed</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 rounded-full bg-gray-500' />
                <span>Locked</span>
              </div>
            </div>
          )}

          {/* Stats */}
          {graph && (
            <div className='text-xs text-muted-foreground text-center'>
              {graph.metadata.nodeCount} nodes · {graph.metadata.edgeCount}{' '}
              connections
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
