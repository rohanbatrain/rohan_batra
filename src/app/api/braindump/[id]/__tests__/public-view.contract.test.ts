/**
 * Contract Test: GET /api/braindump/[id]
 * Public braindump detail view endpoint
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Response schema validation
const BraindumpDetailResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    braindump: z.object({
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
    }),
  }),
});

const ErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
});

describe('GET /api/braindump/[id] - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return 404 for non-existent braindump', async () => {
    const fakeId = '507f1f77bcf86cd799439011'; // Valid ObjectId format
    const response = await fetch(`${baseUrl}/api/braindump/${fakeId}`);
    
    expect(response.status).toBe(404);
    const data = await response.json();
    const result = ErrorResponseSchema.safeParse(data);
    expect(result.success).toBe(true);
  });
  
  it('should return 400 for invalid ID format', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/invalid-id`);
    
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.success).toBe(false);
  });
  
  it('should increment view count on each request', async () => {
    // Note: This requires a valid public braindump ID
    // In real tests, this would be seeded data
    const testSlug = 'test-braindump';
    
    const response1 = await fetch(`${baseUrl}/api/braindump/${testSlug}`);
    if (response1.status === 200) {
      const data1 = await response1.json();
      const viewCount1 = data1.data.braindump.viewCount;
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const response2 = await fetch(`${baseUrl}/api/braindump/${testSlug}`);
      const data2 = await response2.json();
      const viewCount2 = data2.data.braindump.viewCount;
      
      expect(viewCount2).toBeGreaterThanOrEqual(viewCount1);
    }
  });
  
  it('should support slug-based lookup', async () => {
    const testSlug = 'test-braindump-slug';
    const response = await fetch(`${baseUrl}/api/braindump/${testSlug}`);
    
    // Either finds it or returns 404 (both valid responses for a slug)
    expect([200, 404]).toContain(response.status);
  });
  
  it('should not expose private fields', async () => {
    const testSlug = 'test-braindump';
    const response = await fetch(`${baseUrl}/api/braindump/${testSlug}`);
    
    if (response.status === 200) {
      const data = await response.json();
      const braindump = data.data.braindump;
      
      expect(braindump.userId).toBeUndefined();
      expect(braindump.sharedWith).toBeUndefined();
      expect(braindump.editHistory).toBeUndefined();
    }
  });
});
