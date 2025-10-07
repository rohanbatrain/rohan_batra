# Implementation Plan: Course Knowledge Graph

**Branch**: `014-course-knowledge-graph` | **Date**: October 7, 2025 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/014-course-knowledge-graph/spec.md`

## Execution Flow (/plan command scope)
```
1. ✅ Load feature spec from Input path
2. ✅ Fill Technical Context
3. ✅ Fill Constitution Check section
4. ✅ Evaluate Constitution Check section
   → Update Progress Tracking: Initial Constitution Check
5. 🔄 Execute Phase 0 → research.md
6. 🔄 Execute Phase 1 → contracts, data-model.md, quickstart.md, .github/copilot-instructions.md
7. ⏳ Re-evaluate Constitution Check section
8. ⏳ Plan Phase 2 → Describe task generation approach
9. ⏳ STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 9. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary

**Primary Requirement**: Integrate an Obsidian-like interactive knowledge graph visualization into the course system to show relationships between lessons, sub-lessons, and prerequisites.

**Technical Approach** (production-ready, analyzed from codebase):
- **Visualization**: D3.js force-directed layout (d3-force + d3-zoom + d3-drag + d3-selection)
- **Data Source**: Derive graph from existing `CourseLesson`, `CourseModule`, `CourseProgress` models (no schema changes)
- **Architecture**: REST API endpoints + React components with SVG rendering + `/lib/graph/` domain logic
- **UI/UX**: Toggleable secondary navigation aid (content-first approach)
- **Views**: Global course graph + Local lesson graph
- **Performance**: Redis caching (5-min TTL), hierarchical keys, cache invalidation hooks
- **Patterns**: Follow established patterns in `/src/lib/courses/`, API routes, SWR components

## Technical Context

**Language/Version**: TypeScript 5.9.2, ES2017  
**Primary Dependencies**: 
- Next.js 15.5.3 (App Router)
- React 19.1.0
- recharts 3.2.1 (includes d3-* sub-packages: d3-array, d3-scale, d3-shape, d3-interpolate, d3-color, d3-path, d3-ease, d3-time)
- **NEW**: d3-force 3.0.0 (force-directed layout)
- **NEW**: d3-zoom 3.0.0 (native zoom/pan behavior)
- **NEW**: d3-drag 3.0.0 (node dragging)
- **NEW**: d3-selection 3.0.0 (DOM selection helpers)
- Mongoose 8.18.1 (MongoDB ODM)
- Clerk auth
- Radix UI (shadcn/ui components)
- Tailwind CSS 4.1.13

**Storage**: MongoDB (existing Course, CourseLesson, CourseModule, CourseProgress models)  
**Caching**: ioredis 5.7.0 (optional Redis caching for graph data)  
**Testing**: Vitest 3.2.4, @testing-library/react 16.3.0, jsdom 27.0.0  
**Target Platform**: Web (desktop + mobile responsive), SSR with Next.js App Router  
**Project Type**: web (frontend + backend integrated in Next.js)

**Performance Goals**: 
- Graph API response < 500ms (p95)
- Initial graph render < 400ms
- 60fps during zoom/pan (16ms/frame)
- Support 200+ nodes without lag

**Constraints**: 
- ✅ No database schema changes (use existing models)
- ✅ New packages allowed: d3-force, d3-zoom, d3-drag, d3-selection (~40KB total)
- ✅ Lightweight bundle impact (< 100KB added total)
- ✅ Maintain content-first UX (graph is secondary, toggleable)
- ✅ Accessibility required (ARIA, keyboard nav)
- ✅ Follow production patterns from codebase (analyzed in PRODUCTION_ARCHITECTURE.md)

**Scale/Scope**: 
- Target: 100+ lesson courses
- Edge cases: up to 500 lessons
- 2 graph types: Global (course-level) + Local (lesson-level)
- 6 node types: course, module, lesson, sublesson, topic (future)
- 5 edge types: prerequisite, parent-child, sibling, module-lesson, sequential

**User Requirements** (from context):
- "best in ui ux" - Focus on smooth interactions, elegant design, intuitive controls
- "try not to reengineer stuff" - Reuse existing components (existing data model docs, API patterns, UI components from shadcn/ui)
- "you are allow to add new npm packages" - Can add d3 packages for optimal UX (d3-force, d3-zoom, d3-drag)
- "make it best so plan out with production ready modules" - Analyzed codebase patterns and created PRODUCTION_ARCHITECTURE.md with seamless integration approach

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Note**: Constitution file is template-based and not yet filled. Proceeding with standard best practices.

### Standard Best Practices Check

✅ **Library-First**: Graph logic isolated in `/lib/graph/` directory  
✅ **Type Safety**: Full TypeScript interfaces for GraphNode, GraphEdge, KnowledgeGraph  
✅ **Test-First**: Will create contract tests before implementation  
✅ **Integration Testing**: API endpoints + D3 simulation + React component integration  
✅ **Observability**: API error handling, client error boundaries, performance logging  
✅ **Simplicity**: No new dependencies, reuse existing D3 via recharts  
✅ **Existing Patterns**: Follow established API route patterns, component structure  

**No Constitution Violations Detected**

## Project Structure

### Documentation (this feature)
```
specs/014-course-knowledge-graph/
├── plan.md                         # This file (/plan command output)
├── spec.md                         # ✅ Complete (600+ lines)
├── data-model.md                   # ✅ Complete (500+ lines) - REUSE existing
├── api-reference.md                # ✅ Complete (700+ lines) - REUSE existing
├── implementation-guide.md         # ✅ Partial (Phase 1 complete) - REUSE existing
├── research.md                     # ✅ Phase 0 output - COMPLETE (R001-R005)
├── PLANNING_SUMMARY.md             # ✅ Executive summary - COMPLETE
├── PRODUCTION_ARCHITECTURE.md      # ✅ NEW - Codebase analysis + production patterns
├── quickstart.md                   # Phase 1 output (/plan command) - TO CREATE
├── contracts/                      # Phase 1 output (/plan command) - TO CREATE
│   ├── course-graph.openapi.yaml
│   └── lesson-graph.openapi.yaml
└── tasks.md                        # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root) - Production-Ready Structure
```
# Web application structure (Next.js App Router)
# Pattern: Mirrors existing /lib/courses/, /app/api/courses/, /components/courses/
src/
├── lib/
│   └── graph/                      # ⏳ Domain logic (Phase 3)
│       ├── types.ts                # GraphNode, GraphEdge, KnowledgeGraph interfaces
│       ├── generator.ts            # buildCourseGraph(), buildLessonGraph() - PATTERN: /lib/courses/progress.ts
│       ├── cache.ts                # Redis caching utilities - PATTERN: /lib/redis.ts, /lib/cache-service.ts
│       ├── simulator.ts            # D3 force simulation wrapper
│       ├── query.ts                # Database queries - PATTERN: /lib/courses/query.ts
│       └── utils.ts                # Helper functions - PATTERN: /lib/courses/format.ts
├── components/courses/             # ⏳ React components (Phase 3)
│   ├── KnowledgeGraph.tsx          # Main container with SWR - PATTERN: QuizTaker.tsx
│   ├── GraphCanvas.tsx             # D3 + SVG rendering
│   ├── GraphControls.tsx           # Zoom/pan/filter UI - PATTERN: shadcn/ui components
│   └── GraphNodeTooltip.tsx        # Node hover details - PATTERN: Radix UI Tooltip
├── app/api/courses/                # ⏳ API routes (Phase 3)
│   ├── [courseId]/
│   │   └── graph/
│   │       └── route.ts            # GET /api/courses/:courseId/graph
│   │                               # PATTERN: /app/api/courses/[courseId]/progress/route.ts
│   │                               # - Zod validation (QuerySchema.safeParse)
│   │                               # - auth() from @clerk/nextjs/server
│   │                               # - Types.ObjectId.isValid(courseId)
│   │                               # - Redis cache check (getCachedGraph)
│   │                               # - Error handling (NextResponse.json)
│   │                               # - dynamic = 'force-dynamic'
│   └── [courseId]/lessons/[lessonSlug]/graph/
│       └── route.ts                # GET /api/courses/:courseId/lessons/:lessonSlug/graph
└── __tests__/                      # ⏳ Tests (Phase 3)
    ├── api/
    │   ├── course-graph.contract.test.ts   # PATTERN: /src/test/contract/courses.detail.contract.test.ts
    │   └── lesson-graph.contract.test.ts
    └── lib/graph/
        ├── generator.test.ts       # Unit tests - PATTERN: vitest + mongoose mocks
        ├── cache.test.ts
        └── simulator.test.ts
```

### Existing Models (NO CHANGES)
```
src/models/
├── Course.ts                       # ✅ Existing - use as-is
├── CourseLesson.ts                 # ✅ Existing - use prerequisiteLessonIds, parentLessonId
├── CourseModule.ts                 # ✅ Existing - use lessonIds
└── CourseProgress.ts               # ✅ Existing - use completedLessonIds
```
```
specs/014-course-knowledge-graph/
├── plan.md                   # This file (/plan command output)
├── spec.md                   # ✅ Complete (600+ lines)
├── data-model.md             # ✅ Complete (500+ lines) - REUSE existing
├── api-reference.md          # ✅ Complete (700+ lines) - REUSE existing
├── implementation-guide.md   # ✅ Partial (Phase 1 complete) - REUSE existing
├── research.md               # Phase 0 output (/plan command) - TO CREATE
├── quickstart.md             # Phase 1 output (/plan command) - TO CREATE
├── contracts/                # Phase 1 output (/plan command) - TO CREATE
│   ├── course-graph.openapi.yaml
│   └── lesson-graph.openapi.yaml
└── tasks.md                  # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Web application structure (Next.js App Router)
src/
├── lib/
│   └── graph/
│       ├── types.ts              # GraphNode, GraphEdge, KnowledgeGraph interfaces
│       ├── generator.ts          # buildCourseGraph(), buildLessonGraph()
│       ├── layout.ts             # D3 force simulation wrapper
│       └── colors.ts             # Node/edge color utilities
├── components/
│   └── graph/
│       ├── ForceGraph.tsx        # Main force-directed graph component
│       ├── RadialGraph.tsx       # Lesson-centric radial layout
│       ├── GraphNode.tsx         # Individual node renderer
│       ├── GraphEdge.tsx         # Edge/link renderer
│       ├── GraphControls.tsx     # Zoom/pan/reset controls
│       ├── GraphLegend.tsx       # Node type legend
│       └── GraphToggle.tsx       # Collapsible container + toggle button
├── app/
│   └── api/
│       └── courses/
│           └── [slug]/
│               ├── graph/
│               │   └── route.ts  # GET /api/courses/[slug]/graph
│               └── lessons/
│                   └── [lessonSlug]/
│                       └── graph/
│                           └── route.ts  # GET /api/courses/.../lessons/.../graph
└── models/                       # Existing models (no changes needed)
    ├── Course.ts
    ├── CourseLesson.ts
    ├── CourseModule.ts
    └── CourseProgress.ts

__tests__/
├── lib/
│   └── graph/
│       ├── generator.test.ts     # Unit tests for graph generation
│       ├── layout.test.ts        # D3 simulation tests
│       └── colors.test.ts        # Color utility tests
├── api/
│   └── graph.test.ts             # API endpoint tests
└── components/
    └── graph/
        ├── ForceGraph.test.tsx   # Component tests
        └── GraphControls.test.tsx
```

**Structure Decision**: Web application (Option 2) - frontend + backend integrated in Next.js App Router

## Phase 0: Outline & Research

**Objective**: Resolve technical unknowns, validate existing work, establish implementation patterns

### Research Tasks

#### R001: D3.js Integration via Recharts
**Question**: How to import and use D3 modules from recharts dependency?

**Research Approach**:
```typescript
// Investigate import paths
import * as d3 from 'd3';           // Won't work (d3 not direct dependency)
import { scaleLinear } from 'd3-scale';  // ✅ Works (via recharts → victory-vendor → d3-*)

// Check available d3 modules via recharts
// pnpm-lock.yaml shows: d3-array, d3-color, d3-ease, d3-interpolate, d3-scale, d3-shape, d3-path, d3-time
```

**Expected Finding**: Import specific d3-* packages directly, not the monolithic 'd3' package

**Rationale**: Avoid adding new dependencies, use existing d3 modules from recharts

---

#### R002: D3 Force Simulation in React Pattern
**Question**: Best practice for integrating D3 force simulation with React?

**Research Approach**:
- Review D3 + React patterns (useEffect + useRef)
- Investigate data binding: D3 owns the DOM vs React renders
- Check existing recharts implementation patterns

**Expected Finding**: 
1. Use `useEffect` to initialize simulation
2. Use `useRef` for SVG element
3. Let D3 mutate node positions (x, y)
4. React re-renders when data changes, not during animation
5. Use `requestAnimationFrame` for smooth updates

**Alternatives Considered**:
- React-Spring: Overkill, adds dependency
- Framer Motion: Good for UI animations, not physics simulations
- Pure Canvas: Less accessible than SVG

---

#### R003: Graph API Caching Strategy
**Question**: How to efficiently cache graph data with course updates?

**Research Approach**:
- Review existing Redis usage in codebase (ioredis 5.7.0 available)
- Check course update patterns (when do lessons change?)
- Investigate cache invalidation strategies

**Expected Finding**:
```typescript
// Cache key pattern
const cacheKey = userId 
  ? `graph:course:${courseId}:user:${userId}`
  : `graph:course:${courseId}:public`;

// TTL: 5 minutes (balance between freshness and performance)
// Invalidate on: lesson CRUD, prerequisite changes, module reordering
```

**Alternatives Considered**:
- Build-time generation: Static, but stale for dynamic courses
- No caching: Simple, but slow for large courses
- In-memory cache: Fast, but not shared across instances

---

#### R004: Performance Optimization for Large Graphs (200+ nodes)
**Question**: How to maintain 60fps with many nodes?

**Research Approach**:
- Review D3 force simulation performance characteristics
- Investigate clustering/pagination strategies
- Check Web Workers for background simulation

**Expected Finding**:
1. **Reduce simulation iterations**: Stop simulation after convergence (~300 ticks)
2. **Optimize rendering**: Only render visible nodes (viewport culling)
3. **Debounce interactions**: Throttle zoom/pan events to 16ms
4. **Simplify edges**: Use straight lines instead of curves for > 100 edges
5. **Clustering**: Group nodes by module for courses > 300 lessons

**Alternatives Considered**:
- WebGL rendering (three.js): Overkill, accessibility issues
- Virtual scrolling: Doesn't work well with force layouts
- Static images: Not interactive

---

#### R005: Accessibility for Graph Visualizations
**Question**: How to make SVG graphs accessible to screen readers and keyboard users?

**Research Approach**:
- Review WCAG 2.1 guidelines for complex visualizations
- Investigate ARIA patterns for interactive graphics
- Check existing Next.js accessibility patterns

**Expected Finding**:
```tsx
// ARIA structure
<svg role="img" aria-label="Course knowledge graph">
  <title>Knowledge Graph for {courseName}</title>
  <desc>Interactive visualization showing {nodeCount} lessons and their relationships</desc>
  
  <g role="list" aria-label="Lessons">
    <circle role="listitem" aria-label="Lesson: {title}" tabIndex={0} />
  </g>
  
  <g aria-label="Relationships">
    <line aria-label="{source} prerequisite for {target}" />
  </g>
</svg>

// Keyboard navigation
- Tab: Focus next node
- Enter/Space: Navigate to lesson
- Arrow keys: Pan graph
- +/-: Zoom in/out
- R: Reset view
- Escape: Close graph
```

**Alternatives Considered**:
- Skip graph for screen readers: Defeats purpose
- Text-only fallback: Good supplement, but graph adds value
- Alternative table view: Complementary, not replacement

---

### Research Consolidation

**Output**: `research.md` with sections:
1. **D3 Integration Decision**: Install d3-force, d3-zoom, d3-drag, d3-selection for optimal UX (~40KB total)
2. **React Pattern**: useEffect + useRef + D3 simulation, React controls state
3. **Caching Strategy**: Redis with 5-minute TTL, invalidate on course changes
4. **Performance Plan**: Simulation optimization + viewport culling + debouncing
5. **Accessibility Approach**: ARIA structure + keyboard nav + screen reader descriptions
6. **Zoom & Drag**: Native D3 behaviors for professional feel (better than custom React implementation)

---

## Phase 1: Design & Contracts

*Prerequisites: research.md complete*

### Step 1: Reuse Existing Data Model

**Action**: Copy `data-model.md` to contracts as reference

**Existing Work** (✅ COMPLETE):
- `/specs/014-course-knowledge-graph/data-model.md` (500+ lines)
- Entities: GraphNode, GraphEdge, KnowledgeGraph, GraphMetadata
- Algorithms: buildCourseGraph(), buildLessonGraph()
- Helper functions: Color utilities, access control, metrics

**Validation**: All entities extracted from feature spec, no new models needed

---

### Step 2: Generate API Contracts

**Action**: Create OpenAPI specs for graph endpoints

**File**: `contracts/course-graph.openapi.yaml`
```yaml
openapi: 3.1.0
info:
  title: Course Knowledge Graph API
  version: 1.0.0

paths:
  /api/courses/{slug}/graph:
    get:
      summary: Get global course graph
      parameters:
        - name: slug
          in: path
          required: true
          schema:
            type: string
        - name: includeModules
          in: query
          schema:
            type: boolean
            default: true
        - name: includeSiblings
          in: query
          schema:
            type: boolean
            default: false
        - name: layout
          in: query
          schema:
            type: string
            enum: [force, hierarchical, radial]
            default: force
      responses:
        200:
          description: Graph data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/KnowledgeGraph'
        404:
          description: Course not found
        500:
          description: Server error

components:
  schemas:
    KnowledgeGraph:
      type: object
      required: [nodes, edges, metadata]
      properties:
        nodes:
          type: array
          items:
            $ref: '#/components/schemas/GraphNode'
        edges:
          type: array
          items:
            $ref: '#/components/schemas/GraphEdge'
        metadata:
          $ref: '#/components/schemas/GraphMetadata'
    
    GraphNode:
      type: object
      required: [id, type, label]
      properties:
        id:
          type: string
        type:
          type: string
          enum: [course, module, lesson, sublesson, topic]
        label:
          type: string
        size:
          type: number
        color:
          type: string
        # ... (full schema in contracts/)
```

**File**: `contracts/lesson-graph.openapi.yaml`
```yaml
# Similar structure for /api/courses/{slug}/lessons/{lessonSlug}/graph
```

---

### Step 3: Generate Contract Tests

**File**: `__tests__/api/course-graph.contract.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/courses/[slug]/graph/route';

describe('[CONTRACT] GET /api/courses/[slug]/graph', () => {
  it('returns valid KnowledgeGraph schema', async () => {
    const request = new Request('http://localhost/api/courses/test-course/graph');
    const response = await GET(request, { params: { slug: 'test-course' } });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // Schema validation
    expect(data).toHaveProperty('nodes');
    expect(data).toHaveProperty('edges');
    expect(data).toHaveProperty('metadata');
    
    expect(Array.isArray(data.nodes)).toBe(true);
    expect(Array.isArray(data.edges)).toBe(true);
    
    // Node schema
    if (data.nodes.length > 0) {
      const node = data.nodes[0];
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('type');
      expect(node).toHaveProperty('label');
      expect(['course', 'module', 'lesson', 'sublesson', 'topic'])
        .toContain(node.type);
    }
    
    // Edge schema
    if (data.edges.length > 0) {
      const edge = data.edges[0];
      expect(edge).toHaveProperty('id');
      expect(edge).toHaveProperty('source');
      expect(edge).toHaveProperty('target');
      expect(edge).toHaveProperty('type');
    }
    
    // Metadata schema
    expect(data.metadata).toHaveProperty('scope');
    expect(data.metadata.scope).toBe('global');
    expect(data.metadata).toHaveProperty('nodeCount');
    expect(data.metadata).toHaveProperty('edgeCount');
  });
  
  it('returns 404 for nonexistent course', async () => {
    const request = new Request('http://localhost/api/courses/nonexistent/graph');
    const response = await GET(request, { params: { slug: 'nonexistent' } });
    
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
  
  it('validates query parameters', async () => {
    const request = new Request('http://localhost/api/courses/test/graph?layout=invalid');
    const response = await GET(request, { params: { slug: 'test' } });
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Invalid query parameters');
  });
});
```

**File**: `__tests__/api/lesson-graph.contract.test.ts`
```typescript
// Similar contract tests for lesson graph endpoint
```

**Expected Result**: ❌ Tests fail (no implementation yet) - TDD principle

---

### Step 4: Create Quickstart Guide

**File**: `quickstart.md`
```markdown
# Quick Start: Knowledge Graph Feature

**Goal**: Get the knowledge graph running locally in 15 minutes

## Prerequisites

- ✅ MongoDB running (existing courses seeded)
- ✅ Redis running (optional, for caching)
- ✅ Node.js 20+ with pnpm

## Step 1: Verify Dependencies

```bash
# Check recharts includes d3 modules
grep -A 5 "recharts" pnpm-lock.yaml | grep "d3-"
# Should show: d3-array, d3-scale, d3-shape, etc.
```

## Step 2: Run Contract Tests

```bash
pnpm test __tests__/api/course-graph.contract.test.ts
# Expected: FAIL (no implementation yet)
```

## Step 3: Create Type Definitions

```bash
# Create lib/graph directory
mkdir -p src/lib/graph

# Copy types from data-model.md
# (Already documented in data-model.md - Phase 1.1 of implementation-guide.md)
```

## Step 4: Implement Graph Generator

```bash
# Follow implementation-guide.md Phase 1.3
# Create src/lib/graph/generator.ts
```

## Step 5: Create API Routes

```bash
# Create route handlers
mkdir -p src/app/api/courses/[slug]/graph
touch src/app/api/courses/[slug]/graph/route.ts

mkdir -p src/app/api/courses/[slug]/lessons/[lessonSlug]/graph
touch src/app/api/courses/[slug]/lessons/[lessonSlug]/graph/route.ts
```

## Step 6: Test API Endpoints

```bash
# Start dev server
pnpm dev

# Test course graph
curl http://localhost:3000/api/courses/YOUR_COURSE_SLUG/graph | jq

# Test lesson graph
curl http://localhost:3000/api/courses/YOUR_COURSE_SLUG/lessons/YOUR_LESSON_SLUG/graph | jq
```

## Step 7: Run Contract Tests Again

```bash
pnpm test __tests__/api/course-graph.contract.test.ts
# Expected: PASS ✅
```

## Step 8: Create Basic Graph Component

```bash
# Create components directory
mkdir -p src/components/graph

# Create ForceGraph component (Phase 2.2 of implementation-guide.md)
touch src/components/graph/ForceGraph.tsx
```

## Step 9: Integrate into Course Page

```tsx
// src/app/courses/[slug]/page.tsx
import { KnowledgeGraphToggle } from '@/components/graph/GraphToggle';

export default function CoursePage({ params }: { params: { slug: string } }) {
  return (
    <>
      {/* Existing course content */}
      <CourseModules courseSlug={params.slug} />
      
      {/* NEW: Knowledge graph */}
      <KnowledgeGraphToggle courseSlug={params.slug} />
    </>
  );
}
```

## Step 10: Verify Graph Renders

```bash
# Visit course page
open http://localhost:3000/courses/YOUR_COURSE_SLUG

# Click "Show Knowledge Graph" button
# Should see: Force-directed graph with nodes and edges
```

## Success Criteria

✅ API returns valid graph JSON  
✅ Contract tests pass  
✅ Graph renders in browser  
✅ Nodes are clickable  
✅ Zoom/pan works  
✅ Toggle button shows/hides graph  

## Troubleshooting

**Issue**: D3 import errors  
**Solution**: Import specific packages: `import { forceSimulation } from 'd3-force'`

**Issue**: Graph not rendering  
**Solution**: Check browser console, verify SVG has width/height > 0

**Issue**: API returns 404  
**Solution**: Verify course slug matches database, check MongoDB connection

## Next Steps

- Add styling (Tailwind classes)
- Implement zoom controls
- Add dark mode support
- Optimize for large graphs

---

**Estimated Time**: 15-30 minutes  
**Difficulty**: Intermediate  
**Blockers**: None (all dependencies exist)
```

---

### Step 5: Update GitHub Copilot Instructions

**File**: `.github/copilot-instructions.md`

**Action**: Run update script with incremental changes
```bash
.specify/scripts/bash/update-agent-context.sh copilot
```

**Expected Output**: Updates `.github/copilot-instructions.md` with:

```markdown
<!-- AUTO-GENERATED SECTION: START -->
## Recent Changes (Last 3 Features)

### 014: Course Knowledge Graph (Oct 7, 2025)
- **Tech**: D3.js (via recharts), React 19, Next.js 15 App Router
- **Patterns**: 
  - Force-directed graph with D3 simulation
  - REST API: GET /api/courses/[slug]/graph
  - React hooks: useCourseGraph, useLessonGraph
  - SVG rendering with ARIA accessibility
- **Components**: ForceGraph, RadialGraph, GraphToggle, GraphControls
- **Models**: GraphNode, GraphEdge, KnowledgeGraph (no DB changes)
- **Testing**: Vitest + @testing-library/react, contract tests

### 013: Nested Flashcard Decks (Prior)
- Parent deck selection UI
- Sentinel value pattern ('__none__' → null)
- Tree-based dropdowns with visual hierarchy

### 012: LinkedIn-style Brands (Prior)
- Social media integration
- Brand profiles with markdown support

<!-- AUTO-GENERATED SECTION: END -->

<!-- MANUAL ADDITIONS: START -->
[Preserved manual additions here]
<!-- MANUAL ADDITIONS: END -->

## Technology Stack

### Core
- TypeScript 5.9.2, ES2017 target
- Next.js 15.5.3 (App Router, SSR)
- React 19.1.0
- MongoDB + Mongoose 8.18.1
- Clerk authentication

### UI/UX
- Tailwind CSS 4.1.13
- Radix UI (shadcn/ui components)
- Lucide icons
- Framer Motion (animations)
- **NEW: D3.js (via recharts 3.2.1)** - Force-directed graphs

### Development
- Vitest 3.2.4 + jsdom 27.0.0
- ESLint 9 + Prettier
- pnpm package manager

## Current Feature: Knowledge Graph (014)

### Key Files
- `/lib/graph/generator.ts` - Graph generation logic
- `/components/graph/ForceGraph.tsx` - D3 + React integration
- `/app/api/courses/[slug]/graph/route.ts` - Graph API endpoint

### Patterns to Follow
```typescript
// 1. D3 + React hook pattern
useEffect(() => {
  const simulation = forceSimulation(nodes)
    .force('link', forceLink(edges))
    .force('charge', forceManyBody())
    .force('center', forceCenter());
  
  simulation.on('tick', () => {
    // Update positions
  });
}, [nodes, edges]);

// 2. API error handling
try {
  const graph = await buildCourseGraph({ courseId, userId });
  return NextResponse.json(graph);
} catch (error) {
  console.error('[Graph API] Error:', error);
  return NextResponse.json({ error: 'Failed to generate graph' }, { status: 500 });
}

// 3. Accessibility
<svg role="img" aria-label="Knowledge graph">
  <circle role="listitem" tabIndex={0} aria-label={node.label} />
</svg>
```

### Constraints
- ❌ No new npm packages (use existing d3 via recharts)
- ✅ No database schema changes (derive from existing models)
- ✅ Lightweight bundle impact (< 100KB)
- ✅ Content-first UX (graph is secondary, toggleable)

---

**Lines**: ~120 (under 150 line budget)  
**Token Efficiency**: Essential context only
```

---

## Phase 2: Task Planning Approach

*This section describes what the /tasks command will do - DO NOT execute during /plan*

### Task Generation Strategy

**Input Sources**:
1. Contracts: `contracts/*.openapi.yaml` → API implementation tasks
2. Data Model: `data-model.md` → Type definition + utility function tasks
3. Quickstart: `quickstart.md` → Integration + testing tasks
4. User Stories: `spec.md` → Feature completion tasks

**Task Categories**:

1. **[P] Foundation Tasks** (parallel execution)
   - Create type definitions (`lib/graph/types.ts`)
   - Create color utilities (`lib/graph/colors.ts`)
   - Create layout utilities (`lib/graph/layout.ts`)
   
2. **Graph Generation Tasks** (sequential, depends on Foundation)
   - Implement `buildCourseGraph()` in `generator.ts`
   - Implement `buildLessonGraph()` in `generator.ts`
   - Add helper functions (canAccessLesson, calculateMaxDepth)

3. **[P] API Tasks** (parallel, depends on Graph Generation)
   - Create `/api/courses/[slug]/graph/route.ts`
   - Create `/api/courses/[slug]/lessons/[lessonSlug]/graph/route.ts`
   - Implement caching layer (Redis)

4. **[P] Component Tasks** (parallel, depends on Foundation)
   - Create `ForceGraph.tsx` (D3 + React)
   - Create `RadialGraph.tsx` (lesson-centric)
   - Create `GraphNode.tsx`, `GraphEdge.tsx` (rendering)
   - Create `GraphControls.tsx` (zoom, pan, reset)
   - Create `GraphLegend.tsx` (node type legend)
   - Create `GraphToggle.tsx` (collapsible container)

5. **Integration Tasks** (sequential, depends on Components + API)
   - Integrate graph into course detail page
   - Integrate local graph into lesson detail page
   - Add loading/error states
   - Wire up navigation handlers

6. **Testing Tasks** (parallel, throughout)
   - Unit tests for graph generator
   - Unit tests for layout utilities
   - Contract tests for API endpoints
   - Component tests for ForceGraph
   - Integration tests for full flow
   - Accessibility tests (keyboard nav, ARIA)

7. **Polish Tasks** (sequential, after core complete)
   - Refine styling (colors, animations, responsive)
   - Optimize performance (large graphs, debouncing)
   - Add dark mode support
   - Implement keyboard shortcuts
   - Create user documentation

**Ordering Strategy**:
```
Foundation [P] → Graph Generation → API [P]
                                  ↘
Foundation [P] → Components [P]  → Integration → Polish
                      ↓
                  Testing [P] (continuous)
```

**Estimated Task Count**: 30-35 tasks
- Foundation: 3 tasks [P]
- Graph Generation: 4 tasks
- API: 3 tasks [P]
- Components: 7 tasks [P]
- Integration: 4 tasks
- Testing: 8 tasks [P]
- Polish: 5 tasks

**TDD Emphasis**:
- Each API endpoint: Contract test FIRST, then implementation
- Each component: Test FIRST (expected behavior), then render logic
- Each utility: Unit test FIRST, then function body

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

---

## Phase 3+: Future Implementation

*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md with 30-35 ordered tasks)  
**Phase 4**: Implementation (execute tasks following TDD, ~4 weeks timeline)  
**Phase 5**: Validation (all tests pass, quickstart works, performance metrics met)

---

## Complexity Tracking

*Fill ONLY if Constitution Check has violations that must be justified*

**No violations detected** - all complexity is justified:

| Aspect | Complexity Level | Justification |
|--------|------------------|---------------|
| D3 force simulation | Medium | Standard pattern for graph visualization, no simpler alternative |
| Two graph views | Low | Required by feature spec (global + local) |
| Redis caching | Low | Optional optimization, not required for MVP |
| SVG rendering | Low | Standard for accessible, scalable graphics |
| Zero new dependencies | Low | Reduces bundle size, uses existing recharts → d3 |

---

## Progress Tracking

*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research planned (ready to execute)
- [x] Phase 0: Research complete (/plan command) ✅
- [ ] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [ ] Post-Design Constitution Check: PASS (pending Phase 1 completion)
- [x] All NEEDS CLARIFICATION resolved (Technical Context complete)
- [x] Complexity deviations documented (none)

**Artifact Status**:
- [x] spec.md - Complete (600+ lines)
- [x] data-model.md - Complete (500+ lines, reuse existing)
- [x] api-reference.md - Complete (700+ lines, reuse existing)
- [x] implementation-guide.md - Partial (Phase 1 complete)
- [x] research.md - Complete ✅
- [ ] contracts/*.openapi.yaml - Pending Phase 1
- [ ] quickstart.md - Pending Phase 1
- [ ] .github/copilot-instructions.md - Pending Phase 1 update
- [ ] tasks.md - Pending Phase 2 (/tasks command)

---

## Next Steps

1. **Execute Phase 0**: Create `research.md` with D3 integration, caching, performance, accessibility decisions
2. **Execute Phase 1**: Create contracts, finalize quickstart, update copilot instructions
3. **Re-evaluate Constitution Check**: Verify no violations after design complete
4. **Plan Phase 2**: Describe task generation approach (this document, above)
5. **STOP**: Ready for `/tasks` command to generate `tasks.md`

**Command to Continue**: `/tasks` (will create tasks.md with 30-35 ordered, prioritized tasks)

---

*Based on Constitution template - Project-specific constitution not yet defined*  
*Plan follows standard best practices: Library-first, Type-safe, Test-first, Integration tested, Observable, Simple*
