# Data Model: Knowledge Graph System

**Feature**: Course Knowledge Graph  
**Date**: October 7, 2025

---

## Overview

The knowledge graph system visualizes relationships between course entities (courses, modules, lessons, sub-lessons) without requiring new database collections. It derives graph structures from existing relationships in the course system.

---

## Graph Entity Definitions

### GraphNode

**Purpose**: Represents a single entity in the knowledge graph

**TypeScript Interface**:
```typescript
interface GraphNode {
  // Identity
  id: string;                    // MongoDB ObjectId as string
  type: NodeType;
  label: string;                 // Display name
  
  // Display properties
  size?: number;                 // Node radius (8-20)
  color?: string;                // Hex color code
  icon?: IconType;               // Content type icon
  shape?: 'circle' | 'rect' | 'diamond';
  
  // Metadata
  duration?: number;             // estimatedDurationMinutes
  completed?: boolean;           // From CourseProgress
  locked?: boolean;              // Prerequisites not met
  contentType?: ContentType;     // Lesson content type
  progress?: number;             // 0-100
  
  // Navigation
  href?: string;                 // Absolute URL path
  slug?: string;                 // URL-friendly identifier
  
  // Graph layout
  x?: number;                    // SVG x coordinate
  y?: number;                    // SVG y coordinate
  fx?: number | null;            // Fixed x (for pinning)
  fy?: number | null;            // Fixed y (for pinning)
  
  // Relationships
  moduleId?: string;             // Parent module ID
  moduleName?: string;           // Module title
  parentId?: string;             // Parent lesson ID
  
  // State
  isHighlighted?: boolean;       // In current path
  isCurrent?: boolean;           // Active lesson
  isHovered?: boolean;           // Mouse hover state
}

type NodeType = 
  | 'course'      // Course root node
  | 'module'      // Module grouping
  | 'lesson'      // Top-level lesson
  | 'sublesson'   // Child lesson
  | 'topic';      // Topic reference

type ContentType = 
  | 'blog' 
  | 'standalone' 
  | 'video' 
  | 'quiz' 
  | 'flashcards';

type IconType =
  | 'book'        // blog
  | 'file'        // standalone
  | 'video'       // video
  | 'clipboard'   // quiz
  | 'cards';      // flashcards
```

**Derived From**:
```typescript
// CourseLesson → GraphNode
{
  id: lesson._id.toString(),
  type: lesson.parentLessonId ? 'sublesson' : 'lesson',
  label: lesson.title,
  contentType: lesson.contentType,
  duration: lesson.estimatedDurationMinutes,
  href: `/courses/${courseSlug}/lessons/${lesson.slug}`,
  slug: lesson.slug,
  moduleId: lesson.moduleId.toString(),
  parentId: lesson.parentLessonId?.toString(),
}

// CourseModule → GraphNode
{
  id: module._id.toString(),
  type: 'module',
  label: module.title,
  size: 20, // Larger than lessons
  shape: 'rect',
}
```

---

### GraphEdge

**Purpose**: Represents a relationship between two nodes

**TypeScript Interface**:
```typescript
interface GraphEdge {
  // Identity
  id: string;                    // Unique edge ID
  source: string;                // Source node ID
  target: string;                // Target node ID
  type: EdgeType;
  
  // Display properties
  weight?: number;               // Line thickness (1-5)
  style?: 'solid' | 'dashed' | 'dotted';
  color?: string;                // Hex color code
  label?: string;                // Optional text label
  
  // Direction
  directed?: boolean;            // True for prerequisites
  bidirectional?: boolean;       // Mutual relationship
  
  // Metadata
  strength?: number;             // Force simulation strength
  distance?: number;             // Preferred distance
  
  // State
  isHighlighted?: boolean;       // In current path
  isHovered?: boolean;           // Mouse hover state
}

type EdgeType = 
  | 'prerequisite'   // A must be completed before B
  | 'parent-child'   // Parent lesson → sub-lesson
  | 'sibling'        // Sub-lessons of same parent
  | 'related'        // Suggested related content
  | 'module-lesson'  // Module contains lesson
  | 'sequential';    // Next in sequence
```

**Derived From**:
```typescript
// Prerequisites: lesson.prerequisiteLessonIds → GraphEdge
lesson.prerequisiteLessonIds.forEach(prereqId => {
  edges.push({
    id: `prereq-${prereqId}-${lesson._id}`,
    source: prereqId.toString(),
    target: lesson._id.toString(),
    type: 'prerequisite',
    directed: true,
    style: 'dashed',
    color: '#f59e0b', // orange
  });
});

// Parent-Child: lesson.parentLessonId → GraphEdge
if (lesson.parentLessonId) {
  edges.push({
    id: `parent-${lesson.parentLessonId}-${lesson._id}`,
    source: lesson.parentLessonId.toString(),
    target: lesson._id.toString(),
    type: 'parent-child',
    directed: false,
    color: '#8b5cf6', // purple
  });
}

// Module-Lesson: module.lessonIds → GraphEdge
module.lessonIds.forEach(lessonId => {
  edges.push({
    id: `module-${module._id}-${lessonId}`,
    source: module._id.toString(),
    target: lessonId.toString(),
    type: 'module-lesson',
    directed: false,
    color: '#3b82f6', // blue
  });
});
```

---

### KnowledgeGraph

**Purpose**: Complete graph structure with metadata

**TypeScript Interface**:
```typescript
interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: GraphMetadata;
}

interface GraphMetadata {
  // Context
  courseId?: string;
  courseSlug?: string;
  lessonId?: string;
  lessonSlug?: string;
  scope: 'global' | 'local';
  
  // Statistics
  nodeCount: number;
  edgeCount: number;
  maxDepth: number;           // Longest prerequisite chain
  moduleCount?: number;
  lessonCount?: number;
  sublessonCount?: number;
  
  // Layout hints
  suggestedLayout?: 'force' | 'hierarchical' | 'radial';
  bounds?: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  
  // Cache info
  generatedAt: string;        // ISO timestamp
  expiresAt?: string;         // ISO timestamp
  version: string;            // Semantic version
}
```

---

## Existing Models (Reference)

### CourseLesson (src/models/CourseLesson.ts)

**Relevant Fields**:
```typescript
{
  _id: ObjectId;
  courseId: ObjectId;
  moduleId: ObjectId;
  title: string;
  slug?: string;
  contentType: 'blog' | 'standalone' | 'video' | 'quiz' | 'flashcards';
  estimatedDurationMinutes: number;
  
  // Graph relationships
  parentLessonId?: ObjectId | null;    // Sub-lesson parent
  prerequisiteLessonIds: ObjectId[];   // Must complete before
  order: number;                       // Sequential order
}
```

### CourseModule (src/models/CourseModule.ts)

**Relevant Fields**:
```typescript
{
  _id: ObjectId;
  courseId: ObjectId;
  title: string;
  order: number;
  lessonIds: ObjectId[];               // Contained lessons
}
```

### CourseProgress (src/models/CourseProgress.ts)

**Relevant Fields**:
```typescript
{
  userId: ObjectId;
  courseId: ObjectId;
  completedLessons: ObjectId[];        // For node.completed
  currentLessonId?: ObjectId;          // For node.isCurrent
  percentComplete: number;             // Overall progress
}
```

---

## Graph Generation Algorithms

### Global Course Graph

**Input**: Course ID + User ID (optional)  
**Output**: KnowledgeGraph

**Algorithm**:
```typescript
async function buildCourseGraph(
  courseId: string,
  userId?: string
): Promise<KnowledgeGraph> {
  // 1. Fetch course data
  const course = await CourseModel.findById(courseId);
  const modules = await CourseModuleModel.find({ courseId }).sort({ order: 1 });
  const lessons = await CourseLessonModel.find({ courseId }).sort({ order: 1 });
  
  // 2. Fetch user progress (if authenticated)
  const progress = userId 
    ? await CourseProgressModel.findOne({ userId, courseId })
    : null;
  
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // 3. Create module nodes
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
  
  // 4. Create lesson nodes
  for (const lesson of lessons) {
    const isCompleted = progress?.completedLessons.includes(lesson._id);
    const isCurrent = progress?.currentLessonId?.equals(lesson._id);
    
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
      moduleId: lesson.moduleId.toString(),
      parentId: lesson.parentLessonId?.toString(),
      color: getNodeColor(lesson, isCompleted, isCurrent),
      icon: getContentTypeIcon(lesson.contentType),
    });
  }
  
  // 5. Create module-lesson edges
  for (const module of modules) {
    for (const lessonId of module.lessonIds) {
      const lesson = lessons.find(l => l._id.equals(lessonId));
      if (lesson && !lesson.parentLessonId) { // Only top-level lessons
        edges.push({
          id: `module-${module._id}-${lessonId}`,
          source: module._id.toString(),
          target: lessonId.toString(),
          type: 'module-lesson',
          weight: 1,
          color: '#9ca3af',
        });
      }
    }
  }
  
  // 6. Create prerequisite edges
  for (const lesson of lessons) {
    for (const prereqId of lesson.prerequisiteLessonIds) {
      edges.push({
        id: `prereq-${prereqId}-${lesson._id}`,
        source: prereqId.toString(),
        target: lesson._id.toString(),
        type: 'prerequisite',
        directed: true,
        style: 'dashed',
        color: '#f59e0b',
        weight: 2,
      });
    }
  }
  
  // 7. Create parent-child edges
  for (const lesson of lessons) {
    if (lesson.parentLessonId) {
      edges.push({
        id: `parent-${lesson.parentLessonId}-${lesson._id}`,
        source: lesson.parentLessonId.toString(),
        target: lesson._id.toString(),
        type: 'parent-child',
        color: '#8b5cf6',
        weight: 2,
      });
    }
  }
  
  // 8. Create sibling edges (optional)
  const sublessonGroups = groupBy(
    lessons.filter(l => l.parentLessonId),
    l => l.parentLessonId.toString()
  );
  
  for (const [parentId, siblings] of Object.entries(sublessonGroups)) {
    for (let i = 0; i < siblings.length - 1; i++) {
      edges.push({
        id: `sibling-${siblings[i]._id}-${siblings[i+1]._id}`,
        source: siblings[i]._id.toString(),
        target: siblings[i+1]._id.toString(),
        type: 'sibling',
        color: '#d1d5db',
        weight: 1,
      });
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
      moduleCount: modules.length,
      lessonCount: lessons.filter(l => !l.parentLessonId).length,
      sublessonCount: lessons.filter(l => l.parentLessonId).length,
      suggestedLayout: 'force',
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}
```

### Local Lesson Graph

**Input**: Lesson ID + User ID (optional)  
**Output**: KnowledgeGraph

**Algorithm**:
```typescript
async function buildLessonGraph(
  lessonId: string,
  userId?: string
): Promise<KnowledgeGraph> {
  // 1. Fetch lesson and related data
  const lesson = await CourseLessonModel.findById(lessonId);
  const course = await CourseModel.findById(lesson.courseId);
  
  // 2. Fetch sub-lessons
  const sublessons = await CourseLessonModel.find({
    parentLessonId: lesson._id,
    courseId: lesson.courseId,
  }).sort({ order: 1 });
  
  // 3. Fetch prerequisites
  const prerequisites = await CourseLessonModel.find({
    _id: { $in: lesson.prerequisiteLessonIds },
  });
  
  // 4. Fetch "next" lessons (lessons that have this as prerequisite)
  const nextLessons = await CourseLessonModel.find({
    prerequisiteLessonIds: lesson._id,
    courseId: lesson.courseId,
  }).limit(5);
  
  // 5. Fetch user progress
  const progress = userId
    ? await CourseProgressModel.findOne({ userId, courseId: lesson.courseId })
    : null;
  
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  
  // 6. Create current lesson node (center)
  nodes.push({
    id: lesson._id.toString(),
    type: 'lesson',
    label: lesson.title,
    size: 16, // Larger (center)
    isCurrent: true,
    contentType: lesson.contentType,
    duration: lesson.estimatedDurationMinutes,
    href: `/courses/${course.slug}/lessons/${lesson.slug}`,
    color: '#3b82f6', // blue
    icon: getContentTypeIcon(lesson.contentType),
  });
  
  // 7. Create sub-lesson nodes
  for (const sublesson of sublessons) {
    const isCompleted = progress?.completedLessons.includes(sublesson._id);
    
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
    
    // Edge: parent → sub-lesson
    edges.push({
      id: `parent-${lesson._id}-${sublesson._id}`,
      source: lesson._id.toString(),
      target: sublesson._id.toString(),
      type: 'parent-child',
      color: '#8b5cf6',
    });
  }
  
  // 8. Create prerequisite nodes
  for (const prereq of prerequisites) {
    const isCompleted = progress?.completedLessons.includes(prereq._id);
    
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
    
    // Edge: prerequisite → current
    edges.push({
      id: `prereq-${prereq._id}-${lesson._id}`,
      source: prereq._id.toString(),
      target: lesson._id.toString(),
      type: 'prerequisite',
      directed: true,
      style: 'dashed',
      color: '#f59e0b',
    });
  }
  
  // 9. Create "next" lesson nodes
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
    
    // Edge: current → next
    edges.push({
      id: `next-${lesson._id}-${next._id}`,
      source: lesson._id.toString(),
      target: next._id.toString(),
      type: 'prerequisite',
      directed: true,
      style: 'dashed',
      color: '#6b7280',
    });
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
      maxDepth: 1, // Only immediate relationships
      suggestedLayout: 'radial',
      generatedAt: new Date().toISOString(),
      version: '1.0.0',
    },
  };
}
```

---

## Helper Functions

### Color Assignments

```typescript
function getNodeColor(
  lesson: CourseLesson,
  isCompleted: boolean,
  isCurrent: boolean
): string {
  if (isCurrent) return '#3b82f6';      // blue
  if (isCompleted) return '#10b981';    // green
  if (lesson.parentLessonId) return '#8b5cf6'; // purple (sublesson)
  return '#6366f1';                     // indigo (lesson)
}

function getModuleColor(order: number): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
  ];
  return colors[order % colors.length];
}

function getContentTypeIcon(contentType: ContentType): IconType {
  const iconMap = {
    blog: 'book',
    standalone: 'file',
    video: 'video',
    quiz: 'clipboard',
    flashcards: 'cards',
  };
  return iconMap[contentType];
}
```

### Access Control

```typescript
function canAccessLesson(
  lesson: CourseLesson,
  progress: CourseProgress | null
): boolean {
  if (!lesson.prerequisiteLessonIds.length) return true;
  if (!progress) return false;
  
  return lesson.prerequisiteLessonIds.every(prereqId =>
    progress.completedLessons.some(completed => completed.equals(prereqId))
  );
}
```

### Graph Metrics

```typescript
function calculateMaxDepth(edges: GraphEdge[]): number {
  // Build adjacency list
  const graph = new Map<string, string[]>();
  edges
    .filter(e => e.type === 'prerequisite')
    .forEach(e => {
      if (!graph.has(e.source)) graph.set(e.source, []);
      graph.get(e.source)!.push(e.target);
    });
  
  // DFS to find longest path
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

---

## Caching Strategy

### Cache Key Structure

```
graph:course:{courseId}:user:{userId}
graph:lesson:{lessonId}:user:{userId}
graph:course:{courseId}:public  // No user context
```

### Cache Invalidation

**Invalidate when**:
- Lesson added/removed from course
- Lesson prerequisites updated
- Lesson parent-child relationship changed
- Module structure modified
- User completes a lesson (user-specific cache)

**TTL**:
- Course graphs: 5 minutes
- Lesson graphs: 5 minutes
- Public graphs (no user): 30 minutes

---

## API Response Schema

### GET /api/courses/[slug]/graph

**Response**: 200 OK
```json
{
  "nodes": [
    {
      "id": "66f1234567890abcdef12345",
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
      "moduleId": "66f1234567890abcdef99999",
      "moduleName": "Fundamentals",
      "color": "#10b981",
      "icon": "book"
    }
  ],
  "edges": [
    {
      "id": "prereq-123-456",
      "source": "66f1234567890abcdef12345",
      "target": "66f1234567890abcdef12346",
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

---

## Summary

✅ **No new collections required** - graph derived from existing models  
✅ **Efficient queries** - uses existing indexes  
✅ **Flexible structure** - supports multiple layouts  
✅ **User-aware** - incorporates progress data  
✅ **Cacheable** - supports Redis/memory caching  
✅ **Extensible** - easy to add new node/edge types  

The data model leverages the existing hierarchical course structure and adds lightweight graph transformations for visualization without requiring schema migrations.
