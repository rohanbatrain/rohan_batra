# API Reference: Knowledge Graph Endpoints

**Feature**: Course Knowledge Graph  
**Date**: October 7, 2025  
**Base URL**: `/api/courses/[slug]`

---

## Endpoints

### 1. Get Global Course Graph

**GET** `/api/courses/[slug]/graph`

Returns the complete knowledge graph for a course, showing all modules, lessons, and their relationships.

#### Request

**URL Parameters**:
- `slug` (string, required): Course slug identifier

**Query Parameters**:
- `includeModules` (boolean, optional): Include module nodes (default: `true`)
- `includeSiblings` (boolean, optional): Include sibling edges between sub-lessons (default: `false`)
- `layout` (string, optional): Preferred layout hint (`force`, `hierarchical`, `radial`, default: `force`)

**Headers**:
- `Authorization` (optional): Bearer token for user-specific data (progress, locked status)

**Example**:
```bash
GET /api/courses/typescript/graph?includeModules=true&layout=force
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Status**: 200 OK

**Body**:
```json
{
  "nodes": [
    {
      "id": "66f1234567890abcdef12345",
      "type": "module",
      "label": "Fundamentals",
      "size": 20,
      "shape": "rect",
      "color": "#3b82f6"
    },
    {
      "id": "66f1234567890abcdef12346",
      "type": "lesson",
      "label": "Introduction to TypeScript",
      "size": 12,
      "contentType": "blog",
      "duration": 30,
      "completed": true,
      "locked": false,
      "isCurrent": false,
      "href": "/courses/typescript/lessons/introduction",
      "slug": "introduction",
      "moduleId": "66f1234567890abcdef12345",
      "moduleName": "Fundamentals",
      "color": "#10b981",
      "icon": "book"
    },
    {
      "id": "66f1234567890abcdef12347",
      "type": "sublesson",
      "label": "Type Annotations",
      "size": 8,
      "contentType": "standalone",
      "duration": 15,
      "completed": false,
      "locked": false,
      "isCurrent": false,
      "href": "/courses/typescript/lessons/type-annotations",
      "slug": "type-annotations",
      "moduleId": "66f1234567890abcdef12345",
      "parentId": "66f1234567890abcdef12346",
      "color": "#8b5cf6",
      "icon": "file"
    }
  ],
  "edges": [
    {
      "id": "module-66f1234567890abcdef12345-66f1234567890abcdef12346",
      "source": "66f1234567890abcdef12345",
      "target": "66f1234567890abcdef12346",
      "type": "module-lesson",
      "weight": 1,
      "color": "#9ca3af"
    },
    {
      "id": "parent-66f1234567890abcdef12346-66f1234567890abcdef12347",
      "source": "66f1234567890abcdef12346",
      "target": "66f1234567890abcdef12347",
      "type": "parent-child",
      "color": "#8b5cf6",
      "weight": 2
    },
    {
      "id": "prereq-66f1234567890abcdef12346-66f1234567890abcdef12348",
      "source": "66f1234567890abcdef12346",
      "target": "66f1234567890abcdef12348",
      "type": "prerequisite",
      "directed": true,
      "style": "dashed",
      "color": "#f59e0b",
      "weight": 2
    }
  ],
  "metadata": {
    "courseId": "66f1234567890abcdef00000",
    "courseSlug": "typescript",
    "scope": "global",
    "nodeCount": 42,
    "edgeCount": 58,
    "maxDepth": 5,
    "moduleCount": 6,
    "lessonCount": 35,
    "sublessonCount": 7,
    "suggestedLayout": "force",
    "generatedAt": "2025-10-07T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### Error Responses

**404 Not Found**:
```json
{
  "error": "Course not found",
  "slug": "nonexistent-course"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Failed to generate course graph",
  "details": "Database connection timeout"
}
```

---

### 2. Get Local Lesson Graph

**GET** `/api/courses/[slug]/lessons/[lessonSlug]/graph`

Returns a focused sub-graph centered on a specific lesson, showing its immediate relationships (prerequisites, sub-lessons, next lessons).

#### Request

**URL Parameters**:
- `slug` (string, required): Course slug identifier
- `lessonSlug` (string, required): Lesson slug identifier

**Query Parameters**:
- `depth` (number, optional): Relationship depth (1-3, default: `1`)
  - `1`: Only immediate connections (prerequisites, sub-lessons, next lessons)
  - `2`: Include prerequisites of prerequisites, etc.
  - `3`: Full neighborhood
- `maxNodes` (number, optional): Maximum nodes to return (5-50, default: `20`)

**Headers**:
- `Authorization` (optional): Bearer token for user-specific data

**Example**:
```bash
GET /api/courses/typescript/lessons/introduction/graph?depth=1&maxNodes=20
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Response

**Status**: 200 OK

**Body**:
```json
{
  "nodes": [
    {
      "id": "66f1234567890abcdef12346",
      "type": "lesson",
      "label": "Introduction to TypeScript",
      "size": 16,
      "isCurrent": true,
      "contentType": "blog",
      "duration": 30,
      "href": "/courses/typescript/lessons/introduction",
      "color": "#3b82f6",
      "icon": "book"
    },
    {
      "id": "66f1234567890abcdef12347",
      "type": "sublesson",
      "label": "Type Annotations",
      "size": 10,
      "completed": false,
      "contentType": "standalone",
      "duration": 15,
      "href": "/courses/typescript/lessons/type-annotations",
      "parentId": "66f1234567890abcdef12346",
      "color": "#8b5cf6",
      "icon": "file"
    },
    {
      "id": "66f1234567890abcdef12348",
      "type": "lesson",
      "label": "Advanced Types",
      "size": 10,
      "locked": true,
      "contentType": "video",
      "href": "/courses/typescript/lessons/advanced-types",
      "color": "#6b7280",
      "icon": "video"
    }
  ],
  "edges": [
    {
      "id": "parent-66f1234567890abcdef12346-66f1234567890abcdef12347",
      "source": "66f1234567890abcdef12346",
      "target": "66f1234567890abcdef12347",
      "type": "parent-child",
      "color": "#8b5cf6"
    },
    {
      "id": "next-66f1234567890abcdef12346-66f1234567890abcdef12348",
      "source": "66f1234567890abcdef12346",
      "target": "66f1234567890abcdef12348",
      "type": "prerequisite",
      "directed": true,
      "style": "dashed",
      "color": "#6b7280"
    }
  ],
  "metadata": {
    "lessonId": "66f1234567890abcdef12346",
    "lessonSlug": "introduction",
    "courseId": "66f1234567890abcdef00000",
    "courseSlug": "typescript",
    "scope": "local",
    "nodeCount": 8,
    "edgeCount": 12,
    "maxDepth": 1,
    "suggestedLayout": "radial",
    "generatedAt": "2025-10-07T12:00:00.000Z",
    "version": "1.0.0"
  }
}
```

#### Error Responses

**404 Not Found** (Course):
```json
{
  "error": "Course not found",
  "slug": "nonexistent-course"
}
```

**404 Not Found** (Lesson):
```json
{
  "error": "Lesson not found",
  "lessonSlug": "nonexistent-lesson",
  "courseSlug": "typescript"
}
```

---

## Implementation Examples

### API Route: Global Course Graph

**File**: `src/app/api/courses/[slug]/graph/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { buildCourseGraph } from '@/lib/graph/generator';
import { CourseModel } from '@/models/Course';
import { z } from 'zod';

const querySchema = z.object({
  includeModules: z.enum(['true', 'false']).optional().default('true'),
  includeSiblings: z.enum(['true', 'false']).optional().default('false'),
  layout: z.enum(['force', 'hierarchical', 'radial']).optional().default('force'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // 1. Parse query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);

    // 2. Get user ID (if authenticated)
    const { userId } = auth();

    // 3. Find course
    const course = await CourseModel.findOne({ slug: params.slug });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', slug: params.slug },
        { status: 404 }
      );
    }

    // 4. Generate graph
    const graph = await buildCourseGraph({
      courseId: course._id.toString(),
      userId: userId || undefined,
      includeModules: query.includeModules === 'true',
      includeSiblings: query.includeSiblings === 'true',
      suggestedLayout: query.layout,
    });

    // 5. Return graph
    return NextResponse.json(graph);
  } catch (error) {
    console.error('[Graph API] Error generating course graph:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate course graph' },
      { status: 500 }
    );
  }
}
```

### API Route: Local Lesson Graph

**File**: `src/app/api/courses/[slug]/lessons/[lessonSlug]/graph/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { buildLessonGraph } from '@/lib/graph/generator';
import { CourseModel } from '@/models/Course';
import { CourseLessonModel } from '@/models/CourseLesson';
import { z } from 'zod';

const querySchema = z.object({
  depth: z.coerce.number().int().min(1).max(3).optional().default(1),
  maxNodes: z.coerce.number().int().min(5).max(50).optional().default(20),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; lessonSlug: string } }
) {
  try {
    // 1. Parse query params
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);

    // 2. Get user ID
    const { userId } = auth();

    // 3. Find course
    const course = await CourseModel.findOne({ slug: params.slug });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', slug: params.slug },
        { status: 404 }
      );
    }

    // 4. Find lesson
    const lesson = await CourseLessonModel.findOne({
      courseId: course._id,
      slug: params.lessonSlug,
    });
    if (!lesson) {
      return NextResponse.json(
        {
          error: 'Lesson not found',
          lessonSlug: params.lessonSlug,
          courseSlug: params.slug,
        },
        { status: 404 }
      );
    }

    // 5. Generate local graph
    const graph = await buildLessonGraph({
      lessonId: lesson._id.toString(),
      userId: userId || undefined,
      depth: query.depth,
      maxNodes: query.maxNodes,
    });

    // 6. Return graph
    return NextResponse.json(graph);
  } catch (error) {
    console.error('[Graph API] Error generating lesson graph:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate lesson graph' },
      { status: 500 }
    );
  }
}
```

---

## Client Usage Examples

### React Hook: useCourseGraph

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { KnowledgeGraph } from '@/lib/graph/types';

export function useCourseGraph(courseSlug: string) {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGraph() {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${courseSlug}/graph`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch graph: ${res.statusText}`);
        }
        
        const data = await res.json();
        setGraph(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (courseSlug) {
      fetchGraph();
    }
  }, [courseSlug]);

  return { graph, loading, error };
}

// Usage in component
export function CourseGraphView({ courseSlug }: { courseSlug: string }) {
  const { graph, loading, error } = useCourseGraph(courseSlug);

  if (loading) return <div>Loading graph...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!graph) return null;

  return <ForceGraph nodes={graph.nodes} edges={graph.edges} />;
}
```

### React Hook: useLessonGraph

```typescript
'use client';

import { useState, useEffect } from 'react';
import type { KnowledgeGraph } from '@/lib/graph/types';

export function useLessonGraph(
  courseSlug: string,
  lessonSlug: string,
  depth: number = 1
) {
  const [graph, setGraph] = useState<KnowledgeGraph | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGraph() {
      try {
        setLoading(true);
        const url = `/api/courses/${courseSlug}/lessons/${lessonSlug}/graph?depth=${depth}`;
        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch graph: ${res.statusText}`);
        }
        
        const data = await res.json();
        setGraph(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    if (courseSlug && lessonSlug) {
      fetchGraph();
    }
  }, [courseSlug, lessonSlug, depth]);

  return { graph, loading, error, refetch: () => setLoading(true) };
}

// Usage in component
export function LessonGraphView({
  courseSlug,
  lessonSlug,
}: {
  courseSlug: string;
  lessonSlug: string;
}) {
  const { graph, loading, error } = useLessonGraph(courseSlug, lessonSlug, 1);

  if (loading) return <div>Loading lesson connections...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!graph) return null;

  return (
    <RadialGraph
      centerNode={graph.nodes.find(n => n.isCurrent)!}
      nodes={graph.nodes}
      edges={graph.edges}
    />
  );
}
```

---

## Caching Strategy

### Server-Side Caching

**Redis Cache Keys**:
```
graph:course:{courseId}:user:{userId}           // User-specific
graph:course:{courseId}:public                  // Anonymous
graph:lesson:{lessonId}:user:{userId}:depth:{depth}
graph:lesson:{lessonId}:public:depth:{depth}
```

**TTL**:
- Course graphs: 5 minutes
- Lesson graphs: 5 minutes
- Public graphs: 30 minutes

**Implementation**:
```typescript
import { redis } from '@/lib/redis';

async function getCachedGraph(
  cacheKey: string,
  generator: () => Promise<KnowledgeGraph>
): Promise<KnowledgeGraph> {
  // 1. Try cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. Generate
  const graph = await generator();

  // 3. Cache (fire-and-forget)
  redis.setex(cacheKey, 300, JSON.stringify(graph)).catch(console.error);

  return graph;
}

// Usage
export async function buildCourseGraph(options: BuildOptions) {
  const cacheKey = options.userId
    ? `graph:course:${options.courseId}:user:${options.userId}`
    : `graph:course:${options.courseId}:public`;

  return getCachedGraph(cacheKey, async () => {
    // ... graph generation logic ...
  });
}
```

### Cache Invalidation

**Invalidate on**:
- Lesson CRUD operations
- Module structure changes
- Prerequisite updates
- User progress updates (user-specific only)

**Implementation**:
```typescript
// After lesson update
await redis.del(`graph:course:${courseId}:*`);
await redis.del(`graph:lesson:${lessonId}:*`);

// After user completes lesson
await redis.del(`graph:course:${courseId}:user:${userId}`);
await redis.del(`graph:lesson:*:user:${userId}:*`);
```

---

## Testing Examples

### API Test: Global Course Graph

```typescript
import { expect, test } from 'vitest';
import { GET } from './route';
import { mockCourse, mockLessons, mockModules } from '@/test/fixtures';

test('GET /api/courses/[slug]/graph - returns full course graph', async () => {
  // Arrange
  const request = new Request('http://localhost/api/courses/typescript/graph');
  const params = { slug: 'typescript' };

  // Act
  const response = await GET(request as any, { params });
  const data = await response.json();

  // Assert
  expect(response.status).toBe(200);
  expect(data.nodes).toBeDefined();
  expect(data.edges).toBeDefined();
  expect(data.metadata.scope).toBe('global');
  expect(data.metadata.courseSlug).toBe('typescript');
  expect(data.nodes.length).toBeGreaterThan(0);
});

test('GET /api/courses/[slug]/graph - returns 404 for nonexistent course', async () => {
  // Arrange
  const request = new Request('http://localhost/api/courses/nonexistent/graph');
  const params = { slug: 'nonexistent' };

  // Act
  const response = await GET(request as any, { params });
  const data = await response.json();

  // Assert
  expect(response.status).toBe(404);
  expect(data.error).toBe('Course not found');
});
```

### API Test: Local Lesson Graph

```typescript
test('GET /api/courses/[slug]/lessons/[lessonSlug]/graph - returns lesson sub-graph', async () => {
  // Arrange
  const url = 'http://localhost/api/courses/typescript/lessons/introduction/graph?depth=1';
  const request = new Request(url);
  const params = { slug: 'typescript', lessonSlug: 'introduction' };

  // Act
  const response = await GET(request as any, { params });
  const data = await response.json();

  // Assert
  expect(response.status).toBe(200);
  expect(data.metadata.scope).toBe('local');
  expect(data.metadata.lessonSlug).toBe('introduction');
  expect(data.nodes.some(n => n.isCurrent)).toBe(true);
  expect(data.nodes.length).toBeLessThanOrEqual(20); // default maxNodes
});
```

---

## Performance Considerations

### Query Optimization

1. **Use indexes**:
   ```typescript
   // CourseLesson model
   lessonSchema.index({ courseId: 1, parentLessonId: 1 });
   lessonSchema.index({ courseId: 1, prerequisiteLessonIds: 1 });
   ```

2. **Batch queries**:
   ```typescript
   // Fetch all lessons at once (instead of N+1)
   const lessons = await CourseLessonModel.find({ courseId });
   ```

3. **Limit depth**:
   ```typescript
   // Prevent infinite recursion in deep prerequisite chains
   const MAX_DEPTH = 10;
   ```

### Response Size

- **Global graphs**: Typically 10-100 KB (50-200 nodes)
- **Local graphs**: Typically 2-20 KB (5-30 nodes)
- **Compression**: Enable gzip in Next.js config

---

## Summary

✅ **Two REST endpoints** - global course graph and local lesson graph  
✅ **User-aware** - incorporates progress when authenticated  
✅ **Flexible queries** - depth, layout, filtering options  
✅ **Cached** - Redis caching with smart invalidation  
✅ **Type-safe** - Zod validation, TypeScript interfaces  
✅ **Tested** - comprehensive test coverage  

The API provides efficient, cacheable access to knowledge graph data for visualization components.