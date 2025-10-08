/**
 * T018: Enhanced Graph Canvas Component
 *
 * SVG-based graph rendering with D3 zoom/pan/drag interactions.
 * Enhanced with improved visual design, animations, and quality of life features.
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { zoom as d3Zoom, zoomIdentity, ZoomBehavior } from 'd3-zoom';
import { drag as d3Drag } from 'd3-drag';
import { select } from 'd3-selection';
import 'd3-transition'; // Add transition support to d3-selection
import { simulateGraphLayout } from '@/lib/graph/simulator';
import { GraphNodeTooltip } from './GraphNodeTooltip';
import type { KnowledgeGraph, GraphNode, GraphEdge } from '@/lib/graph/types';

interface GraphCanvasProps {
  graph: KnowledgeGraph;
  selectedNodeId?: string | null;
  onNodeClick?: (nodeId: string) => void;
}

/**
 * Enhanced Graph Canvas Component
 *
 * Renders an interactive SVG graph with D3 force layout,
 * zoom/pan controls, draggable nodes, and enhanced visuals.
 */
export function GraphCanvasEnhanced({
  graph,
  selectedNodeId,
  onNodeClick,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('translate(0, 0) scale(1)');
  const [layoutGraph, setLayoutGraph] = useState<KnowledgeGraph | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(
    null
  );
  const lastGraphRef = useRef<KnowledgeGraph | null>(null);

  // Enhanced color schemes
  const getNodeColor = (node: GraphNode): string => {
    // Completed state takes priority
    if (node.locked === false && node.color === '#22c55e') {
      return 'rgb(34, 197, 94)'; // green-500
    }

    // Locked state
    if (node.locked) {
      return 'rgb(107, 114, 128)'; // gray-500
    }

    // Use existing color or determine by type
    if (node.color) return node.color;

    // Node type colors
    switch (node.type) {
      case 'module':
        return 'rgb(59, 130, 246)'; // blue-500
      case 'lesson':
        return 'rgb(139, 92, 246)'; // violet-500
      case 'sublesson':
        return 'rgb(168, 85, 247)'; // purple-500
      default:
        return 'rgb(156, 163, 175)'; // gray-400
    }
  };

  const getNodeStrokeColor = (node: GraphNode): string => {
    if (node.locked === false && node.color === '#22c55e') {
      return 'rgb(22, 163, 74)'; // green-600
    }
    if (node.locked) {
      return 'rgb(75, 85, 99)'; // gray-600
    }
    switch (node.type) {
      case 'module':
        return 'rgb(37, 99, 235)'; // blue-600
      case 'lesson':
        return 'rgb(124, 58, 237)'; // violet-600
      case 'sublesson':
        return 'rgb(147, 51, 234)'; // purple-600
      default:
        return 'rgb(107, 114, 128)'; // gray-500
    }
  };

  const getNodeRadius = (node: GraphNode): number => {
    const baseSize = node.size || 30;
    switch (node.type) {
      case 'module':
        return Math.max(baseSize * 0.4, 12);
      case 'lesson':
        return Math.max(baseSize * 0.33, 10);
      case 'sublesson':
        return Math.max(baseSize * 0.27, 8);
      default:
        return Math.max(baseSize * 0.33, 10);
    }
  };

  // Simulate layout when graph changes
  useEffect(() => {
    if (!graph || graph.nodes.length === 0) {
      setLayoutGraph(null);
      lastGraphRef.current = null;
      return;
    }

    // Only update if graph actually changed (deep comparison by reference)
    if (lastGraphRef.current === graph) {
      return;
    }

    console.log(
      '[GraphCanvas] Simulating layout for',
      graph.nodes.length,
      'nodes'
    );

    lastGraphRef.current = graph;
    const simulated = simulateGraphLayout(graph, {
      width: 1200,
      height: 600,
      maxIterations: Math.min(300, graph.nodes.length * 3),
    });
    setLayoutGraph(simulated);
  }, [graph]);

  // Setup D3 zoom behavior
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = select(svgRef.current);

    const zoomBehavior = d3Zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', event => {
        const { x, y, k } = event.transform;
        setTransform(`translate(${x}, ${y}) scale(${k})`);
      });

    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    // Cleanup
    return () => {
      svg.on('.zoom', null);
    };
  }, []);

  // Setup D3 drag behavior for nodes
  const setupDragBehavior = useCallback(() => {
    if (!svgRef.current || !layoutGraph || layoutGraph.nodes.length === 0)
      return;

    const svg = select(svgRef.current);
    const nodes = [...layoutGraph.nodes];

    const dragBehavior = d3Drag<SVGCircleElement, GraphNode>()
      .on('start', function (event, d) {
        select(this.parentNode as any)
          .raise()
          .select('.node-circle')
          .transition()
          .duration(200)
          .attr('r', getNodeRadius(d) * 1.3)
          .attr('stroke-width', 3);
      })
      .on('drag', function (event, d) {
        // Validate positions
        if (!event.x || !event.y || isNaN(event.x) || isNaN(event.y)) return;

        d.x = event.x;
        d.y = event.y;

        // Update node group position
        select(this.parentNode as any).attr(
          'transform',
          `translate(${d.x}, ${d.y})`
        );

        // Update connected edges
        svg
          .selectAll<SVGLineElement, GraphEdge>('line.edge')
          .filter(
            (edge: GraphEdge) => edge.source === d.id || edge.target === d.id
          )
          .attr('x1', (edge: GraphEdge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const x = edge.source === d.id ? d.x! : sourceNode?.x || 0;
            return isNaN(x) ? 0 : x;
          })
          .attr('y1', (edge: GraphEdge) => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const y = edge.source === d.id ? d.y! : sourceNode?.y || 0;
            return isNaN(y) ? 0 : y;
          })
          .attr('x2', (edge: GraphEdge) => {
            const targetNode = nodes.find(n => n.id === edge.target);
            const x = edge.target === d.id ? d.x! : targetNode?.x || 0;
            return isNaN(x) ? 0 : x;
          })
          .attr('y2', (edge: GraphEdge) => {
            const targetNode = nodes.find(n => n.id === edge.target);
            const y = edge.target === d.id ? d.y! : targetNode?.y || 0;
            return isNaN(y) ? 0 : y;
          });
      })
      .on('end', function (event, d) {
        select(this.parentNode as any)
          .select('.node-circle')
          .transition()
          .duration(200)
          .attr('r', getNodeRadius(d))
          .attr('stroke-width', 2.5);
      });

    svg
      .selectAll<SVGGElement, GraphNode>('g.node-group')
      .call(dragBehavior as any);
  }, [layoutGraph]);

  // Apply drag behavior when layout changes
  useEffect(() => {
    if (layoutGraph && layoutGraph.nodes.length > 0) {
      setupDragBehavior();
    }
  }, [layoutGraph?.nodes.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;

      const svg = select(svgRef.current);

      switch (e.key) {
        case '+':
        case '=':
          e.preventDefault();
          svg
            .transition()
            .duration(300)
            .call(zoomBehaviorRef.current.scaleBy, 1.3);
          break;
        case '-':
        case '_':
          e.preventDefault();
          svg
            .transition()
            .duration(300)
            .call(zoomBehaviorRef.current.scaleBy, 0.7);
          break;
        case '0':
          e.preventDefault();
          svg
            .transition()
            .duration(300)
            .call(zoomBehaviorRef.current.transform, zoomIdentity);
          break;
        case 'Escape':
          if (onNodeClick) onNodeClick('');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNodeClick]);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: GraphNode) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  if (!layoutGraph || layoutGraph.nodes.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className='relative w-full h-[600px] bg-gradient-to-br from-background via-background to-muted/10 rounded-lg'
      role='img'
      aria-label='Knowledge graph visualization'
    >
      <svg
        ref={svgRef}
        width='100%'
        height='100%'
        className='cursor-grab active:cursor-grabbing'
        style={{ touchAction: 'none' }}
      >
        <defs>
          {/* Enhanced arrowhead markers */}
          <marker
            id='arrowhead-regular'
            markerWidth='10'
            markerHeight='10'
            refX='20'
            refY='3'
            orient='auto'
            markerUnits='strokeWidth'
          >
            <path d='M0,0 L0,6 L9,3 z' fill='rgb(156, 163, 175)' opacity='0.6' />
          </marker>
          <marker
            id='arrowhead-prereq'
            markerWidth='10'
            markerHeight='10'
            refX='20'
            refY='3'
            orient='auto'
            markerUnits='strokeWidth'
          >
            <path d='M0,0 L0,6 L9,3 z' fill='rgb(245, 158, 11)' opacity='0.8' />
          </marker>

          {/* Shadow filter for nodes */}
          <filter id='node-shadow' x='-50%' y='-50%' width='200%' height='200%'>
            <feDropShadow
              dx='0'
              dy='2'
              stdDeviation='3'
              floodOpacity='0.3'
            />
          </filter>

          {/* Glow filter for hover */}
          <filter id='node-glow' x='-50%' y='-50%' width='200%' height='200%'>
            <feGaussianBlur stdDeviation='3' result='coloredBlur' />
            <feMerge>
              <feMergeNode in='coloredBlur' />
              <feMergeNode in='SourceGraphic' />
            </feMerge>
          </filter>
        </defs>

        <g transform={transform}>
          {/* Render edges with enhanced styling */}
          {layoutGraph.edges.map((edge, idx) => {
            const sourceNode = layoutGraph.nodes.find(
              n => n.id === edge.source
            );
            const targetNode = layoutGraph.nodes.find(
              n => n.id === edge.target
            );

            // Skip if nodes don't exist or don't have positions
            if (
              !sourceNode ||
              !targetNode ||
              sourceNode.x === undefined ||
              sourceNode.y === undefined ||
              targetNode.x === undefined ||
              targetNode.y === undefined
            ) {
              return null;
            }

            const isPrerequisite = edge.type === 'prerequisite';
            const isHighlighted =
              hoveredNodeId === edge.source || hoveredNodeId === edge.target;

            return (
              <line
                key={`edge-${idx}`}
                className='edge'
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isPrerequisite ? 'rgb(245, 158, 11)' : 'rgb(156, 163, 175)'}
                strokeWidth={isPrerequisite ? 2.5 : 1.5}
                strokeDasharray={isPrerequisite ? '5,5' : undefined}
                markerEnd={
                  isPrerequisite
                    ? 'url(#arrowhead-prereq)'
                    : 'url(#arrowhead-regular)'
                }
                opacity={isHighlighted ? 0.8 : 0.4}
                style={{
                  transition: 'opacity 0.2s, stroke-width 0.2s',
                }}
              />
            );
          })}

          {/* Render nodes with enhanced visuals */}
          {layoutGraph.nodes.map(node => {
            // Skip nodes without valid positions
            if (
              node.x === undefined ||
              node.y === undefined ||
              isNaN(node.x) ||
              isNaN(node.y)
            ) {
              return null;
            }

            const isSelected = node.id === selectedNodeId;
            const isHovered = node.id === hoveredNodeId;
            const radius = getNodeRadius(node);
            const color = getNodeColor(node);
            const strokeColor = getNodeStrokeColor(node);

            return (
              <GraphNodeTooltip key={`node-${node.id}`} node={node}>
                <g
                  className='node-group'
                  transform={`translate(${node.x}, ${node.y})`}
                  style={{ cursor: node.href ? 'pointer' : 'move' }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                >
                  {/* Outer glow circle */}
                  <circle
                    className='node-glow'
                    r={radius + 4}
                    fill={color}
                    opacity={isHovered ? 0.4 : 0.2}
                    style={{
                      transition: 'opacity 0.2s, r 0.2s',
                    }}
                  />

                  {/* Main node circle */}
                  <circle
                    className='node-circle'
                    r={radius}
                    fill={color}
                    stroke={isSelected ? 'white' : strokeColor}
                    strokeWidth={isSelected ? 3 : 2.5}
                    filter='url(#node-shadow)'
                    opacity={node.locked ? 0.6 : 1}
                    style={{
                      transition: 'all 0.2s',
                      filter: isHovered ? 'url(#node-glow)' : 'url(#node-shadow)',
                    }}
                  />

                  {/* Lock icon for locked nodes */}
                  {node.locked && (
                    <text
                      textAnchor='middle'
                      dy='0.35em'
                      fill='white'
                      fontSize='10px'
                      className='pointer-events-none select-none'
                    >
                      🔒
                    </text>
                  )}

                  {/* Check mark for completed nodes */}
                  {!node.locked && node.color === '#22c55e' && (
                    <text
                      textAnchor='middle'
                      dy='0.35em'
                      fill='white'
                      fontSize='12px'
                      fontWeight='bold'
                      className='pointer-events-none select-none'
                    >
                      ✓
                    </text>
                  )}

                  {/* Node label with better visibility */}
                  <text
                    y={radius + 16}
                    textAnchor='middle'
                    className='pointer-events-none select-none'
                    fill='currentColor'
                    fontSize='11px'
                    fontWeight='500'
                    style={{
                      textShadow:
                        '0 1px 3px rgba(0, 0, 0, 0.5), 0 0 8px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    {node.label.length > 20
                      ? node.label.substring(0, 20) + '...'
                      : node.label}
                  </text>
                </g>
              </GraphNodeTooltip>
            );
          })}
        </g>
      </svg>

      {/* Enhanced keyboard shortcuts hint */}
      <div className='absolute bottom-3 right-3 text-xs text-muted-foreground bg-background/90 backdrop-blur-sm px-3 py-2 rounded-lg border shadow-sm'>
        <div className='flex items-center gap-3'>
          <span className='flex items-center gap-1'>
            <kbd className='px-1.5 py-0.5 bg-muted border rounded font-mono'>
              +
            </kbd>
            <kbd className='px-1.5 py-0.5 bg-muted border rounded font-mono'>
              -
            </kbd>
            <span className='text-[10px] opacity-70'>zoom</span>
          </span>
          <span className='flex items-center gap-1'>
            <kbd className='px-1.5 py-0.5 bg-muted border rounded font-mono'>
              0
            </kbd>
            <span className='text-[10px] opacity-70'>reset</span>
          </span>
          <span className='flex items-center gap-1'>
            <kbd className='px-1.5 py-0.5 bg-muted border rounded font-mono text-[10px]'>
              drag
            </kbd>
            <span className='text-[10px] opacity-70'>move</span>
          </span>
        </div>
      </div>

      {/* Loading animation overlay when simulating */}
      {!layoutGraph && (
        <div className='absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-3'>
            <div className='w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin' />
            <p className='text-sm text-muted-foreground'>
              Generating graph layout...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
