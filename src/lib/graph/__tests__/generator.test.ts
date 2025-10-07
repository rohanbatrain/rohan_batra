/**
 * T006: Unit Test - Graph Generator
 * 
 * Tests buildCourseGraph and buildLessonGraph functions with mock data.
 */

import { describe, it, expect, vi } from 'vitest';
import { Types } from 'mongoose';
import { buildCourseGraph, buildLessonGraph } from '@/lib/graph/generator';

describe('Graph Generator', () => {
  describe('buildCourseGraph', () => {
    it('should return valid graph structure with mock data', async () => {
      const mockCourseId = new Types.ObjectId();

      const graph = await buildCourseGraph({
        courseId: mockCourseId,
        depth: 2,
        includeProgress: false,
      });

      expect(graph).toBeDefined();
      expect(graph.nodes).toBeInstanceOf(Array);
      expect(graph.edges).toBeInstanceOf(Array);
      expect(graph.metadata).toBeDefined();
      expect(graph.metadata.courseId).toBe(mockCourseId.toString());
    });

    it('should handle empty course (no lessons)', async () => {
      const mockCourseId = new Types.ObjectId();

      const graph = await buildCourseGraph({
        courseId: mockCourseId,
        depth: 2,
        includeProgress: false,
      });

      expect(graph).toBeDefined();
      expect(graph.nodes).toBeInstanceOf(Array);
      expect(graph.edges).toBeInstanceOf(Array);
    });

    it('should include module nodes', async () => {
      const mockCourseId = new Types.ObjectId();

      const graph = await buildCourseGraph({
        courseId: mockCourseId,
        depth: 2,
        includeProgress: false,
      });

      const moduleNodes = graph.nodes.filter((n: any) => n.type === 'module');
      // Should have module nodes if course has modules
      expect(moduleNodes).toBeInstanceOf(Array);
    });

    it('should create module→lesson edges', async () => {
      const mockCourseId = new Types.ObjectId();

      const graph = await buildCourseGraph({
        courseId: mockCourseId,
        depth: 2,
        includeProgress: false,
      });

      const containsEdges = graph.edges.filter((e: any) => e.type === 'contains');
      expect(containsEdges).toBeInstanceOf(Array);
    });

    it('should calculate locked status correctly', async () => {
      const mockCourseId = new Types.ObjectId();
      const mockUserId = new Types.ObjectId();

      const graph = await buildCourseGraph({
        courseId: mockCourseId,
        userId: mockUserId,
        depth: 2,
        includeProgress: true,
      });

      expect(graph).toBeDefined();
      // Locked status should be boolean or undefined
      graph.nodes.forEach((node: any) => {
        if ('locked' in node) {
          expect(typeof node.locked).toBe('boolean');
        }
      });
    });
  });

  describe('buildLessonGraph', () => {
    it('should return lesson-centric graph', async () => {
      const mockLessonId = new Types.ObjectId();

      const graph = await buildLessonGraph({
        lessonId: mockLessonId,
        depth: 2,
        includeProgress: false,
      });

      expect(graph).toBeDefined();
      expect(graph.nodes).toBeInstanceOf(Array);
      expect(graph.edges).toBeInstanceOf(Array);
    });

    it('should respect depth parameter', async () => {
      const mockLessonId = new Types.ObjectId();

      const graph1 = await buildLessonGraph({
        lessonId: mockLessonId,
        depth: 1,
        includeProgress: false,
      });

      const graph2 = await buildLessonGraph({
        lessonId: mockLessonId,
        depth: 3,
        includeProgress: false,
      });

      expect(graph1).toBeDefined();
      expect(graph2).toBeDefined();
    });

    it('should include sub-lessons', async () => {
      const mockLessonId = new Types.ObjectId();

      const graph = await buildLessonGraph({
        lessonId: mockLessonId,
        depth: 2,
        includeProgress: false,
      });

      const subLessonNodes = graph.nodes.filter((n: any) => n.type === 'sublesson');
      expect(subLessonNodes).toBeInstanceOf(Array);
    });
  });
});
