import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import AuditLog from '@/models/AuditLog';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ success: false, error: 'Auth required' }, { status: 401 });
    await connectToDatabase();
    const me = await User.findOne({ clerkId: userId });
    if (!me || me.role !== 'admin') return NextResponse.json({ success: false, error: 'Admin only' }, { status: 403 });

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '20', 10)));
  const action = searchParams.get('action') || undefined;
  const entityType = searchParams.get('entityType') || undefined;
  const userEmail = searchParams.get('userEmail') || undefined;
  const entityId = searchParams.get('entityId') || undefined;
  const start = searchParams.get('start');
  const end = searchParams.get('end');

    const q: any = {};
    if (action) q.action = action;
    if (entityType) q.entityType = entityType;
    if (userEmail) q.userEmail = userEmail;
    if (entityId) q.entityId = entityId;
    if (start || end) {
      q.createdAt = {} as any;
      if (start) q.createdAt.$gte = new Date(start);
      if (end) q.createdAt.$lte = new Date(end);
    }

    const totalItems = await AuditLog.countDocuments(q);
    const logs = await AuditLog.find(q)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          hasPreviousPage: page > 1,
          hasNextPage: page * limit < totalItems,
        },
      },
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Failed to load audit logs' }, { status: 500 });
  }
}