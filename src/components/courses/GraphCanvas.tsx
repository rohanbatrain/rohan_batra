/**
 * T018: Graph Canvas Component
 *
 * SVG-based graph rendering with D3 zoom/pan/drag interactions.
 * Renders nodes and edges from a knowledge graph.
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
 * Graph Canvas Component
 *
 * Renders an interactive SVG graph with D3 force layout,
 * zoom/pan controls, and draggable nodes.
 */
export function GraphCanvas({
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
    if (!svgRef.current || !layoutGraph || layoutGraph.nodes.length === 0) return;

    const svg = select(svgRef.current);
    const nodes = [...layoutGraph.nodes];

    const dragBehavior = d3Drag<SVGCircleElement, GraphNode>()
      .on('start', function (event, d) {
        select(this).raise().attr('stroke', '#fff').attr('stroke-width', 3);
      })
      .on('drag', function (event, d) {
        // Validate positions
        if (!event.x || !event.y || isNaN(event.x) || isNaN(event.y)) return;
        
        d.x = event.x;
        d.y = event.y;

        // Update node position
        select(this).attr('cx', d.x!).attr('cy', d.y!);

        // Update label position
        svg
          .select(`text[data-node-id="${d.id}"]`)
          .attr('x', d.x!)
          .attr('y', d.y! + (d.size || 30) + 15);

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
      .on('end', function () {
        select(this).attr('stroke', null).attr('stroke-width', null);
      });

    svg
      .selectAll<SVGCircleElement, GraphNode>('circle.node')
      .call(dragBehavior as any);
  }, [layoutGraph]);

  // Apply drag behavior when layout changes
  useEffect(() => {
    if (layoutGraph && layoutGraph.nodes.length > 0) {
      setupDragBehavior();
    }
  }, [layoutGraph?.nodes.length]); // Only depend on node count, not the function

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!svgRef.current || !zoomBehaviorRef.current) return;

      const svg = select(svgRef.current);
      const currentTransform = zoomIdentity; // Get current transform

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
      className='relative w-full h-[600px] bg-background'
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
          {/* Arrowhead marker for directed edges */}
          <marker
            id='arrowhead'
            markerWidth='10'
            markerHeight='10'
            refX='8'
            refY='3'
            orient='auto'
            markerUnits='strokeWidth'
          >
            <path d='M0,0 L0,6 L9,3 z' fill='#94a3b8' />
          </marker>
        </defs>

        <g transform={transform}>
          {/* Render edges */}
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
              console.warn(`[GraphCanvas] Skipping edge ${idx}: missing node or position`, {
                source: edge.source,
                target: edge.target,
                sourceNode: sourceNode ? { x: sourceNode.x, y: sourceNode.y } : null,
                targetNode: targetNode ? { x: targetNode.x, y: targetNode.y } : null,
              });
              return null;
            }

            const isPrerequisite = edge.type === 'prerequisite';

            return (
              <line
                key={`edge-${idx}`}
                className='edge'
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                stroke={isPrerequisite ? '#f59e0b' : '#94a3b8'}
                strokeWidth={isPrerequisite ? 2 : 1}
                strokeDasharray={isPrerequisite ? '5,5' : undefined}
                markerEnd={isPrerequisite ? 'url(#arrowhead)' : undefined}
                opacity={0.6}
              />
            );
          })}

          {/* Render nodes */}
          {layoutGraph.nodes.map(node => {
            // Skip nodes without valid positions
            if (node.x === undefined || node.y === undefined || isNaN(node.x) || isNaN(node.y)) {
              console.warn(`[GraphCanvas] Skipping node ${node.id}: invalid position`, { x: node.x, y: node.y });
              return null;
            }

            const isSelected = node.id === selectedNodeId;
            const isHovered = node.id === hoveredNodeId;
            const size = node.size || 30;
            const color = node.color || '#8b5cf6';

            return (
              <g key={`node-${node.id}`}>
                <GraphNodeTooltip node={node}>
                  <circle
                    className='node'
                    cx={node.x}
                    cy={node.y}
                    r={size}
                    fill={color}
                    stroke={isSelected ? '#fff' : undefined}
                    strokeWidth={isSelected ? 3 : undefined}
                    opacity={node.locked ? 0.5 : 1}
                    style={{
                      cursor: node.href ? 'pointer' : 'move',
                      filter: isHovered ? 'brightness(1.2)' : undefined,
                      transition: 'filter 0.2s',
                    }}
                    onClick={() => handleNodeClick(node)}
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                    role='button'
                    tabIndex={0}
                    aria-label={`${node.label} - ${node.type}`}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  />
                </GraphNodeTooltip>

                {/* Node label */}
                <text
                  data-node-id={node.id}
                  x={node.x}
                  y={node.y + size + 15}
                  textAnchor='middle'
                  className='text-xs fill-foreground pointer-events-none select-none'
                  style={{ fontSize: '12px' }}
                >
                  {node.label.length > 20
                    ? node.label.substring(0, 20) + '...'
                    : node.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Keyboard shortcuts hint */}
      <div className='absolute bottom-2 right-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded'>
        <kbd className='px-1 border rounded'>+</kbd> /{' '}
        <kbd className='px-1 border rounded'>-</kbd> zoom ·
        <kbd className='px-1 border rounded'>0</kbd> reset ·
        <kbd className='px-1 border rounded'>drag</kbd> move
      </div>
    </div>
  );
}
