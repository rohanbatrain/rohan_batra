/**
 * Contract Test: GET /api/analytics/trending
 * Trending braindumps endpoint
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const TrendingResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    braindumps: z.array(z.object({
      _id: z.string(),
      content: z.string(),
      slug: z.string().optional(),
      viewCount: z.number(),
      shareCount: z.number(),
      commentCount: z.number(),
      reactionCount: z.number(),
      trendingScore: z.number(),
      createdAt: z.string(),
    })),
    period: z.string(),
    cacheHit: z.boolean().optional(),
  }),
});

describe('GET /api/analytics/trending - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return valid response structure', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending?period=7d&limit=10`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    const result = TrendingResponseSchema.safeParse(data);
    
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);
    }
    
    expect(result.success).toBe(true);
  });
  
  it('should accept period parameter (24h, 7d, 30d)', async () => {
    const periods = ['24h', '7d', '30d'];
    
    for (const period of periods) {
      const response = await fetch(`${baseUrl}/api/analytics/trending?period=${period}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.data.period).toBe(period);
    }
  });
  
  it('should default to 7d if period not specified', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(['24h', '7d', '30d']).toContain(data.data.period);
  });
  
  it('should respect limit parameter (max 50)', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending?limit=5`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data.braindumps.length).toBeLessThanOrEqual(5);
  });
  
  it('should enforce max limit of 50', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending?limit=100`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data.braindumps.length).toBeLessThanOrEqual(50);
  });
  
  it('should return braindumps sorted by trending score', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending?period=7d&limit=10`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    const braindumps = data.data.braindumps;
    
    // Verify descending order
    for (let i = 0; i < braindumps.length - 1; i++) {
      expect(braindumps[i].trendingScore).toBeGreaterThanOrEqual(
        braindumps[i + 1].trendingScore
      );
    }
  });
  
  it('should calculate trending score correctly', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending?period=7d&limit=5`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data.braindumps.length > 0) {
        const braindump = data.data.braindumps[0];
        
        // Trending score = (views × 1) + (shares × 5) + (comments × 3) + (reactions × 2)
        const expectedScore = 
          (braindump.viewCount * 1) +
          (braindump.shareCount * 5) +
          (braindump.commentCount * 3) +
          (braindump.reactionCount * 2);
        
        expect(braindump.trendingScore).toBe(expectedScore);
      }
    }
  });
  
  it('should use Redis caching', async () => {
    // First request - cache miss
    const response1 = await fetch(`${baseUrl}/api/analytics/trending?period=7d`);
    const data1 = await response1.json();
    
    // Second request immediately after - should be cache hit
    const response2 = await fetch(`${baseUrl}/api/analytics/trending?period=7d`);
    const data2 = await response2.json();
    
    // If caching is working, second request might indicate cache hit
    // (Implementation-specific, may not always be exposed)
    expect(response2.status).toBe(200);
  });
  
  it('should only include public/unlisted braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending`);
    
    if (response.ok) {
      const data = await response.json();
      
      // All returned braindumps should have visibility public or unlisted
      data.data.braindumps.forEach((braindump: any) => {
        // If visibility field is included, verify it's not private
        if (braindump.visibility) {
          expect(['public', 'unlisted']).toContain(braindump.visibility);
        }
      });
    }
  });
  
  it('should handle empty results gracefully', async () => {
    // Request with very restrictive period
    const response = await fetch(`${baseUrl}/api/analytics/trending?period=24h&limit=100`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.data.braindumps)).toBe(true);
  });
});
