import { Types } from 'mongoose';
import { z } from 'zod';

// ============================================================================
// Analytics Event Types
// ============================================================================

export type AnalyticsEventType =
  | 'view'
  | 'share_twitter'
  | 'share_linkedin'
  | 'share_facebook'
  | 'share_email'
  | 'share_copy'
  | 'comment'
  | 'reaction'
  | 'search'
  | 'export';

export interface IAnalyticsEvent {
  _id: Types.ObjectId;
  type: AnalyticsEventType;
  braindumpId?: Types.ObjectId;
  userId?: string; // Clerk user ID (optional for anonymous events)
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface IBraindumpAnalytics {
  braindumpId: string;
  period: '7d' | '30d' | '90d' | 'all';
  views: {
    total: number;
    unique: number;
    timeline: Array<{ date: string; count: number }>;
  };
  shares: {
    total: number;
    byPlatform: {
      twitter: number;
      linkedin: number;
      facebook: number;
      email: number;
      copy: number;
    };
  };
  comments: {
    total: number;
    approved: number;
    pending: number;
  };
  reactions: {
    total: number;
    breakdown: Record<string, number>;
  };
  referrers: Array<{
    source: string;
    count: number;
  }>;
  topViewers?: Array<{
    userId: string;
    userName: string;
    viewCount: number;
  }>;
}

export interface IDashboardAnalytics {
  period: '7d' | '30d' | '90d' | 'all';
  overview: {
    totalViews: number;
    totalShares: number;
    totalComments: number;
    totalReactions: number;
    publicBraindumps: number;
  };
  topBraindumps: Array<{
    id: string;
    slug?: string;
    content: string; // First 100 chars
    views: number;
    shares: number;
    comments: number;
    reactions: number;
  }>;
  growthMetrics: {
    viewsChange: number;
    sharesChange: number;
    commentsChange: number;
    reactionsChange: number;
  };
}

export interface ITrendingBraindump {
  id: string;
  slug?: string;
  content: string; // First 200 chars
  tags: string[];
  author: {
    name: string;
    image?: string;
  };
  trendingScore: number;
  recentViews: number;
  recentShares: number;
  recentComments: number;
  recentReactions: number;
  createdAt: Date;
}

// ============================================================================
// Notification Types
// ============================================================================

export type NotificationType = 'comment' | 'reply' | 'reaction' | 'share' | 'mention' | 'milestone';

export interface INotification {
  _id: Types.ObjectId;
  userId: string; // Clerk user ID
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedBraindumpId?: Types.ObjectId;
  relatedCommentId?: Types.ObjectId;
  actionUrl?: string;
  actor?: {
    userId: string;
    userName: string;
    userImage?: string;
  };
  createdAt: Date;
}

export interface INotificationPublic {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  relatedBraindumpId?: string;
  relatedCommentId?: string;
  actionUrl?: string;
  actor?: {
    userId: string;
    userName: string;
    userImage?: string;
  };
  createdAt: Date;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const AnalyticsEventTypeSchema = z.enum([
  'view',
  'share_twitter',
  'share_linkedin',
  'share_facebook',
  'share_email',
  'share_copy',
  'comment',
  'reaction',
  'search',
  'export',
]);

export const AnalyticsPeriodSchema = z.enum(['7d', '30d', '90d', 'all']);

export const TrendingQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional().default(10),
  period: z.enum(['24h', '7d', '30d']).optional().default('7d'),
});

export const NotificationTypeSchema = z.enum([
  'comment',
  'reply',
  'reaction',
  'share',
  'mention',
  'milestone',
]);

export const NotificationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  unreadOnly: z.coerce.boolean().optional().default(false),
});

export type TrendingQueryInput = z.infer<typeof TrendingQuerySchema>;
export type NotificationQueryInput = z.infer<typeof NotificationQuerySchema>;
