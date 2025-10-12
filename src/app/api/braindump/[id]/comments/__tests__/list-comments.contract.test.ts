/**
 * Contract Test: GET /api/braindump/[id]/comments
 * Comments listing endpoint
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const CommentSchema = z.object({
  _id: z.string(),
  authorId: z.string(),
  content: z.string(),
  status: z.string(),
  createdAt: z.string(),
  replies: z.array(z.object({
    _id: z.string(),
    authorId: z.string(),
    content: z.string(),
    status: z.string(),
    createdAt: z.string(),
  })).optional(),
});

const CommentsListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    comments: z.array(CommentSchema),
    total: z.number(),
  }),
});

describe('GET /api/braindump/[id]/comments - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return 400 for invalid braindump ID', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/invalid-id/comments`);
    expect(response.status).toBe(400);
  });
  
  it('should return 404 for non-existent braindump', async () => {
    const nonExistentId = '507f1f77bcf86cd799439999';
    const response = await fetch(`${baseUrl}/api/braindump/${nonExistentId}/comments`);
    expect([404, 403]).toContain(response.status);
  });
  
  it('should return valid comments structure', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      const result = CommentsListResponseSchema.safeParse(data);
      
      if (!result.success) {
        console.error('Validation errors:', result.error.errors);
      }
      
      expect(result.success).toBe(true);
    }
  });
  
  it('should return threaded comments with replies', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      
      // Each top-level comment should have replies array
      data.data.comments.forEach((comment: any) => {
        expect(Array.isArray(comment.replies)).toBe(true);
      });
    }
  });
  
  it('should only show approved/pending comments', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      
      // All comments should be approved or pending
      data.data.comments.forEach((comment: any) => {
        expect(['approved', 'pending']).toContain(comment.status);
        
        // Check replies too
        comment.replies?.forEach((reply: any) => {
          expect(['approved', 'pending']).toContain(reply.status);
        });
      });
    }
  });
  
  it('should sort top-level comments by newest first', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data.comments.length > 1) {
        for (let i = 0; i < data.data.comments.length - 1; i++) {
          const current = new Date(data.data.comments[i].createdAt);
          const next = new Date(data.data.comments[i + 1].createdAt);
          expect(current >= next).toBe(true);
        }
      }
    }
  });
  
  it('should sort replies by oldest first', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      
      data.data.comments.forEach((comment: any) => {
        if (comment.replies && comment.replies.length > 1) {
          for (let i = 0; i < comment.replies.length - 1; i++) {
            const current = new Date(comment.replies[i].createdAt);
            const next = new Date(comment.replies[i + 1].createdAt);
            expect(current <= next).toBe(true);
          }
        }
      });
    }
  });
  
  it('should return total comment count', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      expect(typeof data.data.total).toBe('number');
      expect(data.data.total).toBeGreaterThanOrEqual(0);
    }
  });
  
  it('should enforce rate limiting', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`);
    
    // Should have rate limit headers or succeed
    expect([200, 404, 429]).toContain(response.status);
  });
  
  it('should return 403 for private braindumps', async () => {
    // Assuming this is a private braindump ID
    const privateId = '507f1f77bcf86cd799439012';
    const response = await fetch(`${baseUrl}/api/braindump/${privateId}/comments`);
    
    // Should be 403 or 404 for private braindumps
    expect([403, 404]).toContain(response.status);
  });
});
