import { describe, it, expect, beforeAll } from 'vitest';
import { listPublicCourses } from '@/lib/courses/query';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';

describe('Integration: Courses index', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  it('filters by difficulty and tags, sorts and paginates', async () => {
    // Test filtering by difficulty
    const easyResults = await listPublicCourses({
      difficulty: 'beginner',
      page: 1,
      limit: 10,
    });

    expect(easyResults).toHaveProperty('items');
    expect(easyResults).toHaveProperty('page', 1);
    expect(easyResults).toHaveProperty('limit', 10);

    // All results should be beginner level (if any exist)
    if (easyResults.items.length > 0) {
      easyResults.items.forEach((course: any) => {
        expect(course.difficulty).toBe('beginner');
      });
    }

    // Test sorting by newest (default)
    const newestResults = await listPublicCourses({
      sort: 'newest',
      page: 1,
      limit: 10,
    });

    // Verify newest sorting (if multiple items)
    if (newestResults.items.length > 1) {
      const first = new Date(newestResults.items[0].createdAt).getTime();
      const second = new Date(newestResults.items[1].createdAt).getTime();
      expect(first).toBeGreaterThanOrEqual(second);
    }

    // Test sorting alphabetically
    const alphaResults = await listPublicCourses({
      sort: 'az',
      page: 1,
      limit: 10,
    });

    // Verify alphabetical sorting (if multiple items)
    if (alphaResults.items.length > 1) {
      const first = alphaResults.items[0].title.toLowerCase();
      const second = alphaResults.items[1].title.toLowerCase();
      expect(first.localeCompare(second)).toBeLessThanOrEqual(0);
    }

    // Test pagination
    const page1 = await listPublicCourses({ page: 1, limit: 2 });
    const page2 = await listPublicCourses({ page: 2, limit: 2 });

    expect(page1.page).toBe(1);
    expect(page2.page).toBe(2);

    // If we have enough courses, verify different items on different pages
    if (page1.total > 2) {
      if (page1.items.length > 0 && page2.items.length > 0) {
        expect(page1.items[0]._id.toString()).not.toBe(
          page2.items[0]._id.toString()
        );
      }
    }

    // Test tag filtering
    const allCourses = await CourseModel.find({
      status: 'published',
      visibility: 'public',
    })
      .limit(1)
      .lean();

    if (
      allCourses.length > 0 &&
      allCourses[0].tags &&
      allCourses[0].tags.length > 0
    ) {
      const tag = allCourses[0].tags[0];
      const tagResults = await listPublicCourses({
        tags: tag,
        page: 1,
        limit: 10,
      });

      // All results should include the tag
      tagResults.items.forEach((course: any) => {
        expect(course.tags).toContain(tag);
      });
    }
  });
});
