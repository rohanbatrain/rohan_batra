import { describe, it, expect } from 'vitest';

describe('PUT /api/admin/blog/posts/[slug]', () => {
  it('should update an existing blog post', async () => {
    // First create a post to update
    const originalPost = {
      title: 'Original Post Title',
      slug: 'original-post-slug',
      content: 'Original content',
      status: 'draft',
    };

    const createResponse = await fetch(
      'http://localhost:3000/api/admin/blog/posts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(originalPost),
      }
    );

    expect(createResponse.status).toBe(201);
    const createdPost = await createResponse.json();

    // Now update the post
    const updateData = {
      title: 'Updated Post Title',
      content: 'Updated content with new information',
      status: 'published',
      category: 'Technology',
      tags: ['Updated', 'Test'],
      featured: true,
      metaTitle: 'Updated Meta Title',
      metaDescription: 'Updated meta description',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${originalPost.slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      post: {
        _id: createdPost.post._id,
        title: updateData.title,
        slug: originalPost.slug, // Slug should remain the same
        content: updateData.content,
        status: updateData.status,
        category: updateData.category,
        tags: expect.arrayContaining(updateData.tags),
        featured: updateData.featured,
        metaTitle: updateData.metaTitle,
        metaDescription: updateData.metaDescription,
        updatedAt: expect.any(String),
        publishedAt: expect.any(String), // Should be set when status becomes published
      },
    });

    // updatedAt should be more recent than createdAt
    expect(new Date(data.post.updatedAt).getTime()).toBeGreaterThan(
      new Date(data.post.createdAt).getTime()
    );
  });

  it('should handle partial updates correctly', async () => {
    // Create a post
    const originalPost = {
      title: 'Partial Update Test',
      slug: 'partial-update-test',
      content: 'Original content',
      status: 'draft',
      category: 'Original Category',
      tags: ['original', 'test'],
      featured: false,
    };

    // Create a blog post first (setup for partial update test)
    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(originalPost),
    });

    // Partial update - only change title and status
    const partialUpdate = {
      title: 'Partially Updated Title',
      status: 'published',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(originalPost),
    });

    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${originalPost.slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(partialUpdate),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.post).toMatchObject({
      title: partialUpdate.title,
      status: partialUpdate.status,
      // Original values should be preserved
      content: originalPost.content,
      category: originalPost.category,
      tags: originalPost.tags,
      featured: originalPost.featured,
    });
  });

  it('should handle status transitions correctly', async () => {
    // Create a draft post
    const draftPost = {
      title: 'Status Transition Test',
      slug: 'status-transition-test',
      content: 'Content for status transition',
      status: 'draft',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draftPost),
    });

    // Transition from draft to published
    const publishUpdate = {
      status: 'published',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${draftPost.slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(publishUpdate),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.post.status).toBe('published');
    expect(data.post.publishedAt).toBeTruthy();
    expect(new Date(data.post.publishedAt).getTime()).toBeLessThanOrEqual(
      Date.now()
    );
  });

  it('should prevent updating slug to existing slug', async () => {
    // Create two posts
    const firstPost = {
      title: 'First Post',
      slug: 'first-post',
      content: 'First post content',
      status: 'draft',
    };

    const secondPost = {
      title: 'Second Post',
      slug: 'second-post',
      content: 'Second post content',
      status: 'draft',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(firstPost),
    });

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(secondPost),
    });

    // Try to update second post's slug to match first post
    const updateData = {
      slug: 'first-post', // This should conflict
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${secondPost.slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    expect(response.status).toBe(409);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('slug'),
      code: 'DUPLICATE_SLUG',
    });
  });

  it('should return 404 for non-existent post', async () => {
    const updateData = {
      title: 'Updated Title',
      content: 'Updated content',
    };

    const response = await fetch(
      'http://localhost:3000/api/admin/blog/posts/non-existent-slug',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('not found'),
    });
  });

  it('should validate update data', async () => {
    // Create a post first
    const originalPost = {
      title: 'Validation Test Post',
      slug: 'validation-test-post',
      content: 'Original content',
      status: 'draft',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(originalPost),
    });

    // Try to update with invalid data
    const invalidUpdate = {
      title: '', // Empty title should be invalid
      status: 'invalid-status', // Invalid status
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${originalPost.slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidUpdate),
      }
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.any(String),
      validation: expect.objectContaining({
        errors: expect.arrayContaining([
          expect.objectContaining({
            field: expect.stringMatching(/title|status/),
            message: expect.any(String),
          }),
        ]),
      }),
    });
  });

  it('should handle scheduled post updates', async () => {
    // Create a draft post
    const draftPost = {
      title: 'Schedule Update Test',
      slug: 'schedule-update-test',
      content: 'Content for scheduling',
      status: 'draft',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(draftPost),
    });

    // Update to scheduled status
    const scheduleUpdate = {
      status: 'scheduled',
      scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${draftPost.slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleUpdate),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.post.status).toBe('scheduled');
    expect(data.post.scheduledFor).toBe(scheduleUpdate.scheduledFor);
    expect(data.post.publishedAt).toBeNull();
  });

  it('should require admin or editor authentication', async () => {
    const updateData = {
      title: 'Unauthorized Update',
      content: 'This should not be updated',
    };

    // Request without authentication
    const response = await fetch(
      'http://localhost:3000/api/admin/blog/posts/some-slug',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

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

  it('should preserve post history and audit trail', async () => {
    // Create a post
    const originalPost = {
      title: 'History Test Post',
      slug: 'history-test-post',
      content: 'Original content',
      status: 'draft',
    };

    const createResponse = await fetch(
      'http://localhost:3000/api/admin/blog/posts',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(originalPost),
      }
    );

    const createdPost = await createResponse.json();

    // Update the post
    const updateData = {
      title: 'Updated History Test Post',
      content: 'Updated content',
    };

    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${originalPost.slug}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();

    // Should include audit trail information
    expect(data.post).toMatchObject({
      lastModifiedBy: expect.objectContaining({
        _id: expect.any(String),
        name: expect.any(String),
      }),
      version: expect.any(Number),
    });

    // Version should be incremented
    expect(data.post.version).toBeGreaterThan(createdPost.post.version || 0);
  });
});
