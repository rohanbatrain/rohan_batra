# Phase 0: Research & Technical Decisions

**Feature**: Braindump Visibility & Public Rendering  
**Date**: October 9, 2025  
**Status**: Complete

---

## Research Areas

### 1. Visibility System Implementation

**Decision**: Use MongoDB enum field with sparse index for slug  
**Rationale**:
- MongoDB supports enum validation at schema level via Mongoose
- Sparse indexes allow unique slugs only for non-null values (public/unlisted)
- Three-tier system (private/unlisted/public) is simple and scalable
- Existing Braindump model easily extended with new fields

**Alternatives Considered**:
- **Separate PublicBraindump collection**: Rejected due to duplication and sync issues
- **PostgreSQL with separate tables**: Rejected as project uses MongoDB
- **Bitfield flags**: Rejected as less readable and harder to query

**Implementation Details**:
```typescript
visibility: {
  type: String,
  enum: ['private', 'unlisted', 'public'],
  default: 'private',
  index: true
}
slug: {
  type: String,
  unique: true,
  sparse: true  // Only enforces uniqueness for non-null
}
```

---

### 2. SEO Optimization Strategy

**Decision**: Use Next.js 15 App Router with Incremental Static Regeneration (ISR)  
**Rationale**:
- App Router supports generateMetadata for SEO (Open Graph, Twitter Cards)
- ISR allows static generation with periodic revalidation (1-hour)
- generateStaticParams for pre-rendering top 100 public braindumps
- Automatic sitemap generation via app/sitemap.ts

**Alternatives Considered**:
- **Client-side rendering only**: Rejected due to poor SEO
- **Full server-side rendering (SSR)**: Rejected due to unnecessary database load
- **Static Site Generation (SSG) only**: Rejected as content updates frequently

**Implementation Details**:
```typescript
// ISR with 1-hour revalidation
export async function generateMetadata({ params }): Promise<Metadata> {
  const braindump = await fetchBraindump(params.id);
  return {
    title: `${braindump.content.slice(0, 50)}... | Braindump`,
    openGraph: { /* OG tags */ },
    robots: braindump.visibility === 'unlisted' ? 'noindex, nofollow' : 'index, follow'
  };
}
```

---

### 3. Full-Text Search Implementation

**Decision**: Use MongoDB Atlas Search (if available) or fall back to regex with indexes  
**Rationale**:
- MongoDB Atlas Search provides full-text indexing with relevance scoring
- No additional infrastructure required (integrated with existing DB)
- Supports fuzzy matching, stemming, and phrase queries
- Fallback to $regex with compound indexes for non-Atlas deployments

**Alternatives Considered**:
- **Algolia**: Rejected due to cost and external dependency
- **Elasticsearch**: Rejected due to infrastructure complexity
- **PostgreSQL FTS**: Rejected as project uses MongoDB
- **In-memory search (MiniSearch)**: Rejected due to scale limitations

**Implementation Details**:
```typescript
// Atlas Search query
db.braindumps.aggregate([
  {
    $search: {
      index: 'braindump_search',
      text: {
        query: searchTerm,
        path: ['content', 'tags'],
        fuzzy: { maxEdits: 1 }
      }
    }
  },
  { $match: { visibility: 'public' } },
  { $limit: 20 }
]);
```

---

### 4. Rate Limiting Strategy

**Decision**: Use in-memory rate limiting with @upstash/ratelimit or custom Redis implementation  
**Rationale**:
- @upstash/ratelimit supports serverless (Next.js Edge Runtime)
- Redis provides distributed rate limiting across instances
- Sliding window algorithm for accurate rate limits
- Low latency (< 5ms overhead)

**Alternatives Considered**:
- **Vercel Edge Middleware rate limiting**: Rejected due to limited control
- **Database-based rate limiting**: Rejected due to high latency
- **NGINX rate limiting**: Rejected as Vercel deployment doesn't use NGINX
- **In-memory only**: Rejected for multi-instance deployments

**Implementation Details**:
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 req/min
  analytics: true
});
```

---

### 5. HTML Sanitization

**Decision**: Use isomorphic-dompurify for XSS prevention  
**Rationale**:
- Works in both browser and Node.js (isomorphic)
- Industry-standard library (1M+ weekly downloads)
- Configurable allow-lists for tags and attributes
- Handles edge cases (nested tags, encoded entities)

**Alternatives Considered**:
- **sanitize-html**: Rejected due to larger bundle size
- **xss**: Rejected due to less active maintenance
- **Custom regex sanitization**: Rejected due to security risks
- **React dangerouslySetInnerHTML with no sanitization**: Rejected (security risk)

**Implementation Details**:
```typescript
import DOMPurify from 'isomorphic-dompurify';

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}
```

---

### 6. Comments System Architecture

**Decision**: Separate Comment model with parent reference for threading (1 level)  
**Rationale**:
- Separate collection allows efficient querying and pagination
- Parent reference enables threaded replies (1 level deep)
- Easier to moderate (hide/delete) without affecting braindump
- Supports future features (reactions on comments, notifications)

**Alternatives Considered**:
- **Embedded comments in Braindump**: Rejected due to document size limits
- **Deep nesting (unlimited levels)**: Rejected due to complexity (1 level sufficient)
- **Separate threads table**: Rejected as overkill for current needs

**Implementation Details**:
```typescript
interface IComment {
  braindumpId: ObjectId;
  authorId: ObjectId;
  content: string;
  parentId?: ObjectId;  // For replies
  status: 'active' | 'hidden' | 'deleted';
  createdAt: Date;
  updatedAt: Date;
}
```

---

### 7. Emoji Reactions System

**Decision**: Separate Reaction model with compound unique index (user + braindump + emoji)  
**Rationale**:
- Prevents duplicate reactions from same user
- Efficient aggregation for count queries
- Supports multiple emoji types (5 emojis: 👍 ❤️ 🎯 💡 🔥)
- Easy to add/remove reactions without updating braindump document

**Alternatives Considered**:
- **Embedded reactions array in Braindump**: Rejected due to atomic update issues
- **Single reaction per user per braindump**: Rejected as users want multiple emoji types
- **Unlimited emoji types**: Rejected to keep UI simple and focused

**Implementation Details**:
```typescript
ReactionSchema.index({ userId: 1, braindumpId: 1, emoji: 1 }, { unique: true });

// Aggregate counts
db.reactions.aggregate([
  { $match: { braindumpId: id } },
  { $group: { _id: '$emoji', count: { $sum: 1 } } }
]);
```

---

### 8. Collaborative Editing & Permissions

**Decision**: SharePermission model with three permission levels (view, comment, edit)  
**Rationale**:
- Granular permissions allow flexible sharing
- Separate model enables easy revocation
- Edit history tracked in Braindump.editHistory array
- "Last save wins" conflict resolution (sufficient for MVP)

**Alternatives Considered**:
- **Real-time collaborative editing (OT/CRDT)**: Rejected as overly complex for MVP
- **Two permission levels only**: Rejected as "comment" permission is valuable
- **Team/group-based permissions**: Deferred to future phase

**Implementation Details**:
```typescript
interface ISharePermission {
  braindumpId: ObjectId;
  userId: ObjectId;
  permission: 'view' | 'comment' | 'edit';
  grantedBy: ObjectId;
  grantedAt: Date;
  revoked: boolean;
}

// Check permission
async function canEdit(braindumpId, userId): Promise<boolean> {
  const permission = await SharePermission.findOne({ 
    braindumpId, 
    userId, 
    revoked: false 
  });
  return permission?.permission === 'edit' || isOwner || isAdmin;
}
```

---

### 9. Analytics Event Tracking

**Decision**: Event-sourcing pattern with AnalyticsEvent model and background aggregation  
**Rationale**:
- Raw events stored for auditability and re-aggregation
- Background jobs aggregate to daily/weekly/monthly summaries
- Scales to millions of events without dashboard query slowdown
- Supports future analytics features (funnels, cohorts)

**Alternatives Considered**:
- **Real-time aggregation on dashboard load**: Rejected due to slow queries
- **Google Analytics only**: Rejected as we need custom metrics
- **Third-party analytics service**: Rejected due to cost and data ownership
- **No analytics**: Rejected as engagement metrics are core requirement

**Implementation Details**:
```typescript
interface IAnalyticsEvent {
  type: 'view' | 'share' | 'comment' | 'reaction';
  braindumpId: ObjectId;
  userId?: ObjectId;  // Optional for anonymous views
  metadata: {
    source?: string;  // 'twitter', 'linkedin', 'direct'
    device?: string;  // 'mobile', 'desktop'
    country?: string;
  };
  timestamp: Date;
}

// Background job (runs every 15 min)
async function aggregateEvents() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const aggregated = await AnalyticsEvent.aggregate([
    { $match: { timestamp: { $gte: today } } },
    { $group: { 
      _id: { braindumpId: '$braindumpId', type: '$type' },
      count: { $sum: 1 }
    }}
  ]);
  
  // Store in aggregated collection
  await DailyMetrics.insertMany(aggregated);
}
```

---

### 10. Notification System

**Decision**: Dual notification system (email via SendGrid + in-app via MongoDB)  
**Rationale**:
- Email notifications for async engagement (comments, shares)
- In-app notifications for real-time updates (low latency)
- User preferences control email frequency (immediate, digest, none)
- Notification history preserved for 30 days

**Alternatives Considered**:
- **Email only**: Rejected as users want in-app notifications
- **In-app only**: Rejected as users may miss important updates
- **Push notifications**: Deferred to mobile app phase
- **Third-party service (OneSignal)**: Rejected due to cost

**Implementation Details**:
```typescript
interface INotification {
  userId: ObjectId;
  type: 'comment' | 'share' | 'mention' | 'weekly_digest';
  title: string;
  message: string;
  relatedBraindumpId?: ObjectId;
  relatedCommentId?: ObjectId;
  read: boolean;
  createdAt: Date;
}

// Send notification
async function notifyUser(userId: ObjectId, notification: INotification) {
  // 1. Create in-app notification
  await Notification.create(notification);
  
  // 2. Check user preferences
  const prefs = await UserPreferences.findOne({ userId });
  
  // 3. Send email if enabled
  if (prefs.emailNotifications && prefs.types.includes(notification.type)) {
    await sendEmail({
      to: user.email,
      subject: notification.title,
      body: notification.message
    });
  }
}
```

---

### 11. Trending Algorithm

**Decision**: Time-decayed engagement score with Redis caching  
**Rationale**:
- Formula: `score = (views * 1 + comments * 5 + shares * 10) / (age_hours + 2)^1.5`
- Recent engagement weighted more heavily (time decay)
- Redis cache updated every 15 minutes (low latency)
- Top 10 trending shown on listing page

**Alternatives Considered**:
- **Simple view count**: Rejected as doesn't account for recency
- **Machine learning recommendation**: Deferred to future (overkill for MVP)
- **No trending section**: Rejected as discovery is key feature

**Implementation Details**:
```typescript
function calculateTrendingScore(braindump: Braindump): number {
  const ageHours = (Date.now() - braindump.createdAt.getTime()) / (1000 * 60 * 60);
  const engagement = (
    braindump.viewCount * 1 +
    braindump.commentCount * 5 +
    braindump.shareCount * 10
  );
  return engagement / Math.pow(ageHours + 2, 1.5);
}

// Background job updates Redis every 15 min
async function updateTrendingScores() {
  const publicBraindumps = await Braindump.find({ 
    visibility: 'public',
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
  });
  
  const scored = publicBraindumps
    .map(b => ({ id: b._id, score: calculateTrendingScore(b) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  
  await redis.set('trending:braindumps', JSON.stringify(scored), 'EX', 900); // 15 min TTL
}
```

---

### 12. RSS Feed Generation

**Decision**: Dynamic XML generation with 1-hour cache  
**Rationale**:
- RSS 2.0 format (widely supported)
- Latest 50 public braindumps included
- CDN caching reduces database load
- Content preview (first 200 chars) in description

**Alternatives Considered**:
- **Static RSS file**: Rejected as content updates frequently
- **Atom format**: Rejected as RSS 2.0 more widely supported
- **JSON Feed**: Deferred to future (RSS is standard for now)

**Implementation Details**:
```typescript
// src/app/braindump/feed.xml/route.ts
export async function GET() {
  const braindumps = await Braindump.find({ visibility: 'public' })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('userId', 'name');
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Public Braindumps</title>
    <link>${process.env.NEXT_PUBLIC_BASE_URL}/braindumps</link>
    <description>Latest public braindumps</description>
    ${braindumps.map(b => `
    <item>
      <title>${escapeXml(b.content.slice(0, 100))}</title>
      <link>${process.env.NEXT_PUBLIC_BASE_URL}/braindump/${b.slug}</link>
      <description>${escapeXml(b.content.slice(0, 200))}</description>
      <author>${escapeXml(b.userId.name)}</author>
      <pubDate>${b.createdAt.toUTCString()}</pubDate>
      <guid>${b._id}</guid>
    </item>`).join('')}
  </channel>
</rss>`;
  
  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
```

---

## Technology Choices Summary

| Component | Technology | Version | Rationale |
|-----------|-----------|---------|-----------|
| **Framework** | Next.js | 15.5.3 | App Router, ISR, API routes |
| **Language** | TypeScript | 5.x | Type safety, IDE support |
| **Database** | MongoDB | Atlas | Existing infrastructure |
| **ORM** | Mongoose | Latest | Schema validation, hooks |
| **Auth** | Clerk | 6.32 | Existing auth system |
| **UI Library** | Radix UI + shadcn/ui | Latest | Accessible components |
| **Styling** | Tailwind CSS | Latest | Utility-first CSS |
| **Validation** | Zod | Latest | Runtime type validation |
| **HTML Sanitization** | isomorphic-dompurify | Latest | XSS prevention |
| **Rate Limiting** | @upstash/ratelimit | Latest | Serverless-friendly |
| **Email** | SendGrid or AWS SES | N/A | Reliable delivery |
| **Testing** | Vitest | Latest | Fast, Vite-based |
| **Caching** | Redis (Upstash) | N/A | Trending scores, rate limits |

---

## Best Practices Applied

### Security
- ✅ HTML sanitization (XSS prevention)
- ✅ Rate limiting (DoS prevention)
- ✅ CSRF protection (Next.js built-in)
- ✅ Input validation (Zod schemas)
- ✅ Privacy protection (404 not 403 for private content)
- ✅ Audit logging (admin actions tracked)

### Performance
- ✅ ISR (1-hour revalidation)
- ✅ Redis caching (trending, rate limits)
- ✅ Database indexes (visibility, slug, compound indexes)
- ✅ Pagination (20 items per page)
- ✅ CDN headers (static assets)
- ✅ Background jobs (analytics aggregation)

### Accessibility
- ✅ WCAG 2.1 AA compliance
- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast ratios

### Testing
- ✅ Unit tests (models, utilities)
- ✅ Integration tests (API endpoints)
- ✅ E2E tests (user scenarios)
- ✅ Contract tests (API schemas)
- ✅ Performance tests (load time, API latency)

---

## Open Questions Resolved

1. **Q**: Should we use a separate database for analytics?  
   **A**: No, MongoDB aggregation pipeline is sufficient for MVP scale. Can migrate later if needed.

2. **Q**: How to handle concurrent edits in collaborative mode?  
   **A**: "Last save wins" for MVP. Real-time collaboration (OT/CRDT) deferred to future.

3. **Q**: Should we implement pagination for comments?  
   **A**: Yes, 20 comments per page. Load more button for additional pages.

4. **Q**: How to generate slugs that are both unique and SEO-friendly?  
   **A**: Content preview (first 50 chars, sanitized) + timestamp in base-36 for uniqueness.

5. **Q**: Should unlisted braindumps have slugs or just IDs?  
   **A**: Yes, both unlisted and public get slugs. Makes URLs friendlier even if not indexed.

6. **Q**: How to handle email delivery failures?  
   **A**: Retry 3 times with exponential backoff. Log failures for manual review.

7. **Q**: Should we support markdown in comments?  
   **A**: No for MVP. Plain text only with XSS sanitization. Markdown deferred to future.

8. **Q**: How to prevent spam comments?  
   **A**: Rate limiting (10/hour), moderation tools, future: honeypot fields, CAPTCHA.

---

## Dependencies to Install

```bash
# Production dependencies
npm install isomorphic-dompurify @upstash/ratelimit @upstash/redis

# Dev dependencies
npm install --save-dev @types/dompurify
```

---

## Migration Strategy

1. **Phase 0**: Add new fields to Braindump schema (default: private)
2. **Phase 1**: Deploy migration script (zero downtime)
3. **Phase 2**: Deploy new API endpoints (backward compatible)
4. **Phase 3**: Deploy public pages (no impact on existing features)
5. **Phase 4**: Deploy admin UI enhancements
6. **Phase 5**: Enable for all users with announcement

**Rollback Plan**: Feature flags allow disabling public rendering if issues arise. Private braindumps unaffected.

---

## Conclusion

All technical unknowns have been researched and resolved. The technology stack aligns with the existing Next.js/MongoDB infrastructure. Performance, security, and accessibility requirements are achievable with the chosen approaches. Ready to proceed to Phase 1 (Design & Contracts).

**Status**: ✅ Research Complete  
**Next Phase**: Phase 1 - Design & Contracts
