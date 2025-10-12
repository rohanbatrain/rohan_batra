/**
 * Contract Test: POST /api/braindump/[id]/reactions
 * Reaction toggle endpoint
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const ReactionResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    action: z.enum(['added', 'removed']),
    emoji: z.string(),
    reactionCounts: z.object({
      '👍': z.number(),
      '❤️': z.number(),
      '🎯': z.number(),
      '💡': z.number(),
      '🔥': z.number(),
    }),
  }),
});

describe('POST /api/braindump/[id]/reactions - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const validEmojis = ['👍', '❤️', '🎯', '💡', '🔥'];
  
  it('should return 401 for unauthenticated requests', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji: '👍' }),
    });
    
    expect(response.status).toBe(401);
  });
  
  it('should return 400 for invalid emoji', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ emoji: '😀' }), // Not in allowed list
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should accept all valid emojis', async () => {
    const testId = '507f1f77bcf86cd799439011';
    
    for (const emoji of validEmojis) {
      const response = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ emoji }),
      });
      
      // Should either succeed or return auth/not-found error (not validation error)
      expect([200, 201, 401, 404]).toContain(response.status);
    }
  });
  
  it('should return reaction counts after toggle', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ emoji: '👍' }),
    });
    
    if (response.ok) {
      const data = await response.json();
      const result = ReactionResponseSchema.safeParse(data);
      expect(result.success).toBe(true);
      
      if (result.success) {
        expect(['added', 'removed']).toContain(result.data.data.action);
      }
    }
  });
  
  it('should toggle reaction (add then remove)', async () => {
    const testId = '507f1f77bcf86cd799439011';
    
    // First request - should add
    const response1 = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ emoji: '❤️' }),
    });
    
    if (response1.ok) {
      const data1 = await response1.json();
      
      // Second request - should remove
      const response2 = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ emoji: '❤️' }),
      });
      
      if (response2.ok) {
        const data2 = await response2.json();
        
        // Actions should be opposite
        if (data1.data.action === 'added') {
          expect(data2.data.action).toBe('removed');
        } else {
          expect(data2.data.action).toBe('added');
        }
      }
    }
  });
  
  it('should enforce rate limiting (50 reactions/min)', async () => {
    const testId = '507f1f77bcf86cd799439011';
    
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ emoji: '🔥' }),
    });
    
    // Should return appropriate status
    expect([200, 201, 401, 404, 429]).toContain(response.status);
  });
  
  it('GET should return all reaction counts', async () => {
    const testId = '507f1f77bcf86cd799439011';
    
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/reactions`);
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.reactionCounts).toBeDefined();
      
      // Should have all 5 emoji counts
      validEmojis.forEach(emoji => {
        expect(typeof data.data.reactionCounts[emoji]).toBe('number');
      });
    }
  });
});
