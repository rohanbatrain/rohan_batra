# Data Model: Unified Admin Dashboard & Content Platform

## Database Schema (MongoDB)

This data model reflects a unified architecture, consolidating asset management and introducing new entities for a comprehensive admin dashboard. It aligns with existing models discovered in the codebase (`User`, `Comment`, `Project`, `LottieAsset`) and formalizes new ones (`SiteSetting`, `Asset`).

### Asset Collection (New & Unified)
This central collection manages all media assets (images, Lottie files, etc.), linking to an external service like Cloudinary.

```typescript
interface Asset {
  _id: ObjectId;
  assetType: 'image' | 'lottie' | 'video' | 'file'; // Type of asset
  provider: 'cloudinary' | 'vercel' | 'internal'; // Where the asset is stored
  providerAssetId: string; // The ID from the external provider (e.g., Cloudinary public_id)
  
  url: string; // The public URL of the asset
  secureUrl: string; // The HTTPS URL of the asset
  
  title: string; // User-defined title for the asset, 1-200 chars
  altText?: string; // Required for images for accessibility, 1-200 chars
  caption?: string; // Optional caption, max 500 chars
  
  metadata: {
    width?: number; // In pixels
    height?: number; // In pixels
    fileSize?: number; // In bytes
    mimeType?: string; // e.g., 'image/jpeg', 'application/json'
    duration?: number; // For video/audio, in seconds
  };
  
  tags: string[]; // Searchable tags, max 10
  
  // Audit fields
  createdAt: Date;
  createdBy: ObjectId; // Ref to User
  updatedAt: Date;
  updatedBy?: ObjectId; // Ref to User
}
```

### User Collection (Formalized)
Based on `src/models/User.ts`, extended for admin functionality.

```typescript
interface User {
  _id: ObjectId;
  clerkUserId: string; // Unique ID from Clerk
  email: string; // Unique
  username: string; // Unique
  firstName?: string;
  lastName?: string;
  profileImageUrl: string;
  
  role: 'admin' | 'editor' | 'user'; // Required, default 'user'
  
  // Extended fields for admin dashboard
  lastLoginAt?: Date;
  activityMetrics: {
    postCount: number;
    commentCount: number;
    likeCount: number;
  };
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}
```

### Comment Collection (Formalized)
Based on `src/models/Comment.ts`, with added moderation status.

```typescript
interface Comment {
  _id: ObjectId;
  content: string; // 1-2000 chars
  author: ObjectId; // Ref to User
  
  // Reference to the content being commented on
  parentType: 'BlogPost' | 'Project' | 'Chapter';
  parentId: ObjectId;
  
  // For threaded comments
  replyTo?: ObjectId; // Ref to another Comment
  
  moderationStatus: 'pending' | 'approved' | 'spam' | 'rejected'; // Required, default 'pending'
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  moderatedBy?: ObjectId; // Ref to User (admin/editor)
  moderatedAt?: Date;
}
```

### SiteSetting Collection (New)
For managing global site configuration.

```typescript
interface SiteSetting {
  _id: ObjectId;
  key: string; // Unique key, e.g., 'siteTitle', 'socialLinks.twitter'
  value: any; // Can be string, number, boolean, or JSON object
  description: string; // Explanation of the setting for the admin UI
  isPublic: boolean; // If true, can be exposed on a public API endpoint (and cached)
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  updatedBy: ObjectId; // Ref to User
}
```

### BlogPost Collection (Refactored)
Updated to use the unified `Asset` model.

```typescript
interface BlogPost {
  _id: ObjectId;
  title: string; // Required, 1-200 chars
  slug: string; // Required, unique
  content: string; // Rich content, max 50KB
  excerpt?: string; // Optional summary, max 500 chars
  
  coverImageId?: ObjectId; // Ref to Asset
  
  tags: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduledAt?: Date;
  publishedAt?: Date;
  
  seo: { /* ... as before ... */ };
  
  // Refactored to use Asset collection
  lottieAnimationId?: ObjectId; // Ref to Asset (where assetType is 'lottie')
  
  // ... versionHistory and audit fields as before ...
  
  // Seeding support
  seedBatchId?: string;
}
```

### Project Collection (Refactored)
Updated to use the unified `Asset` model.

```typescript
interface Project {
  _id: ObjectId;
  title: string;
  slug: string; // Unique
  description: string;
  
  primaryImageId?: ObjectId; // Ref to Asset
  
  // Gallery now stores references and ordering info
  gallery: [{
    assetId: ObjectId; // Ref to Asset
    order: number; // Display order
  }]; // Max 12 images
  
  // ... tags, links, status, featured, audit fields as before ...
  
  // Seeding support
  seedBatchId?: string;
}
```

## Redis Data Structures (Caching)

### Site Settings Cache
- **Key**: `site-settings:public`
- **Type**: `JSON` (via `JSON.SET`/`JSON.GET`)
- **Content**: A JSON object containing all `SiteSetting` documents where `isPublic` is true.
- **Invalidation**: On any CUD operation on the `SiteSetting` collection.

### Analytics Data Cache
- **Key**: `analytics:dashboard`
- **Type**: `JSON`
- **Content**: Aggregated data like `{ "totalViews": 12045, "topPosts": [{"slug": "...", "views": 500}] }`.
- **Update**: Populated by a background job that runs periodically (e.g., every hour).

### Page Component Cache
- **Key**: `page-component:popular-posts`
- **Type**: `JSON`
- **Content**: A JSON array of the top 5 most popular posts, pre-rendered or as data.
- **Invalidation**: Time-based (TTL of 15 minutes) or on publish/unpublish of a post.

## Database Indexes

### Asset Indexes
`{ provider: 1, providerAssetId: 1 }` (Unique)
`{ assetType: 1, createdAt: -1 }`
`{ tags: 1 }`
`{ title: "text", altText: "text", caption: "text" }` (Search)

### User Indexes
`{ clerkUserId: 1 }` (Unique)
`{ email: 1 }` (Unique)
`{ username: 1 }` (Unique)
`{ role: 1 }`

### Comment Indexes
`{ parentType: 1, parentId: 1, createdAt: -1 }`
`{ moderationStatus: 1, createdAt: 1 }`
`{ author: 1 }`

### SiteSetting Indexes
`{ key: 1 }` (Unique)
`{ isPublic: 1 }`

### BlogPost & Project Indexes
(Indexes on `slug`, `status`, `tags`, `createdBy`, `seedBatchId`, and text search remain relevant. No new indexes are immediately required by the schema change, but query performance should be monitored.)

## State Transitions

### Comment Moderation Flow
```
pending ──┬──→ approved
          ├──→ rejected
          └──→ spam
```
- **Rules**:
  - All new comments start as `pending`.
  - `approved` comments are publicly visible.
  - `rejected` and `spam` comments are hidden and may be periodically deleted.
  - An admin can move a comment between any of these states.

(BlogPost and Project status flows remain as previously defined).
