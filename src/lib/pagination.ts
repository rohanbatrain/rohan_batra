/**
 * Pagination Utility Functions
 * 
 * Provides reusable pagination helpers for API endpoints
 */

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Extract and validate pagination parameters from URL search params
 * 
 * @param searchParams - URLSearchParams from request
 * @param defaultLimit - Default items per page (default: 10)
 * @param maxLimit - Maximum allowed items per page (default: 100)
 * @returns Validated pagination parameters
 */
export function getPaginationParams(
  searchParams: URLSearchParams,
  defaultLimit: number = 10,
  maxLimit: number = 100
): PaginationParams {
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const requestedLimit = parseInt(
    searchParams.get('limit') || String(defaultLimit),
    10
  );
  
  // Clamp limit between 1 and maxLimit
  const limit = Math.min(maxLimit, Math.max(1, requestedLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

/**
 * Create standardized pagination response object
 * 
 * @param data - Array of data items
 * @param total - Total count of items (from database)
 * @param page - Current page number
 * @param limit - Items per page
 * @returns Pagination metadata
 */
export function createPaginationResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): { data: T[]; pagination: PaginationResponse } {
  const pages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages,
      hasNext: page < pages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Calculate pagination offset for database queries
 * 
 * @param page - Current page (1-indexed)
 * @param limit - Items per page
 * @returns Skip value for database query
 */
export function calculateOffset(page: number, limit: number): number {
  return (Math.max(1, page) - 1) * limit;
}

/**
 * Generate pagination links for API responses
 * 
 * @param baseUrl - Base URL for the endpoint
 * @param page - Current page
 * @param pages - Total pages
 * @param limit - Items per page
 * @returns Object with first, prev, next, last URLs
 */
export function generatePaginationLinks(
  baseUrl: string,
  page: number,
  pages: number,
  limit: number
): {
  first?: string;
  prev?: string;
  next?: string;
  last?: string;
} {
  const links: Record<string, string> = {};

  // First page
  if (page > 1) {
    links.first = `${baseUrl}?page=1&limit=${limit}`;
  }

  // Previous page
  if (page > 1) {
    links.prev = `${baseUrl}?page=${page - 1}&limit=${limit}`;
  }

  // Next page
  if (page < pages) {
    links.next = `${baseUrl}?page=${page + 1}&limit=${limit}`;
  }

  // Last page
  if (page < pages) {
    links.last = `${baseUrl}?page=${pages}&limit=${limit}`;
  }

  return links;
}

/**
 * Validate pagination parameters
 * 
 * @param page - Page number to validate
 * @param limit - Limit to validate
 * @param maxLimit - Maximum allowed limit
 * @returns Validation result with error message if invalid
 */
export function validatePaginationParams(
  page: number,
  limit: number,
  maxLimit: number = 100
): { valid: boolean; error?: string } {
  if (page < 1) {
    return { valid: false, error: 'Page must be at least 1' };
  }

  if (limit < 1) {
    return { valid: false, error: 'Limit must be at least 1' };
  }

  if (limit > maxLimit) {
    return {
      valid: false,
      error: `Limit cannot exceed ${maxLimit}`,
    };
  }

  return { valid: true };
}
