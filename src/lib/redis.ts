import Redis from 'ioredis';

// Redis connection configuration
const redisConfig = {
  host: process.env.REDIS_URL?.split('://')[1]?.split(':')[0] || 'localhost',
  port: parseInt(process.env.REDIS_URL?.split(':')[2] || '6379'),
  password: process.env.REDIS_PASSWORD || undefined,
  db: parseInt(process.env.REDIS_DB || '0'),
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: parseInt(process.env.REDIS_MAX_RETRIES || '3'),
  lazyConnect: true,
  connectTimeout: 10000,
  commandTimeout: 5000,
};

// Global Redis instance
let redis: Redis | null = null;

/**
 * Get or create Redis connection
 */
export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(redisConfig);

    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('error', error => {
      console.error('Redis connection error:', error);
    });

    redis.on('close', () => {
      console.log('Redis connection closed');
    });
  }

  return redis;
}

/**
 * Check if Redis is available
 */
export async function isRedisAvailable(): Promise<boolean> {
  try {
    const client = getRedisClient();
    await client.ping();
    return true;
  } catch (error) {
    console.warn('Redis not available:', error);
    return false;
  }
}

/**
 * Cache utilities with TTL
 */
export class RedisCache {
  private client: Redis;
  private defaultTTL: number;

  constructor(ttl = parseInt(process.env.REDIS_TTL || '3600')) {
    this.client = getRedisClient();
    this.defaultTTL = ttl;
  }

  /**
   * Set a cache value with optional TTL
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const expiration = ttl || this.defaultTTL;
      await this.client.setex(key, expiration, serialized);
    } catch (error) {
      console.error('Redis set error:', error);
      throw error;
    }
  }

  /**
   * Get a cache value
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis get error:', error);
      return null;
    }
  }

  /**
   * Delete a cache key
   */
  async del(key: string): Promise<boolean> {
    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis del error:', error);
      return false;
    }
  }

  /**
   * Delete multiple keys matching a pattern
   */
  async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length === 0) return 0;
      return await this.client.del(...keys);
    } catch (error) {
      console.error('Redis delPattern error:', error);
      return 0;
    }
  }

  /**
   * Check if a key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis exists error:', error);
      return false;
    }
  }

  /**
   * Set TTL for an existing key
   */
  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error('Redis expire error:', error);
      return false;
    }
  }

  /**
   * Get remaining TTL for a key
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      console.error('Redis ttl error:', error);
      return -1;
    }
  }

  /**
   * Increment a numeric value
   */
  async incr(key: string, by = 1): Promise<number> {
    try {
      return await this.client.incrby(key, by);
    } catch (error) {
      console.error('Redis incr error:', error);
      throw error;
    }
  }

  /**
   * Add items to a set
   */
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      console.error('Redis sadd error:', error);
      throw error;
    }
  }

  /**
   * Get all members of a set
   */
  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      console.error('Redis smembers error:', error);
      return [];
    }
  }
}

/**
 * Default cache instance
 */
export const cache = new RedisCache();

/**
 * Cache key generators
 */
export const CacheKeys = {
  blogPost: (slug: string) => `blog:post:${slug}`,
  blogPosts: (page = 1, limit = 10) => `blog:posts:${page}:${limit}`,
  blogPostsByTag: (tag: string, page = 1) => `blog:posts:tag:${tag}:${page}`,
  project: (slug: string) => `portfolio:project:${slug}`,
  projects: (page = 1, limit = 12) => `portfolio:projects:${page}:${limit}`,
  projectsByTech: (tech: string, page = 1) =>
    `portfolio:projects:tech:${tech}:${page}`,
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:profile:${id}`,
  comments: (postId: string, page = 1) => `comments:post:${postId}:${page}`,
  commentsCount: (postId: string) => `comments:count:${postId}`,
  likes: (itemType: string, itemId: string) => `likes:${itemType}:${itemId}`,
  likesCount: (itemType: string, itemId: string) =>
    `likes:count:${itemType}:${itemId}`,
  assets: (page = 1, limit = 20) => `assets:${page}:${limit}`,
  asset: (id: string) => `asset:${id}`,
  settings: () => 'settings:global',
  analytics: (period: string) => `analytics:${period}`,
  rateLimit: (ip: string, endpoint: string) => `rate_limit:${ip}:${endpoint}`,
} as const;

/**
 * Close Redis connection (for cleanup)
 */
export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
