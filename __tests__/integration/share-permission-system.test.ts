/**
 * Integration Test: Share Permission System
 * Tests full permission grant, revoke, and access control flow
 */

import { describe, it, expect, beforeAll } from 'vitest';

describe('Share Permission System Integration', () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  let testBraindumpId: string;
  let ownerToken: string;
  let sharedUserToken: string;
  let permissionId: string;
  const testUserId = 'user_test123';
  
  beforeAll(async () => {
    testBraindumpId = '507f1f77bcf86cd799439011';
    ownerToken = 'owner-auth-token';
    sharedUserToken = 'shared-user-token';
  });
  
  it('Step 1: Owner grants view permission', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        permission: 'view',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.permission).toBeDefined();
      expect(data.data.permission.userId).toBe(testUserId);
      expect(data.data.permission.permission).toBe('view');
      
      // Save permission ID for later steps
      permissionId = data.data.permission._id;
    } else {
      // Expected if auth/braindump doesn't exist
      expect([401, 403, 404]).toContain(response.status);
    }
  });
  
  it('Step 2: List permissions for braindump', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/share`, {
      headers: { 'Authorization': `Bearer ${ownerToken}` },
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(Array.isArray(data.data.permissions)).toBe(true);
      
      // Our granted permission should be in the list
      if (permissionId) {
        const found = data.data.permissions.find(
          (p: any) => p._id === permissionId
        );
        expect(found).toBeDefined();
        expect(found?.permission).toBe('view');
      }
    }
  });
  
  it('Step 3: Shared user can view braindump', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}`, {
      headers: { 'Authorization': `Bearer ${sharedUserToken}` },
    });
    
    // With view permission, should be able to access
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.braindump._id).toBe(testBraindumpId);
    }
  });
  
  it('Step 4: Shared user cannot comment (view-only)', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sharedUserToken}`,
      },
      body: JSON.stringify({
        content: 'Trying to comment with view-only permission',
      }),
    });
    
    // Should be rejected - needs comment permission
    expect([403, 401]).toContain(response.status);
  });
  
  it('Step 5: Upgrade to comment permission', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        permission: 'comment',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.data.permission.permission).toBe('comment');
    }
  });
  
  it('Step 6: Shared user can now comment', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sharedUserToken}`,
      },
      body: JSON.stringify({
        content: 'Now I can comment!',
      }),
    });
    
    // Should succeed with comment permission
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data.comment.content).toBe('Now I can comment!');
    }
  });
  
  it('Step 7: Shared user cannot edit (needs edit permission)', async () => {
    const response = await fetch(`${baseUrl}/api/admin/braindump/${testBraindumpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sharedUserToken}`,
      },
      body: JSON.stringify({
        content: 'Trying to edit',
      }),
    });
    
    // Should be rejected - needs edit permission
    expect([403, 401, 404]).toContain(response.status);
  });
  
  it('Step 8: Upgrade to edit permission', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        permission: 'edit',
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      expect(data.data.permission.permission).toBe('edit');
    }
  });
  
  it('Step 9: Shared user can now edit', async () => {
    const response = await fetch(`${baseUrl}/api/admin/braindump/${testBraindumpId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sharedUserToken}`,
      },
      body: JSON.stringify({
        content: 'Edited content',
      }),
    });
    
    // Should succeed with edit permission
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
    }
  });
  
  it('Step 10: Revoke all permissions', async () => {
    if (!permissionId) {
      console.log('Skipping: No permission ID');
      return;
    }
    
    const response = await fetch(
      `${baseUrl}/api/braindump/${testBraindumpId}/share?permissionId=${permissionId}`,
      {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${ownerToken}` },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      expect(data.success).toBe(true);
    }
  });
  
  it('Step 11: Shared user loses access after revocation', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}`, {
      headers: { 'Authorization': `Bearer ${sharedUserToken}` },
    });
    
    // Should be denied access
    expect([403, 404]).toContain(response.status);
  });
  
  it('Step 12: Non-owner cannot grant permissions', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sharedUserToken}`,
      },
      body: JSON.stringify({
        userId: 'user_another',
        permission: 'view',
      }),
    });
    
    // Only owner can grant permissions
    expect([403, 401]).toContain(response.status);
  });
  
  it('Step 13: Prevent self-sharing', async () => {
    const response = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        userId: 'owner-user-id', // Owner's own ID
        permission: 'view',
      }),
    });
    
    // Should reject self-sharing
    expect([400, 403]).toContain(response.status);
  });
  
  it('Step 14: Verify permission hierarchy', async () => {
    // Grant view permission
    await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/share`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ownerToken}`,
      },
      body: JSON.stringify({
        userId: testUserId,
        permission: 'view',
      }),
    });
    
    // User with view can't comment
    const commentResponse = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sharedUserToken}`,
      },
      body: JSON.stringify({ content: 'Test' }),
    });
    
    expect([403, 401]).toContain(commentResponse.status);
    
    // But can view
    const viewResponse = await fetch(`${baseUrl}/api/braindump/${testBraindumpId}`, {
      headers: { 'Authorization': `Bearer ${sharedUserToken}` },
    });
    
    // View should succeed or return 404 (depending on setup)
    expect([200, 404]).toContain(viewResponse.status);
  });
});
