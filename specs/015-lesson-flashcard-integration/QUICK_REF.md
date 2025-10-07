# Lesson Flashcard Integration - Quick Reference

## Overview

**Feature**: Enable flashcard review directly within lesson pages  
**Backend Support**: ✅ Already exists (`CourseLesson.flashcardDeckIds`)  
**Status**: Planning complete, ready to implement  
**Estimated Time**: 8-12 hours

---

## Quick Start

### 1. Create Feature Branch
```bash
git checkout -b 015-lesson-flashcard-integration
```

### 2. Implement in Order
1. **Lesson Page Route** (T001) - 1.5h
2. **Lesson Header** (T002) - 1h  
3. **Content Viewer** (T003) - 1.5h
4. **Flashcards API** (T005) - 1h
5. **Flashcards Section** (T004) - 2h
6. **Review Modal** (T006) - 1h

---

## Key Files to Create

### 📄 Pages
- `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx` - **MAIN PAGE** (empty now)

### 🔌 API Routes
- `/src/app/api/courses/[courseId]/lessons/[lessonId]/flashcards/route.ts` - Deck summary

### 🧩 Components
- `/src/components/courses/LessonHeader.tsx` - Breadcrumb + actions
- `/src/components/courses/LessonContentViewer.tsx` - Content switcher
- `/src/components/courses/LessonFlashcardsSection.tsx` - Deck list + review
- `/src/components/courses/QuickReviewModal.tsx` - Review UI
- `/src/components/courses/FlashcardProgressRing.tsx` - Visual progress

---

## Data Flow

```
Lesson Page
  ↓
Fetch: course, lesson, enrollment, progress
  ↓
Render: LessonHeader + LessonContentViewer
  ↓
If lesson.flashcardDeckIds exists:
  ↓
Render: LessonFlashcardsSection
  ↓
Fetch: /api/courses/{id}/lessons/{id}/flashcards
  ↓
Display: Deck cards with due counts
  ↓
Click "Quick Review": Open QuickReviewModal
  ↓
Study: 10 cards, track progress
  ↓
Complete: Update FlashcardProgress + CourseProgress
```

---

## API Specification

### GET /api/courses/[courseId]/lessons/[lessonId]/flashcards

**Response**:
```json
{
  "lesson": {
    "id": "lesson_123",
    "title": "Introduction to TypeScript"
  },
  "decks": [
    {
      "id": "deck_1",
      "title": "TypeScript Basics",
      "cardCount": 30,
      "dueCount": 12,
      "masteredCount": 10
    }
  ],
  "totalStats": {
    "totalDecks": 2,
    "totalCards": 55,
    "totalDue": 20
  }
}
```

---

## Component Props

### LessonHeader
```tsx
<LessonHeader
  course={course}
  lesson={lesson}
  module={module}
  isCompleted={progress?.completedLessonIds.includes(lesson.id)}
  onToggleComplete={handleToggleComplete}
  flashcardDueCount={totalDueCount}
/>
```

### LessonFlashcardsSection
```tsx
<LessonFlashcardsSection
  lessonId={lesson.id}
  courseSlug={course.slug}
  deckIds={lesson.flashcardDeckIds}
  isEnrolled={!!enrollment}
/>
```

---

## Database Queries

### Lesson Page Data Fetching
```typescript
// 1. Fetch course
const course = await CourseModel.findOne({ slug });

// 2. Fetch lesson (validate courseId)
const lesson = await CourseLessonModel.findById(lessonId);
if (lesson.courseId.toString() !== course._id.toString()) {
  notFound();
}

// 3. Fetch module
const module = await CourseModuleModel.findById(lesson.moduleId);

// 4. If authenticated, fetch enrollment + progress
const enrollment = await CourseEnrollmentModel.findOne({ 
  userId, 
  courseId: course._id 
});
const progress = await CourseProgressModel.findOne({ 
  userId, 
  courseId: course._id 
});

// 5. Fetch flashcard decks
const decks = await FlashcardDeckModel.find({
  _id: { $in: lesson.flashcardDeckIds }
});
```

---

## UI Layout

### Lesson Page Structure
```
┌──────────────────────────────────────────┐
│ Header: Course > Module > Lesson        │
│ [Mark Complete] [Study (20 due)]        │
├──────────────────────────────────────────┤
│                                          │
│  Lesson Content                          │
│  (Blog/Video/Quiz/Standalone)            │
│                                          │
├──────────────────────────────────────────┤
│  📚 Flashcards for this Lesson          │
│                                          │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Deck 1      │  │ Deck 2      │      │
│  │ 12 due      │  │ 8 due       │      │
│  │ [Review]    │  │ [Review]    │      │
│  └─────────────┘  └─────────────┘      │
│                                          │
│  [Review All (20 cards)]                │
├──────────────────────────────────────────┤
│ Navigation: [← Previous] [Next →]       │
└──────────────────────────────────────────┘
```

---

## TypeScript Types

### Lesson Page Props
```typescript
interface LessonPageData {
  course: Course;
  lesson: CourseLesson;
  module: CourseModule;
  enrollment: CourseEnrollment | null;
  progress: CourseProgress | null;
  flashcardDecks: FlashcardDeck[];
}
```

### Flashcard Summary Response
```typescript
interface LessonFlashcardsSummary {
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

---

## Testing Checklist

### Functionality
- [ ] Lesson page renders for all content types
- [ ] Flashcard section shows when decks exist
- [ ] Quick review opens modal with 10 cards
- [ ] Full study navigates to deck page
- [ ] Progress updates after review
- [ ] Due counts are accurate

### Authorization
- [ ] Enrolled users see all content
- [ ] Non-enrolled users see preview only (if isPreviewable)
- [ ] Non-enrolled users get 403 for non-preview lessons

### Edge Cases
- [ ] Lesson with no flashcards (no section shown)
- [ ] Lesson with 1 deck (singular "deck" label)
- [ ] Lesson with no due cards (disabled review button)
- [ ] Empty deck (no cards to review)

### Performance
- [ ] API response < 300ms (lesson data)
- [ ] API response < 200ms (flashcard summary)
- [ ] No unnecessary re-renders
- [ ] Images lazy load

---

## Integration with Knowledge Graph

### Update GraphNode Type
```typescript
interface GraphNode {
  // ... existing fields
  data: {
    // ... existing fields
    flashcardCount?: number; // NEW
  };
}
```

### Update buildCourseGraph
```typescript
const node: GraphNode = {
  id: lesson._id.toString(),
  type: 'lesson',
  data: {
    // ... existing fields
    flashcardCount: lesson.flashcardDeckIds?.length ?? 0,
  },
};
```

### Update GraphNodeTooltip
```tsx
{node.data.flashcardCount > 0 && (
  <div className="flex items-center gap-1 text-xs">
    <Book className="h-3 w-3" />
    <span>{node.data.flashcardCount} deck{node.data.flashcardCount > 1 ? 's' : ''}</span>
  </div>
)}
```

---

## Migration Notes

### No Database Migration Required ✅
All necessary fields already exist:
- `CourseLesson.flashcardDeckIds` ✅
- `FlashcardDeck.linkTargets` with `scope: 'lesson'` ✅
- `FlashcardStudySession.lessonId` ✅

### Existing Data Compatible ✅
- Lessons without flashcards: section won't render
- Lessons with flashcards: will work immediately
- No breaking changes to API

---

## Success Metrics

### User Engagement
- **Lesson completion rate** with flashcard review
- **Average study time** per lesson
- **Flashcard adoption rate** (% of students using)

### Learning Outcomes
- **Retention rate** (cards mastered / total)
- **Review frequency** (sessions per week)
- **Time to mastery** (days until 90% mastered)

---

## Future Enhancements

1. **Auto-generate flashcards** from lesson content (AI)
2. **Collaborative decks** (share between students)
3. **Adaptive difficulty** (adjust based on performance)
4. **Gamification** (XP, badges, leaderboards)
5. **Study groups** (review together in real-time)

---

## Rollout Plan

### Week 1
- Implement T001-T003 (lesson page foundation)
- Deploy to staging, test with sample lessons

### Week 2  
- Implement T004-T006 (flashcard integration)
- Beta test with select courses

### Week 3
- Implement T007-T010 (enhancements)
- Full production rollout
- Monitor analytics, gather feedback

---

## Quick Commands

```bash
# Create branch
git checkout -b 015-lesson-flashcard-integration

# Run dev server
pnpm dev

# Type check
pnpm typecheck

# Run tests
pnpm test lesson-flashcard

# Build for production
pnpm build

# Preview lesson page
open http://localhost:3000/courses/your-course/lesson/lesson-id
```

---

**Status**: ✅ Planning complete  
**Next Action**: Implement T001 - Create Lesson Page Route  
**Estimated Completion**: 2-3 days (8-12 hours)
