/**
 * Cache Monitoring Service
 * 
 * Provides utilities for monitoring Redis cache performance
 */

import Redis from 'ioredis';

export interface CacheHealth {
  connected: boolean;
  totalKeys: number;
  memoryUsage: string;
  hitRate?: number;
  error?: string;
}

export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  lastReset: Date;
}

class CacheMonitor {
  private redis: Redis | null = null;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    lastReset: new Date(),
  };

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: true,
          lazyConnect: true,
        });

        this.redis.on('error', (error) => {
          console.error('Redis cache monitor error:', error);
          this.stats.errors++;
        });
      } catch (error) {
        console.error('Failed to initialize cache monitor:', error);
      }
    }
  }

  /**
   * Get current cache health status
   */
  async getHealth(): Promise<CacheHealth> {
    if (!this.redis) {
      return {
        connected: false,
        totalKeys: 0,
        memoryUsage: 'N/A',
        error: 'Redis not configured',
      };
    }

    try {
      // Check connection
      await this.redis.connect();
      const ping = await this.redis.ping();
      
      if (ping !== 'PONG') {
        throw new Error('Redis ping failed');
      }

      // Get total keys
      const dbsize = await this.redis.dbsize();

      // Get memory info
      const info = await this.redis.info('memory');
      const memoryUsage = this.parseMemoryUsage(info);

      // Calculate hit rate
      const hitRate = this.calculateHitRate();

      return {
        connected: true,
        totalKeys: dbsize,
        memoryUsage,
        hitRate,
      };
    } catch (error) {
      return {
        connected: false,
        totalKeys: 0,
        memoryUsage: 'N/A',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get current cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Record a cache hit
   */
  recordHit(): void {
    this.stats.hits++;
  }

  /**
   * Record a cache miss
   */
  recordMiss(): void {
    this.stats.misses++;
  }

  /**
   * Record a cache set operation
   */
  recordSet(): void {
    this.stats.sets++;
  }

  /**
   * Record a cache delete operation
   */
  recordDelete(): void {
    this.stats.deletes++;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      errors: 0,
      lastReset: new Date(),
    };
  }

  /**
   * Calculate cache hit rate
   */
  private calculateHitRate(): number | undefined {
    const total = this.stats.hits + this.stats.misses;
    if (total === 0) return undefined;
    return (this.stats.hits / total) * 100;
  }

  /**
   * Parse memory usage from Redis INFO output
   */
  private parseMemoryUsage(info: string): string {
    const match = info.match(/used_memory_human:([^\r\n]+)/);
    return match ? match[1].trim() : 'Unknown';
  }

  /**
   * Get detailed cache information
   */
  async getDetailedInfo(): Promise<{
    keys: Array<{ pattern: string; count: number }>;
    memoryByPattern: Array<{ pattern: string; memory: number }>;
  }> {
    if (!this.redis) {
      return { keys: [], memoryByPattern: [] };
    }

    try {
      await this.redis.connect();

      // Get keys by pattern
      const patterns = [
        'asset:*',
        'blog:*',
        'portfolio:*',
        'course:*',
        'flashcard:*',
      ];

      const keysByPattern = await Promise.all(
        patterns.map(async (pattern) => {
          const keys = await this.redis!.keys(pattern);
          return {
            pattern,
            count: keys.length,
          };
        })
      );

      // Get memory usage by pattern (approximate)
      const memoryByPattern = await Promise.all(
        patterns.map(async (pattern) => {
          const keys = await this.redis!.keys(pattern);
          let totalMemory = 0;

          for (const key of keys.slice(0, 100)) {
            // Sample first 100 keys
            const memory = await this.redis!.memory('USAGE', key);
            if (memory) {
              totalMemory += memory;
            }
          }

          return {
            pattern,
            memory: totalMemory,
          };
        })
      );

      return {
        keys: keysByPattern,
        memoryByPattern,
      };
    } catch (error) {
      console.error('Failed to get detailed cache info:', error);
      return { keys: [], memoryByPattern: [] };
    }
  }

  /**
   * Clear cache by pattern
   */
  async clearByPattern(pattern: string): Promise<number> {
    if (!this.redis) {
      throw new Error('Redis not configured');
    }

    try {
      await this.redis.connect();
      const keys = await this.redis.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }

      await this.redis.del(...keys);
      this.recordDelete();
      
      return keys.length;
    } catch (error) {
      console.error('Failed to clear cache by pattern:', error);
      throw error;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }
}

// Export singleton instance
export const cacheMonitor = new CacheMonitor();

// Export convenience functions
export async function getCacheHealth(): Promise<CacheHealth> {
  return cacheMonitor.getHealth();
}

export function getCacheStats(): CacheStats {
  return cacheMonitor.getStats();
}

export async function clearCache(pattern: string = '*'): Promise<number> {
  return cacheMonitor.clearByPattern(pattern);
}
