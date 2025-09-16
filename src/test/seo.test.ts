import { describe, it, expect } from 'vitest';
import {
  generateMetadata,
  generateBlogPostMetadata,
  generateProjectMetadata,
  generateWebsiteStructuredData,
  generateBlogPostStructuredData,
  generateProjectStructuredData,
} from '@/lib/seo';

describe('SEO Utils', () => {
  describe('generateMetadata', () => {
    it('should generate basic metadata', () => {
      const metadata = generateMetadata({
        title: 'Test Title',
        description: 'Test description',
      });

      expect(metadata.title).toContain('Test Title');
      expect(metadata.description).toBe('Test description');
      expect(metadata.openGraph?.title).toContain('Test Title');
      expect(metadata.openGraph?.description).toBe('Test description');
      expect(metadata.twitter?.title).toContain('Test Title');
      expect(metadata.twitter?.description).toBe('Test description');
    });

    it('should include site name in title', () => {
      const metadata = generateMetadata({
        title: 'Test Page',
        description: 'Test description',
      });

      expect(metadata.title).toBe('Test Page | Rohan Batra Portfolio');
    });

    it('should not duplicate site name if already present', () => {
      const metadata = generateMetadata({
        title: 'Test Page | Rohan Batra Portfolio',
        description: 'Test description',
      });

      expect(metadata.title).toBe('Test Page | Rohan Batra Portfolio');
    });

    it('should generate correct URLs', () => {
      const metadata = generateMetadata({
        title: 'Test Page',
        description: 'Test description',
        url: '/test-page',
      });

      expect(metadata.openGraph?.url).toContain('/test-page');
      expect(metadata.alternates?.canonical).toContain('/test-page');
    });
  });

  describe('generateBlogPostMetadata', () => {
    it('should generate blog post metadata', () => {
      const metadata = generateBlogPostMetadata({
        title: 'Test Blog Post',
        excerpt: 'This is a test blog post',
        slug: 'test-blog-post',
        publishedAt: new Date('2024-01-15'),
        author: 'John Doe',
        tags: ['test', 'blog'],
      });

      expect(metadata.title).toContain('Test Blog Post');
      expect(metadata.description).toBe('This is a test blog post');
      // Check openGraph properties with proper typing
      const openGraph = metadata.openGraph as Record<string, unknown>;
      expect(openGraph?.type).toBe('article');
      expect(openGraph?.publishedTime).toBe('2024-01-15T00:00:00.000Z');
      expect(metadata.openGraph?.url).toContain('/blog/test-blog-post');
      expect(metadata.keywords).toEqual(['test', 'blog']);
    });
  });

  describe('generateProjectMetadata', () => {
    it('should generate project metadata', () => {
      const metadata = generateProjectMetadata({
        title: 'Test Project',
        description: 'This is a test project',
        slug: 'test-project',
        technologies: ['React', 'TypeScript'],
      });

      expect(metadata.title).toContain('Test Project');
      expect(metadata.description).toBe('This is a test project');
      expect(metadata.openGraph?.url).toContain('/portfolio/test-project');
      expect(metadata.keywords).toEqual(['React', 'TypeScript']);
    });
  });

  describe('generateWebsiteStructuredData', () => {
    it('should generate website structured data', () => {
      const structuredData = generateWebsiteStructuredData();

      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('WebSite');
      expect(structuredData.name).toBe('Rohan Batra Portfolio');
      expect(structuredData.author['@type']).toBe('Person');
      expect(structuredData.author.name).toBe('Rohan Batra');
      expect(Array.isArray(structuredData.sameAs)).toBe(true);
    });
  });

  describe('generateBlogPostStructuredData', () => {
    it('should generate blog post structured data', () => {
      const structuredData = generateBlogPostStructuredData({
        title: 'Test Blog Post',
        excerpt: 'This is a test blog post',
        slug: 'test-blog-post',
        publishedAt: new Date('2024-01-15'),
        author: 'John Doe',
      });

      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('BlogPosting');
      expect(structuredData.headline).toBe('Test Blog Post');
      expect(structuredData.description).toBe('This is a test blog post');
      expect(structuredData.datePublished).toBe('2024-01-15T00:00:00.000Z');
      expect(structuredData.author['@type']).toBe('Person');
      expect(structuredData.author.name).toBe('John Doe');
      expect(structuredData.publisher['@type']).toBe('Organization');
    });
  });

  describe('generateProjectStructuredData', () => {
    it('should generate project structured data', () => {
      const structuredData = generateProjectStructuredData({
        title: 'Test Project',
        description: 'This is a test project',
        slug: 'test-project',
        technologies: ['React', 'TypeScript'],
        startDate: new Date('2024-01-01'),
        url: 'https://example.com',
        githubUrl: 'https://github.com/user/repo',
      });

      expect(structuredData['@context']).toBe('https://schema.org');
      expect(structuredData['@type']).toBe('CreativeWork');
      expect(structuredData.name).toBe('Test Project');
      expect(structuredData.description).toBe('This is a test project');
      expect(structuredData.dateCreated).toBe('2024-01-01T00:00:00.000Z');
      expect(structuredData.keywords).toBe('React, TypeScript');
      expect(structuredData.sameAs).toEqual(['https://example.com']);
      expect(structuredData.codeRepository).toBe(
        'https://github.com/user/repo'
      );
      expect(structuredData.creator['@type']).toBe('Person');
    });
  });
});
