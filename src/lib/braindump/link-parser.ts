import mongoose from 'mongoose';

export interface BraindumpLink {
  raw: string;              // [[My Note]] or [[braindump:123|My Note]]
  braindumpId?: string;     // ObjectId string (if using ID format)
  linkText?: string;        // "My Note" (for title-based linking)
  displayText?: string;     // Custom display text (optional)
  startIndex: number;
  endIndex: number;
  linkType: 'id' | 'title'; // Type of link
}

/**
 * Parse braindump links from content
 * Supports Obsidian-style formats:
 * - [[Note Title]] - Link by title (Obsidian-style)
 * - [[Note Title|Custom Display]] - Link by title with custom text
 * - [[braindumpId]] - Link by MongoDB ObjectId (legacy)
 * - [[braindumpId|Display Text]] - Link by ID with custom text
 */
export function parseBraindumpLinks(content: string): BraindumpLink[] {
  const links: BraindumpLink[] = [];
  
  // Regex to match [[anything]] but not [[braindump:id]]
  const linkRegex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
  
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const firstPart = match[1].trim();
    const displayPart = match[2]?.trim();
    
    // Check if it's a MongoDB ObjectId (24 hex characters)
    const isObjectId = /^[a-f0-9]{24}$/i.test(firstPart);
    
    if (isObjectId) {
      // ID-based link: [[671d4f8e9a8b2c3d4e5f6789]] or [[671d4f8e9a8b2c3d4e5f6789|Display]]
      links.push({
        raw: match[0],
        braindumpId: firstPart,
        displayText: displayPart,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        linkType: 'id',
      });
    } else {
      // Title-based link: [[My Note Title]] or [[My Note Title|Display]]
      links.push({
        raw: match[0],
        linkText: firstPart,
        displayText: displayPart,
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        linkType: 'title',
      });
    }
  }
  
  return links;
}

/**
 * Extract unique braindump IDs from content (only ID-based links)
 */
export function extractLinkedBraindumpIds(content: string): string[] {
  const links = parseBraindumpLinks(content);
  const uniqueIds = new Set(
    links
      .filter(link => link.linkType === 'id' && link.braindumpId)
      .map(link => link.braindumpId!)
  );
  return Array.from(uniqueIds);
}

/**
 * Validate if string is valid MongoDB ObjectId
 */
export function isValidBraindumpId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

/**
 * Replace braindump links with HTML/React markup
 * For rendering in BraindumpCard (ID-based links only for now)
 */
export function renderBraindumpLinks(
  content: string,
  braindumps: Map<string, { _id: string; content: string; title?: string }>
): string {
  const links = parseBraindumpLinks(content);
  
  // Sort by position (reverse) to replace from end to start
  links.sort((a, b) => b.startIndex - a.startIndex);
  
  let result = content;
  
  for (const link of links) {
    if (link.linkType === 'id' && link.braindumpId) {
      const braindump = braindumps.get(link.braindumpId);
      const derivedTitle = braindump?.title && braindump.title.trim().length
        ? braindump.title.trim()
        : braindump?.content.slice(0, 50);
      const displayText = link.displayText || derivedTitle || 'Unknown Note';
      const tooltip = braindump?.title && braindump.title.trim().length
        ? braindump.title.trim()
        : braindump?.content.slice(0, 100) || '';
      
      const replacement = `<a href="/admin/braindump?id=${link.braindumpId}" class="braindump-link" data-braindump-id="${link.braindumpId}" title="${tooltip}">${displayText}</a>`;
      
      result = result.slice(0, link.startIndex) + 
               replacement + 
               result.slice(link.endIndex);
    }
    // Title-based links handled elsewhere (need database lookup)
  }
  
  return result;
}
