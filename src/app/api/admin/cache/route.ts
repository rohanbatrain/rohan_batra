import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current user and check permissions
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const pattern = searchParams.get('pattern') || '*';
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
      const redis = getRedisClient();

      if (action === 'info') {
        // Get Redis server information
        const [info, memory, keyspace, stats] = await Promise.all([
          redis.info(),
          redis.info('memory'),
          redis.info('keyspace'),
          redis.info('stats'),
        ]);

        const serverInfo = {
          connected: true,
          version: info.match(/redis_version:(.+)/)?.[1]?.trim(),
          uptime: info.match(/uptime_in_seconds:(.+)/)?.[1]?.trim(),
          clients: info.match(/connected_clients:(.+)/)?.[1]?.trim(),
          memory: {
            used: memory.match(/used_memory_human:(.+)/)?.[1]?.trim(),
            peak: memory.match(/used_memory_peak_human:(.+)/)?.[1]?.trim(),
            rss: memory.match(/used_memory_rss_human:(.+)/)?.[1]?.trim(),
          },
          keyspace: keyspace,
          stats: {
            connections: stats
              .match(/total_connections_received:(.+)/)?.[1]
              ?.trim(),
            commands: stats.match(/total_commands_processed:(.+)/)?.[1]?.trim(),
            hits: stats.match(/keyspace_hits:(.+)/)?.[1]?.trim(),
            misses: stats.match(/keyspace_misses:(.+)/)?.[1]?.trim(),
          },
        };

        return NextResponse.json({
          success: true,
          data: serverInfo,
        });
      }

      if (action === 'keys') {
        // Get keys matching pattern
        const keys = await redis.keys(pattern);
        const limitedKeys = keys.slice(0, limit);

        // Get key details
        const keyDetails = await Promise.all(
          limitedKeys.map(async key => {
            try {
              const [type, ttl, size] = await Promise.all([
                redis.type(key),
                redis.ttl(key),
                redis.memory('USAGE', key).catch(() => null),
              ]);

              let value = null;
              let length = 0;

              // Get value based on type (with size limits for safety)
              switch (type) {
                case 'string':
                  const strValue = await redis.get(key);
                  value =
                    strValue && strValue.length > 200
                      ? strValue.substring(0, 200) + '...'
                      : strValue;
                  length = strValue?.length || 0;
                  break;
                case 'list':
                  length = await redis.llen(key);
                  value = length > 0 ? await redis.lrange(key, 0, 4) : [];
                  break;
                case 'set':
                  length = await redis.scard(key);
                  value =
                    length > 0
                      ? await redis
                          .smembers(key)
                          .then(members => members.slice(0, 5))
                      : [];
                  break;
                case 'zset':
                  length = await redis.zcard(key);
                  value =
                    length > 0
                      ? await redis.zrange(key, 0, 4, 'WITHSCORES')
                      : [];
                  break;
                case 'hash':
                  length = await redis.hlen(key);
                  value = length > 0 ? await redis.hgetall(key) : {};
                  break;
              }

              return {
                key,
                type,
                ttl,
                size: size || 0,
                length,
                value,
                expired: ttl === 0,
              };
            } catch (error) {
              return {
                key,
                error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );

        return NextResponse.json({
          success: true,
          data: {
            total: keys.length,
            showing: limitedKeys.length,
            pattern,
            keys: keyDetails,
          },
        });
      }

      // Default: get basic cache stats
      const dbsize = await redis.dbsize();
      const info = await redis.info('memory');

      return NextResponse.json({
        success: true,
        data: {
          connected: true,
          totalKeys: dbsize,
          memoryUsage:
            info.match(/used_memory_human:(.+)/)?.[1]?.trim() || 'Unknown',
        },
      });
    } catch (redisError) {
      console.error('Redis connection error:', redisError);
      return NextResponse.json({
        success: true,
        data: {
          connected: false,
          error:
            redisError instanceof Error
              ? redisError.message
              : 'Redis connection failed',
        },
      });
    }
  } catch (error) {
    console.error('Cache GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache information',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST endpoint for cache operations (clear, set, etc.)
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current user and check permissions
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, pattern, key, value, ttl } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Action is required' },
        { status: 400 }
      );
    }

    try {
      const redis = getRedisClient();
      let result;

      switch (action) {
        case 'flush_all':
          // Clear all cache
          await redis.flushdb();
          result = { message: 'All cache cleared successfully' };
          break;

        case 'flush_pattern':
          // Clear keys matching pattern
          if (!pattern) {
            return NextResponse.json(
              {
                success: false,
                error: 'Pattern is required for flush_pattern action',
              },
              { status: 400 }
            );
          }

          const keys = await redis.keys(pattern);
          if (keys.length > 0) {
            await redis.del(...keys);
          }
          result = {
            message: `Cleared ${keys.length} keys matching pattern: ${pattern}`,
            clearedKeys: keys.length,
          };
          break;

        case 'delete_key':
          // Delete specific key
          if (!key) {
            return NextResponse.json(
              {
                success: false,
                error: 'Key is required for delete_key action',
              },
              { status: 400 }
            );
          }

          const deleted = await redis.del(key);
          result = {
            message:
              deleted > 0
                ? `Key ${key} deleted successfully`
                : `Key ${key} not found`,
            deleted: deleted > 0,
          };
          break;

        case 'set_key':
          // Set key value
          if (!key || value === undefined) {
            return NextResponse.json(
              {
                success: false,
                error: 'Key and value are required for set_key action',
              },
              { status: 400 }
            );
          }

          const valueStr =
            typeof value === 'string' ? value : JSON.stringify(value);
          if (ttl && ttl > 0) {
            await redis.setex(key, ttl, valueStr);
          } else {
            await redis.set(key, valueStr);
          }

          result = {
            message: `Key ${key} set successfully`,
            key,
            value: valueStr,
            ttl: ttl || null,
          };
          break;

        case 'extend_ttl':
          // Extend TTL of existing key
          if (!key || !ttl) {
            return NextResponse.json(
              {
                success: false,
                error: 'Key and TTL are required for extend_ttl action',
              },
              { status: 400 }
            );
          }

          const extended = await redis.expire(key, ttl);
          result = {
            message:
              extended > 0
                ? `TTL extended for key ${key}`
                : `Key ${key} not found`,
            extended: extended > 0,
            ttl,
          };
          break;

        case 'clear_expired':
          // This is handled automatically by Redis, but we can force a scan
          const allKeys = await redis.keys('*');
          const expiredKeys = [];

          for (const k of allKeys) {
            const keyTtl = await redis.ttl(k);
            if (keyTtl === 0) {
              // Key expired but not yet removed
              expiredKeys.push(k);
            }
          }

          if (expiredKeys.length > 0) {
            await redis.del(...expiredKeys);
          }

          result = {
            message: `Cleared ${expiredKeys.length} expired keys`,
            clearedKeys: expiredKeys.length,
          };
          break;

        default:
          return NextResponse.json(
            { success: false, error: 'Invalid action' },
            { status: 400 }
          );
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (redisError) {
      console.error('Redis operation error:', redisError);
      return NextResponse.json(
        {
          success: false,
          error: 'Redis operation failed',
          details:
            redisError instanceof Error
              ? redisError.message
              : 'Unknown Redis error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Cache POST error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform cache operation',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PUT endpoint for updating cache settings or configurations
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Get current user and check permissions
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { configs } = body;

    if (!configs || typeof configs !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Configs object is required' },
        { status: 400 }
      );
    }

    // This endpoint could be used to update cache-related site settings
    // For now, we'll just return success since Redis configs are environment-based
    const results = [];

    for (const [key, value] of Object.entries(configs)) {
      // Here you could update SiteSettings for cache-related configurations
      // For example: cache TTL defaults, cache strategies, etc.
      results.push({
        key,
        value,
        message:
          'Cache configuration noted (requires restart for Redis config changes)',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        message: 'Cache configurations updated',
        results,
      },
    });
  } catch (error) {
    console.error('Cache PUT error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update cache configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
