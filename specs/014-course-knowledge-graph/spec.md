# Spec: Obsidian-like Knowledge Graph for Course System

**Feature ID**: 014  
**Title**: Interactive Knowledge Graph Visualization  
**Created**: October 7, 2025  
**Status**: Planning → Enhanced with Production Patterns  
**Priority**: Medium

**📚 Related Documents**:
- [plan.md](./plan.md) - Implementation planning workflow
- [research.md](./research.md) - Technical research (D3 integration, caching, performance)
- [data-model.md](./data-model.md) - Graph data structures
- [api-reference.md](./api-reference.md) - API endpoints and contracts
- [PRODUCTION_ARCHITECTURE.md](./PRODUCTION_ARCHITECTURE.md) - **NEW** - Codebase analysis + production-ready patterns

---

## Executive Summary

Integrate an **Obsidian-like knowledge graph** into the course system to visualize relationships between lessons, sub-lessons, and topics. The graph will provide two views:

1. **Global Course Graph**: Shows the entire course outline with modules and lesson connections
2. **Local Lesson Graph**: Displays sub-lessons and internal topic relationships for a specific lesson

The graph is **secondary to content** — it's a navigation aid and visualization tool, not the primary interface. Users can toggle it on/demand without cluttering the main learning experience.

---

## Problem Statement

### Current State
- Course structure is hierarchical (Course → Modules → Lessons → Sub-Lessons)
- Navigation is linear (prev/next) and list-based (module accordions)
- No visual representation of how lessons relate to each other
- Prerequisites exist but aren't visually represented
- Sub-lessons are shown as nested lists without relationship visualization

### Limitations
- Students can't see the "big picture" of course structure
- No way to visualize topic clusters or learning paths
- Prerequisite relationships are hidden in data
- Sub-lesson connections aren't obvious
- Difficult to understand course complexity at a glance

### User Pain Points
- "How does this lesson fit into the bigger picture?"
- "What other lessons are related to this topic?"
- "Which lessons should I take before this one?"
- "How are these sub-lessons connected?"

---

## Goals & Success Criteria

### Primary Goals
1. ✅ **Visualize course structure** as an interactive knowledge graph
2. ✅ **Show lesson relationships** (prerequisites, related topics, sub-lessons)
3. ✅ **Enable graph-based navigation** while keeping content primary
4. ✅ **Maintain lightweight UX** with toggleable visibility
5. ✅ **Support both global and local views** (course-level and lesson-level)

### Success Metrics
- Graph loads in < 500ms for courses with 100+ lessons
- Users can toggle graph on/off seamlessly
- Graph supports basic interactions (zoom, pan, click nodes)
- Mobile-friendly with responsive layout
- Accessible via keyboard navigation

### Non-Goals
- ❌ Graph is NOT the primary navigation method
- ❌ Not building a full graph editor (read-only for students)
- ❌ Not replacing module/lesson lists
- ❌ Not supporting 3D graph visualizations (keep it 2D)
- ❌ Not auto-generating relationships (use existing data)

---

## User Stories

### Student Perspective

**As a student**, I want to:
1. See a visual map of the entire course so I can understand its structure
2. View which lessons are prerequisites for the current lesson
3. See how sub-lessons relate to each other within a parent lesson
4. Click on nodes to navigate directly to lessons
5. Toggle the graph view without losing my place in the content
6. Zoom and pan the graph to explore different areas
7. Identify lesson clusters or learning paths visually

### Instructor/Admin Perspective

**As an instructor**, I want to:
1. Preview how my course structure looks as a graph
2. Understand if prerequisite chains are clear
3. Identify orphaned lessons (no connections)
4. See module boundaries in the graph
5. Validate that sub-lesson relationships make sense

---

## Technical Specification

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                  Course Page UI                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Course Content (Primary)           │  │
│  │   - Hero section                             │  │
│  │   - Module accordions                        │  │
│  │   - Lesson lists                             │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  [Toggle Graph] Button                       │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │   Knowledge Graph (Collapsible)              │  │
│  │   - Force-directed layout                    │  │
│  │   - Interactive nodes & edges                │  │
│  │   - Zoom & pan controls                      │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│                  Lesson Page UI                     │
│  ┌──────────────────────────────────────────────┐  │
│  │           Lesson Content (Primary)           │  │
│  │   - Title & metadata                         │  │
│  │   - Content body (MDX/video/etc)             │  │
│  │   - Flashcards                               │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │  [Toggle Local Graph] Button                 │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │   Local Graph (Sub-lessons & Topics)         │  │
│  │   - Current lesson at center                 │  │
│  │   - Sub-lessons as connected nodes           │  │
│  │   - Prerequisites highlighted                │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │           Sub-Lessons Section                │  │
│  └──────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────┐  │
│  │           Navigation Footer                  │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

### Data Model

#### Graph Node Types

```typescript
interface GraphNode {
  id: string;
  type: 'course' | 'module' | 'lesson' | 'sublesson' | 'topic';
  label: string;
  
  // Display properties
  size?: number;        // Node size (based on importance/duration)
  color?: string;       // Color coding by type/status
  icon?: string;        // Icon for content type
  
  // Metadata
  duration?: number;    // estimatedDurationMinutes
  completed?: boolean;  // User progress
  locked?: boolean;     // Prerequisite not met
  contentType?: string; // blog | standalone | video | quiz | flashcards
  
  // Navigation
  href?: string;        // Link to lesson page
  slug?: string;
  
  // Position (for layout persistence)
  x?: number;
  y?: number;
}

interface GraphEdge {
  id: string;
  source: string;       // Node ID
  target: string;       // Node ID
  type: 'prerequisite' | 'parent-child' | 'sibling' | 'related';
  
  // Display properties
  weight?: number;      // Line thickness
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  label?: string;       // Optional edge label
  
  // Direction
  directed?: boolean;   // True for prerequisites
}

interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    courseId?: string;
    lessonId?: string;
    scope: 'global' | 'local';
    nodeCount: number;
    edgeCount: number;
  };
}
```

#### Existing Models (Reference)

From `CourseLesson.ts`:
```typescript
{
  _id: ObjectId;
  courseId: ObjectId;
  moduleId: ObjectId;
  title: string;
  contentType: 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards';
  estimatedDurationMinutes: number;
  parentLessonId?: ObjectId | null;    // For sub-lessons
  prerequisiteLessonIds: ObjectId[];   // Dependencies
  order: number;                       // Within module
  // ... other fields
}
```

From `CourseModule.ts`:
```typescript
{
  _id: ObjectId;
  courseId: ObjectId;
  title: string;
  order: number;
  lessonIds: ObjectId[];
  // ... other fields
}
```

### API Endpoints

#### 1. Global Course Graph
```
GET /api/courses/[courseSlug]/graph

Response:
{
  "nodes": [
    {
      "id": "lesson-123",
      "type": "lesson",
      "label": "Introduction to TypeScript",
      "contentType": "blog",
      "duration": 30,
      "completed": true,
      "href": "/courses/typescript/lessons/introduction",
      "moduleId": "module-1",
      "moduleName": "Fundamentals"
    },
    // ... more nodes
  ],
  "edges": [
    {
      "id": "edge-1",
      "source": "lesson-123",
      "target": "lesson-124",
      "type": "prerequisite",
      "directed": true
    },
    // ... more edges
  ],
  "metadata": {
    "courseId": "course-abc",
    "scope": "global",
    "nodeCount": 42,
    "edgeCount": 58
  }
}
```

#### 2. Local Lesson Graph
```
GET /api/courses/[courseSlug]/lessons/[lessonSlug]/graph

Response:
{
  "nodes": [
    {
      "id": "lesson-current",
      "type": "lesson",
      "label": "Parent Lesson",
      "isCurrent": true
    },
    {
      "id": "sublesson-1",
      "type": "sublesson",
      "label": "Sub-lesson 1",
      "parentId": "lesson-current"
    },
    // ... more nodes
  ],
  "edges": [
    {
      "id": "edge-parent-child-1",
      "source": "lesson-current",
      "target": "sublesson-1",
      "type": "parent-child"
    },
    // ... more edges
  ],
  "metadata": {
    "lessonId": "lesson-current",
    "scope": "local",
    "nodeCount": 8,
    "edgeCount": 12
  }
}
```

### Graph Generation Logic

#### Global Graph (Course-Level)

**Node Creation**:
1. **Course node** (optional, can be center point)
2. **Module nodes** (colored by module, larger size)
3. **Lesson nodes** (default size, colored by content type)
4. **Sub-lesson nodes** (smaller size, same color as parent)

**Edge Creation**:
1. **Module → Lessons**: All lessons in a module connect to it
2. **Prerequisites**: Directed edges from prerequisite → dependent lesson
3. **Parent → Child**: Parent lesson → Sub-lessons
4. **Sibling relationships**: Sub-lessons under same parent (optional)

**Layout Strategy**:
- Use force-directed layout (D3 force simulation)
- Group nodes by module (attractive force within module)
- Respect prerequisite chains (flow from left to right)
- Keep sub-lessons close to parents

#### Local Graph (Lesson-Level)

**Node Creation**:
1. **Current lesson** (center, highlighted, larger)
2. **Sub-lessons** (arranged around parent)
3. **Prerequisites** (shown at left, dimmed if completed)
4. **Next lessons** (shown at right, as suggestions)

**Edge Creation**:
1. **Parent → Sub-lessons**: Radial connections
2. **Sequential sub-lessons**: Sibling connections (if order matters)
3. **Prerequisites**: Incoming edges from completed prerequisites

**Layout Strategy**:
- Radial layout with current lesson at center
- Sub-lessons in a circle around parent
- Prerequisites on left, next lessons on right
- Use hierarchical layout for clarity

### Technology Stack

#### Recommended: D3.js + React
**Rationale**:
- ✅ Already in dependencies (via recharts → d3-*)
- ✅ Powerful force simulation
- ✅ Fine-grained control over rendering
- ✅ Excellent performance
- ✅ SVG-based (accessible, responsive)

**Implementation**:
```tsx
// src/components/course/KnowledgeGraph.tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface KnowledgeGraphProps {
  data: KnowledgeGraph;
  onNodeClick?: (node: GraphNode) => void;
  height?: number;
}

export function KnowledgeGraph({
  data,
  onNodeClick,
  height = 600
}: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current) return;
    
    // D3 force simulation logic
    const simulation = d3.forceSimulation(data.nodes)
      .force('link', d3.forceLink(data.edges))
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter());
    
    // Render nodes and edges
    // ... implementation
  }, [data]);
  
  return <svg ref={svgRef} width="100%" height={height} />;
}
```

#### Alternative: React Flow
**Rationale**:
- ✅ React-first library
- ✅ Built-in controls (zoom, pan, minimap)
- ✅ Custom node components
- ✅ Good TypeScript support

**Cons**:
- ❌ Additional dependency (~200KB)
- ❌ Less control over layout algorithms
- ❌ Heavier than pure D3

#### Alternative: Vis.js Network
**Rationale**:
- ✅ Specialized for network graphs
- ✅ Great physics simulation
- ✅ Good documentation

**Cons**:
- ❌ Not React-native
- ❌ Harder to customize styling
- ❌ Another dependency

**DECISION**: Use **D3.js** (already available) with custom React wrapper

---

## UI/UX Design

### Component Hierarchy

```
<CourseDetailPage>
  <CourseHeader />
  <CourseModules />
  
  <!-- Graph Toggle -->
  <GraphToggleButton 
    onClick={() => setGraphVisible(!graphVisible)}
  >
    {graphVisible ? 'Hide Graph' : 'Show Knowledge Graph'}
  </GraphToggleButton>
  
  <!-- Collapsible Graph Container -->
  <Collapsible open={graphVisible}>
    <KnowledgeGraphContainer>
      <GraphControls>
        <ZoomInButton />
        <ZoomOutButton />
        <ResetViewButton />
        <ToggleLayoutButton />
        <FullscreenButton />
      </GraphControls>
      
      <KnowledgeGraph
        data={graphData}
        onNodeClick={handleNodeClick}
        highlightedNodes={currentPath}
      />
      
      <GraphLegend>
        <LegendItem color="blue" label="Lessons" />
        <LegendItem color="green" label="Completed" />
        <LegendItem color="orange" label="Prerequisites" />
        <LegendItem color="gray" label="Locked" />
      </GraphLegend>
    </KnowledgeGraphContainer>
  </Collapsible>
  
  <CourseFooter />
</CourseDetailPage>

<LessonDetailPage>
  <LessonHeader />
  <LessonContent />
  
  <!-- Local Graph Toggle -->
  <GraphToggleButton 
    onClick={() => setLocalGraphVisible(!localGraphVisible)}
  >
    {localGraphVisible ? 'Hide Lesson Map' : 'Show Lesson Map'}
  </GraphToggleButton>
  
  <!-- Collapsible Local Graph -->
  <Collapsible open={localGraphVisible}>
    <LocalGraphContainer>
      <LocalKnowledgeGraph
        lessonId={lessonId}
        data={localGraphData}
        onNodeClick={handleSubLessonClick}
      />
    </LocalGraphContainer>
  </Collapsible>
  
  <SubLessonsSection />
  <LessonNavigation />
</LessonDetailPage>
```

### Interaction Patterns

#### Toggle Graph
```
[Show Knowledge Graph] ← Button (collapsed state)
         ↓ (click)
┌────────────────────────────────────────┐
│  [Hide Graph] [🔍+] [🔍-] [⟲] [⛶]    │
│                                        │
│     ┌─────────────────────────┐       │
│     │     Knowledge Graph     │       │
│     │         (SVG)           │       │
│     └─────────────────────────┘       │
│                                        │
│  Legend: ● Lessons ● Completed ...    │
└────────────────────────────────────────┘
```

#### Node Interactions
- **Hover**: Show tooltip with lesson title, duration, status
- **Click**: Navigate to lesson page (new tab with Cmd/Ctrl+Click)
- **Drag**: Move node (layout recalculates)
- **Double-click**: Focus on node (zoom to fit neighbors)

#### Graph Interactions
- **Scroll**: Zoom in/out
- **Click + Drag**: Pan view
- **Pinch (mobile)**: Zoom in/out
- **Double-tap (mobile)**: Reset view

### Visual Design

#### Node Styling
```css
/* Base node */
.graph-node {
  fill: var(--node-color);
  stroke: var(--node-border);
  stroke-width: 2px;
  cursor: pointer;
  transition: all 0.2s;
}

/* Node states */
.graph-node--completed {
  fill: #10b981; /* green */
  stroke: #059669;
}

.graph-node--current {
  fill: #3b82f6; /* blue */
  stroke: #2563eb;
  stroke-width: 4px;
}

.graph-node--locked {
  fill: #6b7280; /* gray */
  stroke: #4b5563;
  opacity: 0.6;
}

/* Node hover */
.graph-node:hover {
  stroke-width: 3px;
  filter: brightness(1.1);
}

/* Node types */
.graph-node--lesson { /* Circle */ }
.graph-node--module { /* Rounded rect */ }
.graph-node--sublesson { /* Small circle */ }
```

#### Edge Styling
```css
/* Base edge */
.graph-edge {
  stroke: #9ca3af; /* gray-400 */
  stroke-width: 1.5px;
  fill: none;
}

/* Edge types */
.graph-edge--prerequisite {
  stroke: #f59e0b; /* orange */
  stroke-dasharray: 5, 5;
  marker-end: url(#arrow);
}

.graph-edge--parent-child {
  stroke: #8b5cf6; /* purple */
  stroke-width: 2px;
}

.graph-edge--sibling {
  stroke: #d1d5db; /* gray-300 */
  stroke-width: 1px;
}

/* Highlight path */
.graph-edge--highlighted {
  stroke: #3b82f6; /* blue */
  stroke-width: 3px;
}
```

#### Responsive Design
```css
/* Desktop: Full width, 600px height */
@media (min-width: 1024px) {
  .knowledge-graph-container {
    height: 600px;
  }
}

/* Tablet: Full width, 400px height */
@media (min-width: 768px) and (max-width: 1023px) {
  .knowledge-graph-container {
    height: 400px;
  }
}

/* Mobile: Full width, 300px height, simplified layout */
@media (max-width: 767px) {
  .knowledge-graph-container {
    height: 300px;
  }
  
  /* Hide edge labels on mobile */
  .graph-edge-label {
    display: none;
  }
  
  /* Larger touch targets */
  .graph-node {
    r: 12; /* Increase radius */
  }
}
```

### Dark Mode Support
```css
/* Light mode */
.graph-container {
  background: #f9fafb;
}

.graph-node {
  stroke: #e5e7eb;
}

.graph-edge {
  stroke: #9ca3af;
}

/* Dark mode */
.dark .graph-container {
  background: #111827;
}

.dark .graph-node {
  stroke: #374151;
}

.dark .graph-edge {
  stroke: #4b5563;
}

.dark .graph-node-label {
  fill: #f3f4f6;
}
```

---

## Implementation Plan

### Phase 1: Foundation (Week 1)

**T001: Data Layer**
- [ ] Create `/api/courses/[slug]/graph/route.ts` endpoint
- [ ] Build graph generation logic from existing data
- [ ] Add caching layer (Redis/memory cache)
- [ ] Write unit tests for graph builder

**T002: Basic Graph Component**
- [ ] Create `KnowledgeGraph.tsx` component
- [ ] Implement D3 force simulation
- [ ] Render nodes and edges (SVG)
- [ ] Add basic zoom/pan controls

**T003: Integration**
- [ ] Add graph to course detail page
- [ ] Implement toggle button
- [ ] Wire up data fetching
- [ ] Add loading/error states

### Phase 2: Interactions (Week 2)

**T004: Node Interactions**
- [ ] Implement hover tooltips
- [ ] Add click navigation
- [ ] Support drag-to-reposition
- [ ] Highlight current/completed nodes

**T005: Graph Controls**
- [ ] Zoom in/out buttons
- [ ] Reset view button
- [ ] Layout toggle (force vs hierarchical)
- [ ] Fullscreen mode
- [ ] Minimap (optional)

**T006: Local Graph**
- [ ] Create `/api/courses/[slug]/lessons/[slug]/graph/route.ts`
- [ ] Build local graph generator
- [ ] Create `LocalKnowledgeGraph.tsx` component
- [ ] Add to lesson detail page

### Phase 3: Polish (Week 3)

**T007: Styling & UX**
- [ ] Refine node/edge styles
- [ ] Add animations (smooth transitions)
- [ ] Implement dark mode
- [ ] Make responsive (mobile-friendly)
- [ ] Add legend component

**T008: Performance**
- [ ] Optimize large graphs (100+ nodes)
- [ ] Implement virtual rendering (if needed)
- [ ] Add pagination/clustering
- [ ] Profile and optimize

**T009: Accessibility**
- [ ] Keyboard navigation (Tab, Arrow keys)
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators
- [ ] Alternative text navigation

### Phase 4: Advanced Features (Week 4)

**T010: User Preferences**
- [ ] Save graph layout positions (localStorage)
- [ ] Remember toggle state
- [ ] Customizable colors/sizes
- [ ] Export graph as image (SVG/PNG)

**T011: Admin Tools**
- [ ] Graph preview in admin panel
- [ ] Identify orphaned lessons
- [ ] Validate prerequisite chains
- [ ] Suggest connections

**T012: Documentation**
- [ ] User guide (how to use graph)
- [ ] Developer docs (API, components)
- [ ] Accessibility guide
- [ ] Performance tips

---

## Database Changes

### No Schema Changes Required ✅

**Rationale**: All necessary data already exists in current models:
- `CourseLesson.parentLessonId` → parent-child edges
- `CourseLesson.prerequisiteLessonIds` → prerequisite edges
- `CourseModule.lessonIds` → module-lesson relationships
- `CourseLesson.order` → sibling ordering

### Optional: Add Graph Cache Table

If performance becomes an issue:

```typescript
interface GraphCache {
  _id: ObjectId;
  entityType: 'course' | 'lesson';
  entityId: ObjectId;
  graphData: KnowledgeGraph;
  generatedAt: Date;
  expiresAt: Date;
}
```

**Invalidation**: Clear cache when:
- Lessons added/removed
- Prerequisites changed
- Lesson order updated
- Parent-child relationships modified

---

## Security & Performance

### Security Considerations

1. **Access Control**:
   - Graph respects lesson visibility (public/enrolled)
   - Locked lessons shown as locked in graph
   - Prerequisites visible even if locked (for context)

2. **Rate Limiting**:
   - Cache graph responses (5 minutes)
   - Throttle graph generation (max 10/min per user)

3. **Data Sanitization**:
   - No sensitive data in graph (only titles, IDs, public metadata)
   - User progress only shown to authenticated users

### Performance Optimizations

1. **Server-Side**:
   - Generate graphs at build time for public courses
   - Cache in Redis with course version key
   - Use MongoDB aggregation pipelines

2. **Client-Side**:
   - Lazy load graph (only when toggled)
   - Debounce zoom/pan events
   - Use requestAnimationFrame for animations
   - Virtual rendering for 200+ nodes

3. **Network**:
   - Compress graph JSON (gzip)
   - Use HTTP/2 multiplexing
   - Prefetch graph data (if user lingers on course page)

### Performance Budgets

| Metric | Target | Max |
|--------|--------|-----|
| Graph API response | < 300ms | 500ms |
| Initial render | < 200ms | 400ms |
| Zoom/pan (60fps) | 16ms/frame | 33ms |
| Bundle size | + 50KB | + 100KB |
| Node count (no lag) | 200 | 500 |

---

## Edge Cases & Error Handling

### Edge Cases

1. **Orphaned Lessons**: No prerequisites, not a sub-lesson
   - **Solution**: Create module-level connections
   
2. **Circular Prerequisites**: A → B → C → A
   - **Solution**: Detect cycles, break weakest link
   
3. **Deeply Nested Sub-Lessons**: > 2 levels
   - **Solution**: Flatten to 2 levels in graph
   
4. **Very Large Courses**: > 500 lessons
   - **Solution**: Implement clustering by module
   
5. **No Relationships**: Course with no prerequisites/sub-lessons
   - **Solution**: Show linear progression (sequential edges)

### Error Handling

```typescript
// API error response
{
  "error": "Failed to generate graph",
  "code": "GRAPH_GENERATION_ERROR",
  "details": "Circular dependency detected in prerequisites",
  "fallback": {
    "nodes": [...], // Simple linear graph
    "edges": [...]
  }
}

// Component error boundary
<ErrorBoundary fallback={<GraphErrorState />}>
  <KnowledgeGraph data={graphData} />
</ErrorBoundary>

// Graceful degradation
if (graphGenerationFails) {
  return <SimpleListView lessons={lessons} />;
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// Graph generator
describe('buildCourseGraph', () => {
  it('creates nodes for all lessons', () => {
    const graph = buildCourseGraph(mockCourse);
    expect(graph.nodes).toHaveLength(mockCourse.lessons.length);
  });
  
  it('creates prerequisite edges', () => {
    const graph = buildCourseGraph(mockCourse);
    const prereqEdges = graph.edges.filter(e => e.type === 'prerequisite');
    expect(prereqEdges).toHaveLength(expectedCount);
  });
  
  it('handles circular dependencies', () => {
    const graph = buildCourseGraph(mockCourseWithCycle);
    expect(hasCycle(graph)).toBe(false);
  });
});

// Graph component
describe('KnowledgeGraph', () => {
  it('renders nodes and edges', () => {
    render(<KnowledgeGraph data={mockGraph} />);
    expect(screen.getAllByRole('button')).toHaveLength(mockGraph.nodes.length);
  });
  
  it('calls onNodeClick when node is clicked', () => {
    const handleClick = vi.fn();
    render(<KnowledgeGraph data={mockGraph} onNodeClick={handleClick} />);
    fireEvent.click(screen.getByText('Lesson 1'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Integration Tests

```typescript
describe('Course Graph API', () => {
  it('returns valid graph structure', async () => {
    const res = await GET('/api/courses/typescript/graph');
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({
      nodes: expect.any(Array),
      edges: expect.any(Array),
      metadata: expect.any(Object),
    });
  });
  
  it('caches graph responses', async () => {
    await GET('/api/courses/typescript/graph');
    const start = Date.now();
    await GET('/api/courses/typescript/graph');
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50); // Should be cached
  });
});
```

### Visual Regression Tests

```typescript
// Using Playwright or similar
describe('Graph Visual Tests', () => {
  it('renders graph correctly on desktop', async () => {
    await page.goto('/courses/typescript');
    await page.click('[data-testid="toggle-graph"]');
    await page.waitForSelector('svg.knowledge-graph');
    await expect(page).toHaveScreenshot('course-graph-desktop.png');
  });
  
  it('renders graph correctly on mobile', async () => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/courses/typescript');
    await page.click('[data-testid="toggle-graph"]');
    await expect(page).toHaveScreenshot('course-graph-mobile.png');
  });
});
```

### Performance Tests

```typescript
describe('Graph Performance', () => {
  it('renders 100 nodes in < 400ms', async () => {
    const start = performance.now();
    render(<KnowledgeGraph data={largeGraph} />);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(400);
  });
  
  it('handles 50 zoom operations smoothly', async () => {
    const { container } = render(<KnowledgeGraph data={mockGraph} />);
    const svg = container.querySelector('svg');
    
    const start = performance.now();
    for (let i = 0; i < 50; i++) {
      fireEvent.wheel(svg, { deltaY: -100 });
    }
    const duration = performance.now() - start;
    const avgFrameTime = duration / 50;
    expect(avgFrameTime).toBeLessThan(16); // 60fps
  });
});
```

---

## Rollout Plan

### Phase 1: Alpha (Week 1-2)
- Deploy to staging environment
- Test with internal team
- Gather initial feedback
- Fix critical bugs

### Phase 2: Beta (Week 3)
- Enable for selected courses (feature flag)
- Monitor performance metrics
- Collect user feedback (in-app survey)
- Iterate on UX issues

### Phase 3: Production (Week 4)
- Enable for all courses
- Document feature in help center
- Announce in changelog
- Monitor analytics

### Feature Flag Strategy

```typescript
// Feature flag
const ENABLE_KNOWLEDGE_GRAPH = process.env.FEATURE_KNOWLEDGE_GRAPH === 'true';

// Per-course override
const courseConfig = {
  knowledgeGraph: {
    enabled: true,
    layout: 'force', // or 'hierarchical'
    showModuleNodes: true,
  }
};

// User preference
const userSettings = {
  graphDefaultVisible: false, // Hidden by default
  graphLayout: 'force',
  graphTheme: 'auto', // light | dark | auto
};
```

### Rollback Plan

If critical issues arise:
1. Disable feature flag globally
2. Serve cached static graphs (read-only)
3. Fall back to list view
4. Investigate and fix issues
5. Re-enable gradually

---

## Documentation Requirements

### User Documentation

1. **Help Article**: "Understanding the Knowledge Graph"
   - What is the knowledge graph?
   - How to use it for navigation
   - Interpreting node colors and edges
   - Tips for exploring large courses

2. **Video Tutorial**: "Navigating Courses with the Knowledge Graph"
   - 2-minute screencast
   - Show toggle, zoom, click interactions
   - Demonstrate prerequisite visualization

### Developer Documentation

1. **API Reference**: `/docs/api/knowledge-graph`
   - Endpoint specifications
   - Request/response schemas
   - Error codes
   - Rate limits

2. **Component Docs**: `/docs/components/knowledge-graph`
   - Props interface
   - Usage examples
   - Customization options
   - Performance tips

3. **Architecture Guide**: `/docs/architecture/knowledge-graph`
   - System design
   - Data flow
   - Caching strategy
   - Scaling considerations

---

## Success Metrics & KPIs

### Usage Metrics
- **Graph toggle rate**: % of course page views that toggle graph
- **Average interaction time**: How long users interact with graph
- **Click-through rate**: % of graph node clicks that lead to navigation
- **Return rate**: Users who return to graph multiple times

### Performance Metrics
- **API response time**: P50, P95, P99
- **Client render time**: Time to first paint
- **Frame rate**: During zoom/pan operations
- **Error rate**: Graph generation/rendering failures

### User Satisfaction
- **Survey feedback**: "How useful is the knowledge graph?" (1-5 scale)
- **Feature requests**: Related enhancement requests
- **Support tickets**: Number of graph-related issues

### Business Impact
- **Course completion rate**: Does graph improve completion?
- **Lesson navigation**: Do users explore more lessons?
- **Time to completion**: Faster learning paths?
- **User retention**: Better engagement?

---

## Future Enhancements

### Phase 5: Advanced Features (Future)

1. **Learning Paths**: Highlight recommended sequences
2. **Progress Visualization**: Show completion percentage in graph
3. **Social Graphs**: See what peers are studying
4. **Smart Suggestions**: AI-powered next lesson recommendations
5. **3D Graph**: Optional 3D visualization for complex courses
6. **Collaborative Editing**: Instructors can edit graph visually
7. **Export Options**: PDF, PNG, SVG downloads
8. **Embeddable Graphs**: Share graph via iframe/widget
9. **Custom Layouts**: Tree, circular, hierarchical options
10. **Graph Analytics**: Track which paths users follow

### Integration Opportunities

1. **Flashcard Decks**: Show connected flashcard decks in graph
2. **Blog Posts**: Link lessons to related blog posts
3. **Projects**: Show project nodes connected to lessons
4. **Quizzes**: Visualize quiz dependencies
5. **Certificates**: Show certification paths in graph

---

## Conclusion

This specification outlines a comprehensive plan for integrating an **Obsidian-like knowledge graph** into the course system. The graph will:

✅ Provide visual course structure understanding  
✅ Support both global (course) and local (lesson) views  
✅ Remain secondary to content (toggleable, non-intrusive)  
✅ Leverage existing data (no schema changes)  
✅ Use D3.js for lightweight, performant rendering  
✅ Be fully responsive and accessible  
✅ Support keyboard and screen reader navigation  

The implementation follows a phased approach with clear milestones, testing strategies, and rollout plans. The feature is designed to enhance the learning experience without overwhelming users, maintaining the principle that **content comes first**.

---

**Next Steps**:
1. Review and approve specification
2. Create tasks.md with detailed task breakdown
3. Begin Phase 1 implementation
4. Set up feature flag infrastructure
5. Create mockups for final UX review

**Estimated Timeline**: 4 weeks (MVP)  
**Dependencies**: None (uses existing data)  
**Risk Level**: Low (feature flag controlled)  
**Priority**: Medium (enhancement, not critical path)
