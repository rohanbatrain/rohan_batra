import { describe, it, expect } from 'vitest';

// Contract test for GET /api/comments - will fail until route is implemented

describe('GET /api/comments', () => {
  it('should return comments with correct structure', async () => {
    // This will fail with 404 until the route is created
    const response = await fetch('http://localhost:3000/api/comments');
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(
      expect.objectContaining({
        comments: expect.any(Array),
        total: expect.any(Number),
        page: expect.any(Number),
        limit: expect.any(Number),
      })
    );

    // Verify comment structure if comments exist
    if (data.comments.length > 0) {
      const firstComment = data.comments[0];
      expect(firstComment).toEqual(
        expect.objectContaining({
          id: expect.any(String),
          content: expect.any(String),
          author: expect.objectContaining({
            id: expect.any(String),
            name: expect.any(String),
            avatar: expect.any(String),
          }),
          postId: expect.any(String),
          postSlug: expect.any(String),
          parentId: expect.any(String),
          replies: expect.any(Array),
          likes: expect.any(Number),
          isApproved: expect.any(Boolean),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
        })
      );
    }
  });

  it('should support filtering by post ID', async () => {
    const postId = 'test-post-id';

    const response = await fetch(
      `http://localhost:3000/api/comments?postId=${postId}`
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toBeDefined();

    // All returned comments should belong to the specified post
    data.comments.forEach((comment: { postId: string }) => {
      expect(comment.postId).toBe(postId);
    });
  });

  it('should support filtering by approval status', async () => {
    const response = await fetch(
      'http://localhost:3000/api/comments?approved=true'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toBeDefined();

    // All returned comments should be approved
    data.comments.forEach((comment: { isApproved: boolean }) => {
      expect(comment.isApproved).toBe(true);
    });
  });

  it('should support pagination parameters', async () => {
    const response = await fetch(
      'http://localhost:3000/api/comments?page=2&limit=10'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.page).toBe(2);
    expect(data.limit).toBe(10);
    expect(data.comments.length).toBeLessThanOrEqual(10);
  });

  it('should support sorting by date', async () => {
    const response = await fetch(
      'http://localhost:3000/api/comments?sort=newest'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toBeDefined();

    if (data.comments.length > 1) {
      // Comments should be sorted by creation date (newest first)
      for (let i = 0; i < data.comments.length - 1; i++) {
        const currentDate = new Date(data.comments[i].createdAt);
        const nextDate = new Date(data.comments[i + 1].createdAt);
        expect(currentDate.getTime()).toBeGreaterThanOrEqual(
          nextDate.getTime()
        );
      }
    }
  });

  it('should return only top-level comments when requested', async () => {
    const response = await fetch(
      'http://localhost:3000/api/comments?topLevel=true'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toBeDefined();

    // All returned comments should be top-level (no parent)
    data.comments.forEach((comment: { parentId: string | null }) => {
      expect(comment.parentId).toBeNull();
    });
  });

  it('should include reply count for each comment', async () => {
    const response = await fetch(
      'http://localhost:3000/api/comments?includeReplies=true'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toBeDefined();

    // Each comment should have a reply count
    data.comments.forEach((comment: { replyCount: number }) => {
      expect(comment).toHaveProperty('replyCount');
      expect(typeof comment.replyCount).toBe('number');
      expect(comment.replyCount).toBeGreaterThanOrEqual(0);
    });
  });

  it('should support search functionality', async () => {
    const response = await fetch(
      'http://localhost:3000/api/comments?search=helpful'
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.comments).toBeDefined();

    // All returned comments should contain the search term
    data.comments.forEach((comment: { content: string }) => {
      expect(comment.content.toLowerCase()).toContain('helpful');
    });
  });
});
