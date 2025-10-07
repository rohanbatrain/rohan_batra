# Feature: Lesson-Level Flashcard Integration

**Goal**: Enable flashcard review within lesson pages, allowing students to study lesson-specific decks without leaving the learning flow.

## Current State Analysis

### ✅ Existing Backend Support
- **CourseLesson Model**: Has `flashcardDeckIds: ObjectId[]` field
- **FlashcardDeck Model**: Has `linkTargets` with `scope: 'lesson'` support
- **Lesson CRUD API**: Already handles deck attachment/detachment
- **Sync Service**: `syncDeckLinkTargets` maintains bidirectional links

### ⚠️ Missing Components
1. **Lesson Page**: `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx` is **empty** (0 bytes)
2. **Lesson Viewer Component**: No UI to display lesson content
3. **In-Lesson Flashcard UI**: No component to show/review lesson decks
4. **Flashcard Review API**: No endpoint to fetch lesson-scoped deck progress

---

## Architecture Design

### Data Flow

```
Course Page
  └─> Lesson List (with deck indicators)
       └─> Click Lesson
            └─> Lesson Page (/courses/[slug]/lesson/[lessonId])
                 ├─> Lesson Content Viewer
                 │    ├─> Blog/Video/Quiz/Standalone
                 │    └─> Completion Tracking
                 │
                 └─> Lesson Flashcards Section
                      ├─> Deck List (from lesson.flashcardDeckIds)
                      ├─> Quick Review Mode (10 cards)
                      ├─> Full Study Mode (all cards)
                      └─> Progress Indicator (cards due)
```

### Component Hierarchy

```tsx
<LessonPage>
  <LessonHeader course={} lesson={} />
  
  <LessonContentViewer lesson={}>
    {/* Renders based on contentType */}
    {contentType === 'blog' && <BlogContent />}
    {contentType === 'video' && <VideoPlayer />}
    {contentType === 'quiz' && <QuizViewer />}
    {contentType === 'standalone' && <StandaloneContent />}
  </LessonContentViewer>

  {lesson.flashcardDeckIds?.length > 0 && (
    <LessonFlashcardsSection 
      lessonId={lesson.id}
      deckIds={lesson.flashcardDeckIds}
      courseSlug={course.slug}
    />
  )}

  <LessonNavigation prev={} next={} />
</LessonPage>
```

---

## Implementation Tasks

### Phase 1: Lesson Page Foundation (2-3 hours)

**T001**: Create Lesson Page Route ✅ (exists but empty)
- File: `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx`
- Fetch: Course, lesson, enrollment, progress data
- Handle: Authentication, authorization, preview mode
- Status: **TO IMPLEMENT**

**T002**: Create LessonHeader Component
- File: `/src/components/courses/LessonHeader.tsx`
- Display: Course breadcrumb, lesson title, completion status
- Actions: Mark complete, bookmark, share

**T003**: Create LessonContentViewer Component
- File: `/src/components/courses/LessonContentViewer.tsx`
- Switch: Blog, Video, Quiz, Standalone, Flashcards
- Handle: Content loading, error states
- Track: View duration, scroll progress

### Phase 2: Flashcard Integration (3-4 hours)

**T004**: Create LessonFlashcardsSection Component
- File: `/src/components/courses/LessonFlashcardsSection.tsx`
- Display: All decks attached to lesson
- Show: Due card count, total cards, last reviewed
- Modes: Quick Review (10 cards), Full Study, Browse

**T005**: Create API Route - Lesson Deck Summary
- File: `/src/app/api/courses/[courseId]/lessons/[lessonId]/flashcards/route.ts`
- GET: Fetch all decks for lesson with user progress
- Response:
  ```json
  {
    "decks": [
      {
        "id": "deck_id",
        "title": "Lesson 1 Vocabulary",
        "cardCount": 25,
        "dueCount": 10,
        "lastReviewed": "2025-10-06T10:00:00Z",
        "scope": "lesson"
      }
    ]
  }
  ```

**T006**: Integrate Flashcard Review Flow
- Reuse: `/src/components/flashcards/ReviewButtons.tsx` (already exists)
- Add: Lesson context to study session
- Track: `FlashcardStudySession.lessonId` for analytics

**T007**: Add "Study Flashcards" Button to Lesson Header
- Position: Next to "Mark Complete" button
- Behavior: Opens modal/drawer with deck selection
- Badge: Shows total due cards across all lesson decks

### Phase 3: Enhanced Features (2-3 hours)

**T008**: Quick Review Mode
- Component: `/src/components/courses/QuickReviewModal.tsx`
- Flow: Select random 10 due cards from lesson decks
- Exit: Return to lesson, update progress
- Analytics: Track completion rate

**T009**: Deck Grouping by Lesson (Course Page Enhancement)
- Location: Course page knowledge graph or lesson list
- Display: "📚 5 flashcard decks" badge on lessons with decks
- Click: Direct link to lesson flashcards section

**T010**: Progress Visualization
- Component: Circular progress ring showing cards mastered
- Display: On lesson header and course outline
- Formula: `mastered / total * 100`

### Phase 4: Knowledge Graph Integration (1-2 hours)

**T011**: Add Flashcard Indicators to Graph Nodes
- File: `/src/components/courses/GraphNodeTooltip.tsx` (already created)
- Show: 📚 icon if lesson has flashcard decks
- Tooltip: "3 decks, 15 cards due"

**T012**: Create Lesson Graph with Flashcard Filter
- Extend: `/src/app/api/courses/[courseId]/lessons/[lessonSlug]/graph/route.ts`
- Filter: Show only lessons with flashcards (optional query param)
- Use Case: "Study Path" - navigate lessons with review cards

---

## API Specifications

### GET /api/courses/[courseId]/lessons/[lessonId]/flashcards

**Query Params**:
- `includeProgress` (boolean) - Include user's progress data

**Response**:
```json
{
  "lesson": {
    "id": "lesson_123",
    "title": "Introduction to TypeScript",
    "flashcardDeckIds": ["deck_1", "deck_2"]
  },
  "decks": [
    {
      "id": "deck_1",
      "slug": "typescript-basics",
      "title": "TypeScript Basics",
      "cardCount": 30,
      "dueCount": 12,
      "newCount": 5,
      "reviewCount": 13,
      "masteredCount": 10,
      "lastReviewed": "2025-10-06T14:30:00Z",
      "linkTarget": {
        "scope": "lesson",
        "lessonId": "lesson_123"
      }
    }
  ],
  "totalStats": {
    "totalDecks": 2,
    "totalCards": 55,
    "totalDue": 20,
    "estimatedMinutes": 15
  }
}
```

### POST /api/courses/[courseId]/lessons/[lessonId]/flashcards/quick-review

**Body**:
```json
{
  "cardLimit": 10,
  "includeNew": true
}
```

**Response**:
```json
{
  "sessionId": "session_789",
  "cards": [/* array of 10 cards */],
  "estimatedMinutes": 5
}
```

---

## UI/UX Design

### Lesson Flashcards Section Layout

```
┌─────────────────────────────────────────────────────┐
│  📚 Flashcards for this Lesson                      │
│                                                     │
│  ┌────────────────┐  ┌────────────────┐           │
│  │ TypeScript     │  │ Advanced       │           │
│  │ Basics         │  │ Patterns       │           │
│  │                │  │                │           │
│  │ 30 cards       │  │ 25 cards       │           │
│  │ 12 due now     │  │ 8 due now      │           │
│  │                │  │                │           │
│  │ [Quick Review] │  │ [Quick Review] │           │
│  │ [Full Study]   │  │ [Full Study]   │           │
│  └────────────────┘  └────────────────┘           │
│                                                     │
│  Or review all decks together:                     │
│  [Quick Review All (20 cards)] [Study All (55)]   │
└─────────────────────────────────────────────────────┘
```

### Lesson Header with Flashcard Button

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Course                                   │
│                                                     │
│  Lesson 3: Introduction to TypeScript              │
│  ────────────────────────────────────────          │
│                                                     │
│  [Mark Complete] [📚 Study (20 due)] [Share]      │
└─────────────────────────────────────────────────────┘
```

### Quick Review Modal

```
┌─────────────────────────────────────────────────────┐
│  Quick Review: 10 Cards                        × │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  Progress: ████████░░ 8/10                         │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │                                               │ │
│  │  What is the TypeScript `unknown` type?      │ │
│  │                                               │ │
│  │  [Show Answer]                                │ │
│  │                                               │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  From deck: TypeScript Basics                      │
└─────────────────────────────────────────────────────┘
```

---

## Database Schema Updates

### No Schema Changes Required! ✅

The existing schema already supports this:

```typescript
// CourseLesson (existing)
interface CourseLesson {
  flashcardDeckIds: ObjectId[]; // ✅ Already exists
}

// FlashcardDeck (existing)
interface FlashcardDeck {
  linkTargets: Array<{
    scope: 'lesson'; // ✅ Already supported
    courseId: ObjectId;
    moduleId: ObjectId;
    lessonId: ObjectId;
  }>;
}

// FlashcardStudySession (existing)
interface FlashcardStudySession {
  lessonId?: ObjectId; // ✅ Already exists for analytics
}
```

---

## Integration Points

### 1. Course Page Enhancement
- **File**: `/src/app/courses/[slug]/page.tsx`
- **Change**: Add flashcard badge to lesson items
```tsx
{lesson.flashcardDeckIds?.length > 0 && (
  <Badge variant="secondary">
    📚 {lesson.flashcardDeckIds.length} deck{lesson.flashcardDeckIds.length > 1 ? 's' : ''}
  </Badge>
)}
```

### 2. Knowledge Graph Integration
- **File**: `/src/components/courses/GraphNodeTooltip.tsx`
- **Change**: Add flashcard count to tooltip
```tsx
{node.data.flashcardCount > 0 && (
  <div className="flex items-center gap-1">
    <Book className="h-3 w-3" />
    <span>{node.data.flashcardCount} decks</span>
  </div>
)}
```

### 3. Admin Lesson Editor
- **File**: `/src/components/admin/courses/LessonForm.tsx` (if exists)
- **Change**: Show attached deck count, link to deck manager

---

## Analytics Enhancements

### Track Study Context

```typescript
interface FlashcardStudySession {
  // Existing fields
  deckId: ObjectId;
  userId: ObjectId;
  
  // Enhanced context
  studyContext: {
    source: 'standalone' | 'course' | 'lesson' | 'quick_review';
    courseId?: ObjectId;
    moduleId?: ObjectId;
    lessonId?: ObjectId;
  };
}
```

**Use Cases**:
1. Measure lesson completion with/without flashcard review
2. Identify which lessons benefit most from flashcards
3. Recommend optimal flashcard placement in course structure

---

## Success Metrics

### User Engagement
- **Lesson completion rate** with vs without flashcard review
- **Time spent on flashcards** per lesson (target: 3-5 min)
- **Return rate** to lessons for flashcard review

### Learning Outcomes
- **Retention rate** (cards mastered / total cards)
- **Review frequency** (sessions per week)
- **Streak length** (consecutive days studying)

### Feature Adoption
- **% of lessons** with attached flashcards
- **% of students** using lesson flashcards
- **Quick Review** vs **Full Study** mode usage

---

## Testing Strategy

### Unit Tests
```typescript
// /src/lib/__tests__/lesson-flashcards.test.ts
describe('getLessonDecksSummary', () => {
  it('fetches all decks for lesson with user progress', async () => {
    const summary = await getLessonDecksSummary(lessonId, userId);
    expect(summary.decks).toHaveLength(2);
    expect(summary.totalStats.totalDue).toBe(20);
  });
});
```

### Integration Tests
```typescript
// /src/__tests__/api/lesson-flashcards.test.ts
describe('GET /api/courses/[id]/lessons/[id]/flashcards', () => {
  it('returns deck summary with user progress', async () => {
    const response = await GET(req, { params: { lessonId: '123' }});
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.decks).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// /tests/e2e/lesson-flashcards.spec.ts
test('student can review flashcards from lesson page', async ({ page }) => {
  await page.goto('/courses/typescript-101/lesson/1');
  await page.click('[data-testid="study-flashcards"]');
  await page.click('[data-testid="quick-review"]');
  // ... complete review flow
  expect(page.locator('[data-testid="review-complete"]')).toBeVisible();
});
```

---

## Migration & Rollout

### Phase 1: Backend API (Week 1)
- T005: Create lesson flashcards API
- T006: Update study session tracking

### Phase 2: Basic UI (Week 1-2)
- T001-T003: Lesson page foundation
- T004: Flashcard section component

### Phase 3: Enhanced Features (Week 2)
- T007-T010: Quick review, progress viz
- Course page enhancements

### Phase 4: Integration (Week 2-3)
- T011-T012: Knowledge graph integration
- Analytics dashboard updates

### Launch Checklist
- [ ] All lesson pages render correctly
- [ ] Flashcard review flow works end-to-end
- [ ] Progress tracking updates in real-time
- [ ] Mobile responsive (all screen sizes)
- [ ] Keyboard navigation works
- [ ] Analytics events fire correctly
- [ ] Error handling covers edge cases

---

## Future Enhancements

### Smart Review
- **Spaced Repetition**: Auto-schedule cards based on SM-2 algorithm
- **Adaptive Difficulty**: Adjust card frequency based on performance
- **Topic Clustering**: Group related cards across lessons

### Social Features
- **Study Groups**: Collaborative review sessions
- **Leaderboards**: Top performers per lesson/course
- **Shared Decks**: Import community-created lesson decks

### AI Integration
- **Auto-Generate Cards**: From lesson content (blog/video)
- **Smart Hints**: Context-aware help during review
- **Personalized Study Plans**: AI-recommended review schedule

---

## Questions & Decisions

### Q1: Should lesson flashcards be mandatory for completion?
**Decision**: Optional by default, configurable per course
- Admin can toggle "Require flashcard review" per lesson
- Track completion separately from main lesson progress

### Q2: How to handle multiple decks in Quick Review?
**Decision**: Weighted random selection
- Pick cards from all decks proportional to due count
- Ensure at least 1 card from each deck (if < 10 decks)

### Q3: Where to show flashcard progress on course page?
**Decision**: Multiple touchpoints
- Badge on lesson item (discrete)
- Knowledge graph tooltip (on hover)
- Dedicated "Flashcards" tab in course header (optional)

---

## Documentation

### User Guide
- How to study lesson flashcards
- Quick Review vs Full Study modes
- Tracking progress and streaks

### Admin Guide
- Attaching decks to lessons
- Creating lesson-scoped decks
- Analytics interpretation

### Developer Guide
- API reference for lesson flashcards
- Component props and usage
- Extending flashcard types

---

**Status**: Planning complete, ready for implementation
**Estimated Effort**: 8-12 hours (3 phases)
**Dependencies**: Lesson page implementation (T001)
**Next Step**: Implement T001 (Lesson Page Route)
