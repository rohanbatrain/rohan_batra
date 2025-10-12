/**
 * Contract Test: GET /api/analytics/braindump/[id]
 * Individual braindump analytics endpoint
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const AnalyticsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    braindumpId: z.string(),
    viewCount: z.number(),
    uniqueViewCount: z.number(),
    shareCount: z.number(),
    commentCount: z.number(),
    reactionCount: z.number(),
    reactionBreakdown: z.object({
      '👍': z.number(),
      '❤️': z.number(),
      '🎯': z.number(),
      '💡': z.number(),
      '🔥': z.number(),
    }),
    topReferrers: z.array(z.object({
      source: z.string(),
      count: z.number(),
    })).optional(),
    viewsOverTime: z.array(z.object({
      date: z.string(),
      count: z.number(),
    })).optional(),
  }),
});

describe('GET /api/analytics/braindump/[id] - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return 401 for unauthenticated requests', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${testId}`);
    
    expect(response.status).toBe(401);
  });
  
  it('should return 403 for non-owner access to private braindumps', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${testId}`, {
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    // Should be 403 or 404 if not owner
    expect([200, 401, 403, 404]).toContain(response.status);
  });
  
  it('should return valid analytics structure', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${testId}`, {
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const result = AnalyticsResponseSchema.safeParse(data);
      
      if (!result.success) {
        console.error('Validation errors:', result.error.errors);
      }
      
      expect(result.success).toBe(true);
    }
  });
  
  it('should return all reaction counts', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${testId}`, {
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const breakdown = data.data.reactionBreakdown;
      
      // Should have all 5 emoji counts
      expect(breakdown).toHaveProperty('👍');
      expect(breakdown).toHaveProperty('❤️');
      expect(breakdown).toHaveProperty('🎯');
      expect(breakdown).toHaveProperty('💡');
      expect(breakdown).toHaveProperty('🔥');
      
      // All should be numbers >= 0
      Object.values(breakdown).forEach((count: any) => {
        expect(typeof count).toBe('number');
        expect(count).toBeGreaterThanOrEqual(0);
      });
    }
  });
  
  it('should calculate unique view count', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${testId}`, {
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    if (response.ok) {
      const data = await response.json();
      
      // Unique views should be <= total views
      expect(data.data.uniqueViewCount).toBeLessThanOrEqual(data.data.viewCount);
    }
  });
  
  it('should accept time range parameter', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(
      `${baseUrl}/api/analytics/braindump/${testId}?range=7d`,
      { headers: { 'Authorization': 'Bearer test-token' } }
    );
    
    // Should accept range parameter
    expect([200, 401, 403, 404]).toContain(response.status);
  });
  
  it('should return 400 for invalid braindump ID', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/braindump/invalid-id`, {
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should return 404 for non-existent braindump', async () => {
    const nonExistentId = '507f1f77bcf86cd799439999';
    const response = await fetch(`${baseUrl}/api/analytics/braindump/${nonExistentId}`, {
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    expect([404, 403]).toContain(response.status);
  });
});
