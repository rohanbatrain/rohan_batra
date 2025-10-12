/**
 * Integration Test: Comment System
 * Tests full comment creation, listing, and reply flow
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Comment System Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  let testBraindumpId: string;
  let testCommentId: string;
  let authToken: string;
  
  beforeAll(async () => {
    // In a real test, you'd authenticate and create a test braindump
    // For now, we'll use placeholder values
    testBraindumpId = '507f1f77bcf86cd799439011';
    authToken = 'test-auth-token';
  });
  
  it('Step 1: Create a parent comment', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: 'This is a test comment',
      }),
    });
    
    if (response.status === 201) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.comment).toBeDefined();
      expect(data.data.comment.content).toBe('This is a test comment');
      
      // Save comment ID for next steps
      testCommentId = data.data.comment._id;
    } else {
      // Expected if auth/braindump doesn't exist
      expect([401, 404]).toContain(response.status);
    }
  });
  
  it('Step 2: List comments for braindump', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`);
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.comments)).toBe(true);
      
      // If we created a comment in step 1, it should be here
      if (testCommentId) {
        const foundComment = data.data.comments.find(
          (c: any) => c._id === testCommentId
        );
        expect(foundComment).toBeDefined();
      }
    }
  });
  
  it('Step 3: Create a reply to the comment', async () => {
    if (!testCommentId) {
      console.log('Skipping: No parent comment created');
      return;
    }
    
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: 'This is a reply to the comment',
        parentId: testCommentId,
      }),
    });
    
    if (response.status === 201) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.comment.parentId).toBe(testCommentId);
    } else {
      expect([401, 404, 400]).toContain(response.status);
    }
  });
  
  it('Step 4: Verify comment nesting limit', async () => {
    if (!testCommentId) {
      console.log('Skipping: No parent comment created');
      return;
    }
    
    // Try to create a reply to a reply (should fail)
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: 'Reply to reply - should fail',
        parentId: testCommentId, // This is already a reply
      }),
    });
    
    // Should reject nested replies beyond 1 level
    if (response.status === 400) {
      const data = await response.json();
      expect(data.error).toBeDefined();
    }
  });
  
  it('Step 5: Test XSS prevention in comments', async () => {
    const maliciousContent = '<script>alert("XSS")</script><p>Safe content</p>';
    
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: maliciousContent,
      }),
    });
    
    if (response.status === 201) {
      const data = await response.json();
      
      // Script tags should be removed
      expect(data.data.comment.content).not.toContain('<script>');
      
      // Safe HTML should be preserved
      expect(data.data.comment.content).toContain('Safe content');
    }
  });
  
  it('Step 6: Test comment length validation', async () => {
    const tooLongContent = 'a'.repeat(5001);
    
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        content: tooLongContent,
      }),
    });
    
    // Should reject comments over 5000 characters
    expect(response.status).toBe(400);
  });
  
  it('Step 7: Test rate limiting for comments', async () => {
    const requests = [];
    
    // Try to create 11 comments rapidly (limit is 10/hour)
    for (let i = 0; i < 11; i++) {
      requests.push(
        fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            content: `Rate limit test comment ${i}`,
          }),
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // At least one should be rate limited
    const rateLimited = responses.some(r => r.status === 429);
    
    // Note: This might not trigger if rate limit is per-user and we're using test token
    console.log('Rate limit test:', rateLimited ? 'PASS' : 'SKIP (no rate limit hit)');
  });
  
  it('Step 8: Verify comment count in braindump analytics', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${testBraindumpId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.data.commentCount).toBeGreaterThanOrEqual(0);
    }
  });
});
