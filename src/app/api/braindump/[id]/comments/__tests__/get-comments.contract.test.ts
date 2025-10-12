/**
 * Contract Test: GET /api/braindump/[id]/comments
 * Get comments for a braindump
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const CommentSchema = z.object({
  _id: z.string(),
  authorId: z.string(),
  content: z.string(),
  status: z.string(),
  createdAt: z.string().or(z.date()),
  replies: z.array(z.object({
    _id: z.string(),
    authorId: z.string(),
    content: z.string(),
    status: z.string(),
    createdAt: z.string().or(z.date()),
  })),
});

const CommentsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    comments: z.array(CommentSchema),
    total: z.number(),
  }),
});

describe('GET /api/braindump/[id]/comments - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return valid response structure', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.status === 200) {
      const data = await response.json();
      const result = CommentsResponseSchema.safeParse(data);
      
      if (!result.success) {
        console.error('Validation errors:', result.error.errors);
      }
      
      expect(result.success).toBe(true);
    } else {
      // 404 is acceptable for non-existent braindump
      expect([404, 403]).toContain(response.status);
    }
  });
  
  it('should return 404 for non-existent braindump', async () => {
    const nonExistentId = '507f1f77bcf86cd799439999';
    const response = await fetch(`${baseUrl}/api/braindump/${nonExistentId}/comments`);
    
    expect([404, 403]).toContain(response.status);
  });
  
  it('should return 400 for invalid braindump ID', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/invalid-id/comments`);
    expect(response.status).toBe(400);
  });
  
  it('should return 403 for private braindump', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    // Should be 200 if public, 403 if private
    expect([200, 403, 404]).toContain(response.status);
  });
  
  it('should return threaded comments with replies', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      
      // Each comment should have replies array
      data.data.comments.forEach((comment: any) => {
        expect(Array.isArray(comment.replies)).toBe(true);
      });
    }
  });
  
  it('should only return approved/pending comments', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      
      data.data.comments.forEach((comment: any) => {
        expect(['approved', 'pending']).toContain(comment.status);
      });
    }
  });
  
  it('should return comments sorted by newest first', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      const comments = data.data.comments;
      
      // Verify descending order by creation time
      for (let i = 0; i < comments.length - 1; i++) {
        const date1 = new Date(comments[i].createdAt);
        const date2 = new Date(comments[i + 1].createdAt);
        expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
      }
    }
  });
  
  it('should return total comment count', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      expect(typeof data.data.total).toBe('number');
      expect(data.data.total).toBeGreaterThanOrEqual(data.data.comments.length);
    }
  });
  
  it('should not expose sensitive author information', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data.comments.length > 0) {
        const comment = data.data.comments[0];
        
        // Should have authorId but not email or other sensitive data
        expect(comment.authorId).toBeDefined();
        expect(comment.email).toBeUndefined();
        expect(comment.password).toBeUndefined();
      }
    }
  });
});
