import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { DashboardService } from '@/lib/services/dashboard-service';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const certificates = await DashboardService.getCertificates(userId);

    return NextResponse.json({
      success: true,
      data: {
        certificates,
        summary: {
          total: certificates.length,
          issued: certificates.filter(cert => cert.status === 'issued').length,
          pending: certificates.filter(cert => cert.status === 'pending')
            .length,
          recent: certificates
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
            )
            .slice(0, 3),
        },
      },
    });
  } catch (error) {
    console.error('Dashboard certificates API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch certificates',
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
