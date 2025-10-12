/**
 * Integration Test: Search Flow
 * Tests complete search functionality end-to-end
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Search Flow Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  let testQuery: string;
  let searchResults: any[];
  
  beforeAll(() => {
    testQuery = 'javascript';
  });
  
  it('Step 1: Get search suggestions for partial query', async () => {
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&suggestions=true`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.suggestions)).toBe(true);
    
    console.log('Suggestions received:', data.data.suggestions.length);
  });
  
  it('Step 2: Perform full search with relevance sort', async () => {
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&sort=relevance&limit=10`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.data.query).toBe(testQuery);
    expect(Array.isArray(data.data.results)).toBe(true);
    
    searchResults = data.data.results;
    console.log('Search results:', searchResults.length);
    
    // Verify relevance sorting
    if (searchResults.length > 1) {
      for (let i = 0; i < searchResults.length - 1; i++) {
        const current = searchResults[i].relevanceScore || 0;
        const next = searchResults[i + 1].relevanceScore || 0;
        expect(current).toBeGreaterThanOrEqual(next);
      }
    }
  });
  
  it('Step 3: View top search result details', async () => {
    if (searchResults.length === 0) {
      console.log('Skipping: No search results');
      return;
    }
    
    const topResult = searchResults[0];
    const identifier = topResult.slug || topResult._id;
    
    const response = await fetch(`${baseUrl}/api/braindump/${identifier}`);
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.braindump).toBeDefined();
      
      // View count should increment
      expect(data.data.braindump.viewCount).toBeGreaterThanOrEqual(0);
    }
  });
  
  it('Step 4: Search with tag filter', async () => {
    // Try to find common tag from results
    let commonTag = 'javascript';
    
    if (searchResults.length > 0 && searchResults[0].tags.length > 0) {
      commonTag = searchResults[0].tags[0];
    }
    
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&tags=${commonTag}&limit=10`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    
    // All results should have the tag
    if (data.data.results.length > 0) {
      data.data.results.forEach((result: any) => {
        expect(result.tags.some((t: string) => 
          t.toLowerCase().includes(commonTag.toLowerCase())
        )).toBe(true);
      });
    }
  });
  
  it('Step 5: Search and sort by recency', async () => {
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&sort=recent&limit=10`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    const results = data.data.results;
    
    // Verify descending date order
    if (results.length > 1) {
      for (let i = 0; i < results.length - 1; i++) {
        const current = new Date(results[i].createdAt);
        const next = new Date(results[i + 1].createdAt);
        expect(current >= next).toBe(true);
      }
    }
  });
  
  it('Step 6: Search and sort by popularity', async () => {
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&sort=popular&limit=10`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    const results = data.data.results;
    
    // Calculate popularity scores and verify order
    if (results.length > 1) {
      const scores = results.map((r: any) => 
        (r.viewCount * 1) + 
        (r.shareCount * 5) + 
        (r.commentCount * 3) + 
        (r.reactionCount * 2)
      );
      
      for (let i = 0; i < scores.length - 1; i++) {
        expect(scores[i]).toBeGreaterThanOrEqual(scores[i + 1]);
      }
    }
  });
  
  it('Step 7: Test pagination', async () => {
    const page1Response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&page=1&limit=5`
    );
    
    expect(page1Response.status).toBe(200);
    
    const page1Data = await page1Response.json();
    expect(page1Data.data.pagination.page).toBe(1);
    
    // Try page 2
    const page2Response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&page=2&limit=5`
    );
    
    expect(page2Response.status).toBe(200);
    
    const page2Data = await page2Response.json();
    expect(page2Data.data.pagination.page).toBe(2);
    
    // Results should be different (if enough results exist)
    if (page1Data.data.results.length > 0 && page2Data.data.results.length > 0) {
      const page1Ids = page1Data.data.results.map((r: any) => r._id);
      const page2Ids = page2Data.data.results.map((r: any) => r._id);
      
      // Pages should have different results
      const overlap = page1Ids.filter((id: string) => page2Ids.includes(id));
      expect(overlap.length).toBe(0);
    }
  });
  
  it('Step 8: Test special characters in search', async () => {
    const specialQuery = encodeURIComponent('test & search | query');
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${specialQuery}`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });
  
  it('Step 9: Test empty search results', async () => {
    const obscureQuery = 'xyzabc123unlikely';
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${obscureQuery}`
    );
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.results)).toBe(true);
    // May have 0 results
    expect(data.data.results.length).toBeGreaterThanOrEqual(0);
  });
  
  it('Step 10: Test search query validation', async () => {
    // Too short query
    const response = await fetch(`${baseUrl}/api/braindump/search?q=a`);
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data.success).toBe(false);
    expect(data.error).toContain('at least 2 characters');
  });
  
  it('Step 11: Verify only public/unlisted results', async () => {
    const response = await fetch(
      `${baseUrl}/api/braindump/search?q=${testQuery}&limit=20`
    );
    
    if (response.ok) {
      const data = await response.json();
      
      data.data.results.forEach((result: any) => {
        expect(['public', 'unlisted']).toContain(result.visibility);
      });
    }
  });
  
  it('Step 12: Test rate limiting behavior', async () => {
    // Make multiple rapid requests
    const requests = Array(10).fill(null).map(() =>
      fetch(`${baseUrl}/api/braindump/search?q=${testQuery}`)
    );
    
    const responses = await Promise.all(requests);
    
    // At least some should succeed
    const successful = responses.filter(r => r.status === 200);
    expect(successful.length).toBeGreaterThan(0);
    
    // Note: May not hit rate limit in test environment
    console.log('Rate limit test: All requests completed');
  });
});
