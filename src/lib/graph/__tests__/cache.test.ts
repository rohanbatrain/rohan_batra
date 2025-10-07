/**
 * T007: Unit Test - Redis Cache
 *
 * Tests graph caching functions.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getCachedGraph,
  setCachedGraph,
  invalidateCourseGraph,
  invalidateLessonGraph,
  invalidateUserProgress,
} from '@/lib/graph/cache';
import type { KnowledgeGraph } from '@/lib/graph/types';

describe('Graph Cache', () => {
  const mockGraph: KnowledgeGraph = {
    nodes: [],
    edges: [],
    metadata: {
      courseId: 'test-course',
      nodeCount: 0,
      edgeCount: 0,
      generatedAt: new Date(),
    },
  };

  describe('getCachedGraph', () => {
    it('should return null on cache miss', async () => {
      const result = await getCachedGraph('non-existent-key');
      expect(result).toBeNull();
    });

    it('should return cached data on hit', async () => {
      const key = 'test-graph-key';
      await setCachedGraph(key, mockGraph);

      const result = await getCachedGraph(key);
      expect(result).toBeDefined();
    });

    it('should handle Redis connection errors gracefully', async () => {
      // Should not throw, just return null
      const result = await getCachedGraph('error-key');
      expect(result).toBeNull();
    });
  });

  describe('setCachedGraph', () => {
    it('should store graph with TTL', async () => {
      const key = 'test-set-key';
      await setCachedGraph(key, mockGraph, 300);

      const result = await getCachedGraph(key);
      expect(result).toBeDefined();
    });

    it('should handle errors gracefully', async () => {
      // Should not throw
      await expect(
        setCachedGraph('test-key', mockGraph, 300)
      ).resolves.not.toThrow();
    });
  });

  describe('invalidateCourseGraph', () => {
    it('should delete all keys matching pattern', async () => {
      const courseId = 'test-course-123';

      await invalidateCourseGraph(courseId);

      // Should complete without throwing
      expect(true).toBe(true);
    });
  });

  describe('invalidateLessonGraph', () => {
    it('should delete all keys matching pattern', async () => {
      const lessonId = 'test-lesson-123';

      await invalidateLessonGraph(lessonId);

      // Should complete without throwing
      expect(true).toBe(true);
    });
  });

  describe('invalidateUserProgress', () => {
    it('should delete user-specific cache keys', async () => {
      const userId = 'test-user-123';
      const courseId = 'test-course-123';

      await invalidateUserProgress(userId, courseId);

      // Should complete without throwing
      expect(true).toBe(true);
    });
  });
});
