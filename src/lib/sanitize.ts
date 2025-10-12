import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 * Uses isomorphic-dompurify for both server and client-side sanitization
 */

// Configuration for allowed tags and attributes
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'a', 
  'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
];

const ALLOWED_ATTR = ['href', 'target', 'rel'];

const PURIFY_CONFIG = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SAFE_FOR_TEMPLATES: true,
};

/**
 * Sanitize HTML content for braindump content
 * Allows basic formatting tags but removes all scripts and dangerous elements
 */
export function sanitizeBraindumpContent(html: string): string {
  if (!html) return '';
  
  return DOMPurify.sanitize(html, PURIFY_CONFIG);
}

/**
 * Sanitize comment content
 * More restrictive than braindump content
 */
export function sanitizeCommentContent(html: string): string {
  if (!html) return '';
  
  const commentConfig = {
    ...PURIFY_CONFIG,
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'code'],
  };
  
  return DOMPurify.sanitize(html, commentConfig);
}

/**
 * Sanitize plain text (strip all HTML)
 * Use for titles, slugs, and other non-HTML fields
 */
export function sanitizePlainText(text: string): string {
  if (!text) return '';
  
  // Remove all HTML tags
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize markdown content before rendering
 * Allows markdown-safe HTML
 */
export function sanitizeMarkdown(markdown: string): string {
  if (!markdown) return '';
  
  const markdownConfig = {
    ...PURIFY_CONFIG,
    ALLOWED_TAGS: [
      ...ALLOWED_TAGS,
      'img', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
    ],
    ALLOWED_ATTR: [...ALLOWED_ATTR, 'src', 'alt', 'title', 'width', 'height'],
  };
  
  return DOMPurify.sanitize(markdown, markdownConfig);
}

/**
 * Check if content contains dangerous patterns
 * Returns true if content looks suspicious
 */
export function containsDangerousPatterns(content: string): boolean {
  if (!content) return false;
  
  const dangerousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // Event handlers like onclick, onload, etc.
    /<iframe/i,
    /<embed/i,
    /<object/i,
    /data:text\/html/i,
  ];
  
  return dangerousPatterns.some((pattern) => pattern.test(content));
}

/**
 * Validate and sanitize URL
 * Ensures URL is safe for use in links
 */
export function sanitizeUrl(url: string): string {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    // Invalid URL
    return '';
  }
}

/**
 * Sanitize slug for URL usage
 * Ensures slug contains only safe characters
 */
export function sanitizeSlug(slug: string): string {
  if (!slug) return '';
  
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 200); // Max 200 characters
}

/**
 * Sanitize all fields in an object recursively
 * Useful for sanitizing entire request bodies
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  fieldConfig?: Record<keyof T, 'html' | 'text' | 'url' | 'slug'>
): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      const sanitizeType = fieldConfig?.[key] || 'text';
      
      switch (sanitizeType) {
        case 'html':
          sanitized[key] = sanitizeBraindumpContent(sanitized[key]) as T[Extract<keyof T, string>];
          break;
        case 'url':
          sanitized[key] = sanitizeUrl(sanitized[key]) as T[Extract<keyof T, string>];
          break;
        case 'slug':
          sanitized[key] = sanitizeSlug(sanitized[key]) as T[Extract<keyof T, string>];
          break;
        case 'text':
        default:
          sanitized[key] = sanitizePlainText(sanitized[key]) as T[Extract<keyof T, string>];
          break;
      }
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

export default {
  sanitizeBraindumpContent,
  sanitizeCommentContent,
  sanitizePlainText,
  sanitizeMarkdown,
  sanitizeUrl,
  sanitizeSlug,
  sanitizeObject,
  containsDangerousPatterns,
};
