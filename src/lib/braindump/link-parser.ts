import mongoose from 'mongoose';

export interface BraindumpLink {
  raw: string;              // [[braindump:123|My Note]]
  braindumpId: string;      // 123 or ObjectId string
  displayText?: string;     // "My Note" (optional)
  startIndex: number;
  endIndex: number;
}

/**
 * Parse braindump links from content
 * Supports formats:
 * - [[braindumpId]]
 * - [[braindumpId|Display Text]]
 * - [[braindump:braindumpId]]
 * - [[braindump:braindumpId|Display Text]]
 */
export function parseBraindumpLinks(content: string): BraindumpLink[] {
  const links: BraindumpLink[] = [];
  
  // Regex: [[optional-braindump:id|optional-display]]
  const linkRegex = /\[\[(?:braindump:)?([a-f0-9]{24})(?:\|([^\]]+))?\]\]/gi;
  
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    links.push({
      raw: match[0],
      braindumpId: match[1],
      displayText: match[2] || undefined,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }
  
  return links;
}

/**
 * Extract unique braindump IDs from content
 */
export function extractLinkedBraindumpIds(content: string): string[] {
  const links = parseBraindumpLinks(content);
  const uniqueIds = new Set(links.map(link => link.braindumpId));
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
 * For rendering in BraindumpCard
 */
export function renderBraindumpLinks(
  content: string,
  braindumps: Map<string, { _id: string; content: string }>
): string {
  const links = parseBraindumpLinks(content);
  
  // Sort by position (reverse) to replace from end to start
  links.sort((a, b) => b.startIndex - a.startIndex);
  
  let result = content;
  
  for (const link of links) {
    const braindump = braindumps.get(link.braindumpId);
    const displayText = link.displayText || 
                        braindump?.content.slice(0, 50) || 
                        'Unknown Note';
    
    const replacement = `<a href="/admin/braindump?id=${link.braindumpId}" class="braindump-link" data-braindump-id="${link.braindumpId}" title="${braindump?.content.slice(0, 100) || ''}">${displayText}</a>`;
    
    result = result.slice(0, link.startIndex) + 
             replacement + 
             result.slice(link.endIndex);
  }
  
  return result;
}
