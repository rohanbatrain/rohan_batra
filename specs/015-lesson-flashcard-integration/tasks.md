# Tasks: Lesson Flashcard Integration

**Feature ID**: 015-lesson-flashcard-integration  
**Branch**: `015-lesson-flashcard-integration`  
**Estimated Time**: 8-12 hours

---

## Prerequisites

- [x] Backend schema supports lesson flashcards (`CourseLesson.flashcardDeckIds`)
- [x] FlashcardDeck supports lesson scope linkTargets
- [x] Flashcard review components exist (`ReviewButtons.tsx`)
- [ ] Lesson page route (empty, needs implementation)

---

## Task Breakdown

### Phase 1: Lesson Page Foundation (3-4 hours)

#### T001: Create Lesson Page Route ⏳
**File**: `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx`  
**Priority**: HIGH (blocking)  
**Time**: 1.5 hours

**Requirements**:
- Fetch course by slug
- Fetch lesson by ID (with course/module validation)
- Fetch enrollment (if user authenticated)
- Fetch user progress (if enrolled)
- Check authorization (enrolled OR previewable)
- Handle 404, 401, 403 errors

**Data to fetch**:
```typescript
{
  course: Course;
  lesson: CourseLesson;
  module: CourseModule;
  enrollment: CourseEnrollment | null;
  progress: CourseProgress | null;
  flashcardDecks: FlashcardDeck[];
}
```

**Acceptance Criteria**:
- [ ] Page renders with lesson title
- [ ] Shows 404 if lesson not found
- [ ] Shows 403 if not enrolled and not previewable
- [ ] Passes data to LessonViewer component
- [ ] SEO metadata (title, description, OG tags)

---

#### T002: Create LessonHeader Component ⏳
**File**: `/src/components/courses/LessonHeader.tsx`  
**Priority**: HIGH  
**Time**: 1 hour

**Props**:
```typescript
interface LessonHeaderProps {
  course: Course;
  lesson: CourseLesson;
  module: CourseModule;
  isCompleted: boolean;
  onToggleComplete: () => Promise<void>;
  flashcardDueCount?: number;
}
```

**UI Elements**:
- Breadcrumb: Course > Module > Lesson
- Lesson title + subtitle
- Completion badge (if completed)
- Action buttons:
  - [ ] Mark Complete / Mark Incomplete
  - [ ] Study Flashcards (if decks exist, badge with due count)
  - [ ] Share (copy link)
  - [ ] Bookmark (future)

**Acceptance Criteria**:
- [ ] Breadcrumb links work
- [ ] Toggle complete works (optimistic UI)
- [ ] Flashcard button shows due count badge
- [ ] Mobile responsive (stacked buttons on small screens)

---

#### T003: Create LessonContentViewer Component ⏳
**File**: `/src/components/courses/LessonContentViewer.tsx`  
**Priority**: HIGH  
**Time**: 1.5 hours

**Props**:
```typescript
interface LessonContentViewerProps {
  lesson: CourseLesson;
  isEnrolled: boolean;
  isPreview?: boolean;
}
```

**Content Type Routing**:
```typescript
switch (lesson.contentType) {
  case 'blog':
    return <BlogLessonContent blogSlug={lesson.blogSlug} />;
  
  case 'video':
    return <VideoLessonContent externalResource={lesson.externalResource} />;
  
  case 'quiz':
    return <QuizLessonContent quizId={lesson.quizId} />;
  
  case 'standalone':
    return <StandaloneLessonContent 
      content={lesson.standaloneContent}
      format={lesson.standaloneFormat}
    />;
  
  case 'flashcards':
    return <FlashcardsOnlyLesson 
      deckIds={lesson.flashcardDeckIds}
      lessonId={lesson.id}
    />;
  
  default:
    return <EmptyState />;
}
```

**Sub-Components**:
- BlogLessonContent (fetch blog post by slug, render MDX)
- VideoLessonContent (embed YouTube/Vimeo/Loom)
- QuizLessonContent (load quiz, show questions)
- StandaloneLessonContent (render markdown/MDX)
- FlashcardsOnlyLesson (redirect to flashcard section)

**Acceptance Criteria**:
- [ ] All content types render correctly
- [ ] Blog content fetches and renders MDX
- [ ] Video embeds work (responsive iframe)
- [ ] Quiz loads and tracks progress
- [ ] Standalone content renders with proper formatting
- [ ] Loading states for async content

---

### Phase 2: Flashcard Integration (3-4 hours)

#### T004: Create LessonFlashcardsSection Component ⏳
**File**: `/src/components/courses/LessonFlashcardsSection.tsx`  
**Priority**: HIGH  
**Time**: 2 hours

**Props**:
```typescript
interface LessonFlashcardsSectionProps {
  lessonId: string;
  courseSlug: string;
  deckIds: string[];
  isEnrolled: boolean;
}
```

**Features**:
- Fetch deck summaries with user progress
- Display deck cards with:
  - Title, card count, due count
  - Last reviewed timestamp
  - Progress ring (% mastered)
  - Quick Review button (10 cards)
  - Full Study button (all cards)
- "Review All Decks" button (combined review)
- Empty state if no decks attached

**API Call**:
```typescript
const { data } = useSWR(
  `/api/courses/${courseSlug}/lessons/${lessonId}/flashcards`,
  fetcher
);
```

**Acceptance Criteria**:
- [ ] Displays all lesson decks
- [ ] Shows due count badges
- [ ] Quick Review opens modal with 10 cards
- [ ] Full Study navigates to deck review page
- [ ] Review All combines cards from all decks
- [ ] Loading skeleton while fetching
- [ ] Empty state if no decks

---

#### T005: Create API Route - GET /api/courses/[courseId]/lessons/[lessonId]/flashcards ⏳
**File**: `/src/app/api/courses/[courseId]/lessons/[lessonId]/flashcards/route.ts`  
**Priority**: HIGH  
**Time**: 1 hour

**Query Params**:
- `includeProgress` (boolean, default: true if authenticated)

**Logic**:
1. Validate courseId and lessonId (ObjectId format)
2. Fetch lesson by ID
3. Verify lesson.courseId matches courseId
4. Fetch all decks in lesson.flashcardDeckIds
5. If user authenticated, fetch FlashcardProgress for each deck
6. Calculate due counts, mastered counts, new counts
7. Return summary

**Response Schema**:
```typescript
{
  lesson: {
    id: string;
    title: string;
    flashcardDeckIds: string[];
  };
  decks: Array<{
    id: string;
    slug: string;
    title: string;
    cardCount: number;
    dueCount: number;
    newCount: number;
    masteredCount: number;
    lastReviewed: string | null;
  }>;
  totalStats: {
    totalDecks: number;
    totalCards: number;
    totalDue: number;
    estimatedMinutes: number;
  };
}
```

**Acceptance Criteria**:
- [ ] Returns 404 if lesson not found
- [ ] Returns 404 if courseId doesn't match
- [ ] Includes user progress if authenticated
- [ ] Calculates due counts correctly
- [ ] Estimates study time (2 min per 10 cards)
- [ ] Handles empty flashcardDeckIds gracefully

---

#### T006: Integrate Flashcard Review Flow ⏳
**File**: `/src/components/courses/QuickReviewModal.tsx`  
**Priority**: MEDIUM  
**Time**: 1 hour

**Props**:
```typescript
interface QuickReviewModalProps {
  lessonId: string;
  deckIds: string[];
  isOpen: boolean;
  onClose: () => void;
  mode: 'quick' | 'full';
}
```

**Flow**:
1. Fetch cards (10 for quick, all for full)
2. Shuffle if quick mode
3. Render ReviewButtons component (existing)
4. Track progress (X/10 cards)
5. On complete: Update FlashcardProgress, close modal
6. Save study session with lessonId context

**Acceptance Criteria**:
- [ ] Quick mode shows 10 cards max
- [ ] Full mode shows all cards
- [ ] Progress bar updates in real-time
- [ ] Closing modal saves partial progress
- [ ] Study session includes lessonId for analytics
- [ ] Keyboard shortcuts work (Space, Enter)

---

### Phase 3: Enhanced Features (2-3 hours)

#### T007: Add Flashcard Button to Lesson Header ⏳
**File**: `/src/components/courses/LessonHeader.tsx` (update T002)  
**Priority**: MEDIUM  
**Time**: 30 min

**Changes**:
- Add flashcard button next to "Mark Complete"
- Fetch due count from LessonFlashcardsSection data
- Badge shows total due cards across all decks
- Click opens QuickReviewModal

**Example**:
```tsx
{flashcardDueCount > 0 && (
  <Button variant="secondary" onClick={openQuickReview}>
    <Book className="h-4 w-4" />
    Study ({flashcardDueCount} due)
  </Button>
)}
```

**Acceptance Criteria**:
- [ ] Button appears only if lesson has decks
- [ ] Badge shows accurate due count
- [ ] Opens QuickReviewModal on click
- [ ] Disabled if no cards due

---

#### T008: Course Page Enhancement - Flashcard Badges ⏳
**File**: `/src/app/courses/[slug]/page.tsx`  
**Priority**: LOW  
**Time**: 30 min

**Changes**:
- Add flashcard badge to lesson items in module outline
- Show deck count: "📚 3 decks"
- Click badge: Scroll to lesson flashcard section (if on lesson page)

**Example**:
```tsx
{lesson.flashcardDeckIds?.length > 0 && (
  <Badge variant="outline" className="text-xs">
    <Book className="h-3 w-3" />
    {lesson.flashcardDeckIds.length} deck{lesson.flashcardDeckIds.length > 1 ? 's' : ''}
  </Badge>
)}
```

**Acceptance Criteria**:
- [ ] Badge appears on lessons with decks
- [ ] Shows accurate deck count
- [ ] Doesn't interfere with existing layout
- [ ] Mobile responsive

---

#### T009: Knowledge Graph Integration - Flashcard Indicators ⏳
**File**: `/src/lib/graph/generator.ts` (update buildCourseGraph)  
**Priority**: LOW  
**Time**: 1 hour

**Changes**:
1. Add `flashcardCount` field to GraphNode type
2. Populate in buildCourseGraph:
   ```typescript
   flashcardCount: lesson.flashcardDeckIds?.length ?? 0
   ```
3. Update GraphNodeTooltip to show flashcard count
4. Add filter option to show only lessons with flashcards

**Acceptance Criteria**:
- [ ] Graph nodes include flashcard count
- [ ] Tooltip shows "📚 3 decks" if > 0
- [ ] Filter works: Show only nodes with flashcards
- [ ] Visual indicator (different color/icon)

---

#### T010: Progress Visualization - Flashcard Mastery ⏳
**File**: `/src/components/courses/FlashcardProgressRing.tsx`  
**Priority**: LOW  
**Time**: 1 hour

**Component**:
```tsx
<FlashcardProgressRing
  mastered={10}
  total={30}
  size="md"
  showPercentage={true}
/>
```

**Features**:
- Circular progress ring (SVG)
- Color gradient: red (0%) -> yellow (50%) -> green (100%)
- Percentage text in center
- Tooltip: "10 of 30 cards mastered"

**Acceptance Criteria**:
- [ ] Renders correctly at different sizes (sm, md, lg)
- [ ] Colors interpolate smoothly
- [ ] Accessible (ARIA label)
- [ ] Performant (no re-renders on hover)

---

### Phase 4: Testing & Polish (1-2 hours)

#### T011: Unit Tests - Lesson Flashcards API ⏳
**File**: `/src/__tests__/api/lesson-flashcards.test.ts`  
**Priority**: MEDIUM  
**Time**: 1 hour

**Test Cases**:
- [ ] Returns 404 if lesson not found
- [ ] Returns 404 if courseId doesn't match
- [ ] Returns all decks for lesson
- [ ] Includes user progress when authenticated
- [ ] Calculates due counts correctly
- [ ] Handles empty flashcardDeckIds
- [ ] Returns 401 if not authenticated and lesson not previewable

---

#### T012: Component Tests - LessonFlashcardsSection ⏳
**File**: `/src/__tests__/components/LessonFlashcardsSection.test.tsx`  
**Priority**: MEDIUM  
**Time**: 1 hour

**Test Cases**:
- [ ] Displays all decks
- [ ] Shows correct due counts
- [ ] Quick Review button opens modal
- [ ] Full Study button navigates correctly
- [ ] Review All combines decks
- [ ] Loading state renders
- [ ] Empty state renders if no decks

---

## Summary

### Total Tasks: 12
- **Phase 1 (Foundation)**: 3 tasks (3-4 hours)
- **Phase 2 (Flashcards)**: 3 tasks (3-4 hours)
- **Phase 3 (Enhancements)**: 4 tasks (2-3 hours)
- **Phase 4 (Testing)**: 2 tasks (1-2 hours)

### Estimated Total Time: 8-12 hours

### Critical Path:
1. T001 (Lesson Page) → T002 (Header) → T003 (Viewer)
2. T005 (API) → T004 (Flashcards Section)
3. T006 (Review Modal) → T007 (Header Button)

### Dependencies:
- T001 blocks all other tasks
- T005 blocks T004, T006
- T002 updated by T007

---

## Next Steps

1. **Create feature branch**: `git checkout -b 015-lesson-flashcard-integration`
2. **Start with T001**: Implement lesson page route (highest priority)
3. **Run typecheck**: Validate as you go
4. **Test locally**: Use existing course data
5. **Commit incrementally**: After each task completion

---

**Ready to implement?** Start with T001 - Lesson Page Route!
