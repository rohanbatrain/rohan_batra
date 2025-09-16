/**
 * Date utility functions to ensure consistent formatting across server and client
 * and prevent hydration mismatches
 */

// Consistent date formatting options
export const dateFormats = {
  full: { year: 'numeric', month: 'long', day: 'numeric' },
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
  monthYear: { year: 'numeric', month: 'long' },
} as const;

/**
 * Format date consistently for SSR/Client hydration
 * @param date - Date string or Date object
 * @param format - Format type ('short', 'long', 'monthYear')
 * @param locale - Locale string (defaults to 'en-US')
 * @returns Formatted date string
 */
export function formatDate(
  date: Date | string | undefined,
  format: keyof typeof dateFormats = 'full'
): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    return new Intl.DateTimeFormat('en-US', dateFormats[format]).format(
      dateObj
    );
  } catch {
    return '';
  }
}

/**
 * Format relative time (e.g., "2 days ago")
 * Uses Intl.RelativeTimeFormat for consistent SSR/Client rendering
 */
export function formatRelativeTime(date: Date | string): string {
  if (!date) return '';

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';

    const now = new Date();
    const diffInSeconds = Math.floor(
      (now.getTime() - dateObj.getTime()) / 1000
    );

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return formatDate(dateObj, 'short');
  } catch {
    return '';
  }
}
