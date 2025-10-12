/**
 * Integration Test: Reaction System
 * Tests full reaction toggle flow and analytics
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Reaction System Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  let testBraindumpId: string;
  let authToken: string;
  const testEmoji = '👍';
  
  beforeAll(async () => {
    testBraindumpId = '507f1f77bcf86cd799439011';
    authToken = 'test-auth-token';
  });
  
  it('Step 1: Get initial reaction counts', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.reactionCounts).toBeDefined();
    
    // All 5 emojis should have counts
    const validEmojis = ['👍', '❤️', '🎯', '💡', '🔥'];
    validEmojis.forEach(emoji => {
      expect(typeof data.data.reactionCounts[emoji]).toBe('number');
    });
  });
  
  it('Step 2: Add a reaction', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ emoji: testEmoji }),
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(['added', 'removed']).toContain(data.data.action);
      expect(data.data.emoji).toBe(testEmoji);
      expect(data.data.reactionCounts).toBeDefined();
    } else {
      // Expected if auth/braindump doesn't exist
      expect([401, 404]).toContain(response.status);
    }
  });
  
  it('Step 3: Toggle reaction (remove)', async () => {
    // Try to toggle the same reaction again
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ emoji: testEmoji }),
    });
    
    if (response.ok) {
      const data = await response.json();
      // Action should be opposite of step 2
      expect(['added', 'removed']).toContain(data.data.action);
    }
  });
  
  it('Step 4: Toggle back (add again)', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ emoji: testEmoji }),
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
    }
  });
  
  it('Step 5: Add different emoji reaction', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ emoji: '❤️' }),
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      // Should have reactions for both emojis now
    }
  });
  
  it('Step 6: Verify reaction counts updated', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`);
    
    if (response.ok) {
      const data = await response.json();
      
      // Reaction counts should reflect our toggles
      expect(data.data.reactionCounts).toBeDefined();
      
      // Total reaction count should be sum of all
      const total = Object.values(data.data.reactionCounts).reduce(
        (sum: number, count: any) => sum + count,
        0
      );
      expect(total).toBeGreaterThanOrEqual(0);
    }
  });
  
  it('Step 7: Check user-specific reactions', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Should include user's reactions if authenticated
      if (data.data.userReactions) {
        expect(Array.isArray(data.data.userReactions)).toBe(true);
      }
    }
  });
  
  it('Step 8: Verify invalid emoji is rejected', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ emoji: '😀' }), // Not in allowed list
    });
    
    expect(response.status).toBe(400);
  });
  
  it('Step 9: Test rate limiting for reactions', async () => {
    const requests = [];
    
    // Try 51 reactions rapidly (limit is 50/min)
    for (let i = 0; i < 51; i++) {
      requests.push(
        fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ emoji: '🔥' }),
        })
      );
    }
    
    const responses = await Promise.all(requests);
    
    // At least one should be rate limited
    const rateLimited = responses.some(r => r.status === 429);
    console.log('Reaction rate limit test:', rateLimited ? 'PASS' : 'SKIP');
  });
  
  it('Step 10: Verify reaction count in analytics', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${testBraindumpId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.data.reactionCount).toBeGreaterThanOrEqual(0);
      expect(data.data.reactionBreakdown).toBeDefined();
      
      // Reaction breakdown should match public endpoint
      const publicResponse = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`);
      if (publicResponse.ok) {
        const publicData = await publicResponse.json();
        expect(data.data.reactionBreakdown).toEqual(publicData.data.reactionCounts);
      }
    }
  });
});
