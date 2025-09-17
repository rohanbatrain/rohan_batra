import { describe, it, expect } from 'vitest';

describe('Admin User Management API', () => {
  describe('GET /api/admin/users', () => {
    it('should return users with admin-specific data and pagination', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/users?page=1&limit=10'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        users: expect.arrayContaining([
          expect.objectContaining({
            _id: expect.any(String),
            clerkId: expect.any(String),
            email: expect.any(String),
            name: expect.any(String),
            role: expect.stringMatching(/^(user|editor|admin)$/),
            avatar: expect.any(String),
            createdAt: expect.any(String),
            updatedAt: expect.any(String),
            lastActiveAt: expect.any(String),
            isActive: expect.any(Boolean),
            emailVerified: expect.any(Boolean),
            // Admin-specific fields
            stats: expect.objectContaining({
              postsCount: expect.any(Number),
              commentsCount: expect.any(Number),
              likesCount: expect.any(Number),
              loginCount: expect.any(Number),
            }),
            settings: expect.objectContaining({
              emailNotifications: expect.any(Boolean),
              profileVisibility: expect.stringMatching(/^(public|private)$/),
            }),
          }),
        ]),
        pagination: expect.objectContaining({
          currentPage: 1,
          totalPages: expect.any(Number),
          totalUsers: expect.any(Number),
          limit: 10,
          hasNextPage: expect.any(Boolean),
          hasPrevPage: false,
        }),
        summary: expect.objectContaining({
          totalUsers: expect.any(Number),
          activeUsers: expect.any(Number),
          adminUsers: expect.any(Number),
          editorUsers: expect.any(Number),
          regularUsers: expect.any(Number),
          newUsersThisMonth: expect.any(Number),
        }),
      });
    });

    it('should support filtering users by role and status', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/users?role=admin&status=active&search=john'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.users).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            role: 'admin',
            isActive: true,
            name: expect.stringMatching(/john/i),
          }),
        ])
      );

      expect(data.filters).toMatchObject({
        role: 'admin',
        status: 'active',
        search: 'john',
      });
    });

    it('should support sorting users by various fields', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/users?sortBy=lastActiveAt&sortOrder=desc'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.users[0].lastActiveAt).toBeTruthy();

      // Verify sorting order
      if (data.users.length > 1) {
        const firstUserDate = new Date(data.users[0].lastActiveAt);
        const secondUserDate = new Date(data.users[1].lastActiveAt);
        expect(firstUserDate.getTime()).toBeGreaterThanOrEqual(
          secondUserDate.getTime()
        );
      }
    });

    it('should include user activity analytics', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/users?includeAnalytics=true'
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.analytics).toMatchObject({
        userRegistrations: expect.objectContaining({
          thisMonth: expect.any(Number),
          lastMonth: expect.any(Number),
          growth: expect.any(Number),
        }),
        userActivity: expect.objectContaining({
          dailyActiveUsers: expect.any(Number),
          weeklyActiveUsers: expect.any(Number),
          monthlyActiveUsers: expect.any(Number),
        }),
        roleDistribution: expect.objectContaining({
          admin: expect.any(Number),
          editor: expect.any(Number),
          user: expect.any(Number),
        }),
      });
    });

    it('should require admin authentication', async () => {
      // Request without authentication
      const response = await fetch('http://localhost:3000/api/admin/users');

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);

      if (response.status === 401) {
        const data = await response.json();
        expect(data).toMatchObject({
          success: false,
          error: expect.stringContaining('authentication'),
        });
      } else if (response.status === 403) {
        const data = await response.json();
        expect(data).toMatchObject({
          success: false,
          error: expect.stringContaining('permission'),
        });
      }
    });
  });

  describe('GET /api/admin/users/[userId]', () => {
    it('should return detailed user information', async () => {
      // First get a user ID from the list
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?limit=1'
      );
      const usersData = await usersResponse.json();
      const userId = usersData.users[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}`
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        user: expect.objectContaining({
          _id: userId,
          clerkId: expect.any(String),
          email: expect.any(String),
          name: expect.any(String),
          role: expect.stringMatching(/^(user|editor|admin)$/),
          avatar: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          lastActiveAt: expect.any(String),
          isActive: expect.any(Boolean),
          emailVerified: expect.any(Boolean),
          // Detailed stats
          detailedStats: expect.objectContaining({
            posts: expect.objectContaining({
              total: expect.any(Number),
              published: expect.any(Number),
              drafts: expect.any(Number),
              views: expect.any(Number),
              likes: expect.any(Number),
            }),
            comments: expect.objectContaining({
              total: expect.any(Number),
              approved: expect.any(Number),
              pending: expect.any(Number),
            }),
            activity: expect.objectContaining({
              loginCount: expect.any(Number),
              lastLogin: expect.any(String),
              sessionsThisMonth: expect.any(Number),
            }),
          }),
          // User preferences and settings
          preferences: expect.objectContaining({
            emailNotifications: expect.any(Boolean),
            profileVisibility: expect.stringMatching(/^(public|private)$/),
            language: expect.any(String),
            timezone: expect.any(String),
          }),
        }),
      });
    });

    it('should return 404 for non-existent user', async () => {
      const response = await fetch(
        'http://localhost:3000/api/admin/users/non-existent-id'
      );

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('not found'),
      });
    });
  });

  describe('PUT /api/admin/users/[userId]', () => {
    it('should update user role and settings', async () => {
      // Get a user to update
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?limit=1'
      );
      const usersData = await usersResponse.json();
      const userId = usersData.users[0]._id;

      const updateData = {
        role: 'editor',
        isActive: true,
        preferences: {
          emailNotifications: false,
          profileVisibility: 'private',
        },
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        user: expect.objectContaining({
          _id: userId,
          role: 'editor',
          isActive: true,
          preferences: expect.objectContaining({
            emailNotifications: false,
            profileVisibility: 'private',
          }),
          updatedAt: expect.any(String),
          lastModifiedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      });
    });

    it('should validate role changes', async () => {
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?limit=1'
      );
      const usersData = await usersResponse.json();
      const userId = usersData.users[0]._id;

      const invalidUpdate = {
        role: 'invalid-role',
      };

      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invalidUpdate),
        }
      );

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.any(String),
        validation: expect.objectContaining({
          errors: expect.arrayContaining([
            expect.objectContaining({
              field: 'role',
              message: expect.stringContaining('valid role'),
            }),
          ]),
        }),
      });
    });

    it('should prevent self-demotion for admins', async () => {
      // This test assumes the current user is an admin
      const updateData = {
        role: 'user', // Trying to demote self
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/users/current-admin-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('cannot demote yourself'),
      });
    });

    it('should require admin authentication', async () => {
      const updateData = {
        role: 'editor',
      };

      // Request without authentication
      const response = await fetch(
        'http://localhost:3000/api/admin/users/some-user-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('DELETE /api/admin/users/[userId]', () => {
    it('should soft delete a user account', async () => {
      // Create a test user first (or get an existing one)
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?role=user&limit=1'
      );
      const usersData = await usersResponse.json();
      const userId = usersData.users[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('deactivated'),
        user: expect.objectContaining({
          _id: userId,
          isActive: false,
          deactivatedAt: expect.any(String),
          deactivatedBy: expect.objectContaining({
            _id: expect.any(String),
            name: expect.any(String),
          }),
        }),
      });
    });

    it('should support hard delete with force parameter', async () => {
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?role=user&limit=1'
      );
      const usersData = await usersResponse.json();
      const userId = usersData.users[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}?force=true`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        message: expect.stringContaining('permanently deleted'),
        deletedUser: expect.objectContaining({
          _id: userId,
        }),
      });

      // Verify user is completely removed
      const getResponse = await fetch(
        `http://localhost:3000/api/admin/users/${userId}`
      );
      expect(getResponse.status).toBe(404);
    });

    it('should prevent deletion of admin users without confirmation', async () => {
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?role=admin&limit=1'
      );
      const usersData = await usersResponse.json();
      const adminUserId = usersData.users[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/users/${adminUserId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('admin'),
        requiresConfirmation: true,
      });
    });

    it('should prevent self-deletion', async () => {
      // This test assumes we're trying to delete the current user
      const response = await fetch(
        'http://localhost:3000/api/admin/users/current-user-id',
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data).toMatchObject({
        success: false,
        error: expect.stringContaining('cannot delete yourself'),
      });
    });

    it('should handle users with content dependencies', async () => {
      // Get a user who has created content
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?hasContent=true&limit=1'
      );
      const usersData = await usersResponse.json();
      const userId = usersData.users[0]._id;

      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}`,
        {
          method: 'DELETE',
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.warning).toMatch(/content|posts|comments/i);
      expect(data.contentHandling).toMatchObject({
        postsCount: expect.any(Number),
        commentsCount: expect.any(Number),
        action: expect.stringMatching(/^(anonymize|reassign|preserve)$/),
      });
    });

    it('should require admin authentication', async () => {
      // Request without authentication
      const response = await fetch(
        'http://localhost:3000/api/admin/users/some-user-id',
        {
          method: 'DELETE',
        }
      );

      // Should either return 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });

  describe('POST /api/admin/users/bulk-actions', () => {
    it('should support bulk role updates', async () => {
      // Get multiple users for bulk action
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?role=user&limit=3'
      );
      const usersData = await usersResponse.json();
      const userIds = usersData.users.map((user: { _id: string }) => user._id);

      const bulkAction = {
        action: 'updateRole',
        userIds: userIds,
        data: {
          role: 'editor',
        },
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/users/bulk-actions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bulkAction),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        updatedCount: userIds.length,
        results: expect.arrayContaining([
          expect.objectContaining({
            userId: expect.any(String),
            success: true,
            newRole: 'editor',
          }),
        ]),
      });
    });

    it('should support bulk deactivation', async () => {
      const usersResponse = await fetch(
        'http://localhost:3000/api/admin/users?isActive=true&limit=2'
      );
      const usersData = await usersResponse.json();
      const userIds = usersData.users.map((user: { _id: string }) => user._id);

      const bulkAction = {
        action: 'deactivate',
        userIds: userIds,
      };

      const response = await fetch(
        'http://localhost:3000/api/admin/users/bulk-actions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bulkAction),
        }
      );

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        deactivatedCount: userIds.length,
        results: expect.arrayContaining([
          expect.objectContaining({
            userId: expect.any(String),
            success: true,
            action: 'deactivated',
          }),
        ]),
      });
    });
  });
});
