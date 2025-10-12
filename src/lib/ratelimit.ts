import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ============================================================================
// Rate Limiters
// ============================================================================

/**
 * Public API rate limiter: 100 requests per minute per IP
 * Applied to unauthenticated public endpoints
 */
export const publicApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  analytics: true,
  prefix: 'ratelimit:public',
});

/**
 * Authenticated API rate limiter: 200 requests per minute per user
 * Applied to authenticated endpoints
 */
export const authenticatedApiLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(200, '1 m'),
  analytics: true,
  prefix: 'ratelimit:authenticated',
});

/**
 * Comment rate limiter: 10 comments per hour per user
 * Prevents spam and abuse
 */
export const commentLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  analytics: true,
  prefix: 'ratelimit:comment',
});

/**
 * Create braindump rate limiter: 20 braindumps per hour per user
 * Prevents bulk creation spam
 */
export const createBraindumpLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 h'),
  analytics: true,
  prefix: 'ratelimit:create',
});

/**
 * Reaction rate limiter: 50 reactions per minute per user
 * Prevents reaction spam
 */
export const reactionLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(50, '1 m'),
  analytics: true,
  prefix: 'ratelimit:reaction',
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get identifier for rate limiting
 * Uses Clerk user ID if available, otherwise falls back to IP address
 */
export function getRateLimitIdentifier(userId?: string, ip?: string): string {
  return userId || ip || 'anonymous';
}

/**
 * Check rate limit and return result
 * @returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const { success, limit, remaining, reset } = await limiter.limit(identifier);
  
  return {
    success,
    limit,
    remaining,
    reset,
  };
}

/**
 * Format rate limit error response
 */
export function formatRateLimitError(reset: number): {
  error: string;
  code: string;
  retryAfter: number;
} {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);
  
  return {
    error: 'Rate limit exceeded',
    code: 'RATE_LIMIT_EXCEEDED',
    retryAfter: Math.max(0, retryAfter),
  };
}

// ============================================================================
// Redis Cache Helpers (for trending scores, etc.)
// ============================================================================

export const redisCache = redis;

/**
 * Cache trending braindumps for 1 hour
 */
export async function cacheTrendingBraindumps(
  period: string,
  data: any
): Promise<void> {
  const key = `trending:${period}`;
  await redis.set(key, JSON.stringify(data), { ex: 3600 }); // 1 hour TTL
}

/**
 * Get cached trending braindumps
 */
export async function getCachedTrendingBraindumps(
  period: string
): Promise<any | null> {
  const key = `trending:${period}`;
  const cached = await redis.get(key);
  return cached ? JSON.parse(cached as string) : null;
}

/**
 * Invalidate trending cache
 */
export async function invalidateTrendingCache(): Promise<void> {
  const periods = ['24h', '7d', '30d'];
  await Promise.all(
    periods.map((period) => redis.del(`trending:${period}`))
  );
}
