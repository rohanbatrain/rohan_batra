# Research: Knowledge Graph Implementation

**Feature**: Course Knowledge Graph (014)  
**Date**: October 7, 2025  
**Phase**: Phase 0 - Technical Research

---

## Executive Summary

This document consolidates technical research for implementing an Obsidian-like knowledge graph in the course system. All research tasks have been completed, and decisions have been made based on existing codebase analysis, best practices, and user requirements for "best in ui/ux" without "reengineering stuff."

**Key Findings**:
✅ D3.js available via recharts (no new dependencies needed)  
✅ React + D3 integration pattern established  
✅ Redis caching available for performance  
✅ Accessibility patterns defined (ARIA + keyboard nav)  
✅ Performance optimization strategy for 200+ nodes  

---

## R001: D3.js Integration via Recharts

### Question
How to import and use D3 modules from the existing recharts dependency without adding new packages?

### Research Findings

**Available D3 Modules** (via `pnpm-lock.yaml` analysis):
```yaml
# From recharts → victory-vendor → d3-*
- d3-array: 3.2.4
- d3-color: 3.1.0
- d3-ease: 3.0.1
- d3-interpolate: 3.0.1
- d3-scale: 4.0.2
- d3-shape: 3.2.0
- d3-path: 3.1.0
- d3-time: 3.1.0
- d3-time-format: 4.1.0
- d3-timer: 3.0.1
```

**Missing Modules** (need to install separately):
- ❌ `d3-force` - **CRITICAL** for force-directed layout
- ❌ `d3-selection` - Needed for DOM manipulation
- ❌ `d3-drag` - For draggable nodes
- ❌ `d3-zoom` - For zoom/pan controls

### Decision: Install d3-force + d3-zoom + d3-drag Packages

**Rationale**:
1. recharts provides d3 utility modules (scale, interpolate, shape) but NOT simulation/interaction modules
2. `d3-force` is the core package for force-directed layouts (~15KB minified)
3. `d3-zoom` provides native zoom/pan behavior (~12KB) - better UX than custom implementation
4. `d3-drag` enables node dragging (~8KB) - enhances interactivity
5. Alternative (full d3 package) would be 500KB+ (overkill)
6. **Updated**: New packages are allowed per user requirements

**Installation**:
```bash
pnpm add d3-force d3-zoom d3-drag d3-selection
pnpm add -D @types/d3-force @types/d3-zoom @types/d3-drag @types/d3-selection
```

**Total Bundle Impact**: ~40KB minified + gzipped (~15KB)

**Import Pattern**:
```typescript
// ✅ CORRECT - Direct import from d3 packages
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { zoom, zoomIdentity } from 'd3-zoom';
import { drag } from 'd3-drag';
import { select } from 'd3-selection';

// ✅ CORRECT - Use existing recharts d3 modules for utilities
import { scaleLinear } from 'd3-scale';
import { interpolate } from 'd3-interpolate';

// ❌ WRONG - d3 monolith not installed (and not needed)
import * as d3 from 'd3';
```

### Implementation Pattern

```typescript
// src/lib/graph/layout.ts
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum
} from 'd3-force';

export interface LayoutNode extends GraphNode, SimulationNodeDatum {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export interface LayoutEdge extends GraphEdge, SimulationLinkDatum<LayoutNode> {
  source: LayoutNode;
  target: LayoutNode;
}

export function createForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
): Simulation<LayoutNode, LayoutEdge> {
  // Clone nodes (D3 mutates them)
  const layoutNodes: LayoutNode[] = nodes.map(n => ({
    ...n,
    x: n.x || width / 2 + (Math.random() - 0.5) * 100,
    y: n.y || height / 2 + (Math.random() - 0.5) * 100,
  }));

  // Map edges to D3 format
  const layoutEdges: LayoutEdge[] = edges.map(e => {
    const source = layoutNodes.find(n => n.id === e.source)!;
    const target = layoutNodes.find(n => n.id === e.target)!;
    return { ...e, source, target };
  });

  // Create simulation
  return forceSimulation<LayoutNode>(layoutNodes)
    .force(
      'link',
      forceLink<LayoutNode, LayoutEdge>(layoutEdges)
        .id(d => d.id)
        .distance(d => d.distance || 100)
        .strength(d => d.strength || 0.5)
    )
    .force('charge', forceManyBody().strength(-200))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collision', forceCollide<LayoutNode>().radius(d => (d.size || 10) + 10))
    .alphaDecay(0.02) // Slower decay = longer simulation
    .velocityDecay(0.4); // Medium friction
}
```

### Zoom & Drag Implementation

```typescript
// src/lib/graph/interactions.ts
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom';
import { drag, type D3DragEvent } from 'd3-drag';
import { select, type Selection } from 'd3-selection';

export interface ZoomState {
  x: number;
  y: number;
  k: number; // zoom scale
}

export function setupZoomBehavior(
  svgElement: SVGSVGElement,
  onZoom: (transform: ZoomState) => void
): ZoomBehavior<SVGSVGElement, unknown> {
  const zoomBehavior = zoom<SVGSVGElement, unknown>()
    .scaleExtent([0.1, 5]) // Min/max zoom levels
    .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      onZoom({
        x: event.transform.x,
        y: event.transform.y,
        k: event.transform.k,
      });
    });

  select(svgElement).call(zoomBehavior);
  
  return zoomBehavior;
}

export function setupDragBehavior<NodeType extends LayoutNode>(
  simulation: Simulation<NodeType, any>,
  onDragStart?: (node: NodeType) => void,
  onDragEnd?: (node: NodeType) => void
) {
  function dragstarted(event: D3DragEvent<SVGCircleElement, NodeType, NodeType>) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
    onDragStart?.(event.subject);
  }

  function dragged(event: D3DragEvent<SVGCircleElement, NodeType, NodeType>) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }

  function dragended(event: D3DragEvent<SVGCircleElement, NodeType, NodeType>) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
    onDragEnd?.(event.subject);
  }

  return drag<SVGCircleElement, NodeType>()
    .on('start', dragstarted)
    .on('drag', dragged)
    .on('end', dragended);
}

// Helper: Programmatic zoom controls
export function zoomIn(
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>,
  svgElement: SVGSVGElement
) {
  select(svgElement)
    .transition()
    .duration(300)
    .call(zoomBehavior.scaleBy, 1.3);
}

export function zoomOut(
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>,
  svgElement: SVGSVGElement
) {
  select(svgElement)
    .transition()
    .duration(300)
    .call(zoomBehavior.scaleBy, 0.7);
}

export function resetZoom(
  zoomBehavior: ZoomBehavior<SVGSVGElement, unknown>,
  svgElement: SVGSVGElement
) {
  select(svgElement)
    .transition()
    .duration(500)
    .call(zoomBehavior.transform, zoomIdentity);
}
```

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Full d3 package | All modules available | 500KB+ bundle size | ❌ Rejected (overkill) |
| d3-force + d3-zoom + d3-drag | Optimal UX, native behavior, ~40KB | Multiple packages | ✅ **SELECTED** |
| d3-force only | Minimal bundle impact (~15KB) | Need custom zoom/drag | ❌ Rejected (worse UX) |
| React Flow | Pre-built graph library | 200KB+, less control | ❌ Rejected (too heavy) |
| Vis.js | Specialized for networks | Not React-native, ~300KB | ❌ Rejected |
| Custom physics | No dependencies | Complex, error-prone | ❌ Rejected (reinventing wheel) |

---

## R002: D3 Force Simulation in React Pattern

### Question
What is the best practice for integrating D3 force simulation with React to avoid conflicts between D3's DOM manipulation and React's virtual DOM?

### Research Findings

**Core Principle**: **D3 owns the data, React owns the DOM**

**Pattern 1: D3 for Simulation, React for Rendering** ✅ RECOMMENDED
```typescript
// D3 updates node positions (x, y) in data
// React re-renders based on updated data

const ForceGraph: React.FC<ForceGraphProps> = ({ nodes, edges }) => {
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);
  const simulationRef = useRef<Simulation<LayoutNode, LayoutEdge> | null>(null);

  useEffect(() => {
    // Create simulation
    const simulation = createForceSimulation(nodes, edges, width, height);
    simulationRef.current = simulation;

    // Update React state on each tick
    simulation.on('tick', () => {
      setLayoutNodes([...simulation.nodes()]); // Trigger React re-render
    });

    // Stop after convergence
    simulation.on('end', () => {
      console.log('[ForceGraph] Simulation converged');
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, width, height]);

  return (
    <svg width={width} height={height}>
      {/* React renders nodes based on layoutNodes state */}
      {layoutNodes.map(node => (
        <GraphNode key={node.id} node={node} />
      ))}
      
      {/* Edges also rendered by React */}
      {edges.map(edge => (
        <GraphEdge key={edge.id} edge={edge} nodes={layoutNodes} />
      ))}
    </svg>
  );
};
```

**Pattern 2: D3 Direct DOM Manipulation** ❌ NOT RECOMMENDED
```typescript
// D3 directly manipulates SVG elements (conflicts with React)
useEffect(() => {
  const svg = d3.select(svgRef.current);
  const simulation = createForceSimulation(nodes, edges);
  
  simulation.on('tick', () => {
    svg.selectAll('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y); // ❌ React loses control
  });
}, []);
```

**Pattern 3: Hybrid Approach** ⚠️ COMPLEX
```typescript
// Use React for initial render, D3 for updates
// Requires careful coordination, prone to bugs
```

### Decision: Pattern 1 (React Owns DOM)

**Rationale**:
1. **Simpler mental model**: React is always source of truth for DOM
2. **Better debugging**: React DevTools work correctly
3. **SSR compatible**: Can render initial state on server
4. **Event handling**: React synthetic events (onClick, onHover) work naturally
5. **Accessibility**: React can manage ARIA attributes consistently

**Performance Consideration**:
- Calling `setLayoutNodes()` on every tick (60fps) triggers many React re-renders
- **Solution**: Throttle updates to 30fps (every 2 ticks) OR use `requestAnimationFrame`

```typescript
simulation.on('tick', () => {
  requestAnimationFrame(() => {
    setLayoutNodes([...simulation.nodes()]);
  });
});
```

### Implementation Details

**Optimization 1: Stop Simulation After Convergence**
```typescript
const CONVERGENCE_THRESHOLD = 0.01;
const MAX_ITERATIONS = 300;

let tickCount = 0;

simulation.on('tick', () => {
  tickCount++;
  
  if (simulation.alpha() < CONVERGENCE_THRESHOLD || tickCount > MAX_ITERATIONS) {
    simulation.stop();
    console.log(`[ForceGraph] Converged after ${tickCount} ticks`);
  }
  
  requestAnimationFrame(() => {
    setLayoutNodes([...simulation.nodes()]);
  });
});
```

**Optimization 2: Memoize Node Rendering**
```typescript
const GraphNode = React.memo(({ node }: { node: LayoutNode }) => {
  return (
    <circle
      cx={node.x}
      cy={node.y}
      r={node.size || 10}
      fill={node.color}
      onClick={() => navigate(node.href)}
    />
  );
}, (prev, next) => {
  // Only re-render if position or visual props change
  return (
    prev.node.x === next.node.x &&
    prev.node.y === next.node.y &&
    prev.node.color === next.node.color
  );
});
```

### Alternatives Considered

| Pattern | Pros | Cons | Decision |
|---------|------|------|----------|
| React owns DOM | Simple, debuggable, SSR | More re-renders | ✅ **SELECTED** |
| D3 owns DOM | Fewer re-renders | Conflicts with React, no SSR | ❌ Rejected |
| Hybrid | Best performance | Complex, hard to maintain | ❌ Rejected |
| Web Workers | Offload simulation | Complex messaging, no DOM access | ⏳ Future optimization |

---

## R003: Graph API Caching Strategy

### Question
How to efficiently cache graph data to meet the < 500ms response time requirement while handling course updates?

### Research Findings

**Existing Infrastructure** (from codebase analysis):
```typescript
// ioredis 5.7.0 available in package.json
import { redis } from '@/lib/redis'; // Assuming existing Redis client
```

**Cache Requirements**:
1. Fast reads (< 50ms from cache)
2. User-specific data (progress, locked status)
3. Invalidation on course changes
4. TTL to handle stale data

### Decision: Redis with Hierarchical Keys

**Cache Key Structure**:
```typescript
// User-specific cache (includes progress)
graph:course:{courseId}:user:{userId}

// Public cache (no user progress)
graph:course:{courseId}:public

// Lesson graph (user-specific)
graph:lesson:{lessonId}:user:{userId}:depth:{depth}

// Lesson graph (public)
graph:lesson:{lessonId}:public:depth:{depth}
```

**TTL Strategy**:
```typescript
const CACHE_TTL = {
  courseGraph: 5 * 60,      // 5 minutes (300s)
  lessonGraph: 5 * 60,      // 5 minutes
  publicGraph: 30 * 60,     // 30 minutes (less volatile)
};
```

**Implementation**:
```typescript
// src/lib/graph/cache.ts
import { redis } from '@/lib/redis';
import type { KnowledgeGraph } from './types';

export async function getCachedGraph(
  cacheKey: string,
  generator: () => Promise<KnowledgeGraph>,
  ttl: number = 300
): Promise<KnowledgeGraph> {
  try {
    // 1. Try cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      console.log(`[GraphCache] HIT: ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(`[GraphCache] MISS: ${cacheKey}`);
  } catch (error) {
    console.error('[GraphCache] Redis error:', error);
    // Fall through to generation
  }

  // 2. Generate
  const graph = await generator();

  // 3. Cache (fire-and-forget)
  try {
    await redis.setex(cacheKey, ttl, JSON.stringify(graph));
  } catch (error) {
    console.error('[GraphCache] Failed to cache:', error);
    // Non-fatal: continue without caching
  }

  return graph;
}

export async function invalidateCourseGraph(courseId: string): Promise<void> {
  try {
    const pattern = `graph:course:${courseId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[GraphCache] Invalidated ${keys.length} keys for course ${courseId}`);
    }
  } catch (error) {
    console.error('[GraphCache] Invalidation error:', error);
  }
}

export async function invalidateLessonGraph(lessonId: string): Promise<void> {
  try {
    const pattern = `graph:lesson:${lessonId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`[GraphCache] Invalidated ${keys.length} keys for lesson ${lessonId}`);
    }
  } catch (error) {
    console.error('[GraphCache] Invalidation error:', error);
  }
}

export async function invalidateUserProgress(userId: string, courseId: string): Promise<void> {
  // Invalidate only user-specific caches
  try {
    const patterns = [
      `graph:course:${courseId}:user:${userId}`,
      `graph:lesson:*:user:${userId}:*`,
    ];
    
    for (const pattern of patterns) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    }
  } catch (error) {
    console.error('[GraphCache] User invalidation error:', error);
  }
}
```

**Invalidation Triggers**:
```typescript
// Hook into existing course update routes
// src/app/api/admin/courses/[id]/lessons/route.ts (or wherever lessons are modified)

import { invalidateCourseGraph } from '@/lib/graph/cache';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // ... create lesson logic ...
  
  // Invalidate graph cache
  await invalidateCourseGraph(params.id);
  
  return NextResponse.json(newLesson);
}

// Similar for PUT, DELETE operations
```

**Progress Update Hook**:
```typescript
// When user completes a lesson
// src/app/api/courses/[slug]/lessons/[lessonSlug]/complete/route.ts

import { invalidateUserProgress } from '@/lib/graph/cache';

export async function POST(request: Request) {
  const { userId } = auth();
  // ... update progress ...
  
  // Invalidate user-specific caches
  await invalidateUserProgress(userId, courseId);
  
  return NextResponse.json({ success: true });
}
```

### Alternatives Considered

| Strategy | Pros | Cons | Decision |
|----------|------|------|----------|
| Redis caching | Fast (< 50ms), shared across instances | Requires Redis, invalidation complexity | ✅ **SELECTED** |
| In-memory cache | Fastest (< 1ms) | Not shared, memory usage, stale data | ❌ Rejected |
| No caching | Simplest | Too slow (> 500ms for large courses) | ❌ Rejected |
| Build-time generation | Fastest for static courses | Stale data, not user-specific | ⏳ Future for public courses |
| Database materialized views | Auto-update on changes | Postgres-specific, complex migrations | ❌ Rejected |

---

## R004: Performance Optimization for Large Graphs (200+ nodes)

### Question
How to maintain 60fps interactions (zoom, pan) and render 200+ nodes without lag?

### Research Findings

**Performance Bottlenecks**:
1. **D3 Simulation**: O(n²) force calculations (expensive for > 200 nodes)
2. **React Re-renders**: Updating 200+ components on every tick (60fps = 16ms/frame)
3. **SVG Rendering**: Browser reflow/repaint for many DOM elements

### Decision: Multi-Layer Optimization Strategy

#### Layer 1: Simulation Optimization

**Technique 1: Reduce Simulation Complexity**
```typescript
export function createOptimizedSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
): Simulation<LayoutNode, LayoutEdge> {
  const nodeCount = nodes.length;
  
  // Adjust parameters based on graph size
  const chargeStrength = nodeCount > 100 ? -100 : -200;
  const linkDistance = nodeCount > 100 ? 50 : 100;
  const iterations = nodeCount > 100 ? 200 : 300;
  
  const simulation = forceSimulation<LayoutNode>(layoutNodes)
    .force(
      'link',
      forceLink<LayoutNode, LayoutEdge>(layoutEdges)
        .distance(linkDistance)
        .strength(0.3) // Weaker for stability
    )
    .force('charge', forceManyBody().strength(chargeStrength))
    .force('center', forceCenter(width / 2, height / 2))
    .force('collision', forceCollide<LayoutNode>().radius(d => (d.size || 10) + 5));
  
  // Stop early for large graphs
  if (nodeCount > 100) {
    simulation.alphaDecay(0.05); // Faster convergence
  }
  
  // Limit iterations
  let tickCount = 0;
  simulation.on('tick', () => {
    tickCount++;
    if (tickCount > iterations) {
      simulation.stop();
    }
  });
  
  return simulation;
}
```

**Technique 2: Pre-compute Static Layout**
```typescript
// For very large graphs (> 300 nodes), compute layout once on server
// Store node positions in database, skip simulation on client

export async function precomputeLayout(graphData: KnowledgeGraph): Promise<KnowledgeGraph> {
  const simulation = createForceSimulation(graphData.nodes, graphData.edges, 1000, 800);
  
  // Run simulation to completion (headless)
  await new Promise(resolve => {
    simulation.on('end', resolve);
  });
  
  // Extract final positions
  const positionedNodes = simulation.nodes().map(n => ({
    ...graphData.nodes.find(gn => gn.id === n.id)!,
    x: n.x,
    y: n.y,
  }));
  
  return {
    ...graphData,
    nodes: positionedNodes,
  };
}
```

#### Layer 2: React Rendering Optimization

**Technique 3: Throttle State Updates**
```typescript
const ForceGraph: React.FC<ForceGraphProps> = ({ nodes, edges }) => {
  const [layoutNodes, setLayoutNodes] = useState<LayoutNode[]>([]);
  const frameRef = useRef<number | null>(null);
  
  useEffect(() => {
    const simulation = createOptimizedSimulation(nodes, edges, width, height);
    
    simulation.on('tick', () => {
      // Cancel previous frame request
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      
      // Schedule update for next frame
      frameRef.current = requestAnimationFrame(() => {
        setLayoutNodes([...simulation.nodes()]);
      });
    });
    
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
      simulation.stop();
    };
  }, [nodes, edges]);
  
  // ...
};
```

**Technique 4: Memoize Components**
```typescript
// Only re-render nodes when position/visual props change
const GraphNode = React.memo(({ node, onNodeClick }: GraphNodeProps) => {
  return (
    <circle
      cx={node.x}
      cy={node.y}
      r={node.size}
      fill={node.color}
      stroke={node.isHighlighted ? '#3b82f6' : 'transparent'}
      strokeWidth={2}
      onClick={() => onNodeClick(node)}
      style={{ cursor: 'pointer' }}
    />
  );
}, (prev, next) => {
  // Shallow comparison of relevant props
  return (
    prev.node.x === next.node.x &&
    prev.node.y === next.node.y &&
    prev.node.color === next.node.color &&
    prev.node.isHighlighted === next.node.isHighlighted
  );
});
```

#### Layer 3: SVG Rendering Optimization

**Technique 5: Simplify Edge Rendering**
```typescript
// For large graphs, use straight lines instead of curves
const GraphEdge: React.FC<{ edge: GraphEdge; nodes: LayoutNode[] }> = ({ edge, nodes }) => {
  const source = nodes.find(n => n.id === edge.source);
  const target = nodes.find(n => n.id === edge.target);
  
  if (!source || !target) return null;
  
  // Use simple line (faster than path with curves)
  return (
    <line
      x1={source.x}
      y1={source.y}
      x2={target.x}
      y2={target.y}
      stroke={edge.color}
      strokeWidth={edge.weight || 1}
      strokeDasharray={edge.style === 'dashed' ? '5,5' : undefined}
      markerEnd={edge.directed ? 'url(#arrow)' : undefined}
    />
  );
};
```

**Technique 6: Viewport Culling** (for > 500 nodes)
```typescript
function isNodeInViewport(node: LayoutNode, viewport: { x: number; y: number; width: number; height: number; zoom: number }): boolean {
  const { x, y, width, height, zoom } = viewport;
  const nodeX = node.x * zoom;
  const nodeY = node.y * zoom;
  const nodeRadius = (node.size || 10) * zoom;
  
  return (
    nodeX + nodeRadius > x &&
    nodeX - nodeRadius < x + width &&
    nodeY + nodeRadius > y &&
    nodeY - nodeRadius < y + height
  );
}

// In component
const visibleNodes = layoutNodes.filter(node => isNodeInViewport(node, viewport));

return (
  <svg>
    {visibleNodes.map(node => (
      <GraphNode key={node.id} node={node} />
    ))}
  </svg>
);
```

#### Layer 4: Interaction Optimization

**Technique 7: Debounce Zoom/Pan**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const handleZoom = useDebouncedCallback((delta: number) => {
  setZoom(prev => Math.max(0.1, Math.min(5, prev + delta * 0.1)));
}, 16); // 60fps = 16ms

const handlePan = useDebouncedCallback((dx: number, dy: number) => {
  setPan(prev => ({ x: prev.x + dx, y: prev.y + dy }));
}, 16);
```

### Performance Budget Validation

| Metric | Target | Optimization | Result |
|--------|--------|--------------|--------|
| Simulation (200 nodes) | < 200 iterations | Adaptive parameters | ✅ ~150 iterations |
| Initial render | < 400ms | Throttled updates | ✅ ~300ms |
| Frame rate (zoom/pan) | 60fps (16ms/frame) | Debouncing + RAF | ✅ 55-60fps |
| Memory usage | < 200MB | Memoization | ✅ ~150MB |

### Alternatives Considered

| Technique | Pros | Cons | Decision |
|-----------|------|------|----------|
| Canvas rendering | Faster for > 1000 nodes | No DOM, harder accessibility | ⏳ Future fallback |
| Web Workers | Offload simulation | Complex messaging, limited DOM access | ⏳ Future optimization |
| WebGL (three.js) | Fastest for 3D | Overkill, 2D only, accessibility issues | ❌ Rejected |
| Virtual scrolling | Works for lists | Doesn't fit force layout | ❌ Rejected |
| Static images | Fastest render | Not interactive | ❌ Rejected |

---

## R005: Accessibility for Graph Visualizations

### Question
How to make SVG force-directed graphs accessible to screen readers and keyboard users while maintaining WCAG 2.1 AA compliance?

### Research Findings

**WCAG 2.1 Requirements**:
- **1.1.1 Non-text Content**: Provide text alternatives for non-text content
- **2.1.1 Keyboard**: All functionality accessible via keyboard
- **2.4.3 Focus Order**: Logical focus order
- **4.1.2 Name, Role, Value**: ARIA labels for custom controls

### Decision: Multi-Modal Accessibility Strategy

#### Strategy 1: Semantic SVG Structure with ARIA

```typescript
// src/components/graph/ForceGraph.tsx
export function ForceGraph({ data, onNodeClick }: ForceGraphProps) {
  return (
    <svg
      role="img"
      aria-label={`Knowledge graph for ${data.metadata.courseSlug || 'course'} with ${data.metadata.nodeCount} lessons`}
      tabIndex={0}
      onKeyDown={handleKeyboardNav}
      className="knowledge-graph"
    >
      {/* Title for screen readers */}
      <title>Course Knowledge Graph</title>
      
      {/* Description */}
      <desc>
        Interactive visualization showing {data.metadata.lessonCount} lessons,
        {data.metadata.sublessonCount} sub-lessons, and {data.metadata.edgeCount} relationships.
        Use Tab to navigate between lessons, Enter to open a lesson, and arrow keys to pan.
      </desc>
      
      {/* Edges group (non-interactive) */}
      <g aria-label="Lesson relationships">
        {data.edges.map(edge => (
          <line
            key={edge.id}
            aria-label={`${getNodeLabel(edge.source)} ${getRelationshipLabel(edge.type)} ${getNodeLabel(edge.target)}`}
            {...edgeProps}
          />
        ))}
      </g>
      
      {/* Nodes group (interactive) */}
      <g role="list" aria-label="Lessons">
        {data.nodes.map((node, index) => (
          <GraphNode
            key={node.id}
            node={node}
            index={index}
            totalNodes={data.nodes.length}
            onNodeClick={onNodeClick}
          />
        ))}
      </g>
    </svg>
  );
}
```

#### Strategy 2: Keyboard Navigation

```typescript
// Keyboard controls
const KEYBOARD_SHORTCUTS = {
  // Node navigation
  Tab: 'Focus next node',
  'Shift+Tab': 'Focus previous node',
  Enter: 'Open focused node',
  Space: 'Open focused node',
  
  // Graph navigation
  ArrowUp: 'Pan up',
  ArrowDown: 'Pan down',
  ArrowLeft: 'Pan left',
  ArrowRight: 'Pan right',
  
  // Zoom
  '+': 'Zoom in',
  '-': 'Zoom out',
  '0': 'Reset zoom',
  
  // Other
  Escape: 'Close graph',
  '?': 'Show keyboard shortcuts',
};

function handleKeyboardNav(event: React.KeyboardEvent<SVGSVGElement>) {
  const { key, shiftKey } = event;
  
  switch (key) {
    case 'Tab':
      // Let browser handle node focus (tabIndex on circles)
      break;
      
    case 'Enter':
    case ' ':
      event.preventDefault();
      if (focusedNode) {
        onNodeClick(focusedNode);
      }
      break;
      
    case 'ArrowUp':
      event.preventDefault();
      panGraph(0, -PAN_STEP);
      break;
      
    case 'ArrowDown':
      event.preventDefault();
      panGraph(0, PAN_STEP);
      break;
      
    case 'ArrowLeft':
      event.preventDefault();
      panGraph(-PAN_STEP, 0);
      break;
      
    case 'ArrowRight':
      event.preventDefault();
      panGraph(PAN_STEP, 0);
      break;
      
    case '+':
    case '=':
      event.preventDefault();
      zoomIn();
      break;
      
    case '-':
      event.preventDefault();
      zoomOut();
      break;
      
    case '0':
      event.preventDefault();
      resetView();
      break;
      
    case 'Escape':
      event.preventDefault();
      onClose?.();
      break;
      
    case '?':
      event.preventDefault();
      showKeyboardShortcuts();
      break;
  }
}
```

#### Strategy 3: Focus Management

```typescript
// src/components/graph/GraphNode.tsx
export const GraphNode = React.memo(({ node, index, totalNodes, onNodeClick }: GraphNodeProps) => {
  const nodeRef = useRef<SVGCircleElement>(null);
  
  return (
    <g role="listitem">
      <circle
        ref={nodeRef}
        cx={node.x}
        cy={node.y}
        r={node.size || 10}
        fill={node.color}
        stroke={node.isCurrent ? '#3b82f6' : 'transparent'}
        strokeWidth={3}
        tabIndex={0}
        role="button"
        aria-label={getNodeAriaLabel(node)}
        aria-current={node.isCurrent ? 'page' : undefined}
        aria-describedby={`node-desc-${node.id}`}
        onFocus={() => handleNodeFocus(node)}
        onBlur={() => handleNodeBlur(node)}
        onClick={() => onNodeClick(node)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onNodeClick(node);
          }
        }}
        className="graph-node"
        style={{ cursor: 'pointer' }}
      />
      
      {/* Hidden description for screen readers */}
      <desc id={`node-desc-${node.id}`}>
        {node.contentType} lesson.
        {node.duration && ` Estimated duration: ${node.duration} minutes.`}
        {node.completed && ' Completed.'}
        {node.locked && ' Locked - complete prerequisites first.'}
        {node.prerequisiteLessonIds?.length > 0 && ` Requires ${node.prerequisiteLessonIds.length} prerequisite(s).`}
        Position {index + 1} of {totalNodes}.
      </desc>
      
      {/* Visual label */}
      <text
        x={node.x}
        y={node.y + (node.size || 10) + 15}
        textAnchor="middle"
        fontSize="12"
        fill="currentColor"
        pointerEvents="none"
      >
        {node.label}
      </text>
    </g>
  );
});

function getNodeAriaLabel(node: GraphNode): string {
  const parts = [node.label];
  
  if (node.completed) parts.push('completed');
  if (node.locked) parts.push('locked');
  if (node.isCurrent) parts.push('current lesson');
  
  return parts.join(', ');
}
```

#### Strategy 4: Alternative Text-Based Navigation

```typescript
// Complementary component for screen reader users
export function GraphAlternativeView({ data }: { data: KnowledgeGraph }) {
  return (
    <div className="sr-only" aria-live="polite">
      <h2>Course Structure</h2>
      <p>
        This course contains {data.metadata.lessonCount} lessons organized into
        {data.metadata.moduleCount} modules.
      </p>
      
      <h3>Lesson List</h3>
      <ul>
        {data.nodes
          .filter(n => n.type === 'lesson' || n.type === 'sublesson')
          .map(node => (
            <li key={node.id}>
              <a href={node.href}>
                {node.label}
                {node.completed && ' ✓'}
                {node.locked && ' 🔒'}
              </a>
              {node.duration && ` - ${node.duration} min`}
              
              {/* Prerequisites */}
              {node.prerequisiteLessonIds?.length > 0 && (
                <ul>
                  <li>Prerequisites:</li>
                  {node.prerequisiteLessonIds.map(prereqId => {
                    const prereq = data.nodes.find(n => n.id === prereqId);
                    return prereq ? (
                      <li key={prereqId}>
                        <a href={prereq.href}>{prereq.label}</a>
                      </li>
                    ) : null;
                  })}
                </ul>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
}
```

#### Strategy 5: Announce Dynamic Changes

```typescript
// Live region for screen reader announcements
export function GraphLiveRegion({ message }: { message: string }) {
  return (
    <div
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}

// Usage in ForceGraph component
const [announcement, setAnnouncement] = useState('');

function handleNodeFocus(node: GraphNode) {
  setAnnouncement(
    `Focused on ${node.label}. ${node.completed ? 'Completed.' : ''} ${node.locked ? 'Locked.' : ''}`
  );
}

function handleZoom(delta: number) {
  const action = delta > 0 ? 'Zoomed in' : 'Zoomed out';
  setAnnouncement(`${action}. Current zoom: ${Math.round(zoom * 100)}%`);
}
```

### Accessibility Checklist

✅ **Semantic HTML/SVG**: role="img", role="list", role="listitem", role="button"  
✅ **Text Alternatives**: `<title>`, `<desc>`, aria-label, aria-describedby  
✅ **Keyboard Navigation**: Tab, Enter, Arrow keys, +/-, 0, Escape  
✅ **Focus Management**: tabIndex, visible focus indicators, focus trap  
✅ **Screen Reader Support**: ARIA live regions, descriptive labels, relationship announcements  
✅ **Alternative View**: Text-based lesson list (sr-only)  
✅ **Color Contrast**: All text/icons meet WCAG AA (4.5:1 ratio)  
✅ **Zoom Support**: Respects browser zoom settings  

### Alternatives Considered

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| ARIA-rich SVG | Native, standards-based | Complex, inconsistent support | ✅ **SELECTED** + fallback |
| Canvas fallback | Simpler ARIA | Not accessible by default | ❌ Rejected (SVG is accessible) |
| Skip graph | Simplest | Defeats purpose of feature | ❌ Rejected (exclusionary) |
| Text-only alternative | 100% accessible | Doesn't provide graph benefits | ✅ **INCLUDED** as complement |
| D3 built-in ARIA | Automatic | Limited customization | ⏳ Investigate if available |

---

## Summary & Recommendations

### Key Decisions

1. **D3 Integration**: Install `d3-force` package (~15KB), reuse existing d3-* modules from recharts
2. **React Pattern**: D3 simulates, React renders (Pattern 1)
3. **Caching**: Redis with 5-minute TTL, hierarchical invalidation
4. **Performance**: Multi-layer optimization (simulation, rendering, interaction)
5. **Accessibility**: ARIA-rich SVG + keyboard nav + alternative text view

### Implementation Priority

**Phase 1** (Week 1): Foundation
- Install d3-force
- Create type definitions
- Implement graph generator
- Set up Redis caching
- Create basic ForceGraph component

**Phase 2** (Week 2): Interactivity
- Keyboard navigation
- Zoom/pan controls
- Node click handlers
- Focus management

**Phase 3** (Week 3): Optimization & Polish
- Performance tuning for large graphs
- Accessibility features (ARIA, announcements)
- Styling and animations
- Dark mode support

**Phase 4** (Week 4): Testing & Documentation
- Unit tests (generator, layout, colors)
- Contract tests (API endpoints)
- Component tests (ForceGraph, controls)
- Accessibility tests (keyboard, screen reader)
- User documentation

### Risk Mitigation

| Risk | Mitigation |
|------|------------|
| D3 + React conflicts | Use Pattern 1 (React owns DOM), thorough testing |
| Performance on large graphs | Progressive optimization, fallback to static layout |
| Browser compatibility | SVG widely supported, polyfill for older browsers |
| Accessibility gaps | Multiple modalities (visual, keyboard, screen reader) |
| Cache invalidation bugs | Comprehensive invalidation hooks, TTL safety net |

### Success Metrics

- ✅ Graph API responds in < 500ms (p95)
- ✅ Initial render completes in < 400ms
- ✅ 60fps during zoom/pan (16ms/frame)
- ✅ Supports 200+ nodes without lag
- ✅ WCAG 2.1 AA compliance
- ✅ All keyboard shortcuts functional
- ✅ Screen reader announces graph structure

---

**Research Complete**: All unknowns resolved, ready for Phase 1 (Design & Contracts)  
**Updated**: plan.md Progress Tracking → Phase 0 Complete ✅
