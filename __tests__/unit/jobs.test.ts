/**
 * Unit Tests for Background Job System
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Types } from 'mongoose';

// Mock dependencies
vi.mock('@/lib/mongodb', () => ({
  default: vi.fn().mockResolvedValue({}),
}));

vi.mock('@/models/Notification', () => ({
  default: {
    find: vi.fn(),
    distinct: vi.fn(),
    deleteMany: vi.fn(),
  },
}));

vi.mock('@/models/User', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import Notification from '@/models/Notification';
import User from '@/models/User';
import {
  generateNotificationDigest,
  cleanupOldNotifications,
} from '@/lib/jobs';

describe('generateNotificationDigest', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate daily digest for user with notifications', async () => {
    const userId = 'user_123';
    const mockUser = {
      clerkId: userId,
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockNotifications = [
      {
        userId,
        type: 'comment',
        title: 'New comment',
        message: 'Someone commented on your braindump',
        actionUrl: '/braindump/slug-1',
        read: false,
        createdAt: new Date(),
      },
      {
        userId,
        type: 'reaction',
        title: 'New reaction',
        message: 'Someone liked your braindump',
        actionUrl: '/braindump/slug-2',
        read: false,
        createdAt: new Date(Date.now() - 3600000),
      },
    ];

    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    } as any);

    vi.mocked(Notification.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockNotifications),
    } as any);

    const digest = await generateNotificationDigest(userId, 'daily');

    expect(digest).not.toBeNull();
    expect(digest?.userId).toBe(userId);
    expect(digest?.userEmail).toBe('test@example.com');
    expect(digest?.userName).toBe('Test User');
    expect(digest?.notifications).toHaveLength(2);
    expect(digest?.period).toBe('daily');
  });

  it('should return null if user not found', async () => {
    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    } as any);

    const digest = await generateNotificationDigest('user_999', 'daily');

    expect(digest).toBeNull();
  });

  it('should return null if no unread notifications', async () => {
    const mockUser = {
      clerkId: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    };

    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    } as any);

    vi.mocked(Notification.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([]),
    } as any);

    const digest = await generateNotificationDigest('user_123', 'daily');

    expect(digest).toBeNull();
  });

  it('should handle weekly digest period', async () => {
    const userId = 'user_123';
    const mockUser = {
      clerkId: userId,
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockNotifications = [
      {
        userId,
        type: 'comment',
        title: 'New comment',
        message: 'Someone commented',
        read: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    ];

    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    } as any);

    vi.mocked(Notification.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockNotifications),
    } as any);

    const digest = await generateNotificationDigest(userId, 'weekly');

    expect(digest).not.toBeNull();
    expect(digest?.period).toBe('weekly');
    expect(Notification.find).toHaveBeenCalledWith(
      expect.objectContaining({
        userId,
        read: false,
        createdAt: expect.any(Object),
      })
    );
  });

  it('should limit notifications to 50', async () => {
    const mockUser = {
      clerkId: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    };

    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    } as any);

    const mockNotifications = Array.from({ length: 60 }, (_, i) => ({
      userId: 'user_123',
      type: 'comment',
      title: `Notification ${i}`,
      message: 'Test',
      read: false,
      createdAt: new Date(),
    }));

    const limitFn = vi.fn().mockReturnThis();
    vi.mocked(Notification.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: limitFn,
      lean: vi.fn().mockResolvedValue(mockNotifications.slice(0, 50)),
    } as any);

    await generateNotificationDigest('user_123', 'daily');

    expect(limitFn).toHaveBeenCalledWith(50);
  });
});

describe('cleanupOldNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete old read notifications', async () => {
    vi.mocked(Notification.deleteMany).mockResolvedValue({
      deletedCount: 150,
    } as any);

    const deletedCount = await cleanupOldNotifications();

    expect(deletedCount).toBe(150);
    expect(Notification.deleteMany).toHaveBeenCalledWith({
      read: true,
      createdAt: { $lt: expect.any(Date) },
    });
  });

  it('should only delete notifications older than 30 days', async () => {
    vi.mocked(Notification.deleteMany).mockResolvedValue({
      deletedCount: 50,
    } as any);

    await cleanupOldNotifications();

    const call = vi.mocked(Notification.deleteMany).mock.calls[0][0] as any;
    const dateThreshold = call.createdAt.$lt as Date;
    const now = new Date();
    const daysDifference = (now.getTime() - dateThreshold.getTime()) / (1000 * 60 * 60 * 24);

    expect(Math.abs(daysDifference - 30)).toBeLessThan(0.1); // Within 2.4 hours tolerance
  });

  it('should only delete read notifications', async () => {
    vi.mocked(Notification.deleteMany).mockResolvedValue({
      deletedCount: 25,
    } as any);

    await cleanupOldNotifications();

    expect(Notification.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        read: true,
      })
    );
  });

  it('should handle zero deletions', async () => {
    vi.mocked(Notification.deleteMany).mockResolvedValue({
      deletedCount: 0,
    } as any);

    const deletedCount = await cleanupOldNotifications();

    expect(deletedCount).toBe(0);
  });

  it('should handle missing deletedCount property', async () => {
    vi.mocked(Notification.deleteMany).mockResolvedValue({} as any);

    const deletedCount = await cleanupOldNotifications();

    expect(deletedCount).toBe(0);
  });
});

describe('Job System Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle database errors in digest generation', async () => {
    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error('Database error')),
    } as any);

    await expect(
      generateNotificationDigest('user_123', 'daily')
    ).rejects.toThrow('Database error');
  });

  it('should handle database errors in cleanup', async () => {
    vi.mocked(Notification.deleteMany).mockRejectedValue(
      new Error('Database error')
    );

    await expect(cleanupOldNotifications()).rejects.toThrow('Database error');
  });
});

describe('Digest Email Format', () => {
  it('should include all required fields in digest', async () => {
    const mockUser = {
      clerkId: 'user_123',
      email: 'test@example.com',
      name: 'Test User',
    };

    const mockNotifications = [
      {
        userId: 'user_123',
        type: 'comment',
        title: 'New comment',
        message: 'Someone commented',
        actionUrl: '/braindump/slug-1',
        read: false,
        createdAt: new Date(),
      },
    ];

    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    } as any);

    vi.mocked(Notification.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockNotifications),
    } as any);

    const digest = await generateNotificationDigest('user_123', 'daily');

    expect(digest).toMatchObject({
      userId: 'user_123',
      userEmail: 'test@example.com',
      userName: 'Test User',
      period: 'daily',
      notifications: expect.arrayContaining([
        expect.objectContaining({
          type: 'comment',
          title: 'New comment',
          message: 'Someone commented',
          actionUrl: '/braindump/slug-1',
          createdAt: expect.any(Date),
        }),
      ]),
    });
  });

  it('should handle missing optional fields', async () => {
    const mockUser = {
      clerkId: 'user_123',
      email: '',
      name: '',
    };

    const mockNotifications = [
      {
        userId: 'user_123',
        type: 'reaction',
        title: 'New reaction',
        message: 'Someone liked your post',
        read: false,
        createdAt: new Date(),
      },
    ];

    vi.mocked(User.findOne).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockUser),
    } as any);

    vi.mocked(Notification.find).mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue(mockNotifications),
    } as any);

    const digest = await generateNotificationDigest('user_123', 'daily');

    expect(digest?.userEmail).toBe('');
    expect(digest?.userName).toBe('');
  });
});
