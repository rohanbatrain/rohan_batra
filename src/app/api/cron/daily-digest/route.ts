/**
 * Daily Digest Cron Job
 * Triggered daily at 9 AM via Vercel Cron or external scheduler
 * Authorization: Bearer token (set CRON_SECRET in env)
 */

import { NextRequest, NextResponse } from 'next/server';
import { processDailyDigests } from '@/lib/jobs';

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

    const sentCount = await processDailyDigests();

    return NextResponse.json({
      success: true,
      jobType: 'daily-digest',
      sentCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Daily digest job error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
