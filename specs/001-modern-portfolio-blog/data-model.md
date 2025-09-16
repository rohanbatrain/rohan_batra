# Data Model: Modern Portfolio + Blog

**Date**: 2025-09-16  
**Feature**: Modern Portfolio + Blog  
**Phase**: 1 - Data Design

---

## Entity Definitions

### User
**Purpose**: Store user account information and roles for authentication and authorization

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `clerkId`: string (unique, required) - Clerk user identifier
- `email`: string (required, indexed) - User email address
- `name`: string (required) - User display name
- `role`: enum ['admin', 'editor', 'user'] (default: 'user') - Access control role
- `avatar`: string? - Profile image URL
- `bio`: string? - User biography
- `preferences`: object - User preferences (theme, language, etc.)
- `createdAt`: Date (default: now) - Account creation timestamp
- `updatedAt`: Date (default: now) - Last update timestamp

**Validation Rules**:
- `clerkId` must be unique and non-empty
- `email` must be valid email format
- `role` must be one of allowed enum values
- `name` must be 1-100 characters

**Relationships**:
- One-to-many with Comment (user can have multiple comments)
- One-to-many with Like (user can have multiple likes)

---

### Project
**Purpose**: Portfolio items showcasing work and achievements

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `title`: string (required) - Project title
- `slug`: string (required, unique, indexed) - URL-friendly identifier
- `description`: string (required) - Project description
- `content`: string - Detailed project content (markdown)
- `technologies`: string[] - Array of technology tags
- `images`: object[] - Array of image objects with url, alt, caption
- `links`: object - External links (github, demo, etc.)
  - `github`: string?
  - `demo`: string?
  - `website`: string?
- `featured`: boolean (default: false) - Whether to feature on homepage
- `status`: enum ['draft', 'published', 'archived'] (default: 'draft')
- `publishedAt`: Date? - Publication timestamp
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `title` must be 1-200 characters
- `slug` must be URL-safe and unique
- `technologies` must be non-empty array
- `links` URLs must be valid when provided

**Relationships**:
- Standalone entity (no direct relationships)

---

### BlogPost
**Purpose**: Blog content metadata (actual content stored in markdown files)

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `title`: string (required) - Post title
- `slug`: string (required, indexed) - URL-friendly identifier
- `summary`: string (required) - SEO description
- `filePath`: string (required) - Path to markdown file
- `categories`: string[] - Post categories/tags
- `language`: string (required, default: 'en') - Content language
- `translationKey`: string? - Key for linking translations
- `publishedAt`: Date? - Publication timestamp
- `updatedAt`: Date (default: now) - Last content update
- `authorId`: ObjectId (required) - Reference to User
- `featured`: boolean (default: false) - Featured post flag
- `status`: enum ['draft', 'published', 'archived'] (default: 'draft')
- `readingTime`: number? - Estimated reading time in minutes
- `viewCount`: number (default: 0) - Page view counter
- `metadata`: object - SEO and social metadata
  - `ogImage`: string?
  - `twitterCard`: string?
  - `canonicalUrl`: string?

**Validation Rules**:
- `title` must be 1-200 characters
- `slug` must be unique per language
- `summary` must be 50-300 characters
- `language` must be valid locale code
- `categories` must be non-empty array

**Relationships**:
- Many-to-one with User (author)
- One-to-many with Comment
- One-to-many with Like
- One-to-many with BlogPost (translations via translationKey)

---

### Comment
**Purpose**: User-generated comments on blog posts

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `postSlug`: string (required, indexed) - Blog post identifier
- `userId`: ObjectId (required) - Comment author
- `content`: string (required) - Comment text content
- `parentId`: ObjectId? - Parent comment for threading
- `status`: enum ['published', 'pending', 'spam', 'deleted'] (default: 'pending')
- `language`: string (default: 'en') - Comment language
- `metadata`: object - Additional comment metadata
  - `ipAddress`: string? - User IP (for moderation)
  - `userAgent`: string? - Browser info (for moderation)
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `content` must be 1-2000 characters
- `content` must be sanitized HTML
- `parentId` must exist if provided
- `userId` must exist

**Relationships**:
- Many-to-one with User (author)
- Many-to-one with BlogPost (via postSlug)
- Self-referencing (parent/child comments)

---

### Like
**Purpose**: User likes/reactions on blog posts

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `postSlug`: string (required, indexed) - Blog post identifier
- `userId`: ObjectId (required, indexed) - User who liked
- `type`: enum ['like', 'love', 'laugh'] (default: 'like') - Reaction type
- `createdAt`: Date (default: now)

**Validation Rules**:
- Compound unique index on (postSlug, userId) - one reaction per user per post
- `userId` must exist
- `postSlug` must correspond to published post

**Relationships**:
- Many-to-one with User
- Many-to-one with BlogPost (via postSlug)

---

### LottieAsset
**Purpose**: Manage Lottie animation files and metadata

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `filename`: string (required, unique) - Lottie file name
- `originalName`: string (required) - Original uploaded filename
- `url`: string (required) - CDN/storage URL
- `size`: number (required) - File size in bytes
- `dimensions`: object - Animation dimensions
  - `width`: number
  - `height`: number
- `metadata`: object - Lottie-specific metadata
  - `duration`: number? - Animation duration
  - `frameRate`: number? - Frames per second
  - `frames`: number? - Total frame count
- `uploadedBy`: ObjectId (required) - User who uploaded
- `tags`: string[] - Searchable tags
- `usageCount`: number (default: 0) - Usage tracking
- `createdAt`: Date (default: now)

**Validation Rules**:
- `filename` must be unique and URL-safe
- `size` must be positive number
- `url` must be valid URL
- File must be valid Lottie JSON format

**Relationships**:
- Many-to-one with User (uploader)

---

### SiteSetting
**Purpose**: Global site configuration and preferences

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `key`: string (required, unique) - Setting identifier
- `value`: mixed (required) - Setting value (string, number, object, etc.)
- `type`: enum ['string', 'number', 'boolean', 'object', 'array'] - Value type
- `category`: string (required) - Setting grouping
- `description`: string? - Human-readable description
- `isPublic`: boolean (default: false) - Whether exposed to frontend
- `updatedBy`: ObjectId? - Last user to update
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `key` must be unique and kebab-case
- `value` must match specified type
- `category` must be non-empty

**Relationships**:
- Many-to-one with User (updater)

---

## Data Relationships Diagram

```
User
├── Comments (1:many)
├── Likes (1:many)
├── BlogPosts as author (1:many)
├── LottieAssets as uploader (1:many)
└── SiteSettings as updater (1:many)

BlogPost
├── Comments (1:many)
├── Likes (1:many)
├── User as author (many:1)
└── BlogPost as translations (many:many via translationKey)

Comment
├── User as author (many:1)
├── BlogPost via postSlug (many:1)
└── Comment as parent (1:many, self-referencing)

Like
├── User (many:1)
└── BlogPost via postSlug (many:1)

LottieAsset
└── User as uploader (many:1)

SiteSetting
└── User as updater (many:1)

Project
└── (standalone, no relationships)
```

---

## Indexes Strategy

### Performance Indexes
- `User.clerkId` - unique index for auth lookups
- `User.email` - index for user searches
- `BlogPost.slug` - unique index for URL routing
- `BlogPost.publishedAt` - index for chronological queries
- `Comment.postSlug` - index for post comment retrieval
- `Comment.userId` - index for user comment history
- `Like.postSlug + Like.userId` - compound unique index
- `LottieAsset.filename` - unique index for file lookups

### Text Search Indexes
- `BlogPost.title, BlogPost.summary` - full-text search
- `Project.title, Project.description` - portfolio search
- `Comment.content` - comment search (optional)

---

## State Transitions

### BlogPost Status Flow
```
draft → published → archived
  ↓         ↓
published ← draft (unpublish)
```

### Comment Moderation Flow  
```
pending → published
   ↓         ↓
  spam ← published (mark as spam)
   ↓         ↓ 
deleted ← published (delete)
```

### Project Status Flow
```
draft → published → archived
  ↓         ↓
published ← draft (unpublish)
```

---

## Data Validation Rules

### Content Sanitization
- All user-generated HTML content must be sanitized
- Markdown content processed through secure parser
- File uploads validated for type and size

### Rate Limiting
- Comments: 10 per user per hour
- Likes: 100 per user per hour  
- File uploads: 5 per user per day

### Data Retention
- Deleted comments: soft delete, purge after 30 days
- User accounts: retain 90 days after deletion request
- Analytics data: aggregate after 12 months