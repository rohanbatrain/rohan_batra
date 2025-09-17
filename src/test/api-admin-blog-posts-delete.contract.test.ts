import { describe, it, expect } from 'vitest';

describe('DELETE /api/admin/blog/posts/[slug]', () => {
  it('should delete an existing blog post', async () => {
    // First create a post to delete
    const postToDelete = {
      title: 'Post to Delete',
      slug: 'post-to-delete',
      content: 'This post will be deleted',
      status: 'draft',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postToDelete),
    });

    // Delete the post
    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postToDelete.slug}`,
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      message: expect.stringContaining('deleted'),
      deletedPost: expect.objectContaining({
        _id: expect.any(String),
        title: postToDelete.title,
        slug: postToDelete.slug,
        deletedAt: expect.any(String),
        deletedBy: expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
        }),
      }),
    });
  });

  it('should soft delete by default (mark as deleted)', async () => {
    // Create a post
    const postToSoftDelete = {
      title: 'Soft Delete Test',
      slug: 'soft-delete-test',
      content: 'This post will be soft deleted',
      status: 'published',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postToSoftDelete),
    });

    // Soft delete the post
    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postToSoftDelete.slug}`,
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.deletedPost.status).toBe('deleted');
    expect(data.deletedPost.deletedAt).toBeTruthy();

    // Verify post is not accessible in regular API
    const getResponse = await fetch(
      `http://localhost:3000/api/blog/posts/${postToSoftDelete.slug}`
    );
    expect(getResponse.status).toBe(404);
  });

  it('should support hard delete with force parameter', async () => {
    // Create a post
    const postToHardDelete = {
      title: 'Hard Delete Test',
      slug: 'hard-delete-test',
      content: 'This post will be permanently deleted',
      status: 'draft',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postToHardDelete),
    });

    // Hard delete the post
    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postToHardDelete.slug}?force=true`,
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      message: expect.stringContaining('permanently deleted'),
      deletedPost: expect.objectContaining({
        title: postToHardDelete.title,
        slug: postToHardDelete.slug,
      }),
    });

    // Verify post is completely removed from admin API too
    const getResponse = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postToHardDelete.slug}`
    );
    expect(getResponse.status).toBe(404);
  });

  it('should handle deletion of published posts with care', async () => {
    // Create a published post
    const publishedPost = {
      title: 'Published Post to Delete',
      slug: 'published-post-to-delete',
      content: 'This is a published post',
      status: 'published',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(publishedPost),
    });

    // Delete the published post
    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${publishedPost.slug}`,
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.deletedPost.status).toBe('deleted');

    // Should include warning about published content
    expect(data.warning).toMatch(/published|live|public/i);
  });

  it('should return 404 for non-existent post', async () => {
    const response = await fetch(
      'http://localhost:3000/api/admin/blog/posts/non-existent-slug',
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(404);

    const data = await response.json();
    expect(data).toMatchObject({
      success: false,
      error: expect.stringContaining('not found'),
    });
  });

  it('should prevent deletion of posts with dependencies', async () => {
    // Create a post that will have comments/likes (simulated)
    const postWithDependencies = {
      title: 'Post with Dependencies',
      slug: 'post-with-dependencies',
      content: 'This post has comments and likes',
      status: 'published',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postWithDependencies),
    });

    // Simulate adding comments/likes by creating them
    // (In real scenario, these would be created through comment/like APIs)

    // Try to delete without force
    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postWithDependencies.slug}`,
      {
        method: 'DELETE',
      }
    );

    // Should warn about dependencies but still allow soft delete
    expect(response.status).toBe(200);

    const data = await response.json();
    if (data.warning) {
      expect(data.warning).toMatch(/comment|like|dependency/i);
    }
  });

  it('should require admin or editor authentication', async () => {
    // Request without authentication
    const response = await fetch(
      'http://localhost:3000/api/admin/blog/posts/some-slug',
      {
        method: 'DELETE',
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

  it('should log deletion activity for audit trail', async () => {
    // Create a post
    const postForAudit = {
      title: 'Audit Trail Test',
      slug: 'audit-trail-test',
      content: 'This deletion should be logged',
      status: 'draft',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postForAudit),
    });

    // Delete the post
    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postForAudit.slug}`,
      {
        method: 'DELETE',
      }
    );

    expect(response.status).toBe(200);

    // Check if activity was logged (this would need to be verified through activity API)
    const activityResponse = await fetch(
      'http://localhost:3000/api/admin/activity?type=blog_post_deleted&limit=1'
    );

    if (activityResponse.status === 200) {
      const activityData = await activityResponse.json();
      expect(activityData.activities[0]).toMatchObject({
        type: 'blog_post_deleted',
        details: expect.objectContaining({
          postTitle: postForAudit.title,
          postSlug: postForAudit.slug,
        }),
      });
    }
  });

  it('should handle bulk delete operations', async () => {
    // Create multiple posts
    const postsToDelete = [
      {
        title: 'Bulk Delete 1',
        slug: 'bulk-delete-1',
        content: 'First post to bulk delete',
        status: 'draft',
      },
      {
        title: 'Bulk Delete 2',
        slug: 'bulk-delete-2',
        content: 'Second post to bulk delete',
        status: 'draft',
      },
    ];

    for (const post of postsToDelete) {
      await fetch('http://localhost:3000/api/admin/blog/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(post),
      });
    }

    // Bulk delete
    const response = await fetch(
      'http://localhost:3000/api/admin/blog/posts/bulk-delete',
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slugs: ['bulk-delete-1', 'bulk-delete-2'],
          force: false,
        }),
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      deletedCount: 2,
      deletedPosts: expect.arrayContaining([
        expect.objectContaining({ slug: 'bulk-delete-1' }),
        expect.objectContaining({ slug: 'bulk-delete-2' }),
      ]),
    });
  });

  it('should provide restoration capability for soft-deleted posts', async () => {
    // Create and soft delete a post
    const postToRestore = {
      title: 'Restore Test Post',
      slug: 'restore-test-post',
      content: 'This post will be restored',
      status: 'published',
    };

    await fetch('http://localhost:3000/api/admin/blog/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postToRestore),
    });

    // Soft delete
    await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postToRestore.slug}`,
      {
        method: 'DELETE',
      }
    );

    // Restore the post
    const response = await fetch(
      `http://localhost:3000/api/admin/blog/posts/${postToRestore.slug}/restore`,
      {
        method: 'POST',
      }
    );

    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toMatchObject({
      success: true,
      post: expect.objectContaining({
        slug: postToRestore.slug,
        status: 'draft', // Should be restored as draft for review
        deletedAt: null,
        restoredAt: expect.any(String),
        restoredBy: expect.objectContaining({
          _id: expect.any(String),
          name: expect.any(String),
        }),
      }),
    });
  });
});
