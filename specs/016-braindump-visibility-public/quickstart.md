# Quickstart Guide - Braindump Visibility Feature

This guide provides integration test scenarios for validating the braindump visibility feature implementation. Each scenario maps to user stories from the feature specification.

## Prerequisites

- MongoDB running locally or connection to test database
- Clerk authentication configured with test API keys
- Next.js development server running (`npm run dev`)
- Test user accounts created in Clerk dashboard

## Test Scenarios

### Scenario 1: Create Private Braindump (S1.1)

**User Story**: As a user, I want to create private braindumps so only I can see them.

**Steps**:
1. Authenticate as Test User A
2. POST `/api/admin/braindump` with:
   ```json
   {
     "content": "This is my private thought about project architecture",
     "visibility": "private",
     "tags": ["architecture", "notes"]
   }
   ```
3. Verify response contains:
   - `visibility: "private"`
   - Generated `slug`
   - `userId` matches Test User A

**Expected Outcome**:
- ✅ Braindump created with 201 status
- ✅ Only visible to creator in dashboard
- ✅ Returns 404 when accessed by other users
- ✅ Not included in public listing API

---

### Scenario 2: Change Visibility to Public (S1.2)

**User Story**: As a user, I want to change braindump visibility so I can share selected thoughts publicly.

**Steps**:
1. Use braindump ID from Scenario 1
2. PUT `/api/admin/braindump/{id}` with:
   ```json
   {
     "visibility": "public"
   }
   ```
3. Verify response contains:
   - `visibility: "public"`
   - Generated SEO-friendly slug (e.g., "project-architecture-notes-ab3k9d")

**Expected Outcome**:
- ✅ Visibility updated to "public"
- ✅ Braindump now appears in public listing
- ✅ Accessible without authentication at `/braindump/{slug}`
- ✅ Page renders with proper meta tags (Open Graph, Twitter Card)

---

### Scenario 3: Create Unlisted Braindump (S1.3)

**User Story**: As a user, I want to create unlisted braindumps so I can share via link without public listing.

**Steps**:
1. Authenticate as Test User A
2. POST `/api/admin/braindump` with:
   ```json
   {
     "content": "Semi-private notes to share with specific colleagues",
     "visibility": "unlisted",
     "customSlug": "team-planning-q4"
   }
   ```
3. Copy the generated slug from response

**Expected Outcome**:
- ✅ Braindump created with visibility "unlisted"
- ✅ Accessible via direct link: `/braindump/team-planning-q4`
- ✅ NOT listed in `/api/braindump` public listing
- ✅ NOT included in RSS feed
- ✅ Returns 404 for unauthenticated users searching by ID

---

### Scenario 4: View Public Braindump (S2.1)

**User Story**: As a visitor, I want to view public braindumps so I can read shared content.

**Steps**:
1. Open browser in incognito mode (unauthenticated)
2. Navigate to `/braindump/{slug}` from Scenario 2
3. Check page source for SEO meta tags

**Expected Outcome**:
- ✅ Page loads successfully without authentication
- ✅ Content displayed with proper formatting
- ✅ Meta tags present: `og:title`, `og:description`, `og:image`
- ✅ Author name and avatar displayed
- ✅ View count increments on each unique visit
- ✅ Tags displayed as clickable links

---

### Scenario 5: Search Public Braindumps (S2.2)

**User Story**: As a visitor, I want to search public braindumps so I can find relevant content.

**Steps**:
1. Create 5 more public braindumps with various tags
2. Navigate to `/braindump` listing page
3. Use search box to search for "architecture"
4. Filter by tag "notes"

**Expected Outcome**:
- ✅ Search returns braindumps containing "architecture" in content
- ✅ Tag filter narrows results to those tagged "notes"
- ✅ Results paginated (20 per page by default)
- ✅ Each result shows preview (first 200 chars)
- ✅ View counts displayed
- ✅ Search response time < 1 second

---

### Scenario 6: Subscribe to RSS Feed (S2.3)

**User Story**: As a visitor, I want to subscribe to an RSS feed so I can follow new public braindumps.

**Steps**:
1. Navigate to `/braindump/feed.xml`
2. Open in RSS reader (e.g., Feedly, NewsBlur)
3. Verify feed structure

**Expected Outcome**:
- ✅ Valid RSS 2.0 XML returned
- ✅ Contains last 50 public braindumps
- ✅ Each item has title, link, description, pubDate
- ✅ Feed updates with 1-hour cache
- ✅ Private and unlisted braindumps excluded

---

### Scenario 7: Add Comment (S3.1)

**User Story**: As a user, I want to comment on public braindumps so I can engage in discussion.

**Steps**:
1. Authenticate as Test User B
2. Navigate to public braindump from Scenario 2
3. POST `/api/braindump/{id}/comments` with:
   ```json
   {
     "content": "Great insights! Have you considered the trade-offs with microservices?"
   }
   ```

**Expected Outcome**:
- ✅ Comment created with 201 status
- ✅ Comment appears in UI immediately
- ✅ Author (Test User B) name and avatar displayed
- ✅ Notification sent to braindump owner (Test User A)
- ✅ Comment count on braindump increments

---

### Scenario 8: Reply to Comment (S3.2)

**User Story**: As a user, I want to reply to comments so I can participate in threaded discussions.

**Steps**:
1. Authenticate as Test User A (braindump owner)
2. POST `/api/braindump/{id}/comments` with:
   ```json
   {
     "content": "Good question! I'll write a follow-up braindump on that.",
     "parentId": "{commentId from Scenario 7}"
   }
   ```

**Expected Outcome**:
- ✅ Reply created and nested under parent comment
- ✅ Notification sent to Test User B
- ✅ Reply indented in UI
- ✅ Maximum nesting depth of 1 enforced

---

### Scenario 9: Add Reaction (S3.3)

**User Story**: As a user, I want to react to braindumps so I can show appreciation quickly.

**Steps**:
1. Authenticate as Test User C
2. POST `/api/braindump/{id}/reactions` with:
   ```json
   {
     "emoji": "💡"
   }
   ```
3. POST again with same emoji (toggle off)

**Expected Outcome**:
- ✅ First POST adds reaction (status 200, action: "added")
- ✅ Reaction count for 💡 increments
- ✅ Second POST removes reaction (status 200, action: "removed")
- ✅ One user can only have one reaction per emoji type
- ✅ User can react with multiple different emojis

---

### Scenario 10: Grant Share Permission (S3.4)

**User Story**: As a user, I want to grant specific users permission to view/comment on private braindumps.

**Steps**:
1. Authenticate as Test User A (owner of private braindump from Scenario 1)
2. POST `/api/braindump/{id}/share` with:
   ```json
   {
     "userId": "user_TestUserD",
     "permission": "comment"
   }
   ```
3. Authenticate as Test User D
4. Navigate to private braindump URL

**Expected Outcome**:
- ✅ Share permission granted successfully
- ✅ Test User D can view the private braindump
- ✅ Test User D can add comments
- ✅ Test User D cannot edit content (only "comment" permission)
- ✅ Notification sent to Test User D about share

---

### Scenario 11: View Analytics (S4.1)

**User Story**: As a user, I want to view analytics for my public braindumps so I can understand engagement.

**Steps**:
1. Authenticate as Test User A
2. Perform various actions on public braindump:
   - View from 3 different browsers (incognito)
   - Share via Twitter (record event)
   - Add 2 comments, 3 reactions
3. GET `/api/analytics/braindump/{id}?period=7d`

**Expected Outcome**:
- ✅ Analytics returned with 200 status
- ✅ Total views: 3+ (including Test User A's own views)
- ✅ Unique views tracked separately
- ✅ Share count reflects social shares
- ✅ Comment and reaction counts accurate
- ✅ Daily timeline data included
- ✅ Top referrers listed

---

### Scenario 12: Dashboard Overview (S4.2)

**User Story**: As a user, I want a dashboard of all my braindumps' performance so I can track overall engagement.

**Steps**:
1. Authenticate as Test User A
2. Navigate to `/dashboard/analytics`
3. GET `/api/analytics/dashboard?period=30d`

**Expected Outcome**:
- ✅ Overview metrics displayed:
  - Total views across all public braindumps
  - Total shares, comments, reactions
  - Count of public vs private braindumps
- ✅ Top 10 performing braindumps listed
- ✅ Growth metrics show % change vs previous period
- ✅ Charts render correctly (views over time)

---

### Scenario 13: Receive Notification (S4.3)

**User Story**: As a user, I want to be notified when someone comments/reacts to my braindumps.

**Steps**:
1. From Scenario 7, verify Test User A receives notification
2. Authenticate as Test User A
3. GET `/api/notifications?unreadOnly=true`

**Expected Outcome**:
- ✅ Notification appears in response with unread status
- ✅ Type is "comment"
- ✅ Message includes commenter name and preview
- ✅ actionUrl points to specific comment
- ✅ Email sent to Test User A (if email notifications enabled)
- ✅ Notification badge shows unread count in UI

---

### Scenario 14: Trending Braindumps (S2.4)

**User Story**: As a visitor, I want to see trending braindumps so I can discover popular content.

**Steps**:
1. Create 10 public braindumps with varying engagement:
   - Braindump A: 100 views, 20 shares, 10 reactions (created 1 day ago)
   - Braindump B: 200 views, 5 shares, 5 reactions (created 10 days ago)
   - Others with lower engagement
2. GET `/api/analytics/trending?period=7d&limit=5`

**Expected Outcome**:
- ✅ Returns top 5 trending braindumps
- ✅ Braindump A ranks higher due to recent engagement
- ✅ Braindump B ranks lower due to age decay
- ✅ Trending score calculated correctly (time-weighted)
- ✅ Response cached in Redis for performance

---

### Scenario 15: Rate Limiting (Non-functional)

**User Story**: System should prevent abuse through rate limiting.

**Steps**:
1. Unauthenticated browser:
   - Make 101 requests to GET `/api/braindump` within 1 minute
2. Authenticated user:
   - Make 51 requests to POST `/api/braindump/{id}/reactions` within 1 minute

**Expected Outcome**:
- ✅ Request 101 returns 429 status
- ✅ Response includes Retry-After header
- ✅ Authenticated user gets higher limit (100 req/min)
- ✅ Request 51 returns 429 status
- ✅ Rate limit resets after 1 minute

---

### Scenario 16: XSS Prevention (Security)

**User Story**: System should prevent XSS attacks in user-generated content.

**Steps**:
1. Authenticate as Test User A
2. POST `/api/admin/braindump` with:
   ```json
   {
     "content": "Check this out: <script>alert('XSS')</script> and <img src=x onerror=alert('XSS')>",
     "visibility": "public"
   }
   ```
3. View braindump as unauthenticated visitor

**Expected Outcome**:
- ✅ Script tags sanitized by isomorphic-dompurify
- ✅ No JavaScript executes in browser
- ✅ Content displayed safely: "Check this out:  and "
- ✅ Malicious attributes removed from HTML tags

---

## Performance Benchmarks

Run these after all scenarios to verify performance targets:

### Page Load Speed
```bash
# Use Lighthouse or WebPageTest
lighthouse https://localhost:3000/braindump/{slug} --view
```
**Target**: < 2 seconds First Contentful Paint

### API Response Time
```bash
# Use Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/braindump
```
**Target**: < 500ms average response time

### Search Performance
```bash
# Test search with 1000+ braindumps in database
curl "http://localhost:3000/api/braindump?search=test" -w "@curl-format.txt"
```
**Target**: < 1 second for search results

---

## Cleanup

After testing, clean up test data:

```javascript
// Run in MongoDB shell
db.braindumps.deleteMany({ userId: { $in: ['user_TestUserA', 'user_TestUserB', 'user_TestUserC', 'user_TestUserD'] } });
db.comments.deleteMany({ braindumpId: { $in: [/* test braindump IDs */] } });
db.reactions.deleteMany({ braindumpId: { $in: [/* test braindump IDs */] } });
db.sharePermissions.deleteMany({ braindumpId: { $in: [/* test braindump IDs */] } });
db.analyticsEvents.deleteMany({ braindumpId: { $in: [/* test braindump IDs */] } });
db.notifications.deleteMany({ userId: { $in: ['user_TestUserA', 'user_TestUserB', 'user_TestUserC', 'user_TestUserD'] } });
```

---

## Automated Test Suite

These scenarios should be implemented as automated integration tests using:

- **Framework**: Vitest + Playwright
- **Test Database**: MongoDB Memory Server for isolation
- **Authentication**: Clerk test keys with mock users
- **CI/CD**: Run on every PR to main branch

Example test structure:
```typescript
describe('Braindump Visibility Feature', () => {
  beforeEach(async () => {
    await setupTestDatabase();
    await createTestUsers();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  describe('S1: Visibility Management', () => {
    it('should create private braindump', async () => {
      // Scenario 1 implementation
    });
    
    it('should change visibility to public', async () => {
      // Scenario 2 implementation
    });
    
    // ... more tests
  });

  describe('S2: Public Discovery', () => {
    // Scenarios 4-6, 14
  });

  describe('S3: Social Features', () => {
    // Scenarios 7-10
  });

  describe('S4: Analytics', () => {
    // Scenarios 11-13
  });

  describe('Non-functional Requirements', () => {
    // Scenarios 15-16
  });
});
```

---

## Notes

- All scenarios assume localhost development environment
- Replace `localhost:3000` with actual deployment URL for staging/production testing
- Ensure test users have valid Clerk accounts before running scenarios
- Some scenarios (like trending) require sufficient data volume to validate correctly
- Rate limiting thresholds may need adjustment for test environments
