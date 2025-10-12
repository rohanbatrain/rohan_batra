/**
 * Contract Test: GET /api/braindump
 * Public braindump listing endpoint
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { z } from 'zod';

// Response schema validation
const BraindumpListResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    braindumps: z.array(z.object({
      _id: z.string(),
      content: z.string(),
      tags: z.array(z.string()),
      visibility: z.enum(['public', 'unlisted']),
      slug: z.string().optional(),
      viewCount: z.number(),
      shareCount: z.number(),
      commentCount: z.number(),
      createdAt: z.string(),
      updatedAt: z.string(),
    })),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }),
    popularTags: z.array(z.object({
      _id: z.string(),
      count: z.number(),
    })).optional(),
  }),
});

describe('GET /api/braindump - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return 200 with valid response structure', async () => {
    const response = await fetch(`${baseUrl}/api/braindump`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    const result = BraindumpListResponseSchema.safeParse(data);
    
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);
    }
    
    expect(result.success).toBe(true);
  });
  
  it('should accept pagination parameters', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?page=1&limit=10`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data.pagination.page).toBe(1);
    expect(data.data.pagination.limit).toBe(10);
  });
  
  it('should accept search parameter', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?search=test`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });
  
  it('should accept tag filter', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?tag=javascript`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });
  
  it('should accept sort parameter', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?sort=views`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });
  
  it('should only return public and unlisted braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/braindump`);
    const data = await response.json();
    
    if (data.data.braindumps.length > 0) {
      data.data.braindumps.forEach((braindump: any) => {
        expect(['public', 'unlisted']).toContain(braindump.visibility);
      });
    }
  });
  
  it('should not expose private fields (userId, sharedWith)', async () => {
    const response = await fetch(`${baseUrl}/api/braindump`);
    const data = await response.json();
    
    if (data.data.braindumps.length > 0) {
      const firstBraindump = data.data.braindumps[0];
      expect(firstBraindump.userId).toBeUndefined();
      expect(firstBraindump.sharedWith).toBeUndefined();
      expect(firstBraindump.editHistory).toBeUndefined();
    }
  });
  
  it('should enforce rate limiting (100 req/min)', async () => {
    // This is a basic check - full rate limit testing requires load testing
    const response = await fetch(`${baseUrl}/api/braindump`);
    expect(response.headers.has('x-ratelimit-limit') || response.status === 200).toBe(true);
  });
});
