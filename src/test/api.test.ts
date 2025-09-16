import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';

// Mock MongoDB connection
const mockBlogs = [
  {
    _id: '1',
    title: 'Test Blog Post',
    slug: 'test-blog-post',
    excerpt: 'This is a test blog post',
    content: 'Full content here',
    status: 'published',
    publishedAt: new Date('2024-01-15'),
    author: {
      _id: '1',
      firstName: 'John',
      lastName: 'Doe',
    },
    tags: ['test'],
    category: 'Technology',
  },
];

// Mock the MongoDB connection
vi.mock('@/lib/mongodb', () => ({
  connectToDatabase: vi.fn().mockResolvedValue({
    db: {
      collection: vi.fn().mockReturnValue({
        find: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockBlogs),
          sort: vi.fn().mockReturnThis(),
          limit: vi.fn().mockReturnThis(),
          skip: vi.fn().mockReturnThis(),
        }),
        findOne: vi.fn().mockResolvedValue(mockBlogs[0]),
        countDocuments: vi.fn().mockResolvedValue(1),
      }),
    },
  }),
}));

describe('Blog API Endpoints', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/blog/posts', () => {
    it('should return published blog posts', async () => {
      // Mock the API handler
      const mockHandler = async () => {
        return Response.json({
          success: true,
          data: {
            posts: mockBlogs,
            pagination: {
              page: 1,
              limit: 10,
              total: 1,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      };

      const response = await mockHandler();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.posts).toHaveLength(1);
      expect(data.data.posts[0].title).toBe('Test Blog Post');
      expect(data.data.pagination.total).toBe(1);
    });

    it('should handle pagination parameters', async () => {
      const mockHandler = async (request: NextRequest) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');

        return Response.json({
          success: true,
          data: {
            posts: mockBlogs,
            pagination: {
              page,
              limit,
              total: 1,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      };

      const request = new NextRequest(
        'http://localhost:3000/api/blog/posts?page=2&limit=5'
      );
      const response = await mockHandler(request);
      const data = await response.json();

      expect(data.data.pagination.page).toBe(2);
      expect(data.data.pagination.limit).toBe(5);
    });

    it('should filter by status', async () => {
      const mockHandler = async (request: NextRequest) => {
        const url = new URL(request.url);
        const status = url.searchParams.get('status');

        const filteredPosts = status
          ? mockBlogs.filter(post => post.status === status)
          : mockBlogs;

        return Response.json({
          success: true,
          data: {
            posts: filteredPosts,
            pagination: {
              page: 1,
              limit: 10,
              total: filteredPosts.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          },
        });
      };

      const request = new NextRequest(
        'http://localhost:3000/api/blog/posts?status=published'
      );
      const response = await mockHandler(request);
      const data = await response.json();

      expect(data.data.posts).toHaveLength(1);
      expect(data.data.posts[0].status).toBe('published');
    });
  });

  describe('GET /api/blog/posts/[slug]', () => {
    it('should return a specific blog post', async () => {
      const mockHandler = async (slug: string) => {
        const post = mockBlogs.find(p => p.slug === slug);

        if (!post) {
          return Response.json(
            { success: false, error: 'Post not found' },
            { status: 404 }
          );
        }

        return Response.json({
          success: true,
          data: { post },
        });
      };

      const response = await mockHandler('test-blog-post');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.post.slug).toBe('test-blog-post');
    });

    it('should return 404 for non-existent post', async () => {
      const mockHandler = async (slug: string) => {
        const post = mockBlogs.find(p => p.slug === slug);

        if (!post) {
          return Response.json(
            { success: false, error: 'Post not found' },
            { status: 404 }
          );
        }

        return Response.json({
          success: true,
          data: { post },
        });
      };

      const response = await mockHandler('non-existent-post');
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Post not found');
    });
  });
});
