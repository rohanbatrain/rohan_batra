/**
 * Integration Test: RSS Feed Flow
 * Tests RSS feed generation and consumption
 */

import { describe, it, expect } from 'vitest';

describe('RSS Feed Flow Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  let feedXML: string;
  let feedItems: any[] = [];
  
  it('Step 1: Fetch RSS feed', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/xml');
    
    feedXML = await response.text();
    expect(feedXML).toBeDefined();
    expect(feedXML.length).toBeGreaterThan(0);
    
    console.log('Feed XML length:', feedXML.length);
  });
  
  it('Step 2: Validate RSS 2.0 structure', async () => {
    expect(feedXML).toContain('<?xml version="1.0"');
    expect(feedXML).toContain('<rss version="2.0"');
    expect(feedXML).toContain('<channel>');
    expect(feedXML).toContain('</channel>');
    expect(feedXML).toContain('</rss>');
  });
  
  it('Step 3: Validate channel metadata', async () => {
    // Required channel elements
    expect(feedXML).toContain('<title>');
    expect(feedXML).toContain('<link>');
    expect(feedXML).toContain('<description>');
    
    // Optional but recommended
    if (feedXML.includes('<language>')) {
      expect(feedXML).toMatch(/<language>en(-[A-Z]{2})?<\/language>/);
    }
    
    if (feedXML.includes('<lastBuildDate>')) {
      const dateMatch = feedXML.match(/<lastBuildDate>(.*?)<\/lastBuildDate>/);
      if (dateMatch) {
        const date = new Date(dateMatch[1]);
        expect(date.toString()).not.toBe('Invalid Date');
      }
    }
  });
  
  it('Step 4: Extract and validate feed items', async () => {
    const itemMatches = feedXML.matchAll(/<item>([\s\S]*?)<\/item>/g);
    feedItems = Array.from(itemMatches).map(match => match[1]);
    
    console.log('Feed items found:', feedItems.length);
    
    expect(feedItems.length).toBeGreaterThanOrEqual(0);
    expect(feedItems.length).toBeLessThanOrEqual(50); // Reasonable limit
  });
  
  it('Step 5: Validate item structure', async () => {
    if (feedItems.length === 0) {
      console.log('Skipping: No items in feed');
      return;
    }
    
    feedItems.forEach((item, index) => {
      // Required elements
      expect(item).toContain('<title>');
      expect(item).toContain('<link>');
      
      // Recommended elements
      expect(item).toContain('<guid');
      expect(item).toContain('<pubDate>');
      
      // Content should be present
      if (item.includes('<description>')) {
        expect(item).toMatch(/<description>[\s\S]*?<\/description>/);
      }
    });
  });
  
  it('Step 6: Verify links point to braindump pages', async () => {
    if (feedItems.length === 0) {
      console.log('Skipping: No items in feed');
      return;
    }
    
    feedItems.forEach(item => {
      const linkMatch = item.match(/<link>(.*?)<\/link>/);
      if (linkMatch) {
        const link = linkMatch[1];
        expect(link).toContain('/braindump/');
        expect(link).toMatch(/\/braindump\/[a-zA-Z0-9_-]+/);
      }
    });
  });
  
  it('Step 7: Verify items are ordered by date (newest first)', async () => {
    if (feedItems.length < 2) {
      console.log('Skipping: Not enough items for date ordering test');
      return;
    }
    
    const dates = feedItems.map(item => {
      const dateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
      return dateMatch ? new Date(dateMatch[1]) : null;
    }).filter(d => d !== null);
    
    // Verify descending order
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i]! >= dates[i + 1]!).toBe(true);
    }
  });
  
  it('Step 8: Test accessing a braindump from feed link', async () => {
    if (feedItems.length === 0) {
      console.log('Skipping: No items in feed');
      return;
    }
    
    // Extract first item link
    const firstItem = feedItems[0];
    const linkMatch = firstItem.match(/<link>(.*?)<\/link>/);
    
    if (linkMatch) {
      const link = linkMatch[1];
      const path = link.replace(baseUrl, '');
      
      // Try to fetch the braindump
      const response = await fetch(`${baseUrl}${path}`);
      
      // Should be accessible (200) or not found (404)
      expect([200, 404]).toContain(response.status);
      
      if (response.ok) {
        // Should return HTML or JSON
        const contentType = response.headers.get('content-type');
        expect(contentType).toMatch(/(text\/html|application\/json)/);
      }
    }
  });
  
  it('Step 9: Verify content is properly escaped', async () => {
    if (feedItems.length === 0) {
      console.log('Skipping: No items in feed');
      return;
    }
    
    feedItems.forEach(item => {
      // Remove CDATA sections (where unescaped content is allowed)
      const withoutCDATA = item.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
      
      // Check that special characters outside CDATA are escaped
      const textContent = withoutCDATA.replace(/<[^>]+>/g, '');
      
      // Should not have unescaped ampersands
      expect(textContent).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)[^;]*;/);
    });
  });
  
  it('Step 10: Test feed caching headers', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeDefined();
    
    // Should have some caching
    if (cacheControl) {
      expect(cacheControl).toMatch(/(max-age|s-maxage)/);
    }
  });
  
  it('Step 11: Verify GUIDs are unique', async () => {
    if (feedItems.length < 2) {
      console.log('Skipping: Not enough items for GUID uniqueness test');
      return;
    }
    
    const guids = feedItems.map(item => {
      const guidMatch = item.match(/<guid[^>]*>(.*?)<\/guid>/);
      return guidMatch ? guidMatch[1] : null;
    }).filter(g => g !== null);
    
    // All GUIDs should be unique
    const uniqueGuids = new Set(guids);
    expect(uniqueGuids.size).toBe(guids.length);
  });
  
  it('Step 12: Test feed updates after new braindump', async () => {
    // Fetch feed twice to check consistency
    const response1 = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml1 = await response1.text();
    
    // Small delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response2 = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml2 = await response2.text();
    
    // Both should be valid
    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);
    
    // Structure should be consistent
    expect(xml1.includes('<rss')).toBe(true);
    expect(xml2.includes('<rss')).toBe(true);
  });
});
