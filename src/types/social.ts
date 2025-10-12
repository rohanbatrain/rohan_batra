import { Types } from 'mongoose';
import { z } from 'zod';

// ============================================================================
// Comment Types
// ============================================================================

export type CommentStatus = 'pending' | 'approved' | 'flagged' | 'deleted';

export interface IComment {
  _id: Types.ObjectId;
  braindumpId: Types.ObjectId;
  authorId: string; // Clerk user ID
  content: string;
  parentId?: Types.ObjectId;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommentPublic {
  id: string;
  braindumpId: string;
  authorId: string;
  authorName: string;
  authorImage?: string;
  content: string;
  parentId?: string;
  status: CommentStatus;
  createdAt: Date;
  updatedAt: Date;
  replies?: ICommentPublic[];
}

// ============================================================================
// Reaction Types
// ============================================================================

export type ReactionEmoji = '👍' | '❤️' | '🎯' | '💡' | '🔥';

export const REACTION_EMOJIS: ReactionEmoji[] = ['👍', '❤️', '🎯', '💡', '🔥'];

export interface IReaction {
  _id: Types.ObjectId;
  braindumpId: Types.ObjectId;
  userId: string; // Clerk user ID
  emoji: ReactionEmoji;
  createdAt: Date;
}

export interface IReactionSummary {
  braindumpId: string;
  counts: Record<ReactionEmoji, number>;
  userReactions: ReactionEmoji[];
  topReactors?: Array<{
    userId: string;
    userName: string;
    userImage?: string;
    reactionCount: number;
  }>;
}

// ============================================================================
// Share Permission Types
// ============================================================================

export type SharePermissionLevel = 'view' | 'comment' | 'edit';

export interface ISharePermission {
  _id: Types.ObjectId;
  braindumpId: Types.ObjectId;
  userId: string; // Clerk user ID
  permission: SharePermissionLevel;
  grantedBy: string; // Clerk user ID
  grantedAt: Date;
  updatedAt: Date;
  revoked: boolean;
}

export interface ISharePermissionPublic {
  id: string;
  braindumpId: string;
  userId: string;
  userName: string;
  userImage?: string;
  permission: SharePermissionLevel;
  grantedAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const CommentStatusSchema = z.enum(['pending', 'approved', 'flagged', 'deleted']);

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional(),
});

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(2000),
});

export const ReactionEmojiSchema = z.enum(['👍', '❤️', '🎯', '💡', '🔥']);

export const ToggleReactionSchema = z.object({
  emoji: ReactionEmojiSchema,
});

export const SharePermissionLevelSchema = z.enum(['view', 'comment', 'edit']);

export const GrantSharePermissionSchema = z.object({
  userId: z.string().min(1),
  permission: SharePermissionLevelSchema,
});

export const UpdateSharePermissionSchema = z.object({
  permission: SharePermissionLevelSchema,
});

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>;
export type ToggleReactionInput = z.infer<typeof ToggleReactionSchema>;
export type GrantSharePermissionInput = z.infer<typeof GrantSharePermissionSchema>;
export type UpdateSharePermissionInput = z.infer<typeof UpdateSharePermissionSchema>;
