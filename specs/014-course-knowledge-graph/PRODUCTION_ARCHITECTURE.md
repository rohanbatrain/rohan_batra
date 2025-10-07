# Production Architecture: Knowledge Graph Feature

**Date**: October 7, 2025  
**Status**: Planning → Enhanced with Production Patterns  
**Context**: Analyzed codebase, identified production patterns, ready for seamless integration

---

## 🎯 Executive Summary

This document enhances the original plan with **production-ready patterns** extracted from the existing codebase. The knowledge graph will integrate seamlessly using established:

- **API patterns**: Zod validation, error handling, auth middleware
- **Data patterns**: MongoDB aggregations, Redis caching, progress tracking
- **Component patterns**: SWR data fetching, shadcn/ui, responsive design
- **Library structure**: Domain-driven `/lib` organization, utility functions
- **Testing patterns**: Vitest contract tests, component tests, integration tests

**Key Insight**: The codebase is **highly consistent** with established patterns in `/src/lib/courses/`, API routes, and component structure. We'll follow these patterns exactly.

---

## 📁 File Organization (Production Structure)

### Library Layer (`/src/lib/graph/`)
```
src/lib/graph/
├── types.ts                    # TypeScript interfaces (GraphNode, GraphEdge, KnowledgeGraph)
├── generator.ts                # Core: buildCourseGraph(), buildLessonGraph()
├── cache.ts                    # Redis caching with hierarchical keys
├── simulator.ts                # D3 force simulation logic (positions)
├── query.ts                    # Database queries (lessons, modules, progress)
├── utils.ts                    # Helpers: filterByDepth(), calculateStats()
└── __tests__/
    ├── generator.test.ts       # Unit tests for graph generation
    ├── cache.test.ts           # Cache hit/miss scenarios
    └── simulator.test.ts       # Force simulation tests
```

**Pattern Match**: Mirrors `/src/lib/courses/` structure (progress.ts, query.ts, duration-calculator.ts)

---

### API Routes (`/src/app/api/courses/`)
```
src/app/api/courses/
├── [courseId]/
│   └── graph/
│       └── route.ts            # GET /api/courses/:courseId/graph
└── [courseId]/
    └── lessons/
        └── [lessonSlug]/
            └── graph/
                └── route.ts    # GET /api/courses/:courseId/lessons/:lessonSlug/graph
```

**Pattern Match**: Follows `/src/app/api/courses/[courseId]/progress/route.ts` structure

**API Route Template** (Production Pattern):
```typescript
// src/app/api/courses/[courseId]/graph/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Types } from 'mongoose';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import User from '@/models/User';
import { buildCourseGraph } from '@/lib/graph/generator';
import { getCachedGraph, setCachedGraph } from '@/lib/graph/cache';

// Query parameter validation (Zod - production pattern)
const QuerySchema = z.object({
  depth: z.coerce.number().int().min(1).max(3).default(2),
  includeProgress: z.enum(['true', 'false']).optional(),
});

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ courseId: string }> }
) {
  try {
    // 1. Auth check (standard pattern)
    const { userId } = await auth();
    // Note: Public graph allowed (userId optional)

    // 2. Parse + validate query params
    const { searchParams } = new URL(req.url);
    const queryResult = QuerySchema.safeParse({
      depth: searchParams.get('depth'),
      includeProgress: searchParams.get('includeProgress'),
    });

    if (!queryResult.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: queryResult.error.issues },
        { status: 400 }
      );
    }

    const { depth, includeProgress } = queryResult.data;

    // 3. Database connection
    await connectToDatabase();

    // 4. Course lookup (slug or ObjectId)
    const { courseId } = await ctx.params;
    const query = Types.ObjectId.isValid(courseId)
      ? { _id: new Types.ObjectId(courseId) }
      : { slug: courseId };

    const course = await CourseModel.findOne(query).lean();
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // 5. User lookup (for progress)
    let userObjectId: Types.ObjectId | null = null;
    if (userId && includeProgress === 'true') {
      const userDoc = await User.findOne({ clerkId: userId }).lean();
      userObjectId = userDoc?._id || null;
    }

    // 6. Check cache (production pattern)
    const cacheKey = userObjectId
      ? `graph:course:${course._id}:user:${userObjectId}`
      : `graph:course:${course._id}:public`;

    const cached = await getCachedGraph(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      });
    }

    // 7. Generate graph
    const graph = await buildCourseGraph({
      courseId: course._id,
      userId: userObjectId,
      depth,
      includeProgress: includeProgress === 'true',
    });

    // 8. Cache result (5-minute TTL)
    await setCachedGraph(cacheKey, graph, 300);

    // 9. Return response
    return NextResponse.json(graph, {
      headers: { 'X-Cache': 'MISS' },
    });
  } catch (error) {
    console.error('[GraphAPI] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
```

---

### Components (`/src/components/courses/`)
```
src/components/courses/
├── KnowledgeGraph.tsx          # Main graph component (container)
├── GraphCanvas.tsx             # SVG + D3 simulation rendering
├── GraphControls.tsx           # Zoom/pan/filter UI
├── GraphNodeTooltip.tsx        # Node hover details
└── __tests__/
    ├── KnowledgeGraph.test.tsx
    └── GraphCanvas.test.tsx
```

**Pattern Match**: Mirrors `/src/components/courses/QuizTaker.tsx` structure

**Component Template** (Production Pattern with SWR):
```typescript
// src/components/courses/KnowledgeGraph.tsx
'use client';

import { useState, useCallback } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { GraphCanvas } from './GraphCanvas';
import { GraphControls } from './GraphControls';
import type { KnowledgeGraph } from '@/lib/graph/types';

interface KnowledgeGraphProps {
  courseSlug: string;
  lessonSlug?: string; // Optional: for lesson-level graph
  includeProgress?: boolean;
}

// SWR fetcher (production pattern)
const fetcher = (url: string) =>
  fetch(url, { credentials: 'include' }).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export function KnowledgeGraph({
  courseSlug,
  lessonSlug,
  includeProgress = false,
}: KnowledgeGraphProps) {
  const [depth, setDepth] = useState(2);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Build API URL
  const apiUrl = lessonSlug
    ? `/api/courses/${courseSlug}/lessons/${lessonSlug}/graph?depth=${depth}&includeProgress=${includeProgress}`
    : `/api/courses/${courseSlug}/graph?depth=${depth}&includeProgress=${includeProgress}`;

  // SWR data fetching (production pattern)
  const { data, error, isLoading } = useSWR<KnowledgeGraph>(
    isOpen ? apiUrl : null, // Only fetch when open
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Error handling
  if (error) {
    toast({
      title: 'Error loading graph',
      description: error.message,
      variant: 'destructive',
    });
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Knowledge Graph</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? 'Hide' : 'Show'} Graph
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent>
          {/* Controls */}
          <GraphControls depth={depth} onDepthChange={setDepth} />

          {/* Loading State */}
          {isLoading && (
            <Skeleton className="w-full h-[600px] rounded-md" />
          )}

          {/* Graph Canvas */}
          {data && !isLoading && (
            <GraphCanvas
              graph={data}
              onNodeClick={(nodeId) => {
                // Navigate to lesson
                window.location.href = `/courses/${courseSlug}/lessons/${nodeId}`;
              }}
            />
          )}

          {/* Empty State */}
          {!data && !isLoading && !error && (
            <div className="text-center py-12 text-muted-foreground">
              No graph data available
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
```

---

## 🔧 Production Module: Graph Generator

### Core Logic (`/src/lib/graph/generator.ts`)

```typescript
import { Types } from 'mongoose';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import type { KnowledgeGraph, GraphNode, GraphEdge } from './types';

export interface BuildGraphOptions {
  courseId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  depth?: number;
  includeProgress?: boolean;
}

/**
 * Build complete course knowledge graph
 * Pattern: Mirrors /src/lib/courses/progress.ts structure
 */
export async function buildCourseGraph(
  options: BuildGraphOptions
): Promise<KnowledgeGraph> {
  const { courseId, userId, depth = 2, includeProgress = false } = options;

  // 1. Fetch course structure (production pattern from progress.ts)
  const [modules, lessons] = await Promise.all([
    CourseModuleModel.find({ courseId })
      .sort({ order: 1 })
      .select('_id title order lessonIds')
      .lean(),
    CourseLessonModel.find({ courseId })
      .select('_id slug title moduleId parentLessonId prerequisiteLessonIds')
      .lean(),
  ]);

  // 2. Build lookup maps
  const lessonMap = new Map<string, any>();
  lessons.forEach((l) => lessonMap.set(l._id.toString(), l));

  // 3. Fetch user progress (if authenticated)
  let completedIds = new Set<string>();
  if (userId && includeProgress) {
    const enrollment = await CourseEnrollmentModel.findOne({
      courseId,
      userId,
    }).lean();

    if (enrollment) {
      const progress = await CourseProgressModel.findOne({
        enrollmentId: enrollment._id,
      })
        .select('completedLessonIds')
        .lean();

      if (progress?.completedLessonIds) {
        completedIds = new Set(
          progress.completedLessonIds.map((id: any) => id.toString())
        );
      }
    }
  }

  // 4. Build nodes
  const nodes: GraphNode[] = [];

  // Add module nodes
  modules.forEach((module) => {
    nodes.push({
      id: module._id.toString(),
      type: 'module',
      label: module.title,
      metadata: {
        order: module.order,
        lessonCount: module.lessonIds?.length || 0,
      },
    });
  });

  // Add lesson nodes
  lessons.forEach((lesson) => {
    const isCompleted = completedIds.has(lesson._id.toString());
    const isLocked = checkIfLocked(lesson, completedIds, lessonMap);

    nodes.push({
      id: lesson._id.toString(),
      type: lesson.parentLessonId ? 'sublesson' : 'lesson',
      label: lesson.title,
      status: isCompleted ? 'completed' : isLocked ? 'locked' : 'available',
      metadata: {
        slug: lesson.slug,
        moduleId: lesson.moduleId.toString(),
        parentLessonId: lesson.parentLessonId?.toString(),
      },
    });
  });

  // 5. Build edges
  const edges: GraphEdge[] = [];

  // Module → Lesson edges
  modules.forEach((module) => {
    (module.lessonIds || []).forEach((lessonId: any) => {
      edges.push({
        source: module._id.toString(),
        target: lessonId.toString(),
        type: 'contains',
      });
    });
  });

  // Prerequisite edges
  lessons.forEach((lesson) => {
    (lesson.prerequisiteLessonIds || []).forEach((prereqId: any) => {
      edges.push({
        source: prereqId.toString(),
        target: lesson._id.toString(),
        type: 'prerequisite',
      });
    });
  });

  // Parent → Child edges
  lessons.forEach((lesson) => {
    if (lesson.parentLessonId) {
      edges.push({
        source: lesson.parentLessonId.toString(),
        target: lesson._id.toString(),
        type: 'parent-child',
      });
    }
  });

  // 6. Return graph
  return {
    nodes,
    edges,
    metadata: {
      courseId: courseId.toString(),
      nodeCount: nodes.length,
      edgeCount: edges.length,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Check if lesson is locked based on prerequisites
 */
function checkIfLocked(
  lesson: any,
  completedIds: Set<string>,
  lessonMap: Map<string, any>
): boolean {
  if (!lesson.prerequisiteLessonIds?.length) return false;

  return lesson.prerequisiteLessonIds.some(
    (prereqId: any) => !completedIds.has(prereqId.toString())
  );
}
```

---

## 🗄️ Production Module: Redis Caching

### Cache Layer (`/src/lib/graph/cache.ts`)

```typescript
import { cache } from '@/lib/redis';
import type { KnowledgeGraph } from './types';

/**
 * Cache key generators (production pattern from /src/lib/redis.ts)
 */
export const GraphCacheKeys = {
  courseGraph: (courseId: string, userId?: string) =>
    userId
      ? `graph:course:${courseId}:user:${userId}`
      : `graph:course:${courseId}:public`,

  lessonGraph: (lessonId: string, userId?: string, depth = 2) =>
    userId
      ? `graph:lesson:${lessonId}:user:${userId}:depth:${depth}`
      : `graph:lesson:${lessonId}:public:depth:${depth}`,
};

/**
 * Get cached graph (production pattern)
 */
export async function getCachedGraph(
  key: string
): Promise<KnowledgeGraph | null> {
  try {
    return await cache.get<KnowledgeGraph>(key);
  } catch (error) {
    console.error('[GraphCache] Get error:', error);
    return null;
  }
}

/**
 * Set cached graph with TTL
 */
export async function setCachedGraph(
  key: string,
  graph: KnowledgeGraph,
  ttl = 300 // 5 minutes default
): Promise<void> {
  try {
    await cache.set(key, graph, ttl);
  } catch (error) {
    console.error('[GraphCache] Set error:', error);
  }
}

/**
 * Invalidate course graph cache (all variations)
 * Call after: lesson CRUD, prerequisite changes, module updates
 */
export async function invalidateCourseGraph(
  courseId: string
): Promise<void> {
  try {
    const pattern = `graph:course:${courseId}:*`;
    const deleted = await cache.delPattern(pattern);
    console.log(`[GraphCache] Invalidated ${deleted} keys for course ${courseId}`);
  } catch (error) {
    console.error('[GraphCache] Invalidation error:', error);
  }
}

/**
 * Invalidate lesson graph cache
 */
export async function invalidateLessonGraph(
  lessonId: string
): Promise<void> {
  try {
    const pattern = `graph:lesson:${lessonId}:*`;
    const deleted = await cache.delPattern(pattern);
    console.log(`[GraphCache] Invalidated ${deleted} keys for lesson ${lessonId}`);
  } catch (error) {
    console.error('[GraphCache] Invalidation error:', error);
  }
}

/**
 * Invalidate user-specific progress cache
 * Call after: user completes lesson
 */
export async function invalidateUserProgress(
  userId: string,
  courseId: string
): Promise<void> {
  try {
    const patterns = [
      `graph:course:${courseId}:user:${userId}`,
      `graph:lesson:*:user:${userId}:*`,
    ];

    let totalDeleted = 0;
    for (const pattern of patterns) {
      totalDeleted += await cache.delPattern(pattern);
    }

    console.log(`[GraphCache] Invalidated ${totalDeleted} keys for user ${userId}`);
  } catch (error) {
    console.error('[GraphCache] User invalidation error:', error);
  }
}
```

---

## 🧪 Testing Strategy (Production Patterns)

### Contract Tests (`/src/__tests__/api/course-graph.contract.test.ts`)

```typescript
import { describe, it, expect, beforeAll } from 'vitest';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import { buildCourseGraph } from '@/lib/graph/generator';

describe('Contract: Course Graph API', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  it('should return valid graph structure for published course', async () => {
    // Find a published course
    const course = await CourseModel.findOne({
      status: 'published',
      visibility: 'public',
    }).lean();

    if (!course) {
      console.log('No published courses found, skipping test');
      return;
    }

    // Generate graph
    const graph = await buildCourseGraph({
      courseId: course._id,
    });

    // Validate structure
    expect(graph).toHaveProperty('nodes');
    expect(graph).toHaveProperty('edges');
    expect(graph).toHaveProperty('metadata');
    expect(Array.isArray(graph.nodes)).toBe(true);
    expect(Array.isArray(graph.edges)).toBe(true);

    // Validate node structure
    if (graph.nodes.length > 0) {
      const node = graph.nodes[0];
      expect(node).toHaveProperty('id');
      expect(node).toHaveProperty('type');
      expect(node).toHaveProperty('label');
      expect(['module', 'lesson', 'sublesson']).toContain(node.type);
    }

    // Validate edge structure
    if (graph.edges.length > 0) {
      const edge = graph.edges[0];
      expect(edge).toHaveProperty('source');
      expect(edge).toHaveProperty('target');
      expect(edge).toHaveProperty('type');
      expect(['contains', 'prerequisite', 'parent-child']).toContain(edge.type);
    }

    // Validate metadata
    expect(graph.metadata).toHaveProperty('courseId');
    expect(graph.metadata).toHaveProperty('nodeCount');
    expect(graph.metadata).toHaveProperty('edgeCount');
    expect(graph.metadata.nodeCount).toBe(graph.nodes.length);
    expect(graph.metadata.edgeCount).toBe(graph.edges.length);
  });

  it('should handle user progress when authenticated', async () => {
    // Test with mock user ID
    const mockUserId = new Types.ObjectId();
    const course = await CourseModel.findOne({ status: 'published' }).lean();

    if (!course) return;

    const graph = await buildCourseGraph({
      courseId: course._id,
      userId: mockUserId,
      includeProgress: true,
    });

    // Should not fail even if no enrollment exists
    expect(graph).toBeDefined();
    expect(graph.nodes.length).toBeGreaterThan(0);
  });
});
```

---

## 🔗 Integration Points

### Cache Invalidation Hooks

**Add to existing lesson CRUD routes:**

```typescript
// src/app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/route.ts

import { invalidateCourseGraph } from '@/lib/graph/cache';

// After lesson creation/update/delete:
export async function POST(req, ctx) {
  // ... existing logic ...

  // Invalidate graph cache
  await invalidateCourseGraph(courseId.toString());

  return NextResponse.json({ success: true });
}
```

**Add to progress update route:**

```typescript
// src/app/api/courses/[courseId]/progress/complete-lesson/route.ts

import { invalidateUserProgress } from '@/lib/graph/cache';

// After lesson completion:
await invalidateUserProgress(userId.toString(), courseId.toString());
```

---

## 📦 NPM Dependencies (Final List)

**Add to package.json:**

```json
{
  "dependencies": {
    "d3-force": "^3.0.0",
    "d3-zoom": "^3.0.0",
    "d3-drag": "^3.0.0",
    "d3-selection": "^3.0.0"
  },
  "devDependencies": {
    "@types/d3-force": "^3.0.10",
    "@types/d3-zoom": "^3.0.8",
    "@types/d3-drag": "^3.0.7",
    "@types/d3-selection": "^3.0.10"
  }
}
```

**Install command:**
```bash
pnpm add d3-force d3-zoom d3-drag d3-selection
pnpm add -D @types/d3-force @types/d3-zoom @types/d3-drag @types/d3-selection
```

---

## 🎨 UI/UX Integration Points

### 1. Course Page Integration
**File**: `src/app/courses/[slug]/page.tsx`

```tsx
import { KnowledgeGraph } from '@/components/courses/KnowledgeGraph';

export default function CoursePage({ params }) {
  return (
    <div>
      {/* Existing course content */}
      
      {/* Add graph as toggleable section */}
      <section className="mt-8">
        <KnowledgeGraph
          courseSlug={params.slug}
          includeProgress={true} // If user is enrolled
        />
      </section>
    </div>
  );
}
```

### 2. Lesson Page Integration
**File**: `src/app/courses/[slug]/lessons/[lessonSlug]/page.tsx`

```tsx
import { KnowledgeGraph } from '@/components/courses/KnowledgeGraph';

export default function LessonPage({ params }) {
  return (
    <div>
      {/* Existing lesson content */}
      
      {/* Add local lesson graph */}
      <aside className="mt-8">
        <KnowledgeGraph
          courseSlug={params.slug}
          lessonSlug={params.lessonSlug}
          includeProgress={true}
        />
      </aside>
    </div>
  );
}
```

---

## 📊 Performance Monitoring

### Metrics to Track

```typescript
// Add to API route
const startTime = Date.now();

// ... generate graph ...

const duration = Date.now() - startTime;
console.log(`[GraphAPI] Generated in ${duration}ms`);

if (duration > 500) {
  console.warn(`[GraphAPI] Slow generation: ${duration}ms`);
}
```

### Benchmarks
- ✅ Graph generation: < 200ms (target)
- ✅ API response (with cache): < 50ms
- ✅ API response (cache miss): < 500ms
- ✅ Component render: < 400ms
- ✅ Zoom/pan: 60fps (16ms/frame)

---

## ✅ Summary

### Production-Ready Checklist

- ✅ **API Routes**: Follow established patterns (auth, validation, error handling)
- ✅ **Library Structure**: Domain-driven `/lib/graph/` matching `/lib/courses/`
- ✅ **Components**: SWR data fetching, shadcn/ui, responsive design
- ✅ **Caching**: Redis with hierarchical keys, TTL, invalidation hooks
- ✅ **Testing**: Contract tests, unit tests, integration tests
- ✅ **Types**: Full TypeScript coverage, Zod validation
- ✅ **Error Handling**: Toast notifications, error boundaries, fallbacks
- ✅ **Performance**: < 500ms API, < 400ms render, 60fps interactions
- ✅ **Accessibility**: ARIA labels, keyboard nav, screen reader support
- ✅ **Integration**: Minimal changes to existing code, cache invalidation hooks

### Next Steps

1. **Phase 1**: Create OpenAPI contracts + contract tests
2. **Phase 2**: Generate tasks.md (30-35 tasks)
3. **Phase 3**: Install D3 dependencies
4. **Phase 4**: Implement library layer (types, generator, cache)
5. **Phase 5**: Implement API routes
6. **Phase 6**: Implement components
7. **Phase 7**: Integration + testing
8. **Phase 8**: Performance optimization

**Estimated Timeline**: 4 weeks (2-3 hours/day)

---

**Ready for Phase 1: Design & Contracts** ✅
