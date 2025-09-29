import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
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

    try {
      const redis = getRedisClient();
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

      return NextResponse.json({ success: true, data: serverInfo });
    } catch (redisError) {
      console.error('Cache info redis error:', redisError);
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
    console.error('Cache info error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cache information',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
