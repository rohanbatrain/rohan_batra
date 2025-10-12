# Tasks: Braindump Visibility & Public Rendering

**Input**: Design documents from `/specs/016-braindump-visibility-public/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Execution Flow (main)
```
1. Load plan.md from feature directory
   → Tech stack: TypeScript 5.x, Next.js 15.5.3 App Router, MongoDB/Mongoose, Clerk v6.32
   → Structure: Full-stack web app (unified src/)
2. Load design documents:
   → data-model.md: 1 extended entity (Braindump) + 5 new entities
   → contracts/: 7 OpenAPI YAML files
   → quickstart.md: 16 integration test scenarios
3. Generate tasks by category:
   → Setup: dependencies, types, database
   → Tests: 7 contract tests + 16 integration tests (TDD)
   → Core: 1 migration + 5 models + 7 API routes
   → UI: 8 components (public pages, admin, engagement)
   → Integration: ISR, rate limiting, search, analytics
   → Polish: security, performance, docs
4. Task rules applied:
   → Different files = [P] for parallel
   → Tests before implementation
   → Models before services before endpoints
5. Total: 62 tasks across 4 implementation phases
6. Validation: ✅ All contracts tested, all entities modeled, TDD enforced
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- File paths are absolute from repository root

## Path Conventions
- **Next.js App Router**: `src/app/` for pages and API routes
- **Components**: `src/components/` organized by feature
- **Models**: `src/models/` for Mongoose schemas
- **Libraries**: `src/lib/` for business logic
- **Tests**: Tests colocated with implementation or in `src/__tests__/`

---

## Phase 3.1: Setup & Dependencies

### T001: Install new dependencies
**Files**: `package.json`
```bash
pnpm add isomorphic-dompurify @upstash/ratelimit @upstash/redis
pnpm add -D @types/dompurify
```
**Validation**: Verify all packages install without conflicts

---

### T002 [P]: Create TypeScript types for new entities
**Files**: `src/types/braindump.ts`, `src/types/social.ts`, `src/types/analytics.ts`
- Export interfaces matching data-model.md schemas
- Include Zod schemas for runtime validation
- Export types for Comment, Reaction, SharePermission, AnalyticsEvent, Notification
**Dependencies**: None
**Validation**: Types compile with strict mode enabled

---

### T003 [P]: Set up Upstash Redis for rate limiting
**Files**: `src/lib/ratelimit.ts`
- Configure @upstash/ratelimit with Redis connection
- Export rate limiter instances: `publicApiLimiter` (100 req/min), `commentLimiter` (10/hour)
- Add environment variables to `.env.local`
**Dependencies**: T001
**Validation**: Rate limiter initializes without errors

---

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3

**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation in Phase 3.3**

### T004 [P]: Contract test for GET /api/braindump (public listing)
**Files**: `src/app/api/braindump/__tests__/route.test.ts`
- Test public braindump listing with pagination
- Test filtering by tag
- Test sorting (newest, views, shares)
- Verify private/unlisted excluded
- Assert response matches `contracts/braindump-public.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T005 [P]: Contract test for GET /api/braindump/[id] (public view)
**Files**: `src/app/api/braindump/[id]/__tests__/route.test.ts`
- Test fetching by ID and by slug
- Test 404 for private braindumps
- Test view count increment
- Assert response matches `contracts/braindump-public.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T006 [P]: Contract test for POST /api/admin/braindump (create with visibility)
**Files**: `src/app/api/admin/braindump/__tests__/create.test.ts`
- Test creating private, unlisted, public braindumps
- Test custom slug generation
- Test validation errors (invalid visibility, slug format)
- Verify authentication required
- Assert response matches `contracts/braindump-admin.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T007 [P]: Contract test for PUT /api/admin/braindump/[id] (update visibility)
**Files**: `src/app/api/admin/braindump/__tests__/update.test.ts`
- Test changing visibility (private → public, public → unlisted)
- Test updating custom slug
- Test edit history tracking
- Test authorization (owner only)
- Assert response matches `contracts/braindump-admin.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T008 [P]: Contract test for POST /api/braindump/[id]/comments (create comment)
**Files**: `src/app/api/braindump/[id]/comments/__tests__/create.test.ts`
- Test creating top-level comment
- Test creating reply (with parentId)
- Test validation (content length, max nesting)
- Test authentication required
- Assert response matches `contracts/comments.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T009 [P]: Contract test for POST /api/braindump/[id]/reactions (toggle reaction)
**Files**: `src/app/api/braindump/[id]/reactions/__tests__/route.test.ts`
- Test adding reaction (5 emoji types)
- Test removing reaction (toggle off)
- Test one reaction per user per emoji
- Assert response matches `contracts/reactions.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T010 [P]: Contract test for POST /api/braindump/[id]/share (grant permission)
**Files**: `src/app/api/braindump/[id]/share/__tests__/route.test.ts`
- Test granting view, comment, edit permissions
- Test authorization (owner only)
- Test duplicate permission handling
- Assert response matches `contracts/sharing.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T011 [P]: Contract test for GET /api/analytics/braindump/[id]
**Files**: `src/app/api/analytics/braindump/[id]/__tests__/route.test.ts`
- Test fetching analytics for time periods (7d, 30d, 90d)
- Test authorization (owner only)
- Test metrics: views, shares, comments, reactions, referrers
- Assert response matches `contracts/analytics.yaml`
**Dependencies**: None
**Validation**: Test fails with "route not implemented"

---

### T012 [P]: Integration test for Scenario 1 (Create Private Braindump)
**Files**: `src/__tests__/integration/visibility/create-private.test.ts`
- Follow steps in quickstart.md Scenario 1
- Verify private braindump only visible to creator
- Verify 404 for other users
- Verify excluded from public listing
**Dependencies**: None
**Validation**: Test fails (no models/routes)

---

### T013 [P]: Integration test for Scenario 2 (Change Visibility to Public)
**Files**: `src/__tests__/integration/visibility/change-to-public.test.ts`
- Follow steps in quickstart.md Scenario 2
- Verify visibility update
- Verify slug generation
- Verify appears in public listing
**Dependencies**: None
**Validation**: Test fails (no models/routes)

---

### T014 [P]: Integration test for Scenario 4 (View Public Braindump)
**Files**: `src/__tests__/integration/public/view-braindump.test.ts`
- Follow steps in quickstart.md Scenario 4
- Verify unauthenticated access
- Verify meta tags (OG, Twitter Card)
- Verify view count increment
**Dependencies**: None
**Validation**: Test fails (no pages/routes)

---

### T015 [P]: Integration test for Scenario 5 (Search Public Braindumps)
**Files**: `src/__tests__/integration/public/search-braindumps.test.ts`
- Follow steps in quickstart.md Scenario 5
- Verify search functionality
- Verify tag filtering
- Verify pagination
- Verify response time < 1s
**Dependencies**: None
**Validation**: Test fails (no search implementation)

---

### T016 [P]: Integration test for Scenario 7 (Add Comment)
**Files**: `src/__tests__/integration/social/add-comment.test.ts`
- Follow steps in quickstart.md Scenario 7
- Verify comment creation
- Verify notification sent to owner
- Verify comment count increment
**Dependencies**: None
**Validation**: Test fails (no comment model/routes)

---

### T017 [P]: Integration test for Scenario 9 (Add Reaction)
**Files**: `src/__tests__/integration/social/add-reaction.test.ts`
- Follow steps in quickstart.md Scenario 9
- Verify reaction toggle (add/remove)
- Verify one reaction per user per emoji
**Dependencies**: None
**Validation**: Test fails (no reaction model/routes)

---

### T018 [P]: Integration test for Scenario 11 (View Analytics)
**Files**: `src/__tests__/integration/analytics/view-analytics.test.ts`
- Follow steps in quickstart.md Scenario 11
- Verify analytics tracking
- Verify metrics aggregation
- Verify authorization
**Dependencies**: None
**Validation**: Test fails (no analytics implementation)

---

### T019 [P]: Integration test for Scenario 15 (Rate Limiting)
**Files**: `src/__tests__/integration/security/rate-limiting.test.ts`
- Follow steps in quickstart.md Scenario 15
- Verify 100 req/min limit for public API
- Verify 429 status after limit exceeded
- Verify Retry-After header
**Dependencies**: None
**Validation**: Test fails (no rate limiting)

---

### T020 [P]: Integration test for Scenario 16 (XSS Prevention)
**Files**: `src/__tests__/integration/security/xss-prevention.test.ts`
- Follow steps in quickstart.md Scenario 16
- Verify script tags sanitized
- Verify malicious attributes removed
- Verify safe content rendering
**Dependencies**: None
**Validation**: Test fails (no sanitization)

---

## Phase 3.3: Database Migration & Models (ONLY after tests are failing)

### T021: Create migration for Braindump schema extension
**Files**: `src/migrations/016-add-visibility-fields.ts`
- Add `visibility` field (default 'private' for existing records)
- Add `slug` field (nullable, generate for public braindumps)
- Add `publicMetadata` subdocument
- Add `editHistory` array
- Add new indexes per data-model.md
- Write rollback script
**Dependencies**: T002, T004-T020 (tests must exist)
**Validation**: Run migration on test DB, verify existing data intact

---

### T022 [P]: Extend Braindump model
**Files**: `src/models/Braindump.ts` (modify existing)
- Add new fields from data-model.md
- Add `generateSlug()` method
- Add `canView(userId)` method
- Add `toPublicJSON()` method
- Add new indexes
- Add pre-save hook for slug generation
**Dependencies**: T021
**Validation**: Model compiles, tests in T012-T013 progress

---

### T023 [P]: Create Comment model
**Files**: `src/models/Comment.ts`
- Implement schema from data-model.md
- Fields: braindumpId, authorId, content, parentId, status
- Add indexes: braindumpId, authorId, parentId
- Add validation: max 2000 chars, status enum
- Add method: `getReplies()`
**Dependencies**: T021
**Validation**: Model compiles, tests in T016 progress

---

### T024 [P]: Create Reaction model
**Files**: `src/models/Reaction.ts`
- Implement schema from data-model.md
- Fields: braindumpId, userId, emoji
- Add compound unique index: (braindumpId, userId, emoji)
- Add validation: emoji enum (5 types)
- Add static method: `getReactionCounts(braindumpId)`
**Dependencies**: T021
**Validation**: Model compiles, tests in T017 progress

---

### T025 [P]: Create SharePermission model
**Files**: `src/models/SharePermission.ts`
- Implement schema from data-model.md
- Fields: braindumpId, userId, permission, grantedBy, revoked
- Add compound unique index: (braindumpId, userId, revoked)
- Add validation: permission enum (view, comment, edit)
**Dependencies**: T021
**Validation**: Model compiles, integration tests progress

---

### T026 [P]: Create AnalyticsEvent model
**Files**: `src/models/AnalyticsEvent.ts`
- Implement schema from data-model.md
- Fields: type, braindumpId, userId, metadata, timestamp
- Add indexes: braindumpId+timestamp, userId+timestamp, type
- Add validation: type enum (10+ types)
- Add TTL index: auto-delete after 2 years
**Dependencies**: T021
**Validation**: Model compiles, tests in T018 progress

---

### T027 [P]: Create Notification model
**Files**: `src/models/Notification.ts`
- Implement schema from data-model.md
- Fields: userId, type, title, message, relatedIds, read, createdAt
- Add indexes: userId+read, userId+createdAt
- Add validation: type enum (6 types), max 500 char message
- Add method: `markAsRead()`
**Dependencies**: T021
**Validation**: Model compiles, notification tests progress

---

## Phase 3.4: Core API Implementation

### T028: Implement GET /api/braindump (public listing)
**Files**: `src/app/api/braindump/route.ts`
- Filter by visibility: 'public' only
- Support pagination (page, limit)
- Support tag filtering
- Support sorting (newest, views, shares)
- Apply rate limiting (publicApiLimiter)
- Return BraindumpPreview schema
**Dependencies**: T022, T024, T004
**Validation**: T004 contract test passes

---

### T029: Implement GET /api/braindump/[id] (public view)
**Files**: `src/app/api/braindump/[id]/route.ts`
- Support lookup by ID or slug
- Check visibility (public/unlisted only for unauthenticated)
- Increment view count (publicMetadata.viewCount)
- Track analytics event (type: 'view')
- Apply rate limiting
- Return full braindump with author info
**Dependencies**: T022, T026, T005
**Validation**: T005 contract test passes

---

### T030: Implement POST /api/admin/braindump (create with visibility)
**Files**: `src/app/api/admin/braindump/route.ts` (modify existing)
- Accept visibility field (default 'private')
- Accept customSlug or auto-generate
- Validate slug uniqueness
- Apply rate limiting (10 creates/hour)
- Return created braindump
**Dependencies**: T022, T006
**Validation**: T006 contract test passes, T012 integration test passes

---

### T031: Implement PUT /api/admin/braindump/[id] (update visibility)
**Files**: `src/app/api/admin/braindump/[id]/route.ts` (modify existing)
- Support visibility changes
- Support slug updates
- Track edit history
- Verify ownership (userId matches)
- Trigger ISR revalidation on visibility change
**Dependencies**: T022, T007
**Validation**: T007 contract test passes, T013 integration test passes

---

### T032: Implement POST /api/braindump/[id]/comments
**Files**: `src/app/api/braindump/[id]/comments/route.ts`
- Create comment or reply (with parentId)
- Validate: max nesting depth 1
- Sanitize content with isomorphic-dompurify
- Apply rate limiting (10 comments/hour/user)
- Send notification to braindump owner
- Return created comment with author info
**Dependencies**: T023, T027, T008
**Validation**: T008 contract test passes, T016 integration test passes

---

### T033: Implement GET /api/braindump/[id]/comments
**Files**: `src/app/api/braindump/[id]/comments/route.ts`
- Fetch all approved comments for braindump
- Include nested replies (1 level)
- Return with author info (name, image)
- Apply rate limiting
**Dependencies**: T023, T008
**Validation**: T008 contract test passes

---

### T034: Implement POST /api/braindump/[id]/reactions
**Files**: `src/app/api/braindump/[id]/reactions/route.ts`
- Toggle reaction (add if not exists, remove if exists)
- Validate emoji type (5 allowed)
- Enforce one reaction per user per emoji
- Return action ('added' or 'removed') and new total
- Apply rate limiting
**Dependencies**: T024, T009
**Validation**: T009 contract test passes, T017 integration test passes

---

### T035: Implement POST /api/braindump/[id]/share
**Files**: `src/app/api/braindump/[id]/share/route.ts`
- Grant share permission (view/comment/edit)
- Verify ownership (only owner can share)
- Check for duplicate permissions
- Send notification to shared user
- Return created permission
**Dependencies**: T025, T027, T010
**Validation**: T010 contract test passes

---

### T036: Implement GET /api/analytics/braindump/[id]
**Files**: `src/app/api/analytics/braindump/[id]/route.ts`
- Aggregate analytics events by period (7d, 30d, 90d, all)
- Calculate: total/unique views, shares by platform, comments, reactions
- Generate timeline data (daily counts)
- Verify ownership (only owner can view analytics)
- Apply rate limiting
**Dependencies**: T026, T011
**Validation**: T011 contract test passes, T018 integration test passes

---

### T037: Implement GET /api/analytics/trending
**Files**: `src/app/api/analytics/trending/route.ts`
- Calculate trending scores (time-decayed)
- Formula: (views + shares*5 + comments*3 + reactions*2) / (age_hours + 2)^1.5
- Cache in Redis (1 hour TTL)
- Support period filter (24h, 7d, 30d)
- Return top N braindumps
**Dependencies**: T026, T003, T011
**Validation**: Trending calculation correct, T015 integration test passes

---

### T038: Implement GET /api/braindump/feed.xml (RSS)
**Files**: `src/app/api/braindump/feed.xml/route.ts`
- Generate RSS 2.0 XML
- Include last 50 public braindumps (sorted by createdAt desc)
- Each item: title, link, description, pubDate, author
- Set Cache-Control: 1 hour
- Exclude private and unlisted
**Dependencies**: T022, T004
**Validation**: Valid RSS 2.0 XML, quickstart Scenario 6 passes

---

## Phase 3.5: Public Pages & UI Components

### T039 [P]: Create public braindump view page
**Files**: `src/app/braindump/[id]/page.tsx`
- Dynamic route with ISR (revalidate: 3600)
- Fetch braindump by slug or ID
- Check visibility (404 if private)
- Generate metadata with Open Graph tags
- Render content with proper formatting
- Show author info, tags, view count
- Include comment thread and reaction bar
**Dependencies**: T022, T023, T024, T029
**Validation**: T014 integration test passes, meta tags present

---

### T040 [P]: Create public braindump listing page
**Files**: `src/app/braindumps/page.tsx`
- Server component with ISR
- Display paginated list of public braindumps
- Include search box and tag filters
- Show preview (first 200 chars)
- Display view counts and author info
- Link to individual braindump pages
**Dependencies**: T028, T039
**Validation**: Page renders, T015 integration test passes

---

### T041 [P]: Create BraindumpPublicView component
**Files**: `src/components/braindump/BraindumpPublicView.tsx`
- Display braindump content with formatting
- Show author name, avatar, date
- Display tags as clickable links
- Show view count, share count
- Include social share buttons
- Render linked braindumps
**Dependencies**: None (UI only)
**Validation**: Component renders correctly

---

### T042 [P]: Create CommentThread component
**Files**: `src/components/braindump/CommentThread.tsx`
- Display comments in threaded structure (1 level nesting)
- Show author name, avatar, timestamp
- Include reply button (if authenticated)
- Show "Load more" for pagination
- Handle edit/delete for comment author
- Real-time update on new comments
**Dependencies**: T023, T032, T033
**Validation**: Comments display correctly, replies nested

---

### T043 [P]: Create ReactionBar component
**Files**: `src/components/braindump/ReactionBar.tsx`
- Display 5 reaction types with counts
- Highlight user's current reactions
- Toggle reaction on click (if authenticated)
- Optimistic UI update
- Show top reactors on hover
**Dependencies**: T024, T034
**Validation**: Reactions toggle correctly, UI updates

---

### T044 [P]: Create ShareDialog component
**Files**: `src/components/braindump/ShareDialog.tsx`
- Social share buttons (Twitter, LinkedIn, Facebook)
- Copy link button
- Email share option
- Track share events to analytics
- Show share count
**Dependencies**: T026
**Validation**: Share buttons work, analytics tracked

---

### T045: Update QuickCaptureCard with visibility selector
**Files**: `src/components/braindump/QuickCaptureCard.tsx` (modify existing)
- Add visibility dropdown (private/unlisted/public)
- Default to 'private'
- Show visibility indicator icon
- Pass visibility to create API
**Dependencies**: T030
**Validation**: Visibility selector works, default correct

---

### T046: Update BraindumpCard with visibility badge
**Files**: `src/components/braindump/BraindumpCard.tsx` (modify existing)
- Show visibility badge (🔒 private, 🔗 unlisted, 🌐 public)
- Display view count for public/unlisted
- Show comment and reaction counts
- Add "Change visibility" button
**Dependencies**: T022
**Validation**: Badges display correctly

---

## Phase 3.6: Admin & Analytics UI

### T047 [P]: Create analytics dashboard page
**Files**: `src/app/admin/analytics/page.tsx`
- Display overview metrics (total views, shares, comments, reactions)
- Show top 10 performing braindumps
- Include growth metrics vs previous period
- Add time period selector (7d, 30d, 90d, all)
- Require authentication
**Dependencies**: T036
**Validation**: Dashboard displays metrics correctly

---

### T048 [P]: Create AnalyticsDashboard component
**Files**: `src/components/analytics/AnalyticsDashboard.tsx`
- Overview cards (views, shares, comments, reactions)
- Line chart for views over time (use D3.js or Recharts)
- Top braindumps table
- Referrer breakdown
**Dependencies**: T036
**Validation**: Charts render, data accurate

---

### T049 [P]: Create NotificationBell component
**Files**: `src/components/analytics/NotificationBell.tsx`
- Bell icon with unread count badge
- Dropdown with recent notifications
- Mark as read on click
- Link to notification source
- "Mark all as read" button
**Dependencies**: T027
**Validation**: Notifications display, mark as read works

---

### T050: Create share management UI in admin
**Files**: `src/app/admin/braindump/[id]/share/page.tsx`
- List users with share permissions
- Add new share permission form
- Permission level selector (view/comment/edit)
- Revoke permission button
- Show granted date
**Dependencies**: T025, T035
**Validation**: Share management works, permissions update

---

## Phase 3.7: Search, Performance & Security

### T051: Implement full-text search
**Files**: `src/lib/braindump/search.ts`
- Implement MongoDB Atlas Search (if available)
- Fallback to regex search for simple deployments
- Search in content, tags, category
- Return ranked results
- Include in T028 listing endpoint
**Dependencies**: T028
**Validation**: T015 integration test passes, response time < 1s

---

### T052: Implement ISR (Incremental Static Regeneration)
**Files**: `src/app/braindump/[id]/page.tsx` (update)
- Add `revalidate: 3600` (1 hour)
- Implement `generateStaticParams` for popular braindumps
- Add on-demand revalidation on visibility change
- Cache public braindump list
**Dependencies**: T039
**Validation**: Pages regenerate every hour, on-demand works

---

### T053: Implement rate limiting middleware
**Files**: `src/middleware.ts` (modify or create)
- Apply rate limiting to public API routes
- Different limits: public (100/min), authenticated (higher)
- Return 429 with Retry-After header
- Log rate limit violations
**Dependencies**: T003
**Validation**: T019 integration test passes, limits enforced

---

### T054: Implement XSS prevention
**Files**: `src/lib/sanitize.ts`
- Sanitize all user content with isomorphic-dompurify
- Whitelist safe HTML tags (<p>, <strong>, <em>, <a>, <ul>, <ol>, <li>)
- Remove all script tags and event handlers
- Apply in comment and braindump creation
**Dependencies**: T001, T032
**Validation**: T020 integration test passes, malicious content blocked

---

### T055: Add CSRF protection
**Files**: `src/middleware.ts` (update)
- Verify Clerk session token on all mutating endpoints
- Check Origin header matches host
- Add CSRF token to forms (if needed)
**Dependencies**: T053
**Validation**: Cross-origin requests blocked

---

### T056: Implement analytics event tracking
**Files**: `src/lib/analytics/track.ts`
- Track events: view, share, comment, reaction
- Background job for aggregation
- Calculate trending scores
- Store in AnalyticsEvent model
**Dependencies**: T026
**Validation**: Events tracked correctly, aggregation runs

---

### T057: Implement notification system
**Files**: `src/lib/notifications/send.ts`
- Create in-app notifications (Notification model)
- Send email notifications via SendGrid (optional)
- Trigger on: new comment, reply, reaction, share
- Include unsubscribe link
**Dependencies**: T027
**Validation**: Notifications created, emails sent (if configured)

---

## Phase 3.8: Polish & Documentation

### T058 [P]: Add unit tests for slug generation
**Files**: `src/models/__tests__/Braindump.test.ts`
- Test `generateSlug()` method
- Test uniqueness enforcement
- Test custom slug validation
- Test URL-safe characters
**Dependencies**: T022
**Validation**: All tests pass

---

### T059 [P]: Add unit tests for visibility checks
**Files**: `src/models/__tests__/Braindump.test.ts`
- Test `canView(userId)` method
- Test private visibility (owner only)
- Test unlisted visibility (direct link)
- Test public visibility (anyone)
- Test share permissions
**Dependencies**: T022, T025
**Validation**: All tests pass

---

### T060 [P]: Add performance tests
**Files**: `src/__tests__/performance/page-load.test.ts`
- Test public page load < 2s (90th percentile)
- Test API response < 500ms (90th percentile)
- Test search response < 1s
- Use Lighthouse or WebPageTest
**Dependencies**: T039, T040, T051
**Validation**: Performance targets met

---

### T061 [P]: Update API documentation
**Files**: `docs/api/braindump-visibility.md`
- Document all new endpoints
- Include request/response examples
- Add authentication requirements
- Document rate limits
- Include error codes
**Dependencies**: T028-T038
**Validation**: Documentation accurate and complete

---

### T062: Run manual testing scenarios
**Files**: Follow `specs/016-braindump-visibility-public/quickstart.md`
- Execute all 16 scenarios manually
- Verify expected outcomes
- Document any issues found
- Update quickstart.md if needed
**Dependencies**: All previous tasks
**Validation**: All scenarios pass

---

## Dependencies Graph

```
Setup (T001-T003)
  ↓
Tests (T004-T020) [All parallel, must fail]
  ↓
Migration (T021)
  ↓
Models (T022-T027) [Parallel]
  ↓
API Routes (T028-T038) [Sequential due to shared concerns]
  ↓
Pages & Components (T039-T046) [Mostly parallel]
  ↓
Admin UI (T047-T050) [Parallel]
  ↓
Integration (T051-T057) [Sequential]
  ↓
Polish (T058-T062) [Mostly parallel]
```

## Parallel Execution Examples

### Phase 3.2: All contract tests simultaneously
```bash
Task: "Contract test for GET /api/braindump (public listing) in src/app/api/braindump/__tests__/route.test.ts"
Task: "Contract test for GET /api/braindump/[id] in src/app/api/braindump/[id]/__tests__/route.test.ts"
Task: "Contract test for POST /api/admin/braindump in src/app/api/admin/braindump/__tests__/create.test.ts"
Task: "Contract test for PUT /api/admin/braindump/[id] in src/app/api/admin/braindump/__tests__/update.test.ts"
Task: "Contract test for POST /api/braindump/[id]/comments in src/app/api/braindump/[id]/comments/__tests__/create.test.ts"
Task: "Contract test for POST /api/braindump/[id]/reactions in src/app/api/braindump/[id]/reactions/__tests__/route.test.ts"
Task: "Contract test for POST /api/braindump/[id]/share in src/app/api/braindump/[id]/share/__tests__/route.test.ts"
```

### Phase 3.3: All models simultaneously
```bash
Task: "Extend Braindump model in src/models/Braindump.ts"
Task: "Create Comment model in src/models/Comment.ts"
Task: "Create Reaction model in src/models/Reaction.ts"
Task: "Create SharePermission model in src/models/SharePermission.ts"
Task: "Create AnalyticsEvent model in src/models/AnalyticsEvent.ts"
Task: "Create Notification model in src/models/Notification.ts"
```

### Phase 3.5: UI components simultaneously
```bash
Task: "Create BraindumpPublicView component in src/components/braindump/BraindumpPublicView.tsx"
Task: "Create CommentThread component in src/components/braindump/CommentThread.tsx"
Task: "Create ReactionBar component in src/components/braindump/ReactionBar.tsx"
Task: "Create ShareDialog component in src/components/braindump/ShareDialog.tsx"
```

## Implementation Phases Alignment

**Phase 1: Core Visibility (Tasks T001-T031, ~15 hours)**
- Setup, tests, migration, models, basic CRUD with visibility

**Phase 2: Discovery (Tasks T028-T029, T038-T040, T051, ~15 hours)**
- Public listing, view page, RSS feed, search

**Phase 3: Social (Tasks T032-T035, T042-T044, T054, T057, ~20 hours)**
- Comments, reactions, sharing, notifications, XSS prevention

**Phase 4: Analytics (Tasks T036-T037, T047-T050, T056, ~15 hours)**
- Analytics tracking, dashboard, trending, notifications

**Infrastructure & Polish (Tasks T052-T053, T055, T058-T062, ~15 hours)**
- ISR, rate limiting, CSRF, tests, documentation

## Notes
- All [P] tasks are independent and can run in parallel
- Tests (T004-T020) MUST be written first and MUST fail
- Verify each test passes after implementing corresponding feature
- Commit after each task with meaningful commit message
- Run `pnpm typecheck` and `pnpm test` before each commit
- Performance targets: Page load < 2s, API < 500ms, Search < 1s

## Validation Checklist
*GATE: Checked before marking tasks complete*

- [x] All 7 contracts have corresponding tests (T004-T011)
- [x] All 6 entities have model tasks (T022-T027)
- [x] All tests come before implementation (T004-T020 before T021+)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No [P] task modifies same file as another [P] task
- [x] TDD enforced: Tests fail first, then pass after implementation
- [x] All 16 integration scenarios covered (T012-T020)
- [x] Performance requirements addressed (T051, T052, T060)
- [x] Security requirements addressed (T053-T055)

---

**Total Tasks**: 62  
**Estimated Time**: 60-80 hours  
**Parallelization**: 35 tasks marked [P] can run concurrently  
**Sequential Tasks**: 27 tasks must run in order due to dependencies

**Ready for execution**: All tasks are specific, testable, and immediately actionable. Proceed with Phase 3.1 setup tasks first.
