import { describe, it, expect } from 'vitest';

describe('POST /api/admin/blog/posts', () => {
  it('should create a new blog post with admin data', async () => {
    const newPost = {
      title: 'New Test Blog Post',
      slug: 'new-test-blog-post',
      excerpt: 'This is a test blog post excerpt for the admin dashboard.',
      content:
        'This is the full content of the test blog post with rich text formatting.',
      status: 'draft',
      category: 'Technology',
      tags: ['Next.js', 'TypeScript', 'Admin'],
      metaTitle: 'New Test Blog Post - Admin Dashboard',
      metaDescription:
        'Test blog post created through admin dashboard interface',
      featured: false,
      allowComments: true,
      scheduledFor: null,
      seoSettings: {
        focusKeyword: 'admin dashboard',
        socialImage: null,
        canonicalUrl: null,
      },
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      post: {
        _id: expect.any(String),
        title: newPost.title,
        slug: newPost.slug,
        excerpt: newPost.excerpt,
        content: newPost.content,
        status: newPost.status,
        category: newPost.category,
        tags: expect.arrayContaining(newPost.tags),
        metaTitle: newPost.metaTitle,
        metaDescription: newPost.metaDescription,
        featured: newPost.featured,
        allowComments: newPost.allowComments,
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        author: expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
          email: expect.any(String),
        }),
        seoSettings: expect.objectContaining({
          focusKeyword: newPost.seoSettings.focusKeyword,
        }),
        metrics: expect.objectContaining({
          views: 0,
          likes: 0,
          comments: 0,
          shares: 0,
        }),
      },
    });
  });

  it('should validate required fields for blog post creation', async () => {
    const invalidPost = {
      // Missing required fields: title, content
      slug: 'invalid-post',
      excerpt: 'Invalid post excerpt',
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidPost),
    });

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.any(String),
      validation: expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: 'title',
            message: expect.any(String),
          }),
          expect.objectContaining({
            field: 'content',
            message: expect.any(String),
          }),
        ]),
      }),
    });
  });

  it('should auto-generate slug if not provided', async () => {
    const postWithoutSlug = {
      title: 'Auto Generated Slug Test',
      content: 'Content for auto-generated slug test',
      status: 'draft',
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postWithoutSlug),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.post.slug).toBe('auto-generated-slug-test');
  });

  it('should prevent duplicate slugs', async () => {
    const firstPost = {
      title: 'First Post',
      slug: 'duplicate-slug-test',
      content: 'First post content',
      status: 'draft',
    };

    // Create first post
    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(firstPost),
    });

    // Try to create second post with same slug
    const secondPost = {
      title: 'Second Post',
      slug: 'duplicate-slug-test',
      content: 'Second post content',
      status: 'draft',
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(secondPost),
    });

    expect(response.status).toBe(409);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('slug'),
      code: 'DUPLICATE_SLUG',
    });
  });

  it('should handle scheduled posts correctly', async () => {
    const scheduledPost = {
      title: 'Scheduled Post Test',
      content: 'Content for scheduled post',
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduledPost),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.post.status).toBe('scheduled');
    expect(data.post.scheduledFor).toBe(scheduledPost.scheduledFor);
    expect(data.post.publishedAt).toBeNull();
  });

  it('should auto-populate SEO fields if not provided', async () => {
    const postWithoutSEO = {
      title: 'SEO Auto-Population Test',
      content: 'Content for SEO auto-population test',
      excerpt: 'This is an excerpt for SEO testing',
      status: 'draft',
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postWithoutSEO),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.post.metaTitle).toBe(postWithoutSEO.title);
    expect(data.post.metaDescription).toBe(postWithoutSEO.excerpt);
  });

  it('should require admin or editor authentication', async () => {
    const newPost = {
      title: 'Unauthorized Post',
      content: 'This should not be created',
      status: 'draft',
    };

    // Request without authentication
    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newPost),
    });

    // Should either return 401 or 403
    expect([401, 403]).toContain(response.status);

    if (response.status === 401) {
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('authentication'),
      });
    } else if (response.status === 403) {
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('permission'),
      });
    }
  });

  it('should validate content length and format', async () => {
    const postWithLongContent = {
      title: 'Content Validation Test',
      content: 'a'.repeat(100000), // Very long content
      status: 'draft',
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postWithLongContent),
    });

    // Should either accept it or return validation error
    if (response.status === 400) {
      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        validation: expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'content',
              message: expect.stringContaining('length'),
            }),
          ]),
        }),
      });
    } else {
      expect(response.status).toBe(201);
    }
  });

  it('should handle draft creation with minimal data', async () => {
    const minimalPost = {
      title: 'Minimal Draft Post',
      content: 'Minimal content for draft',
      status: 'draft',
    };

    const response = await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(minimalPost),
    });

    expect(response.status).toBe(201);

    const data = await response.json();
    expect(data.post).toMatchObject({
      title: minimalPost.title,
      content: minimalPost.content,
      status: 'draft',
      slug: expect.any(String),
      featured: false,
      allowComments: true,
      tags: [],
      metrics: expect.objectContaining({
        views: 0,
        likes: 0,
        comments: 0,
        shares: 0,
      }),
    });
  });
});
