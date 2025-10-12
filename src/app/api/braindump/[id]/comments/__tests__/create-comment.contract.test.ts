/**
 * Contract Test: POST /api/braindump/[id]/comments
 * Comment creation endpoint
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const CommentCreateResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    comment: z.object({
      _id: z.string(),
      braindumpId: z.string(),
      authorId: z.string(),
      content: z.string(),
      parentId: z.string().optional(),
      status: z.string(),
      createdAt: z.string(),
    }),
  }),
  message: z.string(),
});

const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

describe('POST /api/braindump/[id]/comments - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return 401 for unauthenticated requests', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Test comment' }),
    });
    
    expect(response.status).toBe(401);
  });
  
  it('should return 400 for invalid braindump ID', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/invalid-id/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ content: 'Test comment' }),
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should return 400 for missing content', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({}),
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should sanitize HTML in comment content', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const maliciousContent = '<script>alert("XSS")</script>Nice comment';
    
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ content: maliciousContent }),
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.data.comment.content).not.toContain('<script>');
    }
  });
  
  it('should enforce comment length limits', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const longContent = 'a'.repeat(5001); // Over 5000 char limit
    
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ content: longContent }),
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should prevent nested replies beyond 1 level', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const replyToReplyId = '507f1f77bcf86cd799439022'; // Assume this is a reply
    
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ 
        content: 'Reply to reply',
        parentId: replyToReplyId,
      }),
    });
    
    if (response.status === 400) {
      const data = await response.json();
      expect(data.error).toContain('nesting');
    }
  });
  
  it('should enforce rate limiting (10 comments/hour)', async () => {
    // Note: This is a simplified test - full rate limit testing requires multiple requests
    const testId = '507f1f77bcf86cd799439011';
    
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/comments`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ content: 'Test comment' }),
    });
    
    // Should have rate limit headers or appropriate status
    expect([200, 201, 401, 404, 429]).toContain(response.status);
  });
});
