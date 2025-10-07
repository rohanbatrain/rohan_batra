/**
 * Simple in-memory rate limiting
 * For production, consider using Redis with @upstash/ratelimit
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  },
  10 * 60 * 1000
);

export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   */
  max: number;
  /**
   * Time window in milliseconds
   */
  windowMs: number;
  /**
   * Custom key generator function
   * Default: uses IP address
   */
  keyGenerator?: (request: Request) => string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // Create new entry if doesn't exist or window expired
  if (!entry || entry.resetTime < now) {
    const resetTime = now + config.windowMs;
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime,
    });

    return {
      success: true,
      limit: config.max,
      remaining: config.max - 1,
      reset: resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.max) {
    return {
      success: false,
      limit: config.max,
      remaining: 0,
      reset: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    success: true,
    limit: config.max,
    remaining: config.max - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get client identifier from request
 * Uses IP address, falling back to a fingerprint
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Fallback to user-agent + accept-language as fingerprint
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';
  return `${userAgent}-${acceptLanguage}`.slice(0, 100);
}

/**
 * Rate limit presets for different API types
 */
export const rateLimitPresets = {
  // Public API endpoints
  public: {
    max: 30, // 30 requests
    windowMs: 60 * 1000, // per minute
  },

  // Admin API endpoints
  admin: {
    max: 100, // 100 requests
    windowMs: 60 * 1000, // per minute
  },

  // Strict rate limit for sensitive operations
  strict: {
    max: 5, // 5 requests
    windowMs: 60 * 1000, // per minute
  },

  // Very strict for auth endpoints
  auth: {
    max: 10, // 10 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },
};

/**
 * Helper function to create rate limit response
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  const retryAfter = Math.ceil((result.reset - Date.now()) / 1000);

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: 'Please try again later',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.reset.toString(),
        'Retry-After': retryAfter.toString(),
      },
    }
  );
}
