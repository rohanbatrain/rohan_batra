# Dashboard & Analytics Quick Start

**Date**: October 8, 2025  
**Time to Read**: 5 minutes  
**Purpose**: Get started with enhanced dashboards

---

## 🚀 Quick Access

### Admin Analytics Dashboard
```
URL: http://localhost:3000/admin/analytics
Role: Admin or Editor required
Features: All platform metrics, learning analytics, content stats
```

### User Dashboard API
```
Summary:          GET /api/dashboard/summary
Certificates:     GET /api/dashboard/certificates
Recommendations:  GET /api/dashboard/recommendations
```

---

## 📊 Admin Analytics Features

### 1. View Overall Metrics
Navigate to `/admin/analytics` to see:

**Content Statistics (8 Cards)**
- Blog Posts: Total + publication rate
- Projects: Total + featured percentage
- Courses: Total + publication rate ⭐ NEW
- Flashcard Decks: Total + card count ⭐ NEW

**Learning Metrics (4 Cards)** ⭐ NEW SECTION
- Total Enrollments: With completion rate
- Active Learners: Currently enrolled students
- Certificates Issued: Total + weekly count
- Flashcard Reviews: Total + unique learners

**Engagement Stats (4 Cards)**
- Comments, Likes, Users, Active Users

### 2. Time Range Selection
```tsx
// Available timeframes
['7d', '30d', '90d', '1y']

// Example usage
/admin/analytics?timeframe=7d
```

### 3. Cache Monitoring
```tsx
// Include cache statistics
/admin/analytics?includeCache=true

// View in "Cache Status" tab
- Connection status
- Total keys
- Memory usage
- Management controls
```

### 4. Content Tab
**New Progress Indicators:**
- Blog publication progress bar
- Project featured percentage bar
- Course publication progress bar ⭐ NEW
- Flashcard deck/card counts ⭐ NEW

---

## 👤 User Dashboard API

### 1. Get Dashboard Summary
```bash
curl http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response Includes:**
```typescript
{
  enrolledCourses: [...],      // All enrolled courses
  recommendedContent: [...],   // Personalized suggestions
  certificates: [...],         // Earned certificates
  metrics: {
    totalCourses: number,
    coursesInProgress: number,
    completionRate: number,
    streak: number
  },
  insights: {                  // ⭐ NEW
    totalLearningTime: 127800,
    averageCompletionRate: 64.5,
    coursesNearCompletion: 2,
    recentActivity: [...]
  },
  achievements: {              // ⭐ NEW
    certificatesEarned: 3,
    coursesCompleted: 5,
    currentStreak: 7,
    totalCourses: 8
  }
}
```

### 2. Get Certificates
```bash
curl http://localhost:3000/api/dashboard/certificates \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```typescript
{
  certificates: [...],         // All certificates
  summary: {
    total: 3,
    issued: 3,
    pending: 0,
    recent: [...]              // Last 3 certificates
  }
}
```

### 3. Get Recommendations
```bash
curl http://localhost:3000/api/dashboard/recommendations?limit=10 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```typescript
{
  recommendations: [...],
  summary: {
    total: 10,
    byCourse: 6,               // Course suggestions
    byBlog: 3,                 // Blog suggestions
    byBook: 1                  // Book suggestions
  }
}
```

---

## 💻 Frontend Integration Examples

### React Component - Admin Analytics
```tsx
import { useState, useEffect } from 'react';

function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');

  useEffect(() => {
    fetch(`/api/admin/analytics?timeframe=${timeframe}&includeCache=true`)
      .then(res => res.json())
      .then(result => setData(result.data));
  }, [timeframe]);

  if (!data) return <Loading />;

  return (
    <div>
      {/* Timeframe selector */}
      <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      
      {/* Learning metrics - NEW */}
      {data.learning && (
        <div className="grid grid-cols-4 gap-4">
          <MetricCard
            title="Active Enrollments"
            value={data.learning.enrollments.active}
            subtitle={`${data.learning.enrollments.completionRate}% completed`}
          />
          <MetricCard
            title="Certificates"
            value={data.learning.certificates.total}
            subtitle={`${data.learning.certificates.issuedThisWeek} this week`}
          />
          {/* More cards... */}
        </div>
      )}
      
      {/* Course content - NEW */}
      {data.content.courses && (
        <ProgressBar
          label="Courses Published"
          value={data.content.courses.publishedPercentage}
          total={data.content.courses.total}
        />
      )}
    </div>
  );
}
```

### React Component - User Dashboard
```tsx
import useSWR from 'swr';

function UserDashboard() {
  const { data, error } = useSWR('/api/dashboard/summary');

  if (error) return <Error />;
  if (!data) return <Loading />;

  return (
    <div>
      {/* Achievement badges - NEW */}
      <AchievementSection>
        <Badge icon="🏆" label="Certificates" value={data.achievements.certificatesEarned} />
        <Badge icon="✅" label="Completed" value={data.achievements.coursesCompleted} />
        <Badge icon="🔥" label="Streak" value={data.achievements.currentStreak} />
      </AchievementSection>

      {/* Smart insights - NEW */}
      {data.insights.coursesNearCompletion > 0 && (
        <Alert variant="success">
          You have {data.insights.coursesNearCompletion} courses above 80% completion!
          Keep going! 🎯
        </Alert>
      )}

      {/* Learning time - NEW */}
      <MetricCard
        title="Total Learning Time"
        value={formatSeconds(data.insights.totalLearningTime)}
        subtitle={`${data.insights.averageCompletionRate}% average completion`}
      />

      {/* Course list */}
      <CourseList courses={data.enrolledCourses} />
    </div>
  );
}
```

---

## 🎯 Common Use Cases

### 1. Track Course Adoption
```typescript
// Admin view
const courseMetrics = analytics.content.courses;
console.log(`
  Total Courses: ${courseMetrics.total}
  Published: ${courseMetrics.published}
  Publication Rate: ${courseMetrics.publishedPercentage}%
`);
```

### 2. Monitor Learning Progress
```typescript
// Admin view
const learning = analytics.learning;
console.log(`
  Active Learners: ${learning.enrollments.active}
  Completion Rate: ${learning.enrollments.completionRate}%
  Certificates Issued: ${learning.certificates.total}
`);
```

### 3. Track User Achievements
```typescript
// User view
const { achievements, insights } = dashboard;
console.log(`
  Certificates Earned: ${achievements.certificatesEarned}
  Current Streak: ${achievements.currentStreak} days
  Total Learning Time: ${insights.totalLearningTime / 3600} hours
`);
```

### 4. Find Courses to Complete
```typescript
// User view
const nearCompletion = dashboard.enrolledCourses.filter(
  course => course.progress?.percentageComplete >= 80 && 
            course.progress?.percentageComplete < 100
);
console.log(`You're close to completing ${nearCompletion.length} courses!`);
```

---

## 📈 Key Metrics Explained

### Admin Metrics

| Metric | Description | Location |
|--------|-------------|----------|
| `learning.enrollments.total` | All course enrollments | Learning section |
| `learning.enrollments.active` | Currently enrolled students | Learning section |
| `learning.enrollments.completionRate` | % of enrollments completed | Learning section |
| `learning.certificates.total` | Total certificates issued | Learning section |
| `learning.flashcards.totalReviews` | All flashcard study sessions | Learning section |
| `content.courses.publishedPercentage` | % of courses published | Content tab |
| `content.flashcards.avgCardsPerDeck` | Average deck size | Content tab |

### User Metrics

| Metric | Description | API Endpoint |
|--------|-------------|--------------|
| `insights.totalLearningTime` | Total seconds spent learning | `/summary` |
| `insights.averageCompletionRate` | Average % across all courses | `/summary` |
| `insights.coursesNearCompletion` | Courses 80%+ complete | `/summary` |
| `achievements.certificatesEarned` | Total certificates earned | `/summary` |
| `achievements.currentStreak` | Current learning streak | `/summary` |
| `metrics.completionRate` | Overall completion % | `/summary` |

---

## 🔧 Configuration

### Query Parameters

#### Admin Analytics
```typescript
interface AnalyticsParams {
  timeframe?: '7d' | '30d' | '90d' | '1y';  // Default: '30d'
  includeCache?: boolean;                    // Default: false
  include?: 'all' | 'content' | 'users';   // Default: 'all'
}
```

#### User Dashboard
```typescript
interface DashboardParams {
  includeRecommendations?: boolean;  // Default: true
  recommendationsLimit?: number;     // Default: 6
  limit?: number;                    // For recommendations endpoint
}
```

### Caching Strategy
```typescript
// Recommended cache durations
{
  adminAnalytics: 300,      // 5 minutes
  userDashboard: 60,        // 1 minute
  certificates: 1800,       // 30 minutes
  recommendations: 3600     // 1 hour
}
```

---

## 🚨 Troubleshooting

### Admin Analytics Shows Zero Courses
**Cause**: Course model import failed or no courses exist  
**Solution**: Check database, verify Course model exists
```bash
# Verify courses exist
curl http://localhost:3000/api/admin/courses
```

### User Dashboard Missing Insights
**Cause**: No enrollments or progress data  
**Solution**: Enroll in a course first
```bash
# Check enrollments
curl http://localhost:3000/api/courses/{courseId}/enroll -X POST
```

### Recommendations Empty
**Cause**: No DashboardRecommendation documents  
**Solution**: System will show generic recommendations
```typescript
// Recommendations fall back to generic when personalized not found
```

---

## 📝 Best Practices

### 1. Use Timeframes Appropriately
```typescript
// Short-term monitoring (daily checks)
timeframe: '7d'

// Regular monitoring (weekly reviews)
timeframe: '30d'

// Trend analysis (quarterly reports)
timeframe: '90d'

// Annual reviews
timeframe: '1y'
```

### 2. Combine Multiple Endpoints
```typescript
// Fetch all user data in parallel
const [summary, certificates, recommendations] = await Promise.all([
  fetch('/api/dashboard/summary'),
  fetch('/api/dashboard/certificates'),
  fetch('/api/dashboard/recommendations?limit=10')
]);
```

### 3. Handle Loading States
```typescript
// Use SWR or React Query for better UX
const { data, error, isLoading } = useSWR('/api/dashboard/summary', {
  refreshInterval: 60000,  // Refresh every minute
  revalidateOnFocus: true  // Refresh when tab gains focus
});
```

---

## 🎓 Next Steps

1. **Explore Admin Analytics**: Visit `/admin/analytics`
2. **Check Learning Metrics**: Review course adoption and completion rates
3. **Test User Dashboard**: Try the new API endpoints
4. **Build Custom Views**: Use the APIs to create custom dashboards
5. **Set Up Monitoring**: Track key metrics over time

---

## 📚 Related Resources

- **Full Documentation**: `DASHBOARD_ANALYTICS_ENHANCEMENTS.md`
- **API Contracts**: `specs/008-the-portfolio-website/contracts/api.yaml`
- **Dashboard Service**: `src/lib/services/dashboard-service.ts`
- **Type Definitions**: `src/types/dashboard.ts`

---

## ✅ Feature Checklist

Use this to verify everything works:

### Admin Analytics
- [ ] Can view overall metrics
- [ ] Learning section displays correctly
- [ ] Course metrics show up
- [ ] Flashcard metrics appear
- [ ] Timeframe selector works
- [ ] Content tab shows all progress bars
- [ ] Cache tab displays connection status

### User Dashboard API
- [ ] `/api/dashboard/summary` returns data
- [ ] Insights section includes new fields
- [ ] Achievements section populated
- [ ] `/api/dashboard/certificates` works
- [ ] `/api/dashboard/recommendations` returns suggestions
- [ ] All endpoints require authentication

---

**Ready to use? Start with the admin analytics dashboard at `/admin/analytics`!** 🚀
