import { describe, it, expect } from 'vitest';
import { listPublicCourses } from '@/lib/courses/query';

describe('Contract: Courses index shape', () => {
  it('should contain items array and pagination fields', async () => {
    // Test the shape of the courses list response
    const result = await listPublicCourses({
      page: 1,
      limit: 10,
    });

    // Verify structure matches OpenAPI schema
    expect(result).toHaveProperty('items');
    expect(Array.isArray(result.items)).toBe(true);
    expect(result).toHaveProperty('page');
    expect(result).toHaveProperty('limit');
    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('totalPages');

    // Verify types
    expect(typeof result.page).toBe('number');
    expect(typeof result.limit).toBe('number');
    expect(typeof result.total).toBe('number');
    expect(typeof result.totalPages).toBe('number');

    // If items exist, verify structure
    if (result.items.length > 0) {
      const course = result.items[0];
      expect(course).toHaveProperty('_id');
      expect(course).toHaveProperty('title');
      expect(course).toHaveProperty('slug');
      expect(course).toHaveProperty('status');
      expect(course).toHaveProperty('visibility');
    }
  });
});
