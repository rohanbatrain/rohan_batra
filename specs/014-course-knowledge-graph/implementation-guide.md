# Implementation Guide: Knowledge Graph Feature

**Feature**: Course Knowledge Graph Visualization  
**Date**: October 7, 2025  
**Timeline**: 4 weeks (20 working days)

---

## Quick Start

### Prerequisites

- ✅ Existing course system with `CourseLesson`, `CourseModule`, `CourseProgress` models
- ✅ D3.js available via `recharts` dependency
- ✅ React 18+ with hooks support
- ✅ TypeScript 5+
- ✅ Next.js 14+ App Router

### Installation

**No new packages needed** - D3.js is already available via `recharts`:
```bash
# Verify existing dependencies
grep "recharts" package.json
# Should show: "recharts": "^2.x.x" (includes d3-* sub-packages)
```

### File Structure

Create the following directory structure:
```
src/
├── lib/
│   └── graph/
│       ├── types.ts                    # TypeScript interfaces
│       ├── generator.ts                # Graph generation logic
│       ├── layout.ts                   # D3 layout algorithms
│       └── colors.ts                   # Color schemes
├── components/
│   └── graph/
│       ├── ForceGraph.tsx              # Force-directed layout
│       ├── RadialGraph.tsx             # Radial layout (lesson-centric)
│       ├── GraphNode.tsx               # Individual node component
│       ├── GraphEdge.tsx               # Edge/link component
│       ├── GraphControls.tsx           # Zoom/pan/reset controls
│       ├── GraphLegend.tsx             # Node type legend
│       └── GraphToggle.tsx             # Collapsible container
├── app/
│   └── api/
│       └── courses/
│           └── [slug]/
│               ├── graph/
│               │   └── route.ts        # GET /api/courses/[slug]/graph
│               └── lessons/
│                   └── [lessonSlug]/
│                       └── graph/
│                           └── route.ts  # GET /api/courses/.../lessons/.../graph
└── app/
    └── courses/
        └── [slug]/
            ├── page.tsx                # Course page (global graph)
            └── lessons/
                └── [slug]/
                    └── page.tsx        # Lesson page (local graph)
```

---

## Phase 1: Data Layer (Week 1, Days 1-5)

### Step 1.1: Create Type Definitions

**File**: `src/lib/graph/types.ts`

```typescript
// Node types
export type NodeType = 'course' | 'module' | 'lesson' | 'sublesson' | 'topic';
export type ContentType = 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards';
export type IconType = 'book' | 'file' | 'video' | 'clipboard' | 'cards';

export interface GraphNode {
  // Identity
  id: string;
  type: NodeType;
  label: string;
  
  // Display
  size?: number;
  color?: string;
  icon?: IconType;
  shape?: 'circle' | 'rect' | 'diamond';
  
  // Metadata
  duration?: number;
  completed?: boolean;
  locked?: boolean;
  contentType?: ContentType;
  progress?: number;
  
  // Navigation
  href?: string;
  slug?: string;
  
  // Layout (D3)
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  
  // Relationships
  moduleId?: string;
  moduleName?: string;
  parentId?: string;
  
  // State
  isHighlighted?: boolean;
  isCurrent?: boolean;
  isHovered?: boolean;
}

// Edge types
export type EdgeType = 
  | 'prerequisite' 
  | 'parent-child' 
  | 'sibling' 
  | 'related' 
  | 'module-lesson' 
  | 'sequential';

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  
  weight?: number;
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;
  label?: string;
  
  directed?: boolean;
  bidirectional?: boolean;
  
  strength?: number;
  distance?: number;
  
  isHighlighted?: boolean;
  isHovered?: boolean;
}

// Complete graph
export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: GraphMetadata;
}

export interface GraphMetadata {
  courseId?: string;
  courseSlug?: string;
  lessonId?: string;
  lessonSlug?: string;
  scope: 'global' | 'local';
  
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;
  moduleCount?: number;
  lessonCount?: number;
  sublessonCount?: number;
  
  suggestedLayout?: 'force' | 'hierarchical' | 'radial';
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  
  generatedAt: string;
  expiresAt?: string;
  version: string;
}
```

**Test**:
```bash
pnpm typecheck  # Should pass
```

---

### Step 1.2: Create Color Utilities

**File**: `src/lib/graph/colors.ts`

```typescript
import type { ContentType, NodeType } from './types';
import type { CourseLesson } from '@/models/CourseLesson';

export function getNodeColor(
  lesson: CourseLesson,
  isCompleted: boolean,
  isCurrent: boolean
): string {
  if (isCurrent) return '#3b82f6';      // blue
  if (isCompleted) return '#10b981';    // green
  if (lesson.parentLessonId) return '#8b5cf6'; // purple (sublesson)
  return '#6366f1';                     // indigo (lesson)
}

export function getModuleColor(order: number): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];
  return colors[order % colors.length];
}

export function getContentTypeIcon(contentType: ContentType): string {
  const iconMap: Record<ContentType, string> = {
    blog: 'book',
    standalone: 'file',
    video: 'video',
    quiz: 'clipboard',
    flashcards: 'cards',
  };
  return iconMap[contentType];
}

export function getEdgeColor(edgeType: string): string {
  const colorMap: Record<string, string> = {
    prerequisite: '#f59e0b',    // orange
    'parent-child': '#8b5cf6',  // purple
    'module-lesson': '#9ca3af', // gray
    sibling: '#d1d5db',         // light gray
    sequential: '#6b7280',      // dark gray
    related: '#3b82f6',         // blue
  };
  return colorMap[edgeType] || '#6b7280';
}
```

---

### Step 1.3: Create Graph Generator

**File**: `src/lib/graph/generator.ts`

```typescript
import type { KnowledgeGraph, GraphNode, GraphEdge } from './types';
import { CourseModel } from '@/models/Course';
import { CourseModuleModel } from '@/models/CourseModule';
import { CourseLessonModel } from '@/models/CourseLesson';
import { CourseProgressModel } from '@/models/CourseProgress';
import { getNodeColor, getModuleColor, getContentTypeIcon, getEdgeColor } from './colors';

interface BuildCourseGraphOptions {
  courseId: string;
  userId?: string;
  includeModules?: boolean;
  includeSiblings?: boolean;
  suggestedLayout?: 'force' | 'hierarchical' | 'radial';
}

export async function buildCourseGraph(
  options: BuildCourseGraphOptions
): Promise<KnowledgeGraph> {
  const {
    courseId,
    userId,
    includeModules = true,
    includeSiblings = false,
    suggestedLayout = 'force',
  } = options;

  // 1. Fetch data
  const course = await CourseModel.findById(courseId);
  if (!course) throw new Error('Course not found');

  const modules = await CourseModuleModel.find({ courseId }).sort({ order: 1 });
  const lessons = await CourseLessonModel.find({ courseId }).sort({ order: 1 });
  
  const progress = userId
    ? await CourseProgressModel.findOne({ userId, courseId })
    : null;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // 2. Create module nodes (if enabled)
  if (includeModules) {
    for (const module of modules) {
      nodes.push({
        id: module._id.toString(),
        type: 'module',
        label: module.title,
        size: 20,
        shape: 'rect',
        color: getModuleColor(module.order),
      });
    }
  }

  // 3. Create lesson nodes
  for (const lesson of lessons) {
    const isCompleted = progress?.completedLessons.some(id => 
      id.toString() === lesson._id.toString()
    ) || false;
    const isCurrent = progress?.currentLessonId?.toString() === lesson._id.toString();

    nodes.push({
      id: lesson._id.toString(),
      type: lesson.parentLessonId ? 'sublesson' : 'lesson',
      label: lesson.title,
      size: lesson.parentLessonId ? 8 : 12,
      contentType: lesson.contentType,
      duration: lesson.estimatedDurationMinutes,
      completed: isCompleted,
      isCurrent: isCurrent,
      locked: !canAccessLesson(lesson, progress),
      href: `/courses/${course.slug}/lessons/${lesson.slug}`,
      slug: lesson.slug,
      moduleId: lesson.moduleId?.toString(),
      parentId: lesson.parentLessonId?.toString(),
      color: getNodeColor(lesson, isCompleted, isCurrent),
      icon: getContentTypeIcon(lesson.contentType),
    });
  }

  // 4. Create module-lesson edges
  if (includeModules) {
    for (const module of modules) {
      for (const lessonId of module.lessonIds) {
        const lesson = lessons.find(l => l._id.toString() === lessonId.toString());
        if (lesson && !lesson.parentLessonId) {
          edges.push({
            id: `module-${module._id}-${lessonId}`,
            source: module._id.toString(),
            target: lessonId.toString(),
            type: 'module-lesson',
            weight: 1,
            color: getEdgeColor('module-lesson'),
          });
        }
      }
    }
  }

  // 5. Create prerequisite edges
  for (const lesson of lessons) {
    for (const prereqId of lesson.prerequisiteLessonIds || []) {
      edges.push({
        id: `prereq-${prereqId}-${lesson._id}`,
        source: prereqId.toString(),
        target: lesson._id.toString(),
        type: 'prerequisite',
        directed: true,
        style: 'dashed',
        color: getEdgeColor('prerequisite'),
        weight: 2,
      });
    }
  }

  // 6. Create parent-child edges
  for (const lesson of lessons) {
    if (lesson.parentLessonId) {
      edges.push({
        id: `parent-${lesson.parentLessonId}-${lesson._id}`,
        source: lesson.parentLessonId.toString(),
        target: lesson._id.toString(),
        type: 'parent-child',
        color: getEdgeColor('parent-child'),
        weight: 2,
      });
    }
  }

  // 7. Create sibling edges (optional)
  if (includeSiblings) {
    const sublessonGroups = lessons
      .filter(l => l.parentLessonId)
      .reduce((acc, lesson) => {
        const key = lesson.parentLessonId!.toString();
        if (!acc[key]) acc[key] = [];
        acc[key].push(lesson);
        return acc;
      }, {} as Record<string, typeof lessons>);

    for (const siblings of Object.values(sublessonGroups)) {
      siblings.sort((a, b) => a.order - b.order);
      for (let i = 0; i < siblings.length - 1; i++) {
        edges.push({
          id: `sibling-${siblings[i]._id}-${siblings[i + 1]._id}`,
          source: siblings[i]._id.toString(),
          target: siblings[i + 1]._id.toString(),
          type: 'sibling',
          color: getEdgeColor('sibling'),
          weight: 1,
        });
      }
    }
  }

  return {
    nodes,
    edges,
    metadata: {
      courseId: courseId,
      courseSlug: course.slug,
      scope: 'global',
      nodeCount: nodes.length,
      edgeCount: edges.length,
      maxDepth: calculateMaxDepth(edges),
      moduleCount: includeModules ? modules.length : undefined,
      lessonCount: lessons.filter(l => !l.parentLessonId).length,
      sublessonCount: lessons.filter(l => l.parentLessonId).length,
      suggestedLayout,
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

interface BuildLessonGraphOptions {
  lessonId: string;
  userId?: string;
  depth?: number;
  maxNodes?: number;
}

export async function buildLessonGraph(
  options: BuildLessonGraphOptions
): Promise<KnowledgeGraph> {
  const { lessonId, userId, depth = 1, maxNodes = 20 } = options;

  // 1. Fetch lesson
  const lesson = await CourseLessonModel.findById(lessonId);
  if (!lesson) throw new Error('Lesson not found');

  const course = await CourseModel.findById(lesson.courseId);
  if (!course) throw new Error('Course not found');

  // 2. Fetch related lessons
  const sublessons = await CourseLessonModel.find({
    parentLessonId: lesson._id,
  }).sort({ order: 1 });

  const prerequisites = await CourseLessonModel.find({
    _id: { $in: lesson.prerequisiteLessonIds || [] },
  });

  const nextLessons = await CourseLessonModel.find({
    prerequisiteLessonIds: lesson._id,
    courseId: lesson.courseId,
  }).limit(5);

  // 3. Fetch progress
  const progress = userId
    ? await CourseProgressModel.findOne({ userId, courseId: lesson.courseId })
    : null;

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // 4. Create center node (current lesson)
  nodes.push({
    id: lesson._id.toString(),
    type: 'lesson',
    label: lesson.title,
    size: 16,
    isCurrent: true,
    contentType: lesson.contentType,
    duration: lesson.estimatedDurationMinutes,
    href: `/courses/${course.slug}/lessons/${lesson.slug}`,
    color: '#3b82f6',
    icon: getContentTypeIcon(lesson.contentType),
  });

  // 5. Add sub-lessons
  for (const sublesson of sublessons) {
    const isCompleted = progress?.completedLessons.some(id =>
      id.toString() === sublesson._id.toString()
    ) || false;

    nodes.push({
      id: sublesson._id.toString(),
      type: 'sublesson',
      label: sublesson.title,
      size: 10,
      completed: isCompleted,
      contentType: sublesson.contentType,
      duration: sublesson.estimatedDurationMinutes,
      href: `/courses/${course.slug}/lessons/${sublesson.slug}`,
      parentId: lesson._id.toString(),
      color: isCompleted ? '#10b981' : '#8b5cf6',
      icon: getContentTypeIcon(sublesson.contentType),
    });

    edges.push({
      id: `parent-${lesson._id}-${sublesson._id}`,
      source: lesson._id.toString(),
      target: sublesson._id.toString(),
      type: 'parent-child',
      color: getEdgeColor('parent-child'),
    });
  }

  // 6. Add prerequisites
  for (const prereq of prerequisites) {
    const isCompleted = progress?.completedLessons.some(id =>
      id.toString() === prereq._id.toString()
    ) || false;

    nodes.push({
      id: prereq._id.toString(),
      type: 'lesson',
      label: prereq.title,
      size: 10,
      completed: isCompleted,
      contentType: prereq.contentType,
      href: `/courses/${course.slug}/lessons/${prereq.slug}`,
      color: isCompleted ? '#10b981' : '#f59e0b',
      icon: getContentTypeIcon(prereq.contentType),
    });

    edges.push({
      id: `prereq-${prereq._id}-${lesson._id}`,
      source: prereq._id.toString(),
      target: lesson._id.toString(),
      type: 'prerequisite',
      directed: true,
      style: 'dashed',
      color: getEdgeColor('prerequisite'),
    });
  }

  // 7. Add next lessons
  for (const next of nextLessons) {
    nodes.push({
      id: next._id.toString(),
      type: 'lesson',
      label: next.title,
      size: 10,
      locked: true,
      contentType: next.contentType,
      href: `/courses/${course.slug}/lessons/${next.slug}`,
      color: '#6b7280',
      icon: getContentTypeIcon(next.contentType),
    });

    edges.push({
      id: `next-${lesson._id}-${next._id}`,
      source: lesson._id.toString(),
      target: next._id.toString(),
      type: 'prerequisite',
      directed: true,
      style: 'dashed',
      color: getEdgeColor('sequential'),
    });
  }

  // Limit nodes if needed
  if (nodes.length > maxNodes) {
    nodes.splice(maxNodes);
    // Remove edges with missing nodes
    const nodeIds = new Set(nodes.map(n => n.id));
    edges.splice(0, edges.length, ...edges.filter(e => 
      nodeIds.has(e.source) && nodeIds.has(e.target)
    ));
  }

  return {
    nodes,
    edges,
    metadata: {
      lessonId: lessonId,
      lessonSlug: lesson.slug,
      courseId: lesson.courseId.toString(),
      courseSlug: course.slug,
      scope: 'local',
      nodeCount: nodes.length,
      edgeCount: edges.length,
      maxDepth: depth,
      suggestedLayout: 'radial',
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}

// Helper functions
function canAccessLesson(
  lesson: any,
  progress: any | null
): boolean {
  if (!lesson.prerequisiteLessonIds?.length) return true;
  if (!progress) return false;

  return lesson.prerequisiteLessonIds.every((prereqId: any) =>
    progress.completedLessons.some((completed: any) =>
      completed.toString() === prereqId.toString()
    )
  );
}

function calculateMaxDepth(edges: GraphEdge[]): number {
  const graph = new Map<string, string[]>();
  edges
    .filter(e => e.type === 'prerequisite')
    .forEach(e => {
      if (!graph.has(e.source)) graph.set(e.source, []);
      graph.get(e.source)!.push(e.target);
    });

  function dfs(node: string, visited: Set<string>): number {
    visited.add(node);
    const neighbors = graph.get(node) || [];
    let maxDepth = 0;

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        maxDepth = Math.max(maxDepth, 1 + dfs(neighbor, visited));
      }
    }

    visited.delete(node);
    return maxDepth;
  }

  let maxDepth = 0;
  for (const node of graph.keys()) {
    maxDepth = Math.max(maxDepth, dfs(node, new Set()));
  }

  return maxDepth;
}
```

**Test**:
```bash
pnpm typecheck
```

---

### Step 1.4: Create API Routes

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
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);
    const { userId } = auth();

    const course = await CourseModel.findOne({ slug: params.slug });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', slug: params.slug },
        { status: 404 }
      );
    }

    const graph = await buildCourseGraph({
      courseId: course._id.toString(),
      userId: userId || undefined,
      includeModules: query.includeModules === 'true',
      includeSiblings: query.includeSiblings === 'true',
      suggestedLayout: query.layout,
    });

    return NextResponse.json(graph);
  } catch (error) {
    console.error('[Graph API] Error:', error);
    
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
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(searchParams);
    const { userId } = auth();

    const course = await CourseModel.findOne({ slug: params.slug });
    if (!course) {
      return NextResponse.json(
        { error: 'Course not found', slug: params.slug },
        { status: 404 }
      );
    }

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

    const graph = await buildLessonGraph({
      lessonId: lesson._id.toString(),
      userId: userId || undefined,
      depth: query.depth,
      maxNodes: query.maxNodes,
    });

    return NextResponse.json(graph);
  } catch (error) {
    console.error('[Graph API] Error:', error);
    
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

**Test**:
```bash
# Start dev server
pnpm dev

# Test APIs (replace with actual course slug)
curl http://localhost:3000/api/courses/typescript/graph
curl http://localhost:3000/api/courses/typescript/lessons/introduction/graph
```

---

## Phase 2: Visualization Layer (Week 2, Days 6-10)

### Step 2.1: Create D3 Layout Wrapper

**File**: `src/lib/graph/layout.ts`

```typescript
import * as d3 from 'd3';
import type { GraphNode, GraphEdge } from './types';

export interface LayoutNode extends GraphNode {
  x: number;
  y: number;
  vx?: number;
  vy?: number;
}

export interface LayoutEdge extends GraphEdge {
  source: LayoutNode;
  target: LayoutNode;
}

export function createForceSimulation(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number
): d3.Simulation<LayoutNode, LayoutEdge> {
  // Clone nodes (D3 mutates them)
  const layoutNodes: LayoutNode[] = nodes.map(n => ({
    ...n,
    x: n.x || width / 2,
    y: n.y || height / 2,
  }));

  // Convert edges to D3 format
  const layoutEdges: LayoutEdge[] = edges.map(e => {
    const source = layoutNodes.find(n => n.id === e.source)!;
    const target = layoutNodes.find(n => n.id === e.target)!;
    return { ...e, source, target };
  });

  // Create simulation
  const simulation = d3
    .forceSimulation<LayoutNode>(layoutNodes)
    .force(
      'link',
      d3
        .forceLink<LayoutNode, LayoutEdge>(layoutEdges)
        .id(d => d.id)
        .distance(d => d.distance || 100)
        .strength(d => d.strength || 0.5)
    )
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => (d.size || 10) + 10));

  return simulation;
}

export function createRadialLayout(
  nodes: GraphNode[],
  edges: GraphEdge[],
  centerX: number,
  centerY: number,
  radius: number
): LayoutNode[] {
  const layoutNodes: LayoutNode[] = [];
  const centerNode = nodes.find(n => n.isCurrent);

  if (!centerNode) {
    return nodes.map(n => ({ ...n, x: centerX, y: centerY }));
  }

  // Center node
  layoutNodes.push({ ...centerNode, x: centerX, y: centerY });

  // Radial placement for other nodes
  const otherNodes = nodes.filter(n => n.id !== centerNode.id);
  const angleStep = (2 * Math.PI) / otherNodes.length;

  otherNodes.forEach((node, i) => {
    const angle = i * angleStep;
    layoutNodes.push({
      ...node,
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    });
  });

  return layoutNodes;
}
```

---

### Step 2.2: Create Graph Components

**(Continue in next section due to length...)**

---

## Quick Commands Reference

### Development
```bash
# Start dev server
pnpm dev

# Type check
pnpm typecheck

# Run tests
pnpm test

# Build for production
pnpm build
```

### Testing APIs
```bash
# Global course graph
curl http://localhost:3000/api/courses/YOUR_SLUG/graph | jq

# Local lesson graph
curl "http://localhost:3000/api/courses/YOUR_SLUG/lessons/YOUR_LESSON_SLUG/graph?depth=1" | jq
```

### Database Queries (for debugging)
```bash
# Check lesson relationships
mongosh
> use your_database
> db.courselessons.find({ courseId: ObjectId("...") }).pretty()
```

---

## Troubleshooting

### Issue: "D3 is not defined"
**Solution**: Import from recharts dependencies:
```typescript
import * as d3 from 'd3-force';  // ✅ Correct
import * as d3 from 'd3';         // ❌ Won't work without full d3 package
```

### Issue: API returns 404
**Solution**: Check slug matches:
```typescript
// Verify course slug in database
const course = await CourseModel.findOne({ slug: 'your-slug' });
console.log(course?.slug);
```

### Issue: Graph not rendering
**Solution**: Check browser console for:
- SVG size (must be > 0)
- Node/edge data structure
- D3 simulation errors

---

## Next Steps

After completing Phase 1 (data layer):
1. ✅ APIs working and returning graph data
2. ⏭️ Move to Phase 2: Build visualization components
3. ⏭️ Phase 3: Add interactivity (zoom, pan, hover)
4. ⏭️ Phase 4: Polish and optimize

**Continue to**: Phase 2 implementation in next section...