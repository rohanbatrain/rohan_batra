import { NextRequest } from 'next/server';
import AuditLogModel from '@/models/AuditLog';
import connectToDatabase from '@/lib/mongodb';
import { Types } from 'mongoose';

export interface AuditLogData {
  userId: string;
  userEmail?: string;
  userRole?: string;
  action: 'create' | 'update' | 'delete' | 'view';
  resource: string;
  resourceId: string | Types.ObjectId;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };
  status?: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(
  data: AuditLogData,
  request?: NextRequest
): Promise<void> {
  try {
    await connectToDatabase();

    // Extract request metadata
    let ipAddress: string | undefined;
    let userAgent: string | undefined;
    let method: string | undefined;
    let path: string | undefined;

    if (request) {
      // Get IP address
      const forwardedFor = request.headers.get('x-forwarded-for');
      ipAddress = forwardedFor
        ? forwardedFor.split(',')[0].trim()
        : request.headers.get('x-real-ip') ||
          request.headers.get('cf-connecting-ip') ||
          undefined;

      userAgent = request.headers.get('user-agent') || undefined;
      method = request.method;
      path = request.nextUrl.pathname;
    }

    // Convert resourceId to ObjectId if it's a string
    const resourceId =
      typeof data.resourceId === 'string'
        ? new Types.ObjectId(data.resourceId)
        : data.resourceId;

    await AuditLogModel.create({
      userId: data.userId,
      userEmail: data.userEmail,
      userRole: data.userRole,
      action: data.action,
      resource: data.resource,
      resourceId,
      changes: data.changes,
      ipAddress,
      userAgent,
      method,
      path,
      status: data.status || 'success',
      errorMessage: data.errorMessage,
    });
  } catch (error) {
    // Don't throw - audit logging should not break the main operation
    console.error('Failed to create audit log:', error);
  }
}

/**
 * Helper to track field changes between old and new objects
 */
export function getChangedFields(
  oldObj: Record<string, any>,
  newObj: Record<string, any>
): {
  before: Record<string, any>;
  after: Record<string, any>;
  fields: string[];
} {
  const before: Record<string, any> = {};
  const after: Record<string, any> = {};
  const fields: string[] = [];

  // Check all fields in newObj
  for (const key of Object.keys(newObj)) {
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      before[key] = oldObj[key];
      after[key] = newObj[key];
      fields.push(key);
    }
  }

  return { before, after, fields };
}

/**
 * Get recent audit logs for a resource
 */
export async function getResourceAuditLogs(
  resource: string,
  resourceId: string | Types.ObjectId,
  limit = 50
) {
  try {
    await connectToDatabase();

    const resourceObjectId =
      typeof resourceId === 'string'
        ? new Types.ObjectId(resourceId)
        : resourceId;

    const logs = await AuditLogModel.find({
      resource,
      resourceId: resourceObjectId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return logs;
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Get recent audit logs for a user
 */
export async function getUserAuditLogs(userId: string, limit = 100) {
  try {
    await connectToDatabase();

    const logs = await AuditLogModel.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return logs;
  } catch (error) {
    console.error('Failed to fetch user audit logs:', error);
    return [];
  }
}
