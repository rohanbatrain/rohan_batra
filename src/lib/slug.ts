export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function uniqueSlug(
  base: string,
  isTaken: (candidate: string) => Promise<boolean>
): Promise<string> {
  const candidate = slugify(base) || 'item';
  if (!(await isTaken(candidate))) return candidate;
  let n = 2;
  while (await isTaken(`${candidate}-${n}`)) n++;
  return `${candidate}-${n}`;
}

/**
 * Generate a unique slug for a braindump or other entity
 * @param text - Text to generate slug from
 * @param type - Entity type (braindump, blog, etc.)
 * @returns Promise<string> - Unique slug
 */
export async function generateSlug(text: string, type: 'braindump' | 'blog' | 'course' = 'braindump'): Promise<string> {
  const { default: BraindumpModel } = await import('@/models/Braindump');
  
  // Extract meaningful words (remove common words, special chars, etc.)
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['the', 'and', 'but', 'for', 'with', 'from', 'this', 'that'].includes(word))
    .slice(0, 8) // Take first 8 meaningful words
    .join(' ');
  
  const baseSlug = slugify(cleaned || text.substring(0, 50));
  
  // Check uniqueness in database based on type
  const isTaken = async (slug: string): Promise<boolean> => {
    if (type === 'braindump') {
      const existing = await BraindumpModel.findOne({ slug });
      return !!existing;
    }
    // Add other types as needed
    return false;
  };
  
  return uniqueSlug(baseSlug, isTaken);
}
