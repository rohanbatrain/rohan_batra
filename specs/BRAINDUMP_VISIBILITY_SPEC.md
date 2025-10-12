# Braindump Visibility & Public Rendering Specification

**Version:** 1.0  
**Date:** October 8, 2025  
**Status:** Design Phase  
**Estimated Implementation Time:** 16-22 hours

---

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Requirements](#requirements)
4. [Database Schema Changes](#database-schema-changes)
5. [API Design](#api-design)
6. [Public Rendering System](#public-rendering-system)
7. [Role-Based Access Control](#role-based-access-control)
8. [Admin UI Enhancements](#admin-ui-enhancements)
9. [Security Considerations](#security-considerations)
10. [Migration Plan](#migration-plan)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Current State
The braindump feature is **fully private and user-scoped**:
- Location: `/admin/braindump` (admin panel only)
- Access: Users see ONLY their own braindumps
- No visibility controls (no public/private flags)
- No role-based permissions beyond basic editor/admin access
- All API routes require authentication

### Proposed Enhancement
Add **three-tier visibility system** with role-based access:
1. **Private** (default): Only owner sees it (current behavior)
2. **Unlisted**: Anyone with direct link can view
3. **Public**: Discoverable and viewable by anyone

### Key Features
- ✅ Public rendering pages (`/braindump/[id]`)
- ✅ Public API endpoints (no auth for public braindumps)
- ✅ Role-based admin features (admin sees all, moderates all)
- ✅ Read-only public view (sanitized, attributed)
- ✅ Backward compatible (existing braindumps stay private)
- ✅ SEO-friendly public pages
- ✅ Internal linking works in public view

---

## Current State Analysis

### Data Model (Existing)
```typescript
// src/models/Braindump.ts
interface IBraindump {
  userId: ObjectId;              // ✅ Owner reference
  content: string;               // ✅ Main content
  tags: string[];                // ✅ Tags
  category?: string;             // ✅ Category
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'captured' | 'processed' | 'archived';
  linkedTo: ObjectId[];          // ✅ Internal wiki links
  linkedFrom: ObjectId[];        // ✅ Backlinks
  associations: Array<{...}>;    // ✅ Content associations
  // ❌ NO visibility field
  // ❌ NO isPublic field
  // ❌ NO slug field
  // ❌ NO sharedWith field
}
```

### Access Control (Existing)
```typescript
// All queries are user-scoped
const query = { userId }; // Users see only their own

// Middleware protects admin routes
isAdminRoute('/admin/braindump') // Requires editor/admin role

// No public access
// No role-based viewing (admin can't see all)
// No sharing mechanism
```

### Routes (Existing)
- ✅ `/admin/braindump` - Admin UI (editor/admin only)
- ✅ `/api/admin/braindump` - CRUD APIs (user-scoped)
- ❌ `/braindump/[id]` - Public page (DOESN'T EXIST)
- ❌ `/api/braindump/[id]` - Public API (DOESN'T EXIST)

### Components (Existing)
- ✅ `QuickCaptureCard` - Capture form
- ✅ `BraindumpCard` - Admin card view with actions
- ✅ `BraindumpBacklinks` - Backlink display
- ✅ `LinkAutocomplete` - Wiki-style link input
- ❌ `BraindumpPublicView` - Public read-only view (DOESN'T EXIST)

---

## Requirements

### Functional Requirements

#### FR1: Visibility Levels
1. **Private** (default)
   - Only owner can view
   - Not accessible via public routes
   - Current behavior preserved
   
2. **Unlisted**
   - Anyone with direct link can view
   - Not shown in public listings
   - SEO: `noindex, nofollow`
   
3. **Public**
   - Anyone can view
   - Shown in public listings (future)
   - SEO: Full indexing
   - RSS feed eligible (future)

#### FR2: Public Rendering
1. Clean, read-only view at `/braindump/[id]`
2. No edit controls visible
3. Author attribution (name/avatar)
4. Related public braindumps (if linked)
5. Sanitized HTML output
6. Mobile-responsive
7. Share buttons (Twitter, LinkedIn, Copy Link)
8. Metadata for social cards (OG tags)

#### FR3: Role-Based Access
1. **Admin Role**
   - See all braindumps (private, unlisted, public)
   - Moderate any braindump (change visibility, edit, delete)
   - Access "View All Braindumps" toggle in admin UI
   
2. **Editor Role**
   - See own braindumps (all visibility levels)
   - See public braindumps from others
   - Cannot moderate others' braindumps
   
3. **User/Public**
   - See only public braindumps
   - No authentication required
   - Read-only access

#### FR4: Admin UI Enhancements
1. Visibility toggle in quick capture form
2. Visibility badge on braindump cards
3. Bulk visibility change
4. "View All" mode (admin only)
5. Moderation queue (admin only)
6. Visibility filter in search

#### FR5: Internal Linking in Public View
1. Wiki-style `[[links]]` work in public view
2. Only link to PUBLIC braindumps
3. Broken links (private targets) show as plain text
4. Backlinks show only public connections

### Non-Functional Requirements

#### NFR1: Performance
- Public page load < 2s
- API response < 500ms
- Cached public braindumps (CDN-ready)
- Incremental Static Regeneration (ISR)

#### NFR2: Security
- XSS protection (sanitize HTML)
- Rate limiting on public APIs
- No sensitive data in public view
- Privacy: Don't leak existence of private braindumps

#### NFR3: SEO
- Meta tags (title, description, OG)
- JSON-LD structured data
- Sitemap generation (public braindumps)
- Canonical URLs

#### NFR4: Backward Compatibility
- Existing braindumps default to 'private'
- Migration script (zero downtime)
- API versioning not required (additive changes)

---

## Database Schema Changes

### Updated Braindump Model

```typescript
// src/models/Braindump.ts

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IBraindump extends Document {
  // ... existing fields ...
  
  // NEW FIELDS
  visibility: 'private' | 'unlisted' | 'public';
  slug?: string;           // URL-friendly slug (optional, auto-generated)
  publicMetadata?: {
    viewCount?: number;    // Public view count
    lastViewedAt?: Date;   // Last public view
    shareCount?: number;   // Social share count
  };
  sharedWith?: Types.ObjectId[];  // Future: Share with specific users
}

const BraindumpSchema = new Schema<IBraindump>(
  {
    // ... existing fields ...
    
    visibility: {
      type: String,
      enum: ['private', 'unlisted', 'public'],
      default: 'private',
      required: true,
      index: true,  // Index for filtering public braindumps
    },
    
    slug: {
      type: String,
      unique: true,
      sparse: true,  // Allows nulls, only enforces uniqueness for non-null
      index: true,
      maxlength: 200,
      // Auto-generated from first 50 chars of content + timestamp
    },
    
    publicMetadata: {
      viewCount: { type: Number, default: 0 },
      lastViewedAt: { type: Date },
      shareCount: { type: Number, default: 0 },
    },
    
    sharedWith: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  {
    timestamps: true,
  }
);

// NEW INDEXES
BraindumpSchema.index({ visibility: 1, createdAt: -1 }); // Public listings
BraindumpSchema.index({ userId: 1, visibility: 1 });     // User's public items
BraindumpSchema.index({ slug: 1 }, { unique: true, sparse: true }); // Slug lookup

// EXISTING INDEXES (keep these)
BraindumpSchema.index({ userId: 1, status: 1, createdAt: -1 });
BraindumpSchema.index({ userId: 1, tags: 1 });
BraindumpSchema.index({ userId: 1, priority: 1, status: 1 });
BraindumpSchema.index({ tags: 1 });
BraindumpSchema.index({ linkedTo: 1 });
BraindumpSchema.index({ linkedFrom: 1 });

// METHODS

// Generate slug from content
BraindumpSchema.methods.generateSlug = function(): string {
  const timestamp = Date.now().toString(36);
  const contentSlug = this.content
    .slice(0, 50)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  return `${contentSlug}-${timestamp}`;
};

// Check if user can view this braindump
BraindumpSchema.methods.canView = function(userId?: string, userRole?: string): boolean {
  // Admin can see everything
  if (userRole === 'admin') return true;
  
  // Owner can always see their own
  if (userId && this.userId.toString() === userId) return true;
  
  // Public braindumps are viewable by anyone
  if (this.visibility === 'public') return true;
  
  // Unlisted are viewable by anyone with direct link (handled by route)
  if (this.visibility === 'unlisted') return true;
  
  // Private braindumps only for owner
  return false;
};

// Sanitize for public view
BraindumpSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    content: this.content,
    tags: this.tags,
    category: this.category,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    slug: this.slug,
    linkedTo: this.linkedTo,  // Will be filtered to public only in API
    viewCount: this.publicMetadata?.viewCount || 0,
    author: {
      // Populated from User model
    },
  };
};

export default mongoose.models.Braindump || mongoose.model<IBraindump>('Braindump', BraindumpSchema);
```

### Migration Script

```typescript
// scripts/migrate-braindump-visibility.ts

import dbConnect from '@/lib/db/mongodb';
import Braindump from '@/models/Braindump';

async function migrateBraindumpVisibility() {
  console.log('Starting braindump visibility migration...');
  
  await dbConnect();
  
  // Add visibility field to all existing braindumps
  const result = await Braindump.updateMany(
    { visibility: { $exists: false } },
    { 
      $set: { 
        visibility: 'private',
        publicMetadata: {
          viewCount: 0,
          shareCount: 0
        }
      } 
    }
  );
  
  console.log(`Migrated ${result.modifiedCount} braindumps to private visibility`);
  
  // Create indexes
  await Braindump.collection.createIndex({ visibility: 1, createdAt: -1 });
  await Braindump.collection.createIndex({ userId: 1, visibility: 1 });
  await Braindump.collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
  
  console.log('Indexes created successfully');
  
  process.exit(0);
}

migrateBraindumpVisibility().catch(console.error);
```

---

## API Design

### Public API Endpoints (NEW)

#### GET /api/braindump/[id]
**Purpose:** Get a single public braindump by ID or slug

```typescript
// src/app/api/braindump/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import Braindump from '@/models/Braindump';
import User from '@/models/User';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    
    const { id } = params;
    
    // Find by ID or slug
    const braindump = await Braindump.findOne({
      $or: [
        { _id: id },
        { slug: id }
      ]
    }).populate('userId', 'name email image');
    
    if (!braindump) {
      return NextResponse.json(
        { error: 'Braindump not found' },
        { status: 404 }
      );
    }
    
    // Check visibility (only public and unlisted are accessible)
    if (braindump.visibility === 'private') {
      return NextResponse.json(
        { error: 'Braindump not found' },
        { status: 404 }
      );
    }
    
    // Increment view count
    await Braindump.updateOne(
      { _id: braindump._id },
      { 
        $inc: { 'publicMetadata.viewCount': 1 },
        $set: { 'publicMetadata.lastViewedAt': new Date() }
      }
    );
    
    // Get linked braindumps (only public ones)
    const linkedBraindumps = await Braindump.find({
      _id: { $in: braindump.linkedTo },
      visibility: 'public'
    }).select('_id content slug tags createdAt');
    
    // Return sanitized public data
    const response = {
      ...braindump.toPublicJSON(),
      author: {
        name: braindump.userId.name,
        image: braindump.userId.image,
      },
      linkedBraindumps: linkedBraindumps.map(b => ({
        id: b._id,
        slug: b.slug,
        preview: b.content.slice(0, 100),
        tags: b.tags,
        createdAt: b.createdAt,
      })),
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('[API] Error fetching public braindump:', error);
    return NextResponse.json(
      { error: 'Failed to fetch braindump' },
      { status: 500 }
    );
  }
}
```

#### GET /api/braindump
**Purpose:** List public braindumps (for future public listing page)

```typescript
// src/app/api/braindump/route.ts

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const tag = searchParams.get('tag');
    
    const query: any = { visibility: 'public' };
    
    if (tag) {
      query.tags = tag;
    }
    
    const braindumps = await Braindump.find(query)
      .populate('userId', 'name image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    const total = await Braindump.countDocuments(query);
    
    return NextResponse.json({
      braindumps: braindumps.map(b => ({
        id: b._id,
        slug: b.slug,
        content: b.content.slice(0, 200), // Preview
        tags: b.tags,
        category: b.category,
        createdAt: b.createdAt,
        viewCount: b.publicMetadata?.viewCount || 0,
        author: {
          name: b.userId.name,
          image: b.userId.image,
        },
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch braindumps' },
      { status: 500 }
    );
  }
}
```

### Updated Admin API Endpoints

#### POST /api/admin/braindump (UPDATED)
**Changes:** Add `visibility` and `slug` fields

```typescript
// Add to request body schema
const createSchema = z.object({
  content: z.string().min(1).max(10000),
  visibility: z.enum(['private', 'unlisted', 'public']).default('private'),
  // ... other fields ...
});

// In create logic
const braindump = new Braindump({
  userId,
  content: data.content,
  visibility: data.visibility || 'private',
  // ... other fields ...
});

// Generate slug if public or unlisted
if (braindump.visibility !== 'private') {
  braindump.slug = braindump.generateSlug();
}

await braindump.save();
```

#### PUT /api/admin/braindump/[id] (UPDATED)
**Changes:** Allow visibility updates, regenerate slug if needed

```typescript
// Add to update schema
const updateSchema = z.object({
  visibility: z.enum(['private', 'unlisted', 'public']).optional(),
  // ... other fields ...
});

// In update logic
if (data.visibility) {
  braindump.visibility = data.visibility;
  
  // Generate slug if becoming public/unlisted and no slug exists
  if (data.visibility !== 'private' && !braindump.slug) {
    braindump.slug = braindump.generateSlug();
  }
}
```

#### GET /api/admin/braindump (UPDATED)
**Changes:** Add admin "view all" mode

```typescript
// Check if admin wants to see all braindumps
const viewAll = searchParams.get('viewAll') === 'true';
const userRole = await getUserRole(userId);

const query: any = {};

// Only admins can view all
if (viewAll && userRole === 'admin') {
  // No userId filter - see all braindumps
  console.log('[ADMIN] Viewing all braindumps');
} else {
  // Normal user-scoped query
  query.userId = userId;
}

// Add visibility filter if requested
const visibility = searchParams.get('visibility');
if (visibility) {
  query.visibility = visibility;
}
```

---

## Public Rendering System

### Public Page Component

```typescript
// src/app/braindump/[id]/page.tsx

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BraindumpPublicView from '@/components/braindump/BraindumpPublicView';

interface Props {
  params: { id: string };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const braindump = await fetchBraindump(params.id);
  
  if (!braindump || braindump.visibility === 'private') {
    return { title: 'Not Found' };
  }
  
  const preview = braindump.content.slice(0, 160);
  
  return {
    title: `${braindump.content.slice(0, 50)}... | Braindump`,
    description: preview,
    robots: braindump.visibility === 'unlisted' 
      ? 'noindex, nofollow' 
      : 'index, follow',
    openGraph: {
      title: braindump.content.slice(0, 100),
      description: preview,
      type: 'article',
      publishedTime: braindump.createdAt,
      authors: [braindump.author.name],
      tags: braindump.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: braindump.content.slice(0, 100),
      description: preview,
    },
  };
}

async function fetchBraindump(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/braindump/${id}`,
    { next: { revalidate: 3600 } } // ISR: Revalidate every hour
  );
  
  if (!res.ok) return null;
  return res.json();
}

export default async function BraindumpPublicPage({ params }: Props) {
  const braindump = await fetchBraindump(params.id);
  
  if (!braindump) {
    notFound();
  }
  
  return <BraindumpPublicView braindump={braindump} />;
}

// Generate static paths for popular public braindumps
export async function generateStaticParams() {
  // Fetch top 100 public braindumps for static generation
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/braindump?limit=100`
  );
  const { braindumps } = await res.json();
  
  return braindumps.map((b: any) => ({
    id: b.slug || b.id,
  }));
}
```

### Public View Component

```typescript
// src/components/braindump/BraindumpPublicView.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Share2, Eye, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { parseWikiLinks } from '@/lib/braindump/link-parser';

interface BraindumpPublicViewProps {
  braindump: any;
}

export default function BraindumpPublicView({ braindump }: BraindumpPublicViewProps) {
  const [copied, setCopied] = useState(false);
  
  const handleShare = async (platform: 'twitter' | 'linkedin' | 'copy') => {
    const url = window.location.href;
    const text = braindump.content.slice(0, 100);
    
    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'linkedin':
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          '_blank'
        );
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
  };
  
  // Parse wiki links and render
  const renderContent = () => {
    const { segments, links } = parseWikiLinks(braindump.content);
    
    return segments.map((segment, i) => {
      if (segment.type === 'text') {
        return <span key={i}>{segment.content}</span>;
      } else {
        // Check if linked braindump is in public linked list
        const linkedBraindump = braindump.linkedBraindumps?.find(
          (b: any) => b.id === segment.linkedId
        );
        
        if (linkedBraindump) {
          return (
            <Link
              key={i}
              href={`/braindump/${linkedBraindump.slug || linkedBraindump.id}`}
              className="text-primary hover:underline font-medium"
            >
              {segment.text}
            </Link>
          );
        } else {
          // Private or non-existent link - show as plain text
          return <span key={i} className="text-muted-foreground">{segment.text}</span>;
        }
      }
    });
  };
  
  return (
    <div className="container max-w-4xl py-8">
      <Card>
        <CardHeader>
          {/* Author */}
          <div className="flex items-center gap-3 mb-4">
            <Avatar>
              <AvatarImage src={braindump.author.image} />
              <AvatarFallback>{braindump.author.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{braindump.author.name}</p>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(braindump.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {/* Tags */}
          {braindump.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {braindump.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardHeader>
        
        <CardContent>
          {/* Content with wiki links */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <p className="whitespace-pre-wrap">{renderContent()}</p>
          </div>
          
          {/* View count */}
          <div className="flex items-center gap-2 mt-6 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            <span>{braindump.viewCount} views</span>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {/* Share buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('twitter')}
            >
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('linkedin')}
            >
              Share on LinkedIn
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleShare('copy')}
            >
              <Share2 className="h-4 w-4 mr-2" />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Related public braindumps */}
      {braindump.linkedBraindumps?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Related Braindumps</h2>
          <div className="grid gap-4">
            {braindump.linkedBraindumps.map((linked: any) => (
              <Link
                key={linked.id}
                href={`/braindump/${linked.slug || linked.id}`}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <p className="line-clamp-2">{linked.preview}</p>
                    <div className="flex gap-2 mt-2">
                      {linked.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## Role-Based Access Control

### User Role System

```typescript
// src/lib/auth/roles.ts

export type UserRole = 'user' | 'editor' | 'admin';

export interface BraindumpPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canChangeVisibility: boolean;
  canViewAll: boolean;
}

export function getBraindumpPermissions(
  braindump: any,
  userId?: string,
  userRole?: UserRole
): BraindumpPermissions {
  const isOwner = userId && braindump.userId.toString() === userId;
  const isAdmin = userRole === 'admin';
  const isPublic = braindump.visibility === 'public';
  const isUnlisted = braindump.visibility === 'unlisted';
  
  return {
    // View permissions
    canView: isAdmin || isOwner || isPublic || isUnlisted,
    
    // Edit permissions (owner or admin)
    canEdit: isAdmin || isOwner,
    
    // Delete permissions (owner or admin)
    canDelete: isAdmin || isOwner,
    
    // Change visibility (owner or admin)
    canChangeVisibility: isAdmin || isOwner,
    
    // View all braindumps (admin only)
    canViewAll: isAdmin,
  };
}
```

---

## Admin UI Enhancements

### Visibility Toggle in Quick Capture

```typescript
// Update QuickCaptureCard component

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function QuickCaptureCard() {
  const [visibility, setVisibility] = useState<'private' | 'unlisted' | 'public'>('private');
  
  return (
    <Card>
      <CardContent>
        {/* ... existing content field ... */}
        
        {/* Visibility selector */}
        <div className="space-y-2">
          <Label>Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">
                🔒 Private (Only you)
              </SelectItem>
              <SelectItem value="unlisted">
                🔗 Unlisted (Anyone with link)
              </SelectItem>
              <SelectItem value="public">
                🌍 Public (Everyone)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {visibility === 'private' && 'Only visible to you'}
            {visibility === 'unlisted' && 'Anyone with the link can view'}
            {visibility === 'public' && 'Visible to everyone, indexed by search engines'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Visibility Badge on Cards

```typescript
// Update BraindumpCard component

function getVisibilityBadge(visibility: string) {
  const variants = {
    private: { icon: '🔒', label: 'Private', variant: 'secondary' },
    unlisted: { icon: '🔗', label: 'Unlisted', variant: 'outline' },
    public: { icon: '🌍', label: 'Public', variant: 'default' },
  };
  
  const config = variants[visibility as keyof typeof variants];
  
  return (
    <Badge variant={config.variant as any}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </Badge>
  );
}

export default function BraindumpCard({ braindump }: Props) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex gap-2">
            {getVisibilityBadge(braindump.visibility)}
            {/* ... other badges ... */}
          </div>
        </div>
      </CardHeader>
      
      {/* ... rest of card ... */}
      
      {braindump.visibility !== 'private' && (
        <CardFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const url = `${window.location.origin}/braindump/${braindump.slug || braindump._id}`;
              navigator.clipboard.writeText(url);
            }}
          >
            <Share2 className="h-4 w-4 mr-2" />
            Copy Public Link
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
```

### Admin "View All" Toggle

```typescript
// Update admin braindump page

'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function BraindumpPage() {
  const [viewAll, setViewAll] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  return (
    <div>
      {/* Admin controls */}
      {isAdmin && (
        <div className="flex items-center gap-2 mb-4">
          <Switch
            checked={viewAll}
            onCheckedChange={setViewAll}
            id="view-all"
          />
          <Label htmlFor="view-all">
            View All Braindumps (Admin Mode)
          </Label>
        </div>
      )}
      
      {/* Fetch with viewAll parameter */}
      {/* ... rest of component ... */}
    </div>
  );
}
```

---

## Security Considerations

### 1. HTML Sanitization
```typescript
// Use DOMPurify or similar
import DOMPurify from 'isomorphic-dompurify';

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}
```

### 2. Rate Limiting
```typescript
// Implement rate limiting on public endpoints
import { rateLimit } from '@/lib/rate-limit';

export async function GET(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  try {
    await rateLimit.check(ip, 100, '60 s'); // 100 requests per minute
  } catch {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  }
  
  // ... continue ...
}
```

### 3. Privacy Protection
- Never leak existence of private braindumps
- Return 404 (not 403) for private items
- Don't show private braindumps in search results
- Sanitize error messages

### 4. SEO Controls
```typescript
// robots meta tag based on visibility
<meta 
  name="robots" 
  content={visibility === 'unlisted' ? 'noindex,nofollow' : 'index,follow'} 
/>
```

---

## Migration Plan

### Phase 1: Database Migration (1 hour)
1. Run migration script to add `visibility` field
2. Set all existing braindumps to 'private'
3. Create new indexes
4. Test rollback procedure

### Phase 2: API Updates (3-4 hours)
1. Update admin APIs to accept `visibility`
2. Add slug generation logic
3. Create public API endpoints
4. Add rate limiting
5. Test all endpoints

### Phase 3: Public Rendering (4-6 hours)
1. Create public page route
2. Build `BraindumpPublicView` component
3. Add SEO metadata
4. Implement ISR
5. Test social sharing

### Phase 4: Admin UI (3-4 hours)
1. Add visibility toggle to quick capture
2. Update braindump cards with badges
3. Add "View All" toggle for admins
4. Add copy public link button
5. Update edit dialog

### Phase 5: Testing & Polish (2-3 hours)
1. End-to-end testing
2. Security audit
3. Performance testing
4. Documentation updates

**Total: 16-22 hours**

---

## Implementation Roadmap

### Day 1: Database & Backend (8 hours)
- ✅ Update Braindump model
- ✅ Run migration script
- ✅ Create public API endpoints
- ✅ Update admin API endpoints
- ✅ Add rate limiting
- ✅ Test all APIs

### Day 2: Public Frontend (8 hours)
- ✅ Create public page route
- ✅ Build BraindumpPublicView component
- ✅ Add SEO metadata
- ✅ Implement wiki link parsing for public view
- ✅ Add share buttons
- ✅ Test responsive design

### Day 3: Admin UI & Testing (6 hours)
- ✅ Update QuickCaptureCard
- ✅ Update BraindumpCard
- ✅ Add admin "View All" toggle
- ✅ Comprehensive testing
- ✅ Security audit
- ✅ Documentation

---

## Success Metrics

### Technical Metrics
- ✅ All existing braindumps migrated to 'private'
- ✅ Public page load time < 2s
- ✅ API response time < 500ms
- ✅ Zero security vulnerabilities
- ✅ 100% backward compatibility

### Feature Metrics
- ✅ Users can create public braindumps
- ✅ Public braindumps render correctly
- ✅ Wiki links work in public view
- ✅ Admins can view all braindumps
- ✅ Social sharing works

### User Experience Metrics
- ✅ Intuitive visibility controls
- ✅ Clear privacy indicators
- ✅ Fast public page loads
- ✅ Mobile-responsive design
- ✅ Accessible to screen readers

---

## Future Enhancements

### Phase 2 (Later)
1. **Public Braindump Listing Page**
   - `/braindumps` - Browse all public braindumps
   - Filtering by tags, date, author
   - Search functionality

2. **RSS Feed**
   - `/braindump/feed.xml`
   - Subscribe to public braindumps

3. **Social Sharing Analytics**
   - Track share counts
   - Monitor engagement

4. **Collaborative Sharing**
   - Share with specific users
   - Team braindumps
   - Collaborative editing

5. **Comments System**
   - Allow comments on public braindumps
   - Moderation tools

6. **Reactions**
   - Like/upvote public braindumps
   - Emoji reactions

---

## Conclusion

This specification provides a comprehensive plan for adding visibility controls and public rendering to the braindump feature. The three-tier system (private/unlisted/public) provides flexibility while maintaining backward compatibility. The role-based access control ensures admins can moderate content while preserving user privacy.

**Key Benefits:**
- ✅ Share knowledge publicly while keeping personal notes private
- ✅ SEO-friendly public pages for discoverability
- ✅ Admin moderation capabilities
- ✅ Zero impact on existing private braindumps
- ✅ 16-22 hour implementation timeline

**Next Steps:**
1. Review and approve specification
2. Set up development branch
3. Begin Phase 1 (Database Migration)
4. Daily standups during implementation
5. Final review and deployment
