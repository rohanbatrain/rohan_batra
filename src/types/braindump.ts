import { Types } from 'mongoose';
import { z } from 'zod';

// ============================================================================
// Braindump Types
// ============================================================================

export type BraindumpVisibility = 'private' | 'unlisted' | 'public';
export type BraindumpStatus = 'captured' | 'processed' | 'archived';
export type BraindumpPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface IBraindumpPublicMetadata {
  viewCount: number;
  lastViewedAt?: Date;
  shareCount: number;
  sharesByPlatform?: {
    twitter: number;
    linkedin: number;
    facebook: number;
    email: number;
    copy: number;
  };
}

export interface IBraindumpEditHistory {
  editedBy: Types.ObjectId;
  editedAt: Date;
  previousContent?: string;
}

export interface IBraindumpAssociation {
  type: string;
  entityId: Types.ObjectId;
  entityType: string;
}

// Extended Braindump interface with visibility fields
export interface IBraindump {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  content: string;
  tags: string[];
  category?: string;
  priority: BraindumpPriority;
  status: BraindumpStatus;
  linkedTo: Types.ObjectId[];
  linkedFrom: Types.ObjectId[];
  associations: IBraindumpAssociation[];
  
  // New visibility fields
  visibility: BraindumpVisibility;
  slug?: string;
  publicMetadata?: IBraindumpPublicMetadata;
  sharedWith?: Types.ObjectId[];
  editHistory?: IBraindumpEditHistory[];
  
  createdAt: Date;
  updatedAt: Date;
  
  // Virtual fields
  commentCount?: number;
  reactionCounts?: Record<string, number>;
}

// Public-safe braindump (excludes private fields)
export interface IBraindumpPublic {
  id: string;
  content: string;
  slug?: string;
  tags: string[];
  category?: string;
  author: {
    name: string;
    image?: string;
  };
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  shareCount: number;
  commentCount: number;
  reactionCounts?: Record<string, number>;
  linkedBraindumps?: IBraindumpLinked[];
}

// Preview for listing pages
export interface IBraindumpPreview {
  id: string;
  slug?: string;
  content: string; // First 200 chars
  tags: string[];
  category?: string;
  author: {
    name: string;
    image?: string;
  };
  createdAt: Date;
  viewCount: number;
  shareCount: number;
}

// Linked braindump reference
export interface IBraindumpLinked {
  id: string;
  slug?: string;
  preview: string; // First 100 chars
  tags: string[];
  createdAt: Date;
}

// ============================================================================
// Zod Schemas for Validation
// ============================================================================

export const BraindumpVisibilitySchema = z.enum(['private', 'unlisted', 'public']);

export const CreateBraindumpSchema = z.object({
  content: z.string().min(1).max(10000),
  visibility: BraindumpVisibilitySchema.optional().default('private'),
  tags: z.array(z.string().min(1).max(50)).max(10).optional().default([]),
  category: z.string().max(50).optional(),
  customSlug: z.string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  ogImage: z.string().url().optional(),
  ogDescription: z.string().max(160).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export const UpdateBraindumpSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  visibility: BraindumpVisibilitySchema.optional(),
  tags: z.array(z.string().min(1).max(50)).max(10).optional(),
  category: z.string().max(50).optional(),
  customSlug: z.string()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  ogImage: z.string().url().optional(),
  ogDescription: z.string().max(160).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['captured', 'processed', 'archived']).optional(),
});

export const BraindumpQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  tag: z.string().optional(),
  search: z.string().optional(),
  sort: z.enum(['newest', 'views', 'shares']).optional().default('newest'),
});

export type CreateBraindumpInput = z.infer<typeof CreateBraindumpSchema>;
export type UpdateBraindumpInput = z.infer<typeof UpdateBraindumpSchema>;
export type BraindumpQueryInput = z.infer<typeof BraindumpQuerySchema>;
