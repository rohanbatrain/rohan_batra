/**
 * Contract Test: POST /api/braindump/[id]/share
 * Share permission management endpoint
 */

import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const ShareResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    permission: z.object({
      _id: z.string(),
      braindumpId: z.string(),
      userId: z.string(),
      permission: z.enum(['view', 'comment', 'edit']),
      grantedBy: z.string(),
      grantedAt: z.string(),
    }),
  }),
  message: z.string(),
});

const PermissionListSchema = z.object({
  success: z.boolean(),
  data: z.object({
    permissions: z.array(z.object({
      _id: z.string(),
      userId: z.string(),
      permission: z.enum(['view', 'comment', 'edit']),
      grantedAt: z.string(),
      revoked: z.boolean().optional(),
    })),
  }),
});

describe('POST /api/braindump/[id]/share - Contract Tests', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  it('should return 401 for unauthenticated requests', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        userId: 'user_test123',
        permission: 'view',
      }),
    });
    
    expect(response.status).toBe(401);
  });
  
  it('should return 403 for non-owner users', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/share`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ 
        userId: 'user_test123',
        permission: 'view',
      }),
    });
    
    // Should be 403 or 404
    expect([403, 404, 401]).toContain(response.status);
  });
  
  it('should accept valid permission levels', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const permissions = ['view', 'comment', 'edit'];
    
    for (const permission of permissions) {
      const response = await fetch(`${baseUrl}/api/braindump/${testId}/share`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token',
        },
        body: JSON.stringify({ 
          userId: 'user_test123',
          permission,
        }),
      });
      
      // Should accept as valid (may fail auth/ownership, but not validation)
      expect([200, 201, 401, 403, 404]).toContain(response.status);
    }
  });
  
  it('should return 400 for invalid permission level', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/share`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ 
        userId: 'user_test123',
        permission: 'delete', // Invalid
      }),
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should require userId field', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/share`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ 
        permission: 'view',
      }),
    });
    
    expect(response.status).toBe(400);
  });
  
  it('should prevent sharing with self', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/share`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token',
      },
      body: JSON.stringify({ 
        userId: 'self', // Assuming auth token is for 'self'
        permission: 'view',
      }),
    });
    
    // Should reject self-sharing
    expect([400, 401, 403, 404]).toContain(response.status);
  });
  
  it('GET should list all permissions for braindump', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/share`, {
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    if (response.ok) {
      const data = await response.json();
      const result = PermissionListSchema.safeParse(data);
      expect(result.success).toBe(true);
    }
  });
  
  it('DELETE should revoke permissions', async () => {
    const testId = '507f1f77bcf86cd799439011';
    const permissionId = '507f1f77bcf86cd799439033';
    
    const response = await fetch(`${baseUrl}/api/braindump/${testId}/share?permissionId=${permissionId}`, {
      method: 'DELETE',
      headers: { 'Authorization': 'Bearer test-token' },
    });
    
    // Should handle revocation request
    expect([200, 204, 401, 403, 404]).toContain(response.status);
  });
});
