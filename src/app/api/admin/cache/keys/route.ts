import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getRedisClient } from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    // Verify authentication and admin role
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    await connectToDatabase();
    const currentUser = await User.findOne({ clerkId: userId });
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get('pattern') || '*';
    const limit = parseInt(searchParams.get('limit') || '100');

    try {
      const redis = getRedisClient();
      const keys = await redis.keys(pattern);
      const limitedKeys = keys.slice(0, limit);

      const details = await Promise.all(
        limitedKeys.map(async key => {
          try {
            const [type, ttl, size] = await Promise.all([
              redis.type(key),
              redis.ttl(key),
              redis.memory('USAGE', key).catch(() => null),
            ]);

            let value: unknown = null;
            let length = 0;

            switch (type) {
              case 'string': {
                const str = await redis.get(key);
                value =
                  str && str.length > 200 ? str.slice(0, 200) + '...' : str;
                length = str?.length || 0;
                break;
              }
              case 'list': {
                length = await redis.llen(key);
                value = length > 0 ? await redis.lrange(key, 0, 4) : [];
                break;
              }
              case 'set': {
                length = await redis.scard(key);
                value =
                  length > 0 ? (await redis.smembers(key)).slice(0, 5) : [];
                break;
              }
              case 'zset': {
                length = await redis.zcard(key);
                value =
                  length > 0 ? await redis.zrange(key, 0, 4, 'WITHSCORES') : [];
                break;
              }
              case 'hash': {
                length = await redis.hlen(key);
                value = length > 0 ? await redis.hgetall(key) : {};
                break;
              }
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
          } catch (e) {
            return {
              key,
              error: e instanceof Error ? e.message : 'Unknown error',
            };
          }
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          keys: details,
          total: keys.length,
          showing: limitedKeys.length,
          pattern,
        },
      });
    } catch (redisError) {
      console.error('Cache keys redis error:', redisError);
      return NextResponse.json({
        success: true,
        data: {
          keys: [],
          total: 0,
          showing: 0,
          pattern,
          error: 'Redis connection failed',
        },
      });
    }
  } catch (error) {
    console.error('Cache keys error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache keys',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
