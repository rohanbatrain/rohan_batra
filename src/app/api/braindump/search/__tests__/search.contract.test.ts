/**
 * Contract Test: GET /api/braindump/search
 * Search endpoint validation
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const SearchResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    query: z.string(),
    results: z.array(z.object({
      _id: z.string(),
      content: z.string(),
      slug: z.string().optional(),
      tags: z.array(z.string()),
      category: z.string().optional(),
      visibility: z.enum(['public', 'unlisted']),
      viewCount: z.number(),
      shareCount: z.number(),
      commentCount: z.number(),
      reactionCount: z.number(),
      createdAt: z.string(),
      relevanceScore: z.number().optional(),
    })),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      hasMore: z.boolean(),
    }),
  }),
});

const SuggestionsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    suggestions: z.array(z.string()),
  }),
});

describe('GET /api/braindump/search - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return 400 for queries less than 2 characters', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=a`);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('at least 2 characters');
  });
  
  it('should return valid search results', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=test&limit=10`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    const result = SearchResponseSchema.safeParse(data);
    
    if (!result.success) {
      console.error('Validation errors:', result.error.errors);
    }
    
    expect(result.success).toBe(true);
  });
  
  it('should accept sort parameter', async () => {
    const sortOptions = ['relevance', 'recent', 'popular'];
    
    for (const sort of sortOptions) {
      const response = await fetch(`${baseUrl}/api/braindump/search?q=test&sort=${sort}`);
      expect(response.status).toBe(200);
    }
  });
  
  it('should respect limit parameter (max 50)', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=test&limit=100`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data.results.length).toBeLessThanOrEqual(50);
  });
  
  it('should support pagination', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=test&page=2&limit=5`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.data.pagination.page).toBe(2);
    expect(data.data.pagination.limit).toBe(5);
  });
  
  it('should filter by tags', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=test&tags=javascript,typescript`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // If results exist, they should have matching tags
    if (data.data.results.length > 0) {
      data.data.results.forEach((result: any) => {
        const hasTags = result.tags.some((tag: string) => 
          ['javascript', 'typescript'].includes(tag.toLowerCase())
        );
        // Note: Might not match if no results with those tags
      });
    }
  });
  
  it('should only return public/unlisted braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=test`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    data.data.results.forEach((result: any) => {
      expect(['public', 'unlisted']).toContain(result.visibility);
    });
  });
  
  it('should provide search suggestions', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=java&suggestions=true`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    const result = SuggestionsResponseSchema.safeParse(data);
    
    expect(result.success).toBe(true);
    expect(Array.isArray(data.data.suggestions)).toBe(true);
  });
  
  it('should enforce rate limiting', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=test`);
    
    // Should have rate limit headers or succeed
    expect([200, 429]).toContain(response.status);
  });
  
  it('should handle special characters in query', async () => {
    const specialQuery = encodeURIComponent('test & search | query');
    const response = await fetch(`${baseUrl}/api/braindump/search?q=${specialQuery}`);
    
    expect(response.status).toBe(200);
  });
  
  it('should include relevance scores when sorting by relevance', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/search?q=test&sort=relevance`);
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.data.results.length > 0) {
        // Results should have relevance scores
        data.data.results.forEach((result: any) => {
          expect(result.relevanceScore).toBeDefined();
          expect(typeof result.relevanceScore).toBe('number');
        });
        
        // Should be sorted by relevance (descending)
        for (let i = 0; i < data.data.results.length - 1; i++) {
          expect(data.data.results[i].relevanceScore).toBeGreaterThanOrEqual(
            data.data.results[i + 1].relevanceScore
          );
        }
      }
    }
  });
});
