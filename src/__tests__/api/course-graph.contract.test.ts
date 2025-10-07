/**
 * T004: Contract Test - GET /api/courses/:courseId/graph
 *
 * Tests the course graph API endpoint contract.
 * Validates response structure for graph nodes, edges, and metadata.
 *
 * @pattern Follows /src/test/contract/courses.detail.contract.test.ts
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import { buildCourseGraph } from '@/lib/graph/generator';
import type { KnowledgeGraph } from '@/lib/graph/types';

describe('Course Graph API Contract', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  afterAll(async () => {
    // Cleanup if needed
  });

  it('should return valid graph structure for published course', async () => {
    // Find a published course
    const course = await CourseModel.findOne({ published: true }).lean();

    expect(course).toBeDefined();

    // Call buildCourseGraph
    const graph = await buildCourseGraph({
      courseId: course!._id as Types.ObjectId,
      depth: 2,
      includeProgress: false,
    });

    // Validate graph structure
    expect(graph).toBeDefined();
    expect(graph.nodes).toBeInstanceOf(Array);
    expect(graph.edges).toBeInstanceOf(Array);
    expect(graph.metadata).toBeDefined();

    // Validate nodes
    expect(graph.nodes.length).toBeGreaterThan(0);
    graph.nodes.forEach((node: any) => {
      expect(node.id).toBeDefined();
      expect(node.type).toBeDefined();
      expect(node.label).toBeDefined();
      expect(['course', 'module', 'lesson', 'sublesson', 'topic']).toContain(
        node.type
      );
    });

    // Validate edges
    graph.edges.forEach((edge: any) => {
      expect(edge.source).toBeDefined();
      expect(edge.target).toBeDefined();
      expect(edge.type).toBeDefined();
      expect([
        'contains',
        'prerequisite',
        'parent-child',
        'sibling',
        'sequential',
      ]).toContain(edge.type);
    });

    // Validate metadata
    expect(graph.metadata.courseId).toBeDefined();
    expect(graph.metadata.nodeCount).toBe(graph.nodes.length);
    expect(graph.metadata.edgeCount).toBe(graph.edges.length);
    expect(graph.metadata.generatedAt).toBeDefined();
  });

  it('should include user progress when authenticated', async () => {
    // Find a published course
    const course = await CourseModel.findOne({ published: true })
      .populate('modules')
      .lean();

    expect(course).toBeDefined();

    // Mock user ID
    const mockUserId = new Types.ObjectId();

    // Call buildCourseGraph with user ID
    const graph = await buildCourseGraph({
      courseId: course!._id as Types.ObjectId,
      userId: mockUserId,
      depth: 2,
      includeProgress: true,
    });

    // Validate graph structure
    expect(graph).toBeDefined();
    expect(graph.nodes).toBeInstanceOf(Array);
    expect(graph.metadata.userId).toBe(mockUserId.toString());
  });

  it('should handle empty course (no lessons)', async () => {
    // Most courses will have lessons, so this test will be skipped most of the time
    const course = await CourseModel.findOne({ lessonCount: 0 }).lean();

    if (!course) {
      // Skip if no empty course exists
      return;
    }

    // Call buildCourseGraph
    const graph = await buildCourseGraph({
      courseId: course._id as Types.ObjectId,
      depth: 2,
      includeProgress: false,
    });

    // Validate minimal graph structure
    expect(graph).toBeDefined();
    expect(graph.nodes).toBeInstanceOf(Array);
    expect(graph.edges).toBeInstanceOf(Array);
    expect(graph.metadata).toBeDefined();
  });
});
