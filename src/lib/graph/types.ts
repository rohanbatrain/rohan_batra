/**
 * T009: Graph Type Definitions
 *
 * TypeScript interfaces for GraphNode, GraphEdge, and KnowledgeGraph.
 * Based on specs/014-course-knowledge-graph/data-model.md
 *
 * @pattern Follows /src/types/courses.ts structure
 */

import { Types } from 'mongoose';

/**
 * Node types in the knowledge graph
 */
export type NodeType = 'course' | 'module' | 'lesson' | 'sublesson' | 'topic';

/**
 * Content types for lessons
 */
export type ContentType =
  | 'blog'
  | 'standalone'
  | 'video'
  | 'quiz'
  | 'flashcards';

/**
 * Icon types for visual representation
 */
export type IconType = 'book' | 'file' | 'video' | 'clipboard' | 'cards';

/**
 * Edge types representing relationships between nodes
 */
export type EdgeType =
  | 'contains'
  | 'prerequisite'
  | 'parent-child'
  | 'sibling'
  | 'sequential';

/**
 * Graph node representing a course entity
 */
export interface GraphNode {
  // Identity
  id: string;
  type: NodeType;
  label: string;

  // Display properties (optional)
  size?: number;
  color?: string;
  icon?: IconType;
  shape?: 'circle' | 'rect' | 'diamond';

  // Metadata (optional)
  duration?: number; // in seconds
  completed?: boolean;
  locked?: boolean;
  contentType?: ContentType;
  progress?: number; // 0-100

  // Navigation (optional)
  href?: string;
  slug?: string;

  // Layout coordinates (set by D3)
  x?: number;
  y?: number;
  fx?: number | null; // fixed x
  fy?: number | null; // fixed y

  // Relationships (optional)
  moduleId?: string;
  moduleName?: string;
  parentId?: string;

  // UI state (optional)
  isHighlighted?: boolean;
  isCurrent?: boolean;
  isHovered?: boolean;
}

/**
 * Graph edge representing a relationship between nodes
 */
export interface GraphEdge {
  // Required
  source: string;
  target: string;
  type: EdgeType;

  // Optional
  weight?: number;
  label?: string;
}

/**
 * Complete knowledge graph structure
 */
export interface KnowledgeGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    courseId: string;
    nodeCount: number;
    edgeCount: number;
    generatedAt: Date;
    userId?: string;
    lessonId?: string;
    depth?: number;
  };
}

/**
 * Options for building a course graph
 */
export interface BuildCourseGraphOptions {
  courseId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  depth?: number;
  includeProgress?: boolean;
}

/**
 * Options for building a lesson graph
 */
export interface BuildLessonGraphOptions {
  lessonId: Types.ObjectId;
  userId?: Types.ObjectId | null;
  depth?: number;
  includeProgress?: boolean;
}

/**
 * Options for simulating graph layout
 */
export interface SimulationOptions {
  width?: number;
  height?: number;
  maxIterations?: number;
  linkDistance?: number;
  chargeStrength?: number;
}

/**
 * Bounds of the graph layout
 */
export interface GraphBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  width: number;
  height: number;
}

/**
 * Result of fetching course structure
 */
export interface CourseStructure {
  modules: any[];
  lessons: any[];
  lessonsById: Map<string, any>;
}

/**
 * Result of fetching lesson context
 */
export interface LessonContext {
  lesson: any;
  prerequisites: any[];
  subLessons: any[];
  siblings: any[];
}
