/**
 * Cleanup Cron Job
 * Triggered daily at 2 AM via Vercel Cron or external scheduler
 * Cleans up old notifications and updates trending cache
 * Authorization: Bearer token (set CRON_SECRET in env)
 */

import { NextRequest, NextResponse } from 'next/server';
import { cleanupOldNotifications, updateTrendingCache } from '@/lib/jobs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run cleanup tasks
    const deletedCount = await cleanupOldNotifications();
    await updateTrendingCache();

    return NextResponse.json({
      success: true,
      jobType: 'cleanup',
      deletedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Cleanup job error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
