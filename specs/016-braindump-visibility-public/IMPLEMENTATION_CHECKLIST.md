# Implementation Checklist - Braindump Visibility

**Branch**: `016-braindump-visibility-public`  
**Status**: Ready to implement  
**Print this checklist and check off items as you complete them!**

---

## 📋 PHASE 1: CORE VISIBILITY SYSTEM (16-22 hours)

### Week 1: Database & Backend

#### Database Migration
- [ ] Create migration script `scripts/migrate-braindump-visibility.ts`
- [ ] Add `visibility` field (enum: private/unlisted/public, default: private)
- [ ] Add `slug` field (string, unique, sparse index)
- [ ] Add `publicMetadata` object (viewCount, lastViewedAt, shareCount)
- [ ] Create index: `{ visibility: 1, createdAt: -1 }`
- [ ] Create index: `{ userId: 1, visibility: 1 }`
- [ ] Create index: `{ slug: 1 }` (unique, sparse)
- [ ] Add `generateSlug()` method to schema
- [ ] Add `canView(userId, userRole)` method to schema
- [ ] Add `toPublicJSON()` method to schema
- [ ] Test migration on local database
- [ ] Test rollback procedure
- [ ] Run migration on staging
- [ ] Verify all existing braindumps set to 'private'

#### Public API Endpoints
- [ ] Create `src/app/api/braindump/[id]/route.ts`
- [ ] Implement GET handler (find by ID or slug)
- [ ] Check visibility (return 404 if private)
- [ ] Increment view count
- [ ] Populate author (name, image)
- [ ] Fetch linked public braindumps
- [ ] Return sanitized public JSON
- [ ] Add rate limiting (100 req/min per IP)
- [ ] Test with private braindump (should 404)
- [ ] Test with unlisted braindump (should return)
- [ ] Test with public braindump (should return)
- [ ] Test slug lookup
- [ ] Test ID lookup

#### Public Listing API
- [ ] Create `src/app/api/braindump/route.ts`
- [ ] Implement GET handler (list public braindumps)
- [ ] Add pagination (page, limit params)
- [ ] Add tag filtering (tag param)
- [ ] Sort by createdAt descending
- [ ] Return preview (first 200 chars)
- [ ] Test pagination
- [ ] Test tag filtering

#### Admin API Updates
- [ ] Update POST `/api/admin/braindump` (add visibility field)
- [ ] Update PUT `/api/admin/braindump/[id]` (allow visibility changes)
- [ ] Auto-generate slug when visibility != 'private'
- [ ] Update GET `/api/admin/braindump` (add viewAll param)
- [ ] Add admin role check for viewAll
- [ ] Test creating private braindump (no slug)
- [ ] Test creating public braindump (generates slug)
- [ ] Test changing visibility (generates slug if needed)
- [ ] Test admin viewAll mode
- [ ] Test editor cannot viewAll

### Week 2: Frontend & Testing

#### Public Page
- [ ] Create `src/app/braindump/[id]/page.tsx`
- [ ] Implement `generateMetadata()` for SEO
- [ ] Add Open Graph tags (title, description, image, type)
- [ ] Add Twitter Card tags
- [ ] Add robots meta (noindex for unlisted, index for public)
- [ ] Implement `fetchBraindump()` with ISR (revalidate: 3600)
- [ ] Implement `generateStaticParams()` (top 100 public)
- [ ] Test SEO in Google Search Console
- [ ] Test social share previews (Twitter, LinkedIn)

#### Public View Component
- [ ] Create `src/components/braindump/BraindumpPublicView.tsx`
- [ ] Display author (Avatar with name)
- [ ] Display creation date (relative time)
- [ ] Display tags with icons
- [ ] Display view count
- [ ] Implement wiki-link parser (filter by visibility)
- [ ] Add share buttons (Twitter, LinkedIn, Copy Link)
- [ ] Add "Copied!" feedback for Copy Link
- [ ] Display related public braindumps
- [ ] Make fully responsive (mobile-first)
- [ ] Test on mobile devices
- [ ] Test on tablets
- [ ] Test on desktop
- [ ] Test dark mode
- [ ] Run accessibility audit (WCAG 2.1 AA)

#### Admin UI Enhancements
- [ ] Update `src/components/braindump/QuickCaptureCard.tsx`
- [ ] Add visibility selector (Select component)
- [ ] Add descriptions for each visibility level
- [ ] Default to 'private'
- [ ] Update submit handler to include visibility
- [ ] Test creating braindumps with each visibility level

- [ ] Update `src/components/braindump/BraindumpCard.tsx`
- [ ] Add `getVisibilityBadge()` helper function
- [ ] Display visibility badge (🔒 Private, 🔗 Unlisted, 🌍 Public)
- [ ] Add "Copy Public Link" button (if not private)
- [ ] Implement copy to clipboard
- [ ] Test badge display for each visibility
- [ ] Test copy link functionality

- [ ] Update admin braindump page
- [ ] Add "View All" toggle (Switch component)
- [ ] Only show toggle if user is admin
- [ ] Update fetch to include `viewAll` param
- [ ] Test admin can view all braindumps
- [ ] Test editor cannot view all

#### Security & Testing
- [ ] Install DOMPurify (`npm install isomorphic-dompurify`)
- [ ] Create `src/lib/security/sanitize.ts`
- [ ] Implement HTML sanitization
- [ ] Sanitize content before public display
- [ ] Create `src/lib/security/rate-limit.ts`
- [ ] Implement rate limiting with Redis or in-memory
- [ ] Add rate limiting to public endpoints
- [ ] Test XSS prevention (inject script tags)
- [ ] Test rate limiting (exceed 100 req/min)
- [ ] Test privacy (404 for private braindumps)
- [ ] Run full security audit
- [ ] Fix any vulnerabilities

#### End-to-End Testing
- [ ] Test Scenario 1: Creating private braindump
- [ ] Test Scenario 2: Creating unlisted braindump
- [ ] Test Scenario 3: Creating public braindump
- [ ] Test Scenario 4: Viewing public braindump
- [ ] Test Scenario 5: Admin viewing all braindumps
- [ ] Test Scenario 6: Changing visibility
- [ ] Test Scenario 7: Internal linking in public view
- [ ] Run performance tests (< 2s page load)
- [ ] Run API performance tests (< 500ms response)

#### Documentation
- [ ] Create user guide for visibility controls
- [ ] Create admin guide for moderation
- [ ] Update API documentation
- [ ] Create troubleshooting guide
- [ ] Document migration process

#### Deployment
- [ ] Deploy to staging
- [ ] Test all scenarios on staging
- [ ] Run security scan on staging
- [ ] Deploy to production
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Announce Phase 1 to users

---

## 📋 PHASE 2: DISCOVERY & ENGAGEMENT (12-16 hours)

### Week 3: Search & Listing

#### Full-Text Search
- [ ] Set up MongoDB Atlas Search (or Algolia)
- [ ] Create search index on `content` and `tags`
- [ ] Create `src/lib/braindump/search.ts`
- [ ] Implement search query builder
- [ ] Add ranking algorithm (relevance score)
- [ ] Create search API endpoint
- [ ] Add search UI component
- [ ] Add autocomplete/suggestions
- [ ] Test search accuracy
- [ ] Test search performance (< 1s)
- [ ] Optimize slow queries

#### Public Listing Page
- [ ] Create `src/app/braindumps/page.tsx`
- [ ] Implement pagination (20 items per page)
- [ ] Add tag filter dropdown
- [ ] Add sort options (newest, most viewed, most shared)
- [ ] Add search bar
- [ ] Display preview cards
- [ ] Show author, tags, view count on cards
- [ ] Make responsive
- [ ] Test pagination
- [ ] Test filtering
- [ ] Test sorting
- [ ] Test mobile layout

#### Share Tracking
- [ ] Update share buttons to track clicks
- [ ] Add share count to publicMetadata
- [ ] Track by platform (Twitter, LinkedIn, Copy)
- [ ] Display share counts on cards
- [ ] Test share tracking

### Week 4: RSS & Recommendations

#### RSS Feed
- [ ] Create `src/app/braindump/feed.xml/route.ts`
- [ ] Generate RSS 2.0 format
- [ ] Include latest 50 public braindumps
- [ ] Add title, description, link, pubDate
- [ ] Add author information
- [ ] Test in RSS readers (Feedly, Inoreader)
- [ ] Validate RSS format
- [ ] Test auto-update

#### Recommendations
- [ ] Create `src/lib/braindump/recommendations.ts`
- [ ] Implement tag-based similarity
- [ ] Implement link-based similarity
- [ ] Create "Related Braindumps" component
- [ ] Display on public braindump pages
- [ ] Test recommendation accuracy
- [ ] Get user feedback on relevance

#### Testing & Deployment
- [ ] Test Scenario 8: Discovering public braindumps
- [ ] Test Scenario 9: Subscribing via RSS
- [ ] Performance test search
- [ ] Performance test listing page
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Monitor usage metrics
- [ ] Announce Phase 2

---

## 📋 PHASE 3: SOCIAL & COLLABORATION (18-24 hours)

### Week 5: Comments System

#### Comments Schema & API
- [ ] Create `src/models/Comment.ts`
- [ ] Add fields (content, author, braindump, parent, status)
- [ ] Add indexes (braindump, author, parent)
- [ ] Create `src/app/api/braindump/[id]/comments/route.ts`
- [ ] Implement POST (create comment)
- [ ] Implement GET (fetch comments with threading)
- [ ] Create PUT endpoint (edit comment)
- [ ] Create DELETE endpoint (delete comment)
- [ ] Add rate limiting (10 comments/hour)
- [ ] Test comment creation
- [ ] Test threaded replies
- [ ] Test rate limiting

#### Comments UI
- [ ] Create `src/components/braindump/CommentThread.tsx`
- [ ] Display comments with nesting (1 level)
- [ ] Add "Reply" button
- [ ] Add "Edit" button (for author)
- [ ] Add "Delete" button (for author/admin/owner)
- [ ] Add comment count badge
- [ ] Add loading states
- [ ] Test comment submission
- [ ] Test reply functionality
- [ ] Test edit functionality
- [ ] Test delete functionality

#### Comment Moderation
- [ ] Add moderation UI for admins
- [ ] Add "Hide Comment" button
- [ ] Add "Unhide Comment" button
- [ ] Add moderation log
- [ ] Test admin moderation
- [ ] Test owner moderation

### Week 6: Reactions & Sharing

#### Reactions System
- [ ] Create `src/models/Reaction.ts`
- [ ] Add fields (emoji, user, braindump)
- [ ] Add unique constraint (emoji + user + braindump)
- [ ] Create reaction API endpoints
- [ ] Implement POST (toggle reaction)
- [ ] Implement GET (fetch reaction counts)
- [ ] Create `src/components/braindump/ReactionBar.tsx`
- [ ] Display 5 emoji buttons (👍 ❤️ 🎯 💡 🔥)
- [ ] Show counts per emoji
- [ ] Highlight user's reactions
- [ ] Add real-time updates
- [ ] Test reaction toggling
- [ ] Test uniqueness constraint
- [ ] Test real-time updates

#### Sharing System
- [ ] Create `src/models/SharePermission.ts`
- [ ] Add fields (braindump, user, permission, grantedBy)
- [ ] Add permission levels (view, comment, edit)
- [ ] Create share API endpoints
- [ ] Implement POST (grant access)
- [ ] Implement DELETE (revoke access)
- [ ] Create `src/components/braindump/ShareDialog.tsx`
- [ ] Add email/username input
- [ ] Add permission level selector
- [ ] Show list of current access
- [ ] Add "Revoke" button
- [ ] Test granting access
- [ ] Test revoking access
- [ ] Test permission levels

### Week 7: Collaborative Editing

#### Edit History
- [ ] Update Braindump schema (add editHistory array)
- [ ] Track version, user, timestamp, changes
- [ ] Create edit history viewer component
- [ ] Display "Last edited by [User] [Time]"
- [ ] Test edit history tracking
- [ ] Test viewing history

#### Permission Checks
- [ ] Create `src/lib/auth/permissions.ts`
- [ ] Implement permission checking functions
- [ ] Add permission checks to edit endpoints
- [ ] Test view-only permission
- [ ] Test comment permission
- [ ] Test edit permission

#### Email Notifications
- [ ] Set up SendGrid or AWS SES
- [ ] Create email templates
- [ ] Create notification service
- [ ] Send email on new comment
- [ ] Send email on share invitation
- [ ] Test email delivery
- [ ] Test email formatting

#### Testing & Deployment
- [ ] Test Scenario 10: Commenting on braindump
- [ ] Test Scenario 11: Reacting to braindump
- [ ] Test Scenario 12: Sharing with specific users
- [ ] Test Scenario 13: Collaborative editing
- [ ] Test concurrent editing
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Announce Phase 3

---

## 📋 PHASE 4: ANALYTICS & NOTIFICATIONS (14-18 hours)

### Week 8: Analytics Backend

#### Analytics Schema
- [ ] Create `src/models/AnalyticsEvent.ts`
- [ ] Add fields (type, braindump, user, timestamp, metadata)
- [ ] Add indexes (braindump, user, timestamp)
- [ ] Create event tracking API
- [ ] Track view events
- [ ] Track share events
- [ ] Track comment events
- [ ] Track reaction events

#### Analytics Aggregation
- [ ] Create background job for aggregation
- [ ] Aggregate by day, week, month
- [ ] Calculate engagement scores
- [ ] Store aggregated data
- [ ] Test aggregation accuracy

### Week 9: Analytics Dashboard & Notifications

#### Analytics Dashboard
- [ ] Create `src/app/admin/analytics/page.tsx`
- [ ] Display overview metrics (total views, shares, comments)
- [ ] Add view trends chart (time series)
- [ ] Add traffic sources breakdown (pie chart)
- [ ] Add geographic distribution (country map or list)
- [ ] Add engagement metrics
- [ ] Add top-performing braindumps table
- [ ] Create export functionality (CSV, PDF)
- [ ] Test dashboard with real data
- [ ] Test export functionality

#### Notification System
- [ ] Create `src/models/Notification.ts`
- [ ] Add fields (recipient, type, title, message, read)
- [ ] Create notification API endpoints
- [ ] Implement notification creation
- [ ] Implement fetch unread notifications
- [ ] Implement mark as read
- [ ] Create notification UI component
- [ ] Add notification bell icon
- [ ] Add notification badge (unread count)
- [ ] Add notification dropdown
- [ ] Test notification creation
- [ ] Test marking as read

#### Notification Preferences
- [ ] Create preferences schema
- [ ] Create preferences UI
- [ ] Allow enabling/disabling per event type
- [ ] Allow choosing email vs in-app
- [ ] Test preference changes

### Week 10: Trending & Recommendations

#### Trending Algorithm
- [ ] Create trending score calculation
- [ ] Weight recent views, comments, shares
- [ ] Create background job (runs every 15 min)
- [ ] Cache scores in Redis
- [ ] Create "Trending Now" component
- [ ] Display on listing page
- [ ] Test trending accuracy
- [ ] Get user feedback

#### Recommendations Engine
- [ ] Track user viewing history
- [ ] Create recommendation algorithm
- [ ] Use tag similarity
- [ ] Use collaborative filtering
- [ ] Create "You might also like" component
- [ ] Display on braindump pages
- [ ] Test recommendation relevance
- [ ] Get user feedback

#### Weekly Digest
- [ ] Create digest email template
- [ ] Create digest generator (cron job)
- [ ] Include engagement summary
- [ ] Include top braindumps
- [ ] Send every Monday morning
- [ ] Test digest generation
- [ ] Test email delivery

#### Testing & Deployment
- [ ] Test Scenario 14: Viewing analytics
- [ ] Test Scenario 15: Receiving notifications
- [ ] Test Scenario 16: Discovering trending braindumps
- [ ] Performance test dashboard (< 3s load)
- [ ] Test notification delivery (< 5 min)
- [ ] Deploy to staging
- [ ] Deploy to production
- [ ] Announce Phase 4

---

## ✅ FINAL CHECKLIST

### Pre-Launch
- [ ] All 78 functional requirements verified
- [ ] All 9 non-functional requirements verified
- [ ] All 16 user scenarios tested
- [ ] All edge cases tested
- [ ] Security audit passed
- [ ] Performance targets met
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing done
- [ ] Documentation complete
- [ ] User guides written
- [ ] Admin training completed

### Post-Launch
- [ ] Monitor error logs
- [ ] Monitor performance metrics
- [ ] Monitor user feedback
- [ ] Set up analytics dashboards
- [ ] Set up alerting for critical issues
- [ ] Plan first iteration based on feedback

### Success Validation
- [ ] Public page load time < 2s ✓
- [ ] API response time < 500ms ✓
- [ ] Search results < 1s ✓
- [ ] Dashboard load < 3s ✓
- [ ] Zero security vulnerabilities ✓
- [ ] 100% backward compatible ✓
- [ ] All existing braindumps private ✓
- [ ] Comments working ✓
- [ ] Reactions working ✓
- [ ] Sharing working ✓
- [ ] Analytics accurate ✓
- [ ] Notifications delivered ✓
- [ ] Trending algorithm live ✓
- [ ] Recommendations relevant ✓

---

## 🎉 CONGRATULATIONS!

When all items are checked:
✅ You've built a comprehensive knowledge sharing platform!
✅ Users can share braindumps publicly with full control
✅ Community can engage through comments and reactions
✅ Teams can collaborate on braindumps
✅ Analytics provide valuable insights
✅ Notifications keep users engaged

**TIME TO CELEBRATE!** 🚀🎊
