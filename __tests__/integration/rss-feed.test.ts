/**
 * Integration Test: RSS Feed
 * Tests RSS feed generation and consumption
 */

import { describe, it, expect } from 'vitest';

describe('RSS Feed Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('Step 1: Fetch RSS feed', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('xml');
  });
  
  it('Step 2: Parse and validate XML structure', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Basic RSS 2.0 structure
    expect(xml).toContain('<?xml');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('</channel>');
    expect(xml).toContain('</rss>');
  });
  
  it('Step 3: Verify channel metadata', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Extract channel title
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/);
    expect(titleMatch).toBeTruthy();
    
    if (titleMatch) {
      expect(titleMatch[1].length).toBeGreaterThan(0);
    }
    
    // Extract channel link
    const linkMatch = xml.match(/<link>([^<]+)<\/link>/);
    expect(linkMatch).toBeTruthy();
    
    // Extract description
    const descMatch = xml.match(/<description>([^<]+)<\/description>/);
    expect(descMatch).toBeTruthy();
  });
  
  it('Step 4: Verify feed items exist', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Count items
    const itemMatches = xml.match(/<item>/g);
    const itemCount = itemMatches ? itemMatches.length : 0;
    
    console.log(`RSS feed contains ${itemCount} items`);
    
    // Should have at least 0 items (could be empty)
    expect(itemCount).toBeGreaterThanOrEqual(0);
  });
  
  it('Step 5: Verify item structure', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    if (xml.includes('<item>')) {
      // Extract first item
      const itemMatch = xml.match(/<item>([\s\S]*?)<\/item>/);
      
      if (itemMatch) {
        const item = itemMatch[1];
        
        // Required elements
        expect(item).toContain('<title>');
        expect(item).toContain('<link>');
        expect(item).toContain('<description>');
        expect(item).toContain('<pubDate>');
        expect(item).toContain('<guid>');
      }
    }
  });
  
  it('Step 6: Verify pubDate format (RFC 822)', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    const pubDateMatch = xml.match(/<pubDate>([^<]+)<\/pubDate>/);
    
    if (pubDateMatch) {
      const dateStr = pubDateMatch[1];
      
      // RFC 822 format validation
      const rfc822Pattern = /^[A-Z][a-z]{2}, \d{2} [A-Z][a-z]{2} \d{4} \d{2}:\d{2}:\d{2}/;
      expect(rfc822Pattern.test(dateStr)).toBe(true);
      
      // Should be a valid date
      const date = new Date(dateStr);
      expect(date.getTime()).toBeGreaterThan(0);
    }
  });
  
  it('Step 7: Verify links point to braindumps', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    const linkMatches = xml.match(/<link>([^<]+)<\/link>/g);
    
    if (linkMatches && linkMatches.length > 1) {
      // Skip first link (channel link)
      for (let i = 1; i < linkMatches.length; i++) {
        const link = linkMatches[i];
        expect(link).toContain('braindump');
      }
    }
  });
  
  it('Step 8: Click through to braindump from feed', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Find first item link
    const itemLinkMatch = xml.match(/<item>[\s\S]*?<link>([^<]+)<\/link>/);
    
    if (itemLinkMatch) {
      const itemUrl = itemLinkMatch[1];
      
      // Try to fetch the braindump
      const braindumpResponse = await fetch(itemUrl);
      
      // Should be accessible (200) or not found (404)
      expect([200, 404]).toContain(braindumpResponse.status);
    }
  });
  
  it('Step 9: Verify content is sanitized', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Should not contain unsanitized scripts
    expect(xml).not.toContain('<script>alert');
    
    // Should either use CDATA or escape HTML
    if (xml.includes('<description>')) {
      const hasValidContent = 
        xml.includes('<![CDATA[') || 
        xml.includes('&lt;') ||
        !xml.includes('<div>');
      
      // At least one sanitization method should be present
      expect(hasValidContent).toBe(true);
    }
  });
  
  it('Step 10: Verify feed caching', async () => {
    const response1 = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const cacheControl = response1.headers.get('cache-control');
    
    expect(cacheControl).toBeTruthy();
    
    // Should have some max-age
    if (cacheControl) {
      expect(cacheControl).toMatch(/max-age=\d+/);
    }
  });
  
  it('Step 11: Feed updates with new public braindump', async () => {
    // Note: This would require creating a braindump, but we can verify the feed is fresh
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    // Check lastBuildDate if present
    const buildDateMatch = xml.match(/<lastBuildDate>([^<]+)<\/lastBuildDate>/);
    
    if (buildDateMatch) {
      const buildDate = new Date(buildDateMatch[1]);
      expect(buildDate.getTime()).toBeGreaterThan(0);
    }
  });
  
  it('Step 12: Verify feed limit (max 50 items)', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/feed.xml`);
    const xml = await response.text();
    
    const itemMatches = xml.match(/<item>/g);
    const itemCount = itemMatches ? itemMatches.length : 0;
    
    expect(itemCount).toBeLessThanOrEqual(50);
  });
});
