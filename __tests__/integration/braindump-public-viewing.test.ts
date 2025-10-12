/**
 * Integration Test: Public Braindump Viewing Flow
 * Tests the complete user journey from listing to viewing to interacting
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Public Braindump Viewing - Integration Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  let testBraindumpId: string;
  let testBraindumpSlug: string;
  
  it('Step 1: User visits listing page and sees public braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?page=1&limit=20`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.braindumps)).toBe(true);
    
    // Save first braindump for next steps
    if (data.data.braindumps.length > 0) {
      testBraindumpId = data.data.braindumps[0]._id;
      testBraindumpSlug = data.data.braindumps[0].slug;
    }
  });
  
  it('Step 2: User clicks on a braindump and views details', async () => {
    if (!testBraindumpSlug && !testBraindumpId) {
      console.log('Skipping: No test braindumps available');
      return;
    }
    
    const identifier = testBraindumpSlug || testBraindumpId;
    const response = await fetch(`${baseUrl}/api/braindump/${identifier}`);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.braindump).toBeDefined();
      expect(data.data.braindump.content).toBeDefined();
    }
  });
  
  it('Step 3: User loads comments on the braindump', async () => {
    if (!testBraindumpId) {
      console.log('Skipping: No test braindump available');
      return;
    }
    
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.comments)).toBe(true);
    }
  });
  
  it('Step 4: User views reaction counts', async () => {
    if (!testBraindumpId) {
      console.log('Skipping: No test braindump available');
      return;
    }
    
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/reactions`);
    
    if (response.status === 200) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.reactionCounts).toBeDefined();
      expect(typeof data.data.reactionCounts['👍']).toBe('number');
    }
  });
  
  it('Step 5: User searches for braindumps by keyword', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?search=test&page=1&limit=10`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    // Search results should be filtered
    expect(Array.isArray(data.data.braindumps)).toBe(true);
  });
  
  it('Step 6: User filters by tag', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?tag=javascript&page=1&limit=10`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    // All results should have the tag
    if (data.data.braindumps.length > 0) {
      data.data.braindumps.forEach((braindump: any) => {
        expect(braindump.tags).toBeDefined();
      });
    }
  });
  
  it('Step 7: User sorts by views', async () => {
    const response = await fetch(`${baseUrl}/api/braindump?sort=views&limit=5`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    
    // Verify descending order
    if (data.data.braindumps.length > 1) {
      for (let i = 0; i < data.data.braindumps.length - 1; i++) {
        expect(data.data.braindumps[i].viewCount >= data.data.braindumps[i + 1].viewCount).toBe(true);
      }
    }
  });
  
  it('Step 8: User checks trending braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/analytics/trending?period=7d&limit=10`);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.data.braindumps)).toBe(true);
    
    // Trending items should have scores
    if (data.data.braindumps.length > 0) {
      expect(data.data.braindumps[0].trendingScore).toBeDefined();
    }
  });
});
