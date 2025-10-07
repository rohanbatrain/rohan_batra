/**
 * T005: Contract Test - GET /api/courses/:courseId/lessons/:lessonSlug/graph
 *
 * Tests the lesson graph API endpoint contract.
 * Validates response structure for lesson-centric graph views.
 *
 * @pattern Follows /src/test/contract/courses.detail.contract.test.ts
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { Types } from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseLessonModel from '@/models/CourseLesson';
import { buildLessonGraph } from '@/lib/graph/generator';

describe('Lesson Graph API Contract', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  it('should return valid lesson-centric graph structure', async () => {
    // Find a published course with lessons
    const course = await CourseModel.findOne({
      published: true,
      lessonCount: { $gt: 0 },
    }).lean();

    expect(course).toBeDefined();

    // Find any lesson from the course
    const lesson = await CourseLessonModel.findOne({
      courseId: course?._id,
    }).lean();

    if (!lesson) {
      // Skip if no lessons found
      return;
    }

    // Call buildLessonGraph
    const graph = await buildLessonGraph({
      lessonId: lesson._id as Types.ObjectId,
      depth: 2,
      includeProgress: false,
    });

    // Validate graph structure
    expect(graph).toBeDefined();
    expect(graph.nodes).toBeInstanceOf(Array);
    expect(graph.edges).toBeInstanceOf(Array);
    expect(graph.metadata).toBeDefined();

    // Validate nodes have required fields
    expect(graph.nodes.length).toBeGreaterThan(0);
    graph.nodes.forEach((node: any) => {
      expect(node.id).toBeDefined();
      expect(node.type).toBeDefined();
      expect(node.label).toBeDefined();
    });

    // Validate edges
    graph.edges.forEach((edge: any) => {
      expect(edge.source).toBeDefined();
      expect(edge.target).toBeDefined();
      expect(edge.type).toBeDefined();
    });

    // Validate metadata
    expect(graph.metadata.nodeCount).toBe(graph.nodes.length);
    expect(graph.metadata.edgeCount).toBe(graph.edges.length);
  });

  it('should respect depth parameter', async () => {
    // Find a lesson
    const course = await CourseModel.findOne({
      published: true,
      lessonCount: { $gt: 0 },
    }).lean();

    if (!course) return;

    const lesson = await CourseLessonModel.findOne({
      courseId: course._id,
    }).lean();

    if (!lesson) return;

    // Call with depth=1
    const graph1 = await buildLessonGraph({
      lessonId: lesson._id as Types.ObjectId,
      depth: 1,
      includeProgress: false,
    });

    // Call with depth=3
    const graph3 = await buildLessonGraph({
      lessonId: lesson._id as Types.ObjectId,
      depth: 3,
      includeProgress: false,
    });

    // Depth 3 should have more or equal nodes than depth 1
    expect(graph3.nodes.length).toBeGreaterThanOrEqual(graph1.nodes.length);
  });
});
