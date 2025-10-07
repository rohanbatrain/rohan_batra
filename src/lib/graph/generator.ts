/**
 * T011: Graph Generator Core
 * 
 * Implements buildCourseGraph() and buildLessonGraph() functions.
 * 
 * @pattern Follows /src/lib/courses/progress.ts structure
 */

import { Types } from 'mongoose';
import {
  fetchCourseStructure,
  fetchLessonWithContext,
  fetchUserProgress,
} from './query';
import type {
  BuildCourseGraphOptions,
  BuildLessonGraphOptions,
  KnowledgeGraph,
  GraphNode,
  GraphEdge,
  NodeType,
  ContentType,
  IconType,
} from './types';

/**
 * Build a complete course knowledge graph
 * 
 * @param options - Build options (courseId, userId, depth, includeProgress)
 * @returns Complete knowledge graph with nodes, edges, and metadata
 */
export async function buildCourseGraph(
  options: BuildCourseGraphOptions
): Promise<KnowledgeGraph> {
  const {
    courseId,
    userId = null,
    depth = 2,
    includeProgress = false,
  } = options;

  try {
    // Fetch course structure
    const { modules, lessons, lessonsById } = await fetchCourseStructure(courseId);

    // Fetch user progress if authenticated and requested
    let completedIds = new Set<string>();
    if (userId && includeProgress) {
      completedIds = await fetchUserProgress(courseId, userId);
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Build module nodes
    modules.forEach((module: any) => {
      const moduleNode: GraphNode = {
        id: module._id.toString(),
        type: 'module',
        label: module.title,
        size: 40,
        color: '#3b82f6', // blue-500
        icon: 'book',
        shape: 'rect',
      };
      nodes.push(moduleNode);
    });

    // Build lesson nodes
    lessons.forEach((lesson: any) => {
      const lessonId = lesson._id.toString();
      const completed = completedIds.has(lessonId);
      const locked = checkIfLocked(lesson, completedIds, lessonsById);

      const lessonNode: GraphNode = {
        id: lessonId,
        type: lesson.parentLessonId ? 'sublesson' : 'lesson',
        label: lesson.title,
        size: 30,
        color: completed ? '#10b981' : locked ? '#6b7280' : '#8b5cf6', // green-500 : gray-500 : violet-500
        icon: getIconForContentType(lesson.contentType),
        shape: 'circle',
        duration: lesson.duration,
        completed,
        locked,
        contentType: lesson.contentType,
        href: `/courses/${courseId}/lessons/${lesson.slug}`,
        slug: lesson.slug,
        moduleId: lesson.moduleId.toString(),
        parentId: lesson.parentLessonId?.toString(),
      };
      nodes.push(lessonNode);

      // Create module→lesson edge (contains)
      if (lesson.moduleId) {
        edges.push({
          source: lesson.moduleId.toString(),
          target: lessonId,
          type: 'contains',
        });
      }

      // Create prerequisite edges
      if (lesson.prerequisiteLessonIds && lesson.prerequisiteLessonIds.length > 0) {
        lesson.prerequisiteLessonIds.forEach((prereqId: Types.ObjectId) => {
          edges.push({
            source: prereqId.toString(),
            target: lessonId,
            type: 'prerequisite',
          });
        });
      }

      // Create parent→child edge
      if (lesson.parentLessonId) {
        edges.push({
          source: lesson.parentLessonId.toString(),
          target: lessonId,
          type: 'parent-child',
        });
      }
    });

    // Return complete graph
    return {
      nodes,
      edges,
      metadata: {
        courseId: courseId.toString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
        generatedAt: new Date(),
        userId: userId?.toString(),
        depth,
      },
    };
  } catch (error) {
    console.error('Error building course graph:', error);
    throw error;
  }
}

/**
 * Build a lesson-centric knowledge graph
 * 
 * @param options - Build options (lessonId, userId, depth, includeProgress)
 * @returns Lesson-centric knowledge graph
 */
export async function buildLessonGraph(
  options: BuildLessonGraphOptions
): Promise<KnowledgeGraph> {
  const {
    lessonId,
    userId = null,
    depth = 2,
    includeProgress = false,
  } = options;

  try {
    // Fetch lesson with context
    const { lesson, prerequisites, subLessons, siblings } = await fetchLessonWithContext(
      lessonId,
      depth
    );

    if (!lesson) {
      throw new Error(`Lesson not found: ${lessonId}`);
    }

    // Fetch user progress if authenticated
    let completedIds = new Set<string>();
    if (userId && includeProgress) {
      completedIds = await fetchUserProgress(lesson.courseId, userId);
    }

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];
    const addedNodes = new Set<string>();

    // Helper to add a lesson node
    const addLessonNode = (lessonData: any, isCurrent = false) => {
      const id = lessonData._id.toString();
      if (addedNodes.has(id)) return;

      const completed = completedIds.has(id);
      const locked = checkIfLocked(lessonData, completedIds, new Map());

      const node: GraphNode = {
        id,
        type: lessonData.parentLessonId ? 'sublesson' : 'lesson',
        label: lessonData.title,
        size: isCurrent ? 40 : 30,
        color: completed ? '#10b981' : locked ? '#6b7280' : '#8b5cf6',
        icon: getIconForContentType(lessonData.contentType),
        shape: 'circle',
        duration: lessonData.duration,
        completed,
        locked,
        contentType: lessonData.contentType,
        href: `/courses/${lessonData.courseId}/lessons/${lessonData.slug}`,
        slug: lessonData.slug,
        moduleId: lessonData.moduleId?.toString(),
        parentId: lessonData.parentLessonId?.toString(),
        isCurrent,
      };
      nodes.push(node);
      addedNodes.add(id);
    };

    // Add current lesson node
    addLessonNode(lesson, true);

    // Add prerequisite nodes
    prerequisites.forEach((prereq: any) => {
      addLessonNode(prereq);
      edges.push({
        source: prereq._id.toString(),
        target: lessonId.toString(),
        type: 'prerequisite',
      });
    });

    // Add sub-lesson nodes
    subLessons.forEach((subLesson: any) => {
      addLessonNode(subLesson);
      edges.push({
        source: lessonId.toString(),
        target: subLesson._id.toString(),
        type: 'parent-child',
      });
    });

    // Add sibling nodes
    siblings.forEach((sibling: any) => {
      addLessonNode(sibling);
      edges.push({
        source: lesson.moduleId?.toString() || 'module',
        target: sibling._id.toString(),
        type: 'sibling',
      });
    });

    return {
      nodes,
      edges,
      metadata: {
        courseId: lesson.courseId.toString(),
        lessonId: lessonId.toString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
        generatedAt: new Date(),
        userId: userId?.toString(),
        depth,
      },
    };
  } catch (error) {
    console.error('Error building lesson graph:', error);
    throw error;
  }
}

/**
 * Check if a lesson is locked (prerequisites not completed)
 * 
 * @param lesson - Lesson to check
 * @param completedIds - Set of completed lesson IDs
 * @param lessonMap - Map of lesson IDs to lesson data
 * @returns True if lesson is locked
 */
function checkIfLocked(
  lesson: any,
  completedIds: Set<string>,
  lessonMap: Map<string, any>
): boolean {
  if (!lesson.prerequisiteLessonIds || lesson.prerequisiteLessonIds.length === 0) {
    return false;
  }

  // Check if any prerequisite is not completed
  return lesson.prerequisiteLessonIds.some((prereqId: Types.ObjectId) => {
    return !completedIds.has(prereqId.toString());
  });
}

/**
 * Get icon type for content type
 * 
 * @param contentType - Content type
 * @returns Icon type
 */
function getIconForContentType(contentType?: ContentType): IconType {
  switch (contentType) {
    case 'video':
      return 'video';
    case 'quiz':
      return 'clipboard';
    case 'flashcards':
      return 'cards';
    case 'blog':
    case 'standalone':
    default:
      return 'file';
  }
}
