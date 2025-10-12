# Data Model: Braindump Visibility & Public Rendering

**Feature**: 016-braindump-visibility-public  
**Date**: October 9, 2025  
**Status**: Complete

---

## Overview

This document defines all data entities, their relationships, validation rules, and state transitions for the Braindump Visibility feature. The system extends the existing Braindump model and adds 5 new models to support public rendering, social engagement, collaboration, and analytics.

---

## Entity Relationship Diagram

```
┌─────────────┐
│    User     │
│─────────────│
│ _id         │
│ name        │◄──────────────────────────┐
│ email       │                           │
│ image       │                           │
│ role        │                           │ owner
└─────────────┘                           │
       │                                  │
       │ author                           │
       ▼                                  │
┌─────────────────┐              ┌───────────────┐
│    Braindump    │◄─────────────│ SharePermission│
│─────────────────│  braindump   │───────────────│
│ _id             │              │ _id           │
│ userId          │              │ braindumpId   │
│ content         │              │ userId        │
│ tags            │              │ permission    │
│ category        │              │ grantedBy     │
│ visibility  ✨  │              │ revoked       │
│ slug        ✨  │              └───────────────┘
│ publicMetadata  │
│ linkedTo        │
│ linkedFrom      │
│ editHistory ✨  │
└─────────────────┘
       │
       │ braindump
       ▼
┌─────────────┐
│   Comment   │
│─────────────│
│ _id         │
│ braindumpId │
│ authorId    │
│ content     │
│ parentId    │
│ status      │
└─────────────┘

       │ braindump
       ▼
┌─────────────┐
│  Reaction   │
│─────────────│
│ _id         │
│ braindumpId │
│ userId      │
│ emoji       │
└─────────────┘

       │ braindump
       ▼
┌──────────────────┐
│ AnalyticsEvent   │
│──────────────────│
│ _id              │
│ type             │
│ braindumpId      │
│ userId           │
│ metadata         │
│ timestamp        │
└──────────────────┘

┌─────────────┐
│Notification │
│─────────────│
│ _id         │
│ userId      │
│ type        │
│ title       │
│ message     │
│ relatedId   │
│ read        │
└─────────────┘
```

✨ = New or modified field

---

## 1. Braindump (Extended)

**Purpose**: Represents a user's captured thought, note, or knowledge entry with visibility controls.

### Schema

```typescript
interface IBraindump extends Document {
  // === EXISTING FIELDS ===
  userId: Types.ObjectId;                    // Reference to User
  content: string;                           // Main content (max 10,000 chars)
  tags: string[];                            // Tags for categorization
  category?: string;                         // Optional category
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  linkedTo: Types.ObjectId[];                // Internal wiki links (IDs)
  linkedFrom: Types.ObjectId[];              // Backlinks (IDs)
  associations: Array<{
    type: string;
    entityId: Types.ObjectId;
    entityType: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
  
  // === NEW FIELDS (Phase 1) ===
  visibility: 'private' | 'unlisted' | 'public';  // Default: 'private'
  slug?: string;                              // URL-friendly slug (nullable)
  publicMetadata?: {
    viewCount: number;                        // Public view count
    lastViewedAt?: Date;                      // Last public view timestamp
    shareCount: number;                       // Total shares
    sharesByPlatform?: {                      // Breakdown by platform
      twitter: number;
      linkedin: number;
      copy: number;
    };
  };
  
  // === NEW FIELDS (Phase 3) ===
  sharedWith?: Types.ObjectId[];              // Users with explicit access
  editHistory?: Array<{
    editedBy: Types.ObjectId;                 // User who made edit
    editedAt: Date;                           // When edit was made
    previousContent?: string;                 // Previous content (optional)
  }>;
  
  // === COMPUTED FIELDS ===
  commentCount?: number;                      // Virtual field (from Comment count)
  reactionCounts?: Record<string, number>;    // Virtual field (from Reaction aggregation)
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `content` | Required, 1-10,000 chars | "Content must be between 1 and 10,000 characters" |
| `visibility` | Enum: ['private', 'unlisted', 'public'] | "Visibility must be private, unlisted, or public" |
| `slug` | Unique (sparse), max 200 chars, URL-safe | "Slug must be unique and URL-safe" |
| `tags` | Array, max 10 tags, each max 50 chars | "Maximum 10 tags, each up to 50 characters" |
| `userId` | Valid ObjectId, references User | "Invalid user reference" |

### Indexes

```typescript
// === EXISTING INDEXES ===
BraindumpSchema.index({ userId: 1, status: 1, createdAt: -1 });
BraindumpSchema.index({ userId: 1, tags: 1 });
BraindumpSchema.index({ userId: 1, priority: 1, status: 1 });
BraindumpSchema.index({ tags: 1 });
BraindumpSchema.index({ linkedTo: 1 });
BraindumpSchema.index({ linkedFrom: 1 });

// === NEW INDEXES ===
BraindumpSchema.index({ visibility: 1, createdAt: -1 });           // Public listings
BraindumpSchema.index({ userId: 1, visibility: 1 });               // User's public items
BraindumpSchema.index({ slug: 1 }, { unique: true, sparse: true }); // Slug lookup
BraindumpSchema.index({ visibility: 1, tags: 1 });                 // Tag-based discovery
BraindumpSchema.index({ 
  visibility: 1, 
  'publicMetadata.viewCount': -1 
});  // Popular content
```

### Methods

```typescript
// Generate unique slug from content
generateSlug(): string {
  const timestamp = Date.now().toString(36);
  const contentSlug = this.content
    .slice(0, 50)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  return `${contentSlug}-${timestamp}`;
}

// Check if user can view
canView(userId?: string, userRole?: string): boolean {
  if (userRole === 'admin') return true;
  if (userId && this.userId.toString() === userId) return true;
  if (this.visibility === 'public' || this.visibility === 'unlisted') return true;
  return false;
}

// Sanitize for public view
toPublicJSON(): object {
  return {
    id: this._id,
    content: this.content,
    tags: this.tags,
    category: this.category,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    slug: this.slug,
    linkedTo: this.linkedTo,
    viewCount: this.publicMetadata?.viewCount || 0,
    shareCount: this.publicMetadata?.shareCount || 0,
    commentCount: this.commentCount || 0,
    reactionCounts: this.reactionCounts || {}
  };
}
```

### State Transitions

```
┌─────────┐
│ PRIVATE │ (default state)
└─────────┘
     │
     ├──── makeUnlisted() ──────► ┌──────────┐
     │                             │ UNLISTED │
     │                             └──────────┘
     │                                   │
     │                                   │
     └──── makePublic() ─────────────┬──┘
                                     │
                              ┌──────▼──┐
                              │ PUBLIC  │
                              └─────────┘
                                   │
                                   │ makePrivate()
                                   ▼
                              (back to PRIVATE)
```

**Rules**:
- Only owner or admin can change visibility
- Slug is auto-generated when transitioning to public/unlisted (if not exists)
- Slug is preserved when transitioning back to private
- View count is preserved across visibility changes

---

## 2. Comment (New)

**Purpose**: Represents a user comment on a public braindump with support for threaded replies.

### Schema

```typescript
interface IComment extends Document {
  braindumpId: Types.ObjectId;      // Reference to Braindump
  authorId: Types.ObjectId;         // Reference to User
  content: string;                  // Comment text (max 2,000 chars)
  parentId?: Types.ObjectId;        // Reference to parent Comment (for replies)
  status: 'active' | 'hidden' | 'deleted';
  editedAt?: Date;                  // If edited
  createdAt: Date;
  updatedAt: Date;
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `content` | Required, 1-2,000 chars | "Comment must be between 1 and 2,000 characters" |
| `braindumpId` | Valid ObjectId, braindump must exist | "Invalid braindump reference" |
| `authorId` | Valid ObjectId, references User | "Invalid user reference" |
| `parentId` | If provided, must reference existing Comment | "Invalid parent comment reference" |
| `status` | Enum: ['active', 'hidden', 'deleted'] | "Invalid status" |

### Indexes

```typescript
CommentSchema.index({ braindumpId: 1, createdAt: -1 });     // Fetch comments for braindump
CommentSchema.index({ authorId: 1, createdAt: -1 });        // User's comments
CommentSchema.index({ parentId: 1 });                        // Fetch replies
CommentSchema.index({ braindumpId: 1, status: 1, parentId: 1 }); // Active top-level comments
```

### Business Rules

- **Threading**: Maximum 1 level deep (comments can have replies, but replies cannot have replies)
- **Moderation**: 
  - Comment author can edit/delete own comments
  - Braindump owner can hide/delete any comment on their braindump
  - Admins can hide/delete any comment
- **Rate Limiting**: Maximum 10 comments per hour per user
- **Soft Delete**: Deleted comments show as "[deleted]" if they have replies

---

## 3. Reaction (New)

**Purpose**: Represents a user's emoji reaction to a braindump.

### Schema

```typescript
interface IReaction extends Document {
  braindumpId: Types.ObjectId;      // Reference to Braindump
  userId: Types.ObjectId;           // Reference to User
  emoji: '👍' | '❤️' | '🎯' | '💡' | '🔥';  // Emoji type
  createdAt: Date;
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `braindumpId` | Valid ObjectId, braindump must exist | "Invalid braindump reference" |
| `userId` | Valid ObjectId, references User | "Invalid user reference" |
| `emoji` | Enum: ['👍', '❤️', '🎯', '💡', '🔥'] | "Invalid emoji type" |

### Indexes

```typescript
// Unique constraint: one user can only react once per emoji per braindump
ReactionSchema.index({ 
  userId: 1, 
  braindumpId: 1, 
  emoji: 1 
}, { unique: true });

// Aggregate counts
ReactionSchema.index({ braindumpId: 1, emoji: 1 });
```

### Business Rules

- **Uniqueness**: User can react with each emoji type once per braindump (5 max reactions per user per braindump)
- **Toggle**: Clicking same emoji again removes the reaction
- **Aggregation**: Counts are computed on-the-fly via aggregation pipeline

---

## 4. SharePermission (New)

**Purpose**: Represents granular access control for shared braindumps.

### Schema

```typescript
interface ISharePermission extends Document {
  braindumpId: Types.ObjectId;      // Reference to Braindump
  userId: Types.ObjectId;           // Reference to User (grantee)
  permission: 'view' | 'comment' | 'edit';
  grantedBy: Types.ObjectId;        // Reference to User (grantor)
  grantedAt: Date;
  revoked: boolean;                 // Soft delete
  revokedAt?: Date;
  revokedBy?: Types.ObjectId;
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `braindumpId` | Valid ObjectId, braindump must exist | "Invalid braindump reference" |
| `userId` | Valid ObjectId, references User | "Invalid user reference" |
| `permission` | Enum: ['view', 'comment', 'edit'] | "Permission must be view, comment, or edit" |
| `grantedBy` | Valid ObjectId, references User | "Invalid grantor reference" |

### Indexes

```typescript
SharePermissionSchema.index({ braindumpId: 1, userId: 1, revoked: 1 }); // Check permission
SharePermissionSchema.index({ userId: 1, revoked: 1 });                  // User's shared items
```

### Permission Hierarchy

```
VIEW (lowest)
  │
  ▼
COMMENT
  │
  ▼
EDIT (highest)
```

**Rules**:
- `edit` permission implies `comment` and `view`
- `comment` permission implies `view`
- Only owner or admin can grant/revoke permissions
- Owner always has `edit` permission (cannot be revoked)

---

## 5. AnalyticsEvent (New)

**Purpose**: Tracks individual engagement events for analytics aggregation.

### Schema

```typescript
interface IAnalyticsEvent extends Document {
  type: 'view' | 'share' | 'comment' | 'reaction';
  braindumpId: Types.ObjectId;      // Reference to Braindump
  userId?: Types.ObjectId;          // Reference to User (optional for anonymous)
  metadata: {
    source?: 'twitter' | 'linkedin' | 'direct' | 'search' | 'rss';
    device?: 'mobile' | 'tablet' | 'desktop';
    country?: string;                // ISO 3166-1 alpha-2 country code
    referrer?: string;
    userAgent?: string;
  };
  timestamp: Date;
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `type` | Enum: ['view', 'share', 'comment', 'reaction'] | "Invalid event type" |
| `braindumpId` | Valid ObjectId, braindump must exist | "Invalid braindump reference" |
| `timestamp` | Required, Date | "Timestamp is required" |

### Indexes

```typescript
AnalyticsEventSchema.index({ braindumpId: 1, timestamp: -1 });      // Time-series queries
AnalyticsEventSchema.index({ braindumpId: 1, type: 1 });            // Event type aggregation
AnalyticsEventSchema.index({ timestamp: -1 });                       // Recent events
AnalyticsEventSchema.index({ userId: 1, timestamp: -1 });           // User activity
```

### Data Retention

- **Raw events**: Retained for 90 days
- **Aggregated data**: Retained indefinitely
- **Background job**: Aggregates events daily at 00:00 UTC

---

## 6. Notification (New)

**Purpose**: Represents a notification to a user (in-app and email).

### Schema

```typescript
interface INotification extends Document {
  userId: Types.ObjectId;           // Reference to User (recipient)
  type: 'comment' | 'reply' | 'share' | 'mention' | 'weekly_digest';
  title: string;                    // Short title
  message: string;                  // Full message
  relatedBraindumpId?: Types.ObjectId;
  relatedCommentId?: Types.ObjectId;
  read: boolean;                    // Read status
  emailSent: boolean;               // Email delivery status
  emailSentAt?: Date;
  createdAt: Date;
}
```

### Validation Rules

| Field | Rule | Error Message |
|-------|------|---------------|
| `userId` | Valid ObjectId, references User | "Invalid user reference" |
| `type` | Enum: ['comment', 'reply', 'share', 'mention', 'weekly_digest'] | "Invalid notification type" |
| `title` | Required, max 200 chars | "Title must be provided" |
| `message` | Required, max 1,000 chars | "Message must be provided" |

### Indexes

```typescript
NotificationSchema.index({ userId: 1, read: 0, createdAt: -1 });    // Unread notifications
NotificationSchema.index({ userId: 1, createdAt: -1 });             // All notifications
NotificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 }); // TTL: 30 days
```

### Business Rules

- **Auto-cleanup**: Notifications older than 30 days are automatically deleted (MongoDB TTL index)
- **Email batching**: Max 1 email per hour per user (batched notifications)
- **Weekly digest**: Sent every Monday at 09:00 local time

---

## 7. User (Extended Reference)

**Purpose**: Existing User model with role-based permissions.

### Relevant Fields (Read-Only)

```typescript
interface IUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  image?: string;
  role: 'user' | 'editor' | 'admin';
}
```

### Permission Matrix

| Role | View Private (Own) | View Private (Others) | View Public | Moderate | Grant Access |
|------|-------------------|----------------------|-------------|----------|--------------|
| **user** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **editor** | ✅ | ❌ | ✅ | ❌ | Own braindumps only |
| **admin** | ✅ | ✅ | ✅ | ✅ | All braindumps |

---

## Data Flow Diagrams

### Creating a Public Braindump

```
User Input
    │
    ▼
Validate Content
    │
    ├──► Generate Slug (if public/unlisted)
    │
    ▼
Save to Braindump Collection
    │
    ▼
Return Success
```

### Viewing a Public Braindump

```
HTTP Request (/braindump/[id])
    │
    ▼
Find by ID or Slug
    │
    ├──► Check Visibility
    │    │
    │    ├── Private? → Return 404
    │    └── Public/Unlisted? → Continue
    │
    ▼
Increment View Count (async)
    │
    ▼
Fetch Linked Public Braindumps
    │
    ▼
Populate Author Details
    │
    ▼
Aggregate Comment Count
    │
    ▼
Aggregate Reaction Counts
    │
    ▼
Return Public JSON
```

### Posting a Comment

```
User Input (Comment Text)
    │
    ▼
Check Rate Limit (10/hour)
    │
    ├──► Exceeded? → Return 429
    │
    ▼
Validate Content (1-2,000 chars)
    │
    ▼
Check Braindump Visibility (public)
    │
    ▼
Save Comment (status: active)
    │
    ├──► Create AnalyticsEvent (type: comment)
    │
    ├──► Notify Braindump Owner
    │
    └──► Notify Parent Comment Author (if reply)
    │
    ▼
Return Comment JSON
```

---

## Migration Plan

### Phase 1: Add New Fields to Braindump

```typescript
// Migration script
await Braindump.updateMany(
  { visibility: { $exists: false } },
  { 
    $set: { 
      visibility: 'private',
      publicMetadata: {
        viewCount: 0,
        shareCount: 0,
        sharesByPlatform: { twitter: 0, linkedin: 0, copy: 0 }
      }
    } 
  }
);
```

### Phase 2: Create New Collections

```typescript
// Create indexes for new collections
await Comment.createIndexes();
await Reaction.createIndexes();
await SharePermission.createIndexes();
await AnalyticsEvent.createIndexes();
await Notification.createIndexes();
```

### Phase 3: Verify Data Integrity

```typescript
// Verify all braindumps have visibility field
const count = await Braindump.countDocuments({ visibility: { $exists: true } });
console.log(`Migrated ${count} braindumps`);

// Verify indexes created
const indexes = await Braindump.listIndexes();
console.log('Indexes:', indexes.map(i => i.name));
```

---

## Summary

### New Models Created
1. ✅ Comment (threaded comments system)
2. ✅ Reaction (emoji-based engagement)
3. ✅ SharePermission (granular access control)
4. ✅ AnalyticsEvent (event-sourced analytics)
5. ✅ Notification (in-app and email notifications)

### Existing Models Extended
1. ✅ Braindump (visibility, slug, publicMetadata, editHistory)

### Total Collections: 6 (1 extended + 5 new)
### Total Indexes: 25+ (optimized for query patterns)
### Total Validation Rules: 30+ (data integrity ensured)

**Status**: ✅ Data Model Complete  
**Next Phase**: API Contracts Generation
