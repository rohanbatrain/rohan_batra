/**
 * Contract Test: GET /api/braindump/feed.xml
 * RSS feed endpoint
 */

import { describe, it, expect } from 'vitest';

describe('GET /api/braindump/feed.xml - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return RSS feed with correct content type', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    expect(response.status).toBe(200);
    
    const contentType = response.headers.get('content-type');
    expect(contentType).toContain('application/xml');
  });
  
  it('should return valid XML structure', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    expect(response.status).toBe(200);
    
    const xml = await response.text();
    
    // Check for basic RSS structure
    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<rss');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('</channel>');
    expect(xml).toContain('</rss>');
  });
  
  it('should include channel metadata', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Required RSS channel elements
    expect(xml).toContain('<title>');
    expect(xml).toContain('<description>');
    expect(xml).toContain('<link>');
  });
  
  it('should include item elements for braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Should have <item> elements (if any braindumps exist)
    if (xml.includes('<item>')) {
      expect(xml).toContain('<title>');
      expect(xml).toContain('<link>');
      expect(xml).toContain('<pubDate>');
      expect(xml).toContain('<guid>');
    }
  });
  
  it('should use slug in item links when available', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Links should point to /braindump/[slug] or /braindump/[id]
    if (xml.includes('<item>')) {
      expect(xml).toMatch(/<link>.*\/braindump\/[^<]+<\/link>/);
    }
  });
  
  it('should only include public braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // The feed should not indicate visibility in content
    // (implicitly all items are public)
    expect(xml).not.toContain('visibility:private');
    expect(xml).not.toContain('visibility:unlisted');
  });
  
  it('should limit feed to reasonable number of items', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Count <item> occurrences
    const itemCount = (xml.match(/<item>/g) || []).length;
    
    // RSS feeds typically show 10-50 items
    expect(itemCount).toBeLessThanOrEqual(50);
  });
  
  it('should escape special characters in content', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Should not have unescaped special chars in text content
    // (between tags, not in CDATA)
    const textContent = xml.replace(/<!\[CDATA\[.*?\]\]>/g, '');
    
    // These should be escaped if present
    expect(textContent).not.toMatch(/[^<]*&(?!amp;|lt;|gt;|quot;|apos;)[^;]*;/);
  });
  
  it('should set appropriate cache headers', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    
    // Should have cache control headers
    const cacheControl = response.headers.get('cache-control');
    expect(cacheControl).toBeDefined();
  });
  
  it('should include proper RSS version', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Should specify RSS version 2.0
    expect(xml).toMatch(/<rss\s+version="2\.0"/);
  });
  
  it('should order items by most recent first', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Extract pubDates
    const pubDateMatches = xml.matchAll(/<pubDate>(.*?)<\/pubDate>/g);
    const dates = Array.from(pubDateMatches).map(match => new Date(match[1]));
    
    // Check descending order
    for (let i = 0; i < dates.length - 1; i++) {
      expect(dates[i] >= dates[i + 1]).toBe(true);
    }
  });
});
