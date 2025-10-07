# Tasks: Course Knowledge Graph

**Input**: Design documents from `/specs/014-course-knowledge-graph/`  
**Prerequisites**: plan.md ✅, research.md ✅, data-model.md ✅, PRODUCTION_ARCHITECTURE.md ✅

**Tech Stack**: TypeScript 5.9.2, Next.js 15.5.3, React 19.1.0, Mongoose 8.18.1, Redis (ioredis 5.7.0)  
**New Dependencies**: d3-force 3.0.0, d3-zoom 3.0.0, d3-drag 3.0.0, d3-selection 3.0.0

---

## Execution Flow (main)
```
1. ✅ Loaded plan.md → Tech stack: TypeScript, Next.js 15, React 19, MongoDB, Redis
2. ✅ Loaded PRODUCTION_ARCHITECTURE.md → Production patterns identified
3. ✅ Loaded data-model.md → Entities: GraphNode, GraphEdge, KnowledgeGraph
4. ✅ Loaded research.md → Decisions: D3 integration, caching strategy, performance
5. 📝 Generated tasks by category:
   → Setup: Dependencies, branch, TypeScript config
   → Tests: Contract tests (2 endpoints), unit tests (5 modules)
   → Library: types, generator, cache, simulator, query, utils (6 files)
   → API: 2 endpoints (course graph, lesson graph)
   → Components: 4 React components (KnowledgeGraph, GraphCanvas, GraphControls, GraphNodeTooltip)
   → Integration: Cache invalidation hooks, page integration
   → Polish: Performance tests, documentation, cleanup
6. ✅ Applied task rules:
   → Different files marked [P] for parallel execution
   → Tests before implementation (TDD)
   → Models → Services → Endpoints → Polish
7. ✅ Numbered tasks: T001-T035
8. ✅ Generated dependency graph
9. ✅ Validated task completeness:
   → ✅ All endpoints have contract tests
   → ✅ All entities have type definitions
   → ✅ All tests come before implementation
10. ✅ SUCCESS: 35 tasks ready for execution
```

---

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- All paths are absolute from repository root

---

## Phase 3.1: Setup & Dependencies

### T001: Create Feature Branch
**Description**: Create and switch to feature branch `014-course-knowledge-graph`  
**Command**: `git checkout -b 014-course-knowledge-graph`  
**Dependencies**: None  
**Estimated Time**: 2 minutes

### T002: Install D3 Dependencies
**Description**: Install d3-force, d3-zoom, d3-drag, d3-selection packages and type definitions  
**Command**: `pnpm add d3-force d3-zoom d3-drag d3-selection && pnpm add -D @types/d3-force @types/d3-zoom @types/d3-drag @types/d3-selection`  
**Files**: `package.json`, `pnpm-lock.yaml`  
**Dependencies**: T001  
**Estimated Time**: 5 minutes  
**Verification**: Run `pnpm list d3-force d3-zoom d3-drag d3-selection`

### T003 [P]: Verify TypeScript Configuration
**Description**: Ensure tsconfig.json supports TypeScript 5.9.2 with strict mode and ES2017 target  
**File**: `tsconfig.json`  
**Dependencies**: T002  
**Actions**:
- Verify `"strict": true`
- Verify `"target": "ES2017"`
- Verify `"moduleResolution": "bundler"`
- Verify `"@/*": ["./src/*"]` path alias
**Estimated Time**: 3 minutes

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### T004 [P]: Contract Test - GET /api/courses/:courseId/graph
**Description**: Create contract test for course graph API endpoint that validates response structure  
**File**: `src/__tests__/api/course-graph.contract.test.ts`  
**Dependencies**: T003  
**Pattern**: Follow `/src/test/contract/courses.detail.contract.test.ts`  
**Actions**:
- Import Vitest, Mongoose, connectToDatabase
- Find a published course with modules
- Call `buildCourseGraph({ courseId })`
- Validate response structure:
  * `graph.nodes` array exists
  * `graph.edges` array exists
  * `graph.metadata` object exists
  * Nodes have required fields: id, type, label
  * Node types are valid: 'module' | 'lesson' | 'sublesson'
  * Edges have required fields: source, target, type
  * Edge types are valid: 'contains' | 'prerequisite' | 'parent-child'
  * Metadata has: courseId, nodeCount, edgeCount
- Test user progress when authenticated (mock user ID)
**Expected**: Test fails (buildCourseGraph not implemented yet)  
**Estimated Time**: 30 minutes

### T005 [P]: Contract Test - GET /api/courses/:courseId/lessons/:lessonSlug/graph
**Description**: Create contract test for lesson graph API endpoint that validates response structure  
**File**: `src/__tests__/api/lesson-graph.contract.test.ts`  
**Dependencies**: T003  
**Pattern**: Follow `/src/test/contract/courses.detail.contract.test.ts`  
**Actions**:
- Import Vitest, Mongoose, connectToDatabase
- Find a published course with lessons
- Find a lesson with sub-lessons or prerequisites
- Call `buildLessonGraph({ lessonId, depth: 2 })`
- Validate response structure (same as T004)
- Validate depth parameter works (nodes limited by depth)
**Expected**: Test fails (buildLessonGraph not implemented yet)  
**Estimated Time**: 30 minutes

### T006 [P]: Unit Test - Graph Generator
**Description**: Create unit tests for buildCourseGraph and buildLessonGraph functions  
**File**: `src/lib/graph/__tests__/generator.test.ts`  
**Dependencies**: T003  
**Actions**:
- Test `buildCourseGraph()` with mock data
  * Returns valid graph structure
  * Handles empty course (no lessons)
  * Includes module nodes
  * Creates module→lesson edges
  * Creates prerequisite edges
  * Creates parent-child edges
  * Calculates locked status correctly
- Test `buildLessonGraph()` with mock data
  * Returns lesson-centric graph
  * Respects depth parameter
  * Includes prerequisites at depth+1
  * Includes sub-lessons
**Expected**: Tests fail (functions not implemented yet)  
**Estimated Time**: 45 minutes

### T007 [P]: Unit Test - Redis Cache
**Description**: Create unit tests for graph caching functions  
**File**: `src/lib/graph/__tests__/cache.test.ts`  
**Dependencies**: T003  
**Actions**:
- Test `getCachedGraph()`:
  * Returns null on cache miss
  * Returns cached data on hit
  * Handles Redis connection errors gracefully
- Test `setCachedGraph()`:
  * Stores graph with TTL
  * Handles errors gracefully
- Test `invalidateCourseGraph()`:
  * Deletes all keys matching pattern
  * Logs deletion count
- Test `invalidateLessonGraph()`:
  * Deletes all keys matching pattern
- Test `invalidateUserProgress()`:
  * Deletes user-specific cache keys
**Expected**: Tests fail (functions not implemented yet)  
**Estimated Time**: 30 minutes

### T008 [P]: Unit Test - D3 Force Simulator
**Description**: Create unit tests for D3 force simulation wrapper  
**File**: `src/lib/graph/__tests__/simulator.test.ts`  
**Dependencies**: T003  
**Actions**:
- Test `simulateGraphLayout()`:
  * Returns nodes with x, y coordinates
  * Applies force-directed layout
  * Handles empty graph
  * Handles single node
  * Converges within max iterations
- Test `applyModuleGrouping()`:
  * Groups lesson nodes by module
- Test `calculateBounds()`:
  * Returns correct min/max x,y
**Expected**: Tests fail (functions not implemented yet)  
**Estimated Time**: 30 minutes

---

## Phase 3.3: Core Implementation - Library Layer (ONLY after tests are failing)

### T009 [P]: Create Graph Type Definitions
**Description**: Create TypeScript interfaces for GraphNode, GraphEdge, KnowledgeGraph  
**File**: `src/lib/graph/types.ts`  
**Dependencies**: T004, T005, T006, T007, T008 (all tests must fail first)  
**Pattern**: Follow `/src/types/courses.ts` structure  
**Actions**:
- Export `GraphNode` interface (from data-model.md):
  * id, type, label (required)
  * size, color, icon, shape (optional)
  * duration, completed, locked, contentType, progress (optional)
  * href, slug (optional)
  * x, y, fx, fy (optional, for D3)
  * moduleId, moduleName, parentId (optional)
  * isHighlighted, isCurrent, isHovered (optional)
- Export `NodeType` union type: 'course' | 'module' | 'lesson' | 'sublesson' | 'topic'
- Export `ContentType` union type: 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards'
- Export `GraphEdge` interface:
  * source, target, type (required)
  * weight, label (optional)
- Export `EdgeType` union type: 'contains' | 'prerequisite' | 'parent-child' | 'sibling' | 'sequential'
- Export `KnowledgeGraph` interface:
  * nodes: GraphNode[]
  * edges: GraphEdge[]
  * metadata: { courseId, nodeCount, edgeCount, generatedAt, userId? }
- Export `BuildGraphOptions` interface:
  * courseId: Types.ObjectId
  * userId?: Types.ObjectId | null
  * depth?: number
  * includeProgress?: boolean
**Estimated Time**: 30 minutes  
**Verification**: Run `pnpm typecheck`

### T010 [P]: Create Graph Query Utilities
**Description**: Create database query functions for fetching course structure  
**File**: `src/lib/graph/query.ts`  
**Dependencies**: T009  
**Pattern**: Follow `/src/lib/courses/query.ts` structure  
**Actions**:
- Export `fetchCourseStructure(courseId)`:
  * Fetch modules sorted by order
  * Fetch all lessons for course
  * Return { modules, lessons, lessonsById Map }
- Export `fetchLessonWithContext(lessonId, depth)`:
  * Fetch lesson
  * Fetch prerequisites (recursive up to depth)
  * Fetch sub-lessons
  * Fetch sibling lessons in same module
  * Return { lesson, prerequisites, subLessons, siblings }
- Export `fetchUserProgress(courseId, userId)`:
  * Find enrollment
  * Find progress
  * Return Set of completed lesson IDs
- Use `.lean()` for all queries (performance)
- Use `.select()` to limit fields
**Estimated Time**: 45 minutes  
**Verification**: Tests pass for query functions

### T011: Create Graph Generator Core
**Description**: Implement buildCourseGraph() and buildLessonGraph() functions  
**File**: `src/lib/graph/generator.ts`  
**Dependencies**: T009, T010  
**Pattern**: Follow `/src/lib/courses/progress.ts` structure (similar aggregation logic)  
**Actions**:
- Import types, query functions, Mongoose models
- Implement `buildCourseGraph(options)`:
  * Call `fetchCourseStructure(courseId)`
  * Call `fetchUserProgress(courseId, userId)` if authenticated
  * Build module nodes (id, type:'module', label, metadata)
  * Build lesson nodes (check if completed, locked)
  * Build edges:
    - Module→Lesson (type:'contains')
    - Lesson→Lesson (type:'prerequisite')
    - Parent→Child (type:'parent-child')
  * Return KnowledgeGraph with metadata
- Implement `buildLessonGraph(options)`:
  * Call `fetchLessonWithContext(lessonId, depth)`
  * Build lesson-centric graph
  * Include prerequisites up to depth
  * Include sub-lessons
  * Include siblings
  * Return KnowledgeGraph
- Implement helper `checkIfLocked(lesson, completedIds, lessonMap)`:
  * Return true if any prerequisite not completed
- Add JSDoc comments
- Add error handling (try/catch)
**Estimated Time**: 90 minutes  
**Verification**: T004, T005, T006 tests pass

### T012 [P]: Create Redis Cache Layer
**Description**: Implement graph caching functions with hierarchical keys  
**File**: `src/lib/graph/cache.ts`  
**Dependencies**: T009  
**Pattern**: Follow `/src/lib/redis.ts` and `/src/lib/cache-service.ts` patterns  
**Actions**:
- Import { cache } from '@/lib/redis'
- Import types
- Export `GraphCacheKeys`:
  * `courseGraph(courseId, userId?)` → hierarchical key
  * `lessonGraph(lessonId, userId?, depth)` → hierarchical key
- Export `getCachedGraph(key)`:
  * Try cache.get<KnowledgeGraph>(key)
  * Catch errors, return null
- Export `setCachedGraph(key, graph, ttl=300)`:
  * Call cache.set(key, graph, ttl)
  * Catch errors, log warning
- Export `invalidateCourseGraph(courseId)`:
  * Pattern: `graph:course:${courseId}:*`
  * Call cache.delPattern(pattern)
  * Log deletion count
- Export `invalidateLessonGraph(lessonId)`:
  * Pattern: `graph:lesson:${lessonId}:*`
  * Call cache.delPattern(pattern)
- Export `invalidateUserProgress(userId, courseId)`:
  * Patterns: [
      `graph:course:${courseId}:user:${userId}`,
      `graph:lesson:*:user:${userId}:*`
    ]
  * Delete all matching keys
- Add JSDoc comments
**Estimated Time**: 30 minutes  
**Verification**: T007 tests pass

### T013 [P]: Create D3 Force Simulator Wrapper
**Description**: Create wrapper functions for D3 force simulation  
**File**: `src/lib/graph/simulator.ts`  
**Dependencies**: T009, T002 (d3-force installed)  
**Actions**:
- Import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
- Import types
- Export `simulateGraphLayout(graph, options)`:
  * Create D3 force simulation with nodes/edges
  * Apply forces:
    - forceLink (edges)
    - forceManyBody (repulsion)
    - forceCenter (centering)
    - forceCollide (collision detection)
  * Run simulation for N ticks (adaptive based on node count)
  * Return graph with updated node positions (x, y)
- Export `applyModuleGrouping(graph)`:
  * Group lessons by moduleId
  * Apply forceX/forceY to cluster by module
  * Return graph with updated positions
- Export `calculateBounds(nodes)`:
  * Find min/max x, y across all nodes
  * Return { minX, maxX, minY, maxY, width, height }
- Add JSDoc comments
- Add performance logging (console.log simulation time)
**Estimated Time**: 60 minutes  
**Verification**: T008 tests pass

### T014 [P]: Create Graph Utilities
**Description**: Create helper functions for graph manipulation  
**File**: `src/lib/graph/utils.ts`  
**Dependencies**: T009  
**Pattern**: Follow `/src/lib/courses/format.ts` structure  
**Actions**:
- Export `filterByDepth(graph, startNodeId, maxDepth)`:
  * BFS traversal from start node
  * Include nodes within maxDepth edges
  * Return filtered graph
- Export `findPath(graph, startId, endId)`:
  * Find shortest path between nodes
  * Return array of node IDs
- Export `getConnectedNodes(graph, nodeId)`:
  * Return all nodes connected to nodeId
- Export `calculateStats(graph)`:
  * Return { totalNodes, totalEdges, avgDegree, maxDepth }
- Export `groupByModule(graph)`:
  * Return Map<moduleId, GraphNode[]>
- Add JSDoc comments
**Estimated Time**: 45 minutes  
**Verification**: Run `pnpm typecheck`

---

## Phase 3.4: Core Implementation - API Routes

### T015: Create Course Graph API Endpoint
**Description**: Implement GET /api/courses/:courseId/graph API route  
**File**: `src/app/api/courses/[courseId]/graph/route.ts`  
**Dependencies**: T011, T012, T013 (library layer complete)  
**Pattern**: Follow `/src/app/api/courses/[courseId]/progress/route.ts` exactly  
**Actions**:
- Import NextRequest, NextResponse, auth, Types, z
- Import connectToDatabase, CourseModel, User
- Import buildCourseGraph, getCachedGraph, setCachedGraph
- Create `QuerySchema` with Zod:
  * depth: z.coerce.number().int().min(1).max(3).default(2)
  * includeProgress: z.enum(['true', 'false']).optional()
- Export async `GET(req, ctx)`:
  1. auth() check (optional - allow public)
  2. Parse + validate query params with QuerySchema.safeParse()
  3. Return 400 if validation fails
  4. connectToDatabase()
  5. Course lookup (slug or ObjectId)
  6. Return 404 if course not found
  7. User lookup if userId exists
  8. Build cache key (user-specific or public)
  9. Check cache with getCachedGraph(key)
  10. Return cached response with X-Cache: HIT header if found
  11. Generate graph with buildCourseGraph()
  12. Cache result with setCachedGraph(key, graph, 300)
  13. Return graph with X-Cache: MISS header
  14. Catch errors, return 500 with error message
- Export `dynamic = 'force-dynamic'`
- Add JSDoc comments
**Estimated Time**: 60 minutes  
**Verification**: T004 test passes, manual test with Postman/curl

### T016: Create Lesson Graph API Endpoint
**Description**: Implement GET /api/courses/:courseId/lessons/:lessonSlug/graph API route  
**File**: `src/app/api/courses/[courseId]/lessons/[lessonSlug]/graph/route.ts`  
**Dependencies**: T011, T012, T013 (library layer complete)  
**Pattern**: Follow T015 structure  
**Actions**:
- Same imports as T015
- Import buildLessonGraph instead of buildCourseGraph
- Same QuerySchema with depth parameter
- Export async `GET(req, ctx)`:
  1-7. Same as T015 (auth, validation, database, course lookup, user lookup)
  8. Lesson lookup by slug
  9. Return 404 if lesson not found
  10. Build cache key with lessonId + depth
  11. Check cache
  12. Generate graph with buildLessonGraph({ lessonId, depth, userId })
  13. Cache result
  14. Return graph
- Export `dynamic = 'force-dynamic'`
**Estimated Time**: 45 minutes  
**Verification**: T005 test passes, manual test

---

## Phase 3.5: Core Implementation - React Components

### T017 [P]: Create Knowledge Graph Container Component
**Description**: Create main KnowledgeGraph component with SWR data fetching  
**File**: `src/components/courses/KnowledgeGraph.tsx`  
**Dependencies**: T015, T016 (API endpoints exist)  
**Pattern**: Follow `/src/components/courses/QuizTaker.tsx` SWR pattern  
**Actions**:
- 'use client' directive
- Import useState, useCallback
- Import useSWR from 'swr'
- Import shadcn/ui: Card, CardContent, CardHeader, CardTitle, Button, Skeleton
- Import useToast
- Import GraphCanvas, GraphControls
- Import type KnowledgeGraph
- Create `fetcher` function: fetch → check res.ok → return res.json()
- Export `KnowledgeGraph` component:
  * Props: { courseSlug, lessonSlug?, includeProgress? }
  * State: [depth, setDepth], [isOpen, setIsOpen]
  * Build API URL (course or lesson graph)
  * useSWR hook (only fetch when isOpen)
  * Error handling with useToast
  * Render:
    - Card with CardHeader (title + toggle button)
    - If isOpen:
      - GraphControls (depth selector)
      - Loading state: Skeleton
      - Success state: GraphCanvas
      - Empty state: centered message
      - Error state: handled via toast
- Add TypeScript prop types
- Add JSDoc comments
**Estimated Time**: 60 minutes  
**Verification**: Renders without errors (stub GraphCanvas for now)

### T018 [P]: Create Graph Canvas Component
**Description**: Create GraphCanvas component with D3 + SVG rendering  
**File**: `src/components/courses/GraphCanvas.tsx`  
**Dependencies**: T002 (D3 installed), T013 (simulator exists)  
**Actions**:
- 'use client' directive
- Import useEffect, useRef, useState, useCallback
- Import d3-zoom, d3-drag, d3-selection
- Import simulateGraphLayout, calculateBounds
- Import type KnowledgeGraph
- Export `GraphCanvas` component:
  * Props: { graph, onNodeClick? }
  * Refs: svgRef, containerRef
  * State: [transform, setTransform]
  * useEffect: Run simulateGraphLayout on graph change
  * useEffect: Setup d3-zoom behavior
  * useEffect: Setup d3-drag behavior for nodes
  * Render SVG:
    - <svg ref={svgRef} width="100%" height="600px">
    - <g transform={transform}>
    - Render edges (lines)
    - Render nodes (circles with labels)
    - Apply colors based on node type/status
    - Add onClick handlers for nodes
- Add keyboard navigation (Arrow keys, +/-, 0, Escape)
- Add ARIA labels
- Add responsive sizing
**Estimated Time**: 90 minutes  
**Verification**: Graph renders with zoom/pan/drag

### T019 [P]: Create Graph Controls Component
**Description**: Create GraphControls component for zoom/pan/filter UI  
**File**: `src/components/courses/GraphControls.tsx`  
**Dependencies**: None (pure UI component)  
**Pattern**: Use shadcn/ui components  
**Actions**:
- 'use client' directive
- Import shadcn/ui: Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
- Import lucide-react icons: ZoomIn, ZoomOut, Maximize, Filter
- Export `GraphControls` component:
  * Props: { depth, onDepthChange, onZoomIn?, onZoomOut?, onResetZoom?, onFilter? }
  * Render control bar:
    - Depth selector (1, 2, 3)
    - Zoom in button
    - Zoom out button
    - Reset zoom button
    - Filter button (future)
  * Responsive layout (horizontal on desktop, vertical on mobile)
- Add tooltips with Radix UI Tooltip
- Add keyboard shortcuts (display hints)
**Estimated Time**: 30 minutes  
**Verification**: Renders with all controls functional

### T020 [P]: Create Graph Node Tooltip Component
**Description**: Create GraphNodeTooltip component for node hover details  
**File**: `src/components/courses/GraphNodeTooltip.tsx`  
**Dependencies**: None (pure UI component)  
**Pattern**: Use Radix UI Tooltip  
**Actions**:
- 'use client' directive
- Import Radix UI: Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
- Import type GraphNode
- Export `GraphNodeTooltip` component:
  * Props: { node, children }
  * Render Tooltip:
    - TooltipTrigger wraps children
    - TooltipContent shows:
      - Node label
      - Node type badge
      - Duration (if lesson)
      - Completion status (if lesson)
      - Locked status (if locked)
      - Content type icon (if lesson)
      - Module name (if lesson)
- Add keyboard accessibility (show on focus)
- Add dark mode support
**Estimated Time**: 30 minutes  
**Verification**: Tooltip shows on hover/focus

---

## Phase 3.6: Integration

### T021: Add Cache Invalidation Hook to Lesson CRUD
**Description**: Add invalidateCourseGraph call after lesson create/update/delete  
**File**: `src/app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/route.ts`  
**Dependencies**: T012 (cache functions exist)  
**Actions**:
- Import { invalidateCourseGraph } from '@/lib/graph/cache'
- In POST handler (create lesson):
  * After successful lesson creation
  * Call `await invalidateCourseGraph(courseId.toString())`
- In PUT handler (update lesson):
  * After successful lesson update
  * Call `await invalidateCourseGraph(courseId.toString())`
- In DELETE handler (delete lesson):
  * After successful lesson deletion
  * Call `await invalidateCourseGraph(courseId.toString())`
- Add try/catch around cache calls (non-blocking)
**Estimated Time**: 15 minutes  
**Verification**: Cache invalidates after lesson changes

### T022: Add Cache Invalidation Hook to Progress Update
**Description**: Add invalidateUserProgress call after lesson completion  
**File**: `src/app/api/courses/[courseId]/progress/complete-lesson/route.ts`  
**Dependencies**: T012 (cache functions exist)  
**Actions**:
- Import { invalidateUserProgress } from '@/lib/graph/cache'
- In POST handler (complete lesson):
  * After successful progress update
  * Call `await invalidateUserProgress(userId.toString(), courseId.toString())`
- Add try/catch around cache call (non-blocking)
**Estimated Time**: 10 minutes  
**Verification**: User-specific cache invalidates after completion

### T023: Add Cache Invalidation Hook to Module Reorder
**Description**: Add invalidateCourseGraph call after module reorder  
**File**: `src/app/api/admin/courses/[courseId]/modules/reorder/route.ts`  
**Dependencies**: T012 (cache functions exist)  
**Actions**:
- Import { invalidateCourseGraph } from '@/lib/graph/cache'
- In POST handler (reorder modules):
  * After successful reorder
  * Call `await invalidateCourseGraph(courseId.toString())`
- Add try/catch (non-blocking)
**Estimated Time**: 10 minutes  
**Verification**: Cache invalidates after module structure change

### T024: Integrate KnowledgeGraph into Course Page
**Description**: Add KnowledgeGraph component to course detail page  
**File**: `src/app/courses/[slug]/page.tsx`  
**Dependencies**: T017, T018, T019, T020 (all components exist)  
**Actions**:
- Import { KnowledgeGraph } from '@/components/courses/KnowledgeGraph'
- In course page component:
  * After modules/lessons content
  * Add `<section className="mt-8">`
  * Add `<KnowledgeGraph courseSlug={params.slug} includeProgress={isEnrolled} />`
- Add comment: "Knowledge Graph - toggleable secondary navigation"
- Ensure responsive layout (full width on mobile)
**Estimated Time**: 10 minutes  
**Verification**: Graph appears on course page, can toggle on/off

### T025: Integrate KnowledgeGraph into Lesson Page
**Description**: Add KnowledgeGraph component to lesson viewer page  
**File**: `src/app/courses/[slug]/lessons/[lessonSlug]/page.tsx`  
**Dependencies**: T017, T018, T019, T020 (all components exist)  
**Actions**:
- Import { KnowledgeGraph } from '@/components/courses/KnowledgeGraph'
- In lesson page component:
  * After lesson content
  * Add `<aside className="mt-8">`
  * Add `<KnowledgeGraph courseSlug={params.slug} lessonSlug={params.lessonSlug} includeProgress={isEnrolled} />`
- Add comment: "Lesson Graph - shows related lessons and sub-lessons"
**Estimated Time**: 10 minutes  
**Verification**: Local graph appears on lesson page

---

## Phase 3.7: Polish & Testing

### T026 [P]: Add Unit Tests for Graph Utilities
**Description**: Create unit tests for utility functions in utils.ts  
**File**: `src/lib/graph/__tests__/utils.test.ts`  
**Dependencies**: T014 (utils.ts exists)  
**Actions**:
- Test `filterByDepth()`:
  * Filters graph to specified depth
  * Handles empty graph
  * Handles depth = 0
- Test `findPath()`:
  * Finds shortest path
  * Returns empty array if no path
- Test `getConnectedNodes()`:
  * Returns all connected nodes
- Test `calculateStats()`:
  * Calculates correct statistics
- Test `groupByModule()`:
  * Groups nodes by module ID
**Estimated Time**: 30 minutes  
**Verification**: All tests pass

### T027 [P]: Add Component Tests for KnowledgeGraph
**Description**: Create component tests for KnowledgeGraph container  
**File**: `src/components/courses/__tests__/KnowledgeGraph.test.tsx`  
**Dependencies**: T017 (KnowledgeGraph exists)  
**Pattern**: Follow existing component test patterns  
**Actions**:
- Import @testing-library/react
- Mock useSWR
- Test renders with loading state
- Test renders with data (graph)
- Test renders with error
- Test toggle open/close
- Test depth change
**Estimated Time**: 45 minutes  
**Verification**: Tests pass

### T028 [P]: Add Component Tests for GraphCanvas
**Description**: Create component tests for GraphCanvas SVG rendering  
**File**: `src/components/courses/__tests__/GraphCanvas.test.tsx`  
**Dependencies**: T018 (GraphCanvas exists)  
**Actions**:
- Mock D3 functions
- Test renders SVG
- Test renders nodes
- Test renders edges
- Test node click handler
**Estimated Time**: 30 minutes  
**Verification**: Tests pass

### T029: Add Performance Test for Large Graphs
**Description**: Create performance test for graphs with 200+ nodes  
**File**: `src/lib/graph/__tests__/performance.test.ts`  
**Dependencies**: T011, T013 (generator + simulator exist)  
**Actions**:
- Create mock course with 200 lessons
- Measure `buildCourseGraph()` execution time
  * Target: < 200ms
- Measure `simulateGraphLayout()` execution time
  * Target: < 300ms
- Measure total API response time (with cache miss)
  * Target: < 500ms
- Log performance metrics
- Fail test if targets not met
**Estimated Time**: 30 minutes  
**Verification**: Performance targets met

### T030: Add Accessibility Audit
**Description**: Verify graph components meet WCAG 2.1 AA standards  
**File**: Manual testing with axe-core or similar  
**Dependencies**: T018, T019, T020 (all components exist)  
**Actions**:
- Install axe-core: `pnpm add -D @axe-core/react`
- Test GraphCanvas:
  * All nodes have ARIA labels
  * Keyboard navigation works (Tab, Arrow keys, Enter)
  * Focus visible
  * Color contrast meets AA standards
- Test GraphControls:
  * Buttons have ARIA labels
  * Keyboard shortcuts work
- Test GraphNodeTooltip:
  * Tooltip accessible via keyboard
  * Screen reader announces content
- Document any issues in accessibility-audit.md
**Estimated Time**: 45 minutes  
**Verification**: All accessibility requirements met

### T031 [P]: Update API Documentation
**Description**: Update api-reference.md with final implementation details  
**File**: `specs/014-course-knowledge-graph/api-reference.md`  
**Dependencies**: T015, T016 (API routes implemented)  
**Actions**:
- Verify endpoint URLs match implementation
- Verify query parameters documented
- Verify response formats match actual API
- Add cURL examples
- Add response time benchmarks
- Add cache header documentation
**Estimated Time**: 20 minutes  
**Verification**: Documentation matches implementation

### T032 [P]: Create Integration Test for Full Workflow
**Description**: Create end-to-end test for graph feature workflow  
**File**: `src/__tests__/integration/knowledge-graph.integration.test.ts`  
**Dependencies**: T024, T025 (integration complete)  
**Actions**:
- Test scenario: Student navigates course with graph
  1. Fetch course graph (not enrolled)
  2. Verify public graph returned
  3. Enroll in course
  4. Fetch course graph (enrolled)
  5. Verify user progress included
  6. Complete a lesson
  7. Fetch graph again
  8. Verify graph updated (completed node)
  9. Fetch lesson graph
  10. Verify lesson-centric view
- Use real API calls (not mocked)
- Use test database
**Estimated Time**: 60 minutes  
**Verification**: Full workflow works end-to-end

### T033: Code Review & Cleanup
**Description**: Review all code for consistency, remove console.logs, fix linting issues  
**Dependencies**: T032 (all implementation complete)  
**Actions**:
- Run `pnpm lint` → fix all issues
- Run `pnpm typecheck` → fix all type errors
- Search for `console.log` → remove or convert to proper logging
- Review all files for:
  * Consistent naming conventions
  * JSDoc comments on public functions
  * Error handling
  * TypeScript strict mode compliance
- Remove any unused imports
- Remove any commented-out code
**Estimated Time**: 30 minutes  
**Verification**: No lint errors, no type errors

### T034: Performance Optimization
**Description**: Optimize graph rendering and API response times  
**Dependencies**: T033 (code clean)  
**Actions**:
- Profile `buildCourseGraph()`:
  * Add indexes if needed (check MongoDB query performance)
  * Use `.select()` to limit fields
  * Use `.lean()` for read-only queries
- Profile `simulateGraphLayout()`:
  * Adjust iteration count based on node count
  * Use adaptive alpha decay
- Profile component rendering:
  * Memoize GraphCanvas with React.memo
  * Use useCallback for event handlers
  * Throttle zoom/pan updates (requestAnimationFrame)
- Test with 500-node graph
- Document performance improvements
**Estimated Time**: 45 minutes  
**Verification**: Performance targets met for large graphs

### T035: Final Documentation & Deployment Prep
**Description**: Complete documentation and prepare for deployment  
**Dependencies**: T034 (optimization complete)  
**Actions**:
- Update `specs/014-course-knowledge-graph/README_PRODUCTION_READY.md`:
  * Mark Phase 3-5 as complete
  * Add implementation notes
  * Add known issues (if any)
- Create quickstart.md:
  * How to use the graph (user guide)
  * How to test locally
  * API examples
- Update main README.md (if needed):
  * Mention knowledge graph feature
- Create pull request:
  * Title: "Feature: Course Knowledge Graph (014)"
  * Description: Link to spec, summary of changes
  * List all 35 tasks completed
  * Include screenshots/GIFs
- Tag reviewers
**Estimated Time**: 30 minutes  
**Verification**: Documentation complete, PR ready

---

## Dependencies Graph

```
Setup: T001 → T002 → T003
       T001 ─────────┐
                     ↓
Tests: T003 → [T004, T005, T006, T007, T008] (parallel)
              ↓
Library: T009 (types) → [T010, T012, T014] (parallel)
         T009 + T010 → T011 (generator)
         T009 + T002 → T013 (simulator)
         T011 + T012 + T013 → API Routes
                              ↓
API: T015 (course graph), T016 (lesson graph)
     T015 + T016 → Components
                   ↓
Components: [T017, T018, T019, T020] (parallel)
            ↓
Integration: T021, T022, T023, T024, T025
             ↓
Polish: [T026, T027, T028, T031] (parallel)
        T029 (performance)
        T030 (accessibility)
        T032 (integration test)
        T033 (cleanup)
        T034 (optimization)
        T035 (docs + PR)
```

---

## Parallel Execution Examples

### Batch 1: Initial Tests (After T003)
```bash
# Launch T004-T008 together (all independent test files):
task: "Contract test GET /api/courses/:courseId/graph in src/__tests__/api/course-graph.contract.test.ts per data-model.md and PRODUCTION_ARCHITECTURE.md. Validate graph structure: nodes, edges, metadata. Test user progress with mock user. Pattern: /src/test/contract/courses.detail.contract.test.ts"

task: "Contract test GET /api/courses/:courseId/lessons/:lessonSlug/graph in src/__tests__/api/lesson-graph.contract.test.ts. Validate graph structure and depth parameter. Pattern: /src/test/contract/courses.detail.contract.test.ts"

task: "Unit tests for buildCourseGraph and buildLessonGraph in src/lib/graph/__tests__/generator.test.ts. Test mock data, empty course, module nodes, edges, locked status, depth parameter"

task: "Unit tests for Redis cache functions in src/lib/graph/__tests__/cache.test.ts. Test getCachedGraph, setCachedGraph, invalidate functions, error handling"

task: "Unit tests for D3 simulator in src/lib/graph/__tests__/simulator.test.ts. Test simulateGraphLayout, applyModuleGrouping, calculateBounds, convergence"
```

### Batch 2: Library Layer Parallel Tasks (After T009)
```bash
# Launch T010, T012, T014 together (different files):
task: "Create database query functions in src/lib/graph/query.ts. Implement fetchCourseStructure, fetchLessonWithContext, fetchUserProgress. Use .lean() and .select(). Pattern: /src/lib/courses/query.ts"

task: "Create Redis cache functions in src/lib/graph/cache.ts. Implement getCachedGraph, setCachedGraph, invalidate functions with hierarchical keys. Pattern: /src/lib/redis.ts and /src/lib/cache-service.ts"

task: "Create graph utility functions in src/lib/graph/utils.ts. Implement filterByDepth, findPath, getConnectedNodes, calculateStats, groupByModule. Pattern: /src/lib/courses/format.ts"
```

### Batch 3: React Components (After T015, T016)
```bash
# Launch T017, T018, T019, T020 together (different component files):
task: "Create KnowledgeGraph container component in src/components/courses/KnowledgeGraph.tsx with SWR data fetching, toggle state, error handling. Pattern: /src/components/courses/QuizTaker.tsx with useSWR"

task: "Create GraphCanvas component in src/components/courses/GraphCanvas.tsx with D3 force layout, SVG rendering, zoom/pan/drag, keyboard navigation, ARIA labels"

task: "Create GraphControls component in src/components/courses/GraphControls.tsx with depth selector, zoom buttons, responsive layout. Use shadcn/ui components"

task: "Create GraphNodeTooltip component in src/components/courses/GraphNodeTooltip.tsx with Radix UI Tooltip, node details, keyboard accessibility, dark mode"
```

### Batch 4: Polish Tests (After T025)
```bash
# Launch T026, T027, T028, T031 together (different test files):
task: "Unit tests for graph utilities in src/lib/graph/__tests__/utils.test.ts. Test filterByDepth, findPath, getConnectedNodes, calculateStats, groupByModule"

task: "Component tests for KnowledgeGraph in src/components/courses/__tests__/KnowledgeGraph.test.tsx. Mock useSWR, test loading/data/error states, toggle, depth change"

task: "Component tests for GraphCanvas in src/components/courses/__tests__/GraphCanvas.test.tsx. Mock D3, test SVG rendering, nodes, edges, click handler"

task: "Update API documentation in specs/014-course-knowledge-graph/api-reference.md. Verify endpoints, parameters, responses, add cURL examples, benchmarks"
```

---

## Notes

- **[P] tasks**: Different files, no dependencies, safe to parallelize
- **TDD Order**: Tests (T004-T008) MUST fail before implementation (T009-T016)
- **Integration Hooks**: Cache invalidation (T021-T023) is optional but recommended
- **Performance**: Test with 500-node graphs to validate targets
- **Accessibility**: WCAG 2.1 AA compliance required
- **Commit Strategy**: Commit after each task or logical group
- **Testing Strategy**: Run tests frequently during implementation

---

## Validation Checklist

**GATE: Verify before marking feature complete**

- [x] All contract tests exist (T004, T005)
- [x] All entities have type definitions (T009)
- [x] All endpoints implemented (T015, T016)
- [x] All components implemented (T017, T018, T019, T020)
- [x] Cache invalidation hooks added (T021, T022, T023)
- [x] Integration complete (T024, T025)
- [x] All tests pass (T026-T032)
- [x] Performance targets met (< 500ms API, < 400ms render, 60fps)
- [x] Accessibility audit passed (WCAG 2.1 AA)
- [x] Code review complete (T033)
- [x] Documentation updated (T031, T035)
- [x] No lint/type errors
- [x] Pull request created

---

## Summary Statistics

- **Total Tasks**: 35
- **Parallel Tasks**: 18 tasks marked [P]
- **Sequential Tasks**: 17 tasks (dependencies)
- **Estimated Time**: 28-32 hours
- **Files Created**: 20 files
- **Files Modified**: 5 files
- **Lines of Code**: ~2,000-2,500 LOC

**Timeline**: 2-3 weeks (2-3 hours/day)

---

**Generated**: October 7, 2025  
**Status**: Ready for execution  
**Next Command**: Begin with T001 (create feature branch)
