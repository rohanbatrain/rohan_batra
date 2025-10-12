# Dashboard Architecture Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER DASHBOARD (/dashboard)                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
┌──────────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│   EXISTING APIs      │  │   NEW APIs       │  │  ENHANCED APIs   │
├──────────────────────┤  ├──────────────────┤  ├──────────────────┤
│ /dashboard/summary   │  │ /activity        │  │ /recommendations │
│ /dashboard/          │  │ /content/liked   │  │ (enhanced)       │
│  certificates        │  │ /content/recent  │  │                  │
│ /courses/[id]/       │  │ /comments        │  │                  │
│  progress            │  │ /bookmarks       │  │                  │
│                      │  │ /goals           │  │                  │
│                      │  │ /analytics       │  │                  │
└──────────────────────┘  └──────────────────┘  └──────────────────┘
         │                        │                      │
         └────────────────────────┼──────────────────────┘
                                  │
                                  ▼
            ┌─────────────────────────────────────┐
            │     DATABASE LAYER (MongoDB)        │
            ├─────────────────────────────────────┤
            │  EXISTING COLLECTIONS:              │
            │  - User                             │
            │  - Course                           │
            │  - CourseEnrollment                 │
            │  - CourseProgress                   │
            │  - Certificate                      │
            │  - BlogPost                         │
            │  - Project                          │
            │  - Like                             │
            │  - Comment                          │
            │                                     │
            │  NEW COLLECTIONS:                   │
            │  - Bookmark       ⭐                │
            │  - UserGoal       ⭐                │
            │  - ViewHistory    ⭐                │
            │  - DashboardRecommendation          │
            └─────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

### User Opens Dashboard

```
User navigates to /dashboard
         │
         ▼
┌────────────────────┐
│  Dashboard Page    │
│  (Client Component)│
└────────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌─────────────────────┐         ┌─────────────────────┐
│ Fetch Summary Data  │         │ Fetch User Profile  │
│ GET /api/dashboard/ │         │ useUser() from      │
│      summary        │         │ Clerk               │
└─────────────────────┘         └─────────────────────┘
         │                                 │
         ▼                                 ▼
┌─────────────────────────────────────────────────────┐
│            Aggregate Data in Memory                 │
│  - Enrolled courses with progress                   │
│  - Certificates earned                              │
│  - Recommendations                                  │
│  - Metrics (completion rate, streak)                │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│         Parallel Fetch for New Features             │
├─────────────────────────────────────────────────────┤
│  GET /api/dashboard/activity        (Activity Feed) │
│  GET /api/dashboard/content/liked   (Liked Content) │
│  GET /api/dashboard/bookmarks       (Bookmarks)     │
│  GET /api/dashboard/goals           (Goals)         │
│  GET /api/dashboard/analytics       (Analytics)     │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────┐
│              Render Dashboard UI                    │
├─────────────────────────────────────────────────────┤
│  ✓ Header with user greeting                        │
│  ✓ Quick Actions (resume, explore, etc.)            │
│  ✓ Insights Panel (this week summary)               │
│  ✓ Achievement Overview (6 metric cards)            │
│  ✓ Main Content Tabs (8 sections)                   │
│  ✓ Sidebar (goals, community, activity)             │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Component Hierarchy

```
DashboardPage
│
├── DashboardHeader
│   ├── UserGreeting
│   └── RefreshButton
│
├── QuickActions
│   ├── ResumeButton (primary)
│   ├── ExploreButton
│   ├── ReadBlogButton
│   ├── ViewPortfolioButton
│   ├── SetGoalButton
│   └── ShareButton
│
├── InsightsPanel
│   ├── WeeklySummary
│   ├── StreakStatus
│   └── Recommendations
│
├── AchievementOverview (Grid)
│   ├── CertificatesCard
│   ├── CompletedCoursesCard
│   ├── StreakCard
│   ├── LearningTimeCard (NEW)
│   ├── ContentConsumedCard (NEW)
│   └── EngagementScoreCard (NEW)
│
├── MainContentArea
│   │
│   ├── TabNavigation
│   │   ├── LearningHubTab
│   │   ├── ContentLibraryTab (NEW)
│   │   ├── PortfolioInsightsTab (NEW)
│   │   ├── ExperienceTab (NEW)
│   │   ├── SocialActivityTab (NEW)
│   │   ├── AchievementsTab
│   │   └── AnalyticsTab (NEW)
│   │
│   ├── TabContent[Learning Hub]
│   │   ├── ActiveCoursesList
│   │   │   └── CourseCard (progress, CTA)
│   │   ├── RecommendedCourses
│   │   ├── RecentLessons (NEW)
│   │   ├── StudyGoals (NEW)
│   │   └── KnowledgeGraph (NEW)
│   │
│   ├── TabContent[Content Library] (NEW)
│   │   ├── SubTabs (Saved, Liked, Recent, Recommended)
│   │   ├── ContentGrid
│   │   │   └── ContentCard (blog/project)
│   │   └── EmptyState
│   │
│   ├── TabContent[Portfolio Insights] (NEW)
│   │   ├── LikedProjects
│   │   ├── RecentlyViewed
│   │   ├── RelevantProjects
│   │   └── ProjectIdeas
│   │
│   ├── TabContent[Experience] (NEW)
│   │   ├── ExperienceTimeline
│   │   ├── SkillsMapping
│   │   └── Endorsements
│   │
│   ├── TabContent[Social Activity] (NEW)
│   │   ├── MyComments
│   │   ├── ActiveDiscussions
│   │   ├── LikesGiven
│   │   └── CommunityRank
│   │
│   ├── TabContent[Achievements]
│   │   ├── DigitalBadges (NEW)
│   │   ├── CertificateGallery
│   │   ├── UpcomingMilestones (NEW)
│   │   └── AchievementTimeline (NEW)
│   │
│   └── TabContent[Analytics] (NEW)
│       ├── LearningTimeTrends
│       ├── EngagementMetrics
│       ├── ContentConsumption
│       └── StreakHistory
│
└── Sidebar (Desktop) (NEW)
    ├── GoalTracker
    │   ├── GoalProgressBars
    │   ├── CreateGoalButton
    │   └── GoalHistory
    │
    ├── CommunityWidget
    │   ├── UserRankBadge
    │   ├── RecentDiscussions
    │   └── Leaderboard (optional)
    │
    └── ActivityFeed
        ├── ActivityTimeline
        ├── FilterDropdown
        └── LoadMoreButton
```

---

## 🗄️ Database Schema Relationships

```
User (Existing)
  │
  ├─── has many ─→ CourseEnrollment
  │                      │
  │                      └─── has one ─→ CourseProgress
  │                                           │
  │                                           └─── tracks → Lessons Completed
  │
  ├─── has many ─→ Certificate
  │
  ├─── has many ─→ Like
  │                  │
  │                  └─── targets → BlogPost | Project | Comment
  │
  ├─── has many ─→ Comment
  │                  │
  │                  └─── on → BlogPost | Course | Project
  │
  ├─── has many ─→ Bookmark (NEW)
  │                  │
  │                  └─── targets → BlogPost | Project | Course
  │
  ├─── has many ─→ UserGoal (NEW)
  │                  │
  │                  └─── tracks → weekly_hours | courses_complete | streak_days
  │
  ├─── has many ─→ ViewHistory (NEW)
  │                  │
  │                  └─── tracks → BlogPost | Project views
  │
  └─── has one ──→ DashboardRecommendation (Existing)
                      │
                      └─── contains → Course | Blog | Book recommendations
```

---

## 🔄 API Request Flow

### Example: User Bookmarks a Blog Post

```
[Client] User clicks "Bookmark" button on blog post
    │
    ▼
[Client] Optimistic update (show bookmarked state immediately)
    │
    ▼
[Client] POST /api/dashboard/bookmarks
         Body: { targetType: 'blog', targetId: 'post-123' }
    │
    ▼
[Server] Authenticate request (Clerk middleware)
    │
    ├─ If not authenticated → 401 Unauthorized
    │
    ▼
[Server] Validate input
    │
    ├─ If invalid → 400 Bad Request
    │
    ▼
[Server] Check for duplicate bookmark
    │
    ├─ If exists → 409 Conflict
    │
    ▼
[Server] Create Bookmark document
         {
           userId: user._id,
           targetType: 'blog',
           targetId: 'post-123',
           createdAt: Date.now()
         }
    │
    ▼
[Server] Save to MongoDB
    │
    ▼
[Server] Return success response
         { success: true, data: { id: 'bookmark-abc', ... } }
    │
    ▼
[Client] Confirm optimistic update (or revert on error)
    │
    ▼
[Client] Invalidate cache for /api/dashboard/bookmarks
    │
    ▼
[Client] Show success toast: "Saved for later"
```

---

## 🎨 Component State Management

```
Dashboard State Architecture
│
├── Server State (React Query)
│   ├── Query: 'dashboard-summary'
│   │   └─ Fetches: /api/dashboard/summary
│   │
│   ├── Query: 'dashboard-activity'
│   │   └─ Fetches: /api/dashboard/activity
│   │
│   ├── Query: 'dashboard-bookmarks'
│   │   └─ Fetches: /api/dashboard/bookmarks
│   │
│   ├── Query: 'dashboard-goals'
│   │   └─ Fetches: /api/dashboard/goals
│   │
│   └── Query: 'dashboard-analytics'
│       └─ Fetches: /api/dashboard/analytics
│
├── Local UI State (useState)
│   ├── activeTab: 'learning' | 'content' | 'social' | ...
│   ├── filterType: 'all' | 'courses' | 'blog' | 'projects'
│   ├── viewMode: 'grid' | 'list'
│   └── showGoalModal: boolean
│
└── Derived State (useMemo)
    ├── filteredActivities (from activity + filterType)
    ├── completionPercentage (from goals + progress)
    └── recommendedActions (from analytics + goals)
```

---

## 🔐 Authentication & Authorization Flow

```
Request arrives at /api/dashboard/*
    │
    ▼
[Middleware] Clerk auth() check
    │
    ├─ No session → 401 Unauthorized
    │
    ▼
[Middleware] Extract userId from Clerk
    │
    ▼
[API Handler] Find User in MongoDB by clerkId
    │
    ├─ User not found → 404 Not Found
    │
    ▼
[API Handler] Use user._id for all queries
    │
    ▼
[Database] All queries filtered by: { userId: user._id }
    │
    └─ Ensures user only accesses their own data
    │
    ▼
[Response] Return filtered results
```

---

## 📊 Caching Strategy

```
Layer 1: Browser Cache
   ├── Static assets (JS, CSS): 1 year
   ├── Images: 1 year (immutable)
   └── API responses: No cache (controlled by server)
   
Layer 2: React Query Cache (Client)
   ├── dashboard-summary: 5 min stale, refetch on focus
   ├── dashboard-activity: 1 min stale, background updates
   ├── dashboard-bookmarks: 10 min stale, optimistic updates
   ├── dashboard-goals: 10 min stale, optimistic updates
   └── dashboard-analytics: 30 min stale, prefetch on idle
   
Layer 3: Server Cache (Redis/In-Memory)
   ├── Analytics calculations: 5 min TTL
   ├── Activity aggregations: 1 min TTL
   ├── Recommendation results: 1 hour TTL
   └── User stats: 10 min TTL
   
Layer 4: Database (MongoDB)
   ├── Indexes for fast queries
   ├── Aggregation pipelines
   └── Pre-computed fields where possible
```

---

## 🚀 Performance Optimization Points

```
1. Initial Load Optimization
   ├── Server-side render (SSR) for above-the-fold
   ├── Streaming SSR for slow data
   ├── Prefetch critical data in parallel
   └── Show skeleton screens immediately

2. Component Optimization
   ├── React.memo on expensive components
   ├── useMemo for derived calculations
   ├── useCallback for event handlers
   ├── Code-splitting with lazy()
   └── Virtual scrolling for long lists

3. Network Optimization
   ├── Parallel API requests
   ├── Request deduplication
   ├── Optimistic updates
   ├── Background prefetching
   └── GraphQL batching (future)

4. Database Optimization
   ├── Indexes on all query fields
   ├── Compound indexes for common queries
   ├── Aggregation pipeline optimization
   ├── Connection pooling
   └── Read replicas for analytics

5. Asset Optimization
   ├── Next.js Image optimization
   ├── SVG sprites for icons
   ├── Font subsetting
   ├── Critical CSS inline
   └── Lazy load below-the-fold
```

---

## 📈 Monitoring & Observability

```
Monitoring Stack
│
├── Application Performance
│   ├── Vercel Analytics (page views, speed)
│   ├── Web Vitals (CLS, LCP, FID, INP)
│   └── Custom metrics (API latency, error rates)
│
├── Error Tracking
│   ├── Sentry for runtime errors
│   ├── Source maps for stack traces
│   └── User context attached to errors
│
├── User Analytics
│   ├── Event tracking (dashboard_viewed, etc.)
│   ├── Conversion funnels
│   └── Feature adoption metrics
│
├── Database Monitoring
│   ├── MongoDB Atlas metrics
│   ├── Query performance insights
│   └── Index usage statistics
│
└── Alerting
    ├── Error rate > 1% → Slack + PagerDuty
    ├── API latency p95 > 1s → Slack
    ├── Database connection pool exhausted → PagerDuty
    └── User session crashes > 5% → Slack
```

---

## 🎯 Success Metrics Dashboard

```
Executive Dashboard (Stakeholders)
├── User Engagement
│   ├── Daily Active Users (DAU)
│   ├── Weekly Active Users (WAU)
│   ├── Session Duration (target: > 5 min)
│   └── Return Rate (target: > 70%)
│
├── Feature Adoption
│   ├── % users using Quick Actions (target: > 80%)
│   ├── % users setting goals (target: > 50%)
│   ├── % users bookmarking (target: > 30%)
│   └── % users viewing 3+ sections (target: > 50%)
│
├── Content Engagement
│   ├── Courses resumed from dashboard
│   ├── Recommendations clicked (target CTR: > 25%)
│   ├── Bookmarks created per user
│   └── Goals completed (target: > 40%)
│
└── Technical Health
    ├── Page Load Time (target: < 2s)
    ├── API Response Time p95 (target: < 500ms)
    ├── Error Rate (target: < 0.1%)
    └── Uptime (target: 99.9%)
```

---

**Created**: October 8, 2025  
**Version**: 1.0  
**Status**: Architecture Complete ✅
