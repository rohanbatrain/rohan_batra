/**
 * T012: Redis Cache Layer
 *
 * Graph caching functions with hierarchical keys.
 *
 * @pattern Follows /src/lib/redis.ts and /src/lib/cache-service.ts patterns
 */

import { cache } from '@/lib/redis';
import type { KnowledgeGraph } from './types';

/**
 * Graph cache keys generator
 * Hierarchical structure: graph:{type}:{id}:user:{userId}
 */
export const GraphCacheKeys = {
  /**
   * Course graph cache key
   * @param courseId - Course ID
   * @param userId - Optional user ID for user-specific cache
   * @returns Cache key
   */
  courseGraph: (courseId: string, userId?: string) => {
    if (userId) {
      return `graph:course:${courseId}:user:${userId}`;
    }
    return `graph:course:${courseId}:public`;
  },

  /**
   * Lesson graph cache key
   * @param lessonId - Lesson ID
   * @param userId - Optional user ID
   * @param depth - Graph depth
   * @returns Cache key
   */
  lessonGraph: (lessonId: string, userId?: string, depth = 2) => {
    if (userId) {
      return `graph:lesson:${lessonId}:depth:${depth}:user:${userId}`;
    }
    return `graph:lesson:${lessonId}:depth:${depth}:public`;
  },
};

/**
 * Get cached graph
 *
 * @param key - Cache key
 * @returns Cached graph or null if not found
 */
export async function getCachedGraph(
  key: string
): Promise<KnowledgeGraph | null> {
  try {
    const cached = await cache.get<KnowledgeGraph>(key);
    if (cached) {
      console.log(`[Cache HIT] ${key}`);
      return cached;
    }
    console.log(`[Cache MISS] ${key}`);
    return null;
  } catch (error) {
    console.error('Error getting cached graph:', error);
    return null;
  }
}

/**
 * Set cached graph
 *
 * @param key - Cache key
 * @param graph - Graph to cache
 * @param ttl - Time to live in seconds (default: 300 = 5 minutes)
 */
export async function setCachedGraph(
  key: string,
  graph: KnowledgeGraph,
  ttl = 300
): Promise<void> {
  try {
    await cache.set(key, graph, ttl);
    console.log(`[Cache SET] ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.warn('Error setting cached graph:', error);
    // Don't throw - cache failure should not break the app
  }
}

/**
 * Invalidate all course graphs for a course
 * Deletes both public and user-specific caches
 *
 * @param courseId - Course ID
 */
export async function invalidateCourseGraph(courseId: string): Promise<void> {
  try {
    const pattern = `graph:course:${courseId}:*`;
    const deletedCount = await cache.delPattern(pattern);
    console.log(
      `[Cache INVALIDATE] Course ${courseId}: ${deletedCount} keys deleted`
    );
  } catch (error) {
    console.warn('Error invalidating course graph:', error);
  }
}

/**
 * Invalidate all lesson graphs for a lesson
 * Deletes all depth variations and user-specific caches
 *
 * @param lessonId - Lesson ID
 */
export async function invalidateLessonGraph(lessonId: string): Promise<void> {
  try {
    const pattern = `graph:lesson:${lessonId}:*`;
    const deletedCount = await cache.delPattern(pattern);
    console.log(
      `[Cache INVALIDATE] Lesson ${lessonId}: ${deletedCount} keys deleted`
    );
  } catch (error) {
    console.warn('Error invalidating lesson graph:', error);
  }
}

/**
 * Invalidate all user-specific graphs for a user
 * Used when user progress changes
 *
 * @param userId - User ID
 * @param courseId - Optional course ID to limit invalidation
 */
export async function invalidateUserProgress(
  userId: string,
  courseId?: string
): Promise<void> {
  try {
    const patterns: string[] = [];

    if (courseId) {
      // Invalidate specific course graphs for this user
      patterns.push(`graph:course:${courseId}:user:${userId}`);
      patterns.push(`graph:lesson:*:user:${userId}`);
    } else {
      // Invalidate all graphs for this user
      patterns.push(`graph:*:user:${userId}`);
    }

    let totalDeleted = 0;
    for (const pattern of patterns) {
      const deletedCount = await cache.delPattern(pattern);
      totalDeleted += deletedCount;
    }

    console.log(
      `[Cache INVALIDATE] User ${userId}: ${totalDeleted} keys deleted`
    );
  } catch (error) {
    console.warn('Error invalidating user progress:', error);
  }
}
