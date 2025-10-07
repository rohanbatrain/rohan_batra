import { describe, it, expect, beforeAll } from 'vitest';
import { generateMetadata as indexMetadata } from '@/app/courses/page';
import { generateMetadata as detailMetadata } from '@/app/courses/[slug]/page';
import sitemap from '@/app/sitemap';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';

describe('Integration: Courses SEO & Sitemap', () => {
  beforeAll(async () => {
    await connectToDatabase();
  });

  it('includes metadata for index and detail and lists courses in sitemap', async () => {
    // Test index page metadata
    const indexMeta = await indexMetadata();
    expect(indexMeta).toBeDefined();
    expect(indexMeta.title).toBeDefined();
    expect(indexMeta.description).toBeDefined();

    // Find a published course for detail page test
    const course = await CourseModel.findOne({
      status: 'published',
      visibility: 'public',
    }).lean();

    if (course) {
      // Test detail page metadata
      const detailMeta = await detailMetadata({
        params: Promise.resolve({ slug: course.slug }),
      });
      expect(detailMeta).toBeDefined();
      expect(detailMeta.title).toBeDefined();
      expect(detailMeta.description).toBeDefined();

      // Test sitemap includes the course
      const sitemapEntries = await sitemap();
      expect(Array.isArray(sitemapEntries)).toBe(true);

      // Check if courses are included in sitemap
      const courseUrls = sitemapEntries.filter(entry =>
        entry.url.includes('/courses/')
      );

      // Should have at least one course URL
      expect(courseUrls.length).toBeGreaterThan(0);

      // Verify the found course is in sitemap
      const foundInSitemap = courseUrls.some(entry =>
        entry.url.includes(course.slug)
      );
      expect(foundInSitemap).toBe(true);
    } else {
      // No courses to test, but verify sitemap structure
      const sitemapEntries = await sitemap();
      expect(Array.isArray(sitemapEntries)).toBe(true);

      // Verify each entry has required fields
      sitemapEntries.forEach(entry => {
        expect(entry).toHaveProperty('url');
        expect(entry).toHaveProperty('lastModified');
      });
    }
  });
});
