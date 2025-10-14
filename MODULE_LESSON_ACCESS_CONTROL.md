# Module & Lesson Access Control - Preview vs Lock Behavior

## Overview
The course platform implements a two-tier access control system that distinguishes between **non-enrolled users** (preview mode) and **enrolled users** (progressive unlock mode).

## Access Rules

### 📖 Non-Enrolled Users (Preview Mode)
**Goal**: Allow exploration of course content before enrolling

✅ **Can Access**:
- Any module page (via "View Module" button)
- Any lesson marked as `isPreviewable: true`
- Full content of previewable lessons
- Module overview and structure

❌ **Cannot Access**:
- Lessons marked as `isPreviewable: false`
- Cannot mark lessons as complete
- Cannot track progress
- Cannot earn certification

**Behavior**:
- All "View Module" buttons are clickable
- Module pages display normally
- Lesson pages redirect to enrollment if not previewable
- Encourages exploration to make informed enrollment decisions

---

### 🔐 Enrolled Users (Progressive Unlock Mode)
**Goal**: Enforce sequential learning path for course integrity

✅ **Can Access**:
- ✅ Module 1 (always unlocked)
- ✅ First lesson in any unlocked module
- ✅ Next lesson after completing previous lesson
- ✅ Next module after completing all lessons in previous module
- ✅ All previously completed content (can review anytime)

❌ **Cannot Access**:
- 🔒 Locked modules (must complete previous module first)
- 🔒 Locked lessons (must complete previous lesson first)
- 🔒 Locked sub-lessons (must complete previous sub-lesson first)

**Behavior**:
- "View Module" button shows "🔒 Locked Module" and is disabled
- Clicking locked lesson shows error message
- Direct URL access to locked content redirects with error
- Server-side validation prevents bypassing via API

---

## Implementation Details

### Module Lock Check
**File**: `/src/app/courses/[slug]/module/[moduleId]/page.tsx`

```typescript
// Check if module is locked for enrolled users
if (enrollment) {
  // Build full course outline to check module lock status
  const allCourseModules = await CourseModuleModel.find({ courseId: course._id })
    .select('_id title order lessonIds')
    .sort({ order: 1 })
    .lean();
  
  // Build module structure with lessons
  const modulesWithLessons = allCourseModules.map((m: any) => {
    const moduleLessons = allLessons.filter(
      (l: any) => String(l.moduleId) === String(m._id)
    );
    return {
      ...m,
      lessons: buildOrderedLessons(m, moduleLessons as any[]),
    };
  });
  
  // Check if current module is locked
  const completedIds = progress?.completedLessonIds?.map((id: any) => String(id)) || [];
  const lockStatus = isModuleLocked(currentModuleIndex, modulesWithLessons as any[], completedIds);
  
  if (lockStatus.isLocked) {
    // Redirect to course page with error message
    redirect(`/courses/${slug}?message=module-locked&reason=${encodeURIComponent(lockStatus.reason || 'Complete previous modules first')}`);
  }
}
// Non-enrolled users can access any module (preview mode)
```

### Lesson Lock Check
**File**: `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx`

```typescript
// Check authorization
const isEnrolled = !!enrollment;
const isPreviewable = lesson.isPreviewable;

// Non-enrolled users can only view previewable lessons
if (!isEnrolled && !isPreviewable) {
  redirect(`/courses/${slug}?message=enroll-required`);
}

// Progressive unlock check: Verify enrolled user has access to this lesson
if (isEnrolled && progress) {
  const completedLessonIds = progress.completedLessonIds?.map((id: any) => String(id)) || [];
  
  // ... build outline ...
  
  // Check if lesson is locked
  if (lockStatus.isLocked) {
    redirect(`/courses/${slug}?message=lesson-locked&reason=${encodeURIComponent(lockStatus.reason)}`);
  }
}
```

### ViewModuleButton Component
**File**: `/src/components/courses/ViewModuleButton.tsx`

```tsx
export function ViewModuleButton({
  courseSlug,
  moduleId,
  moduleTitle,
  isLocked = false,
  isEnrolled = false,
}: ViewModuleButtonProps) {
  // Non-enrolled users can preview any module (exploration before enrolling)
  // Enrolled users cannot access locked modules (must complete previous modules first)
  const buttonText = isLocked && isEnrolled ? '🔒 Locked Module' : 'View Module';
  const isDisabled = isLocked && isEnrolled;

  if (isDisabled) {
    return <button disabled>🔒 Locked Module</button>;
  }

  return <Link href={`/courses/${courseSlug}/module/${moduleId}`}>View Module</Link>;
}
```

---

## User Journeys

### Journey 1: New User Exploring (Not Enrolled)
1. Visits course page
2. Sees all modules with "View Module" buttons
3. Clicks "View Module" on Module 2 ✅ Allowed
4. Browses module content and lessons
5. Clicks on a lesson ✅ Allowed (if previewable)
6. Decides to enroll after seeing content
7. **Outcome**: User can explore freely to make informed decision

### Journey 2: Enrolled User Learning (Following Path)
1. Enrolls in course
2. Sees Module 1 unlocked, Module 2+ locked with 🔒
3. Starts Module 1, Lesson 1 ✅ Allowed
4. Completes Lesson 1
5. Lesson 2 unlocks automatically ✅
6. Tries to click Module 2 before completing Module 1 ❌ Button disabled
7. Tries direct URL to Module 2 ❌ Redirected with error
8. Completes all Module 1 lessons
9. Module 2 unlocks ✅
10. **Outcome**: User follows proper learning sequence

### Journey 3: Enrolled User Trying to Skip (Blocked)
1. Enrolled in course
2. Copies URL of locked Module 3
3. Pastes URL in browser and navigates
4. ❌ Server validates: "Module locked, complete previous modules"
5. Redirected to course page with error message
6. Must complete Module 2 first
7. **Outcome**: Sequential learning enforced

---

## Error Messages

### Module Locked
```tsx
{message === 'module-locked' && (
  <div className="border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/40">
    <h3>🔒 Module Locked</h3>
    <p>{reason || 'You need to complete all lessons in the previous module before accessing this one.'}</p>
  </div>
)}
```

### Lesson Locked
```tsx
{message === 'lesson-locked' && (
  <div className="border-amber-500/30 bg-amber-50/80 dark:bg-amber-950/40">
    <h3>🔒 Lesson Locked</h3>
    <p>{reason || 'You need to complete previous lessons before accessing this one.'}</p>
  </div>
)}
```

### Enrollment Required
```tsx
{message === 'enroll-required' && (
  <div className="border-blue-500/30 bg-blue-50/80 dark:bg-blue-950/40">
    <h3>ℹ️ Enrollment Required</h3>
    <p>Please enroll in this course to access the lessons.</p>
  </div>
)}
```

---

## Security & Validation

### Client-Side Protection
- Disabled buttons prevent accidental clicks
- Visual indicators (🔒) show locked state
- Tooltips explain why content is locked

### Server-Side Protection
- All access checks happen on the server
- Cannot bypass by manipulating client-side state
- Direct URL access validated before rendering
- API endpoints validate enrollment and unlock status

### Database Queries
```typescript
// Fetch user's progress
const progress = await CourseProgressModel.findOne({
  enrollmentId: enrollment._id,
}).lean();

// Get completed lesson IDs
const completedLessonIds = progress?.completedLessonIds?.map((id: any) => String(id)) || [];

// Validate unlock status
const lockStatus = isModuleLocked(moduleIndex, modules, completedLessonIds);
```

---

## Benefits

### For Learners
✅ Clear exploration before enrolling
✅ Guided learning path after enrolling
✅ No overwhelm from too many choices
✅ Sense of progression and achievement
✅ Fair certification (can't skip content)

### For Platform
✅ Encourages thoughtful enrollment decisions
✅ Maintains course integrity
✅ Accurate learning analytics
✅ Prevents gaming the system
✅ Professional learning experience

---

## Related Files

| File | Purpose |
|------|---------|
| `/src/app/courses/[slug]/module/[moduleId]/page.tsx` | Module page with lock validation |
| `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx` | Lesson page with lock validation |
| `/src/components/courses/ViewModuleButton.tsx` | Module button with lock state |
| `/src/lib/courses/unlock-logic.ts` | Core unlock logic functions |
| `/src/app/courses/[slug]/page.tsx` | Course outline with lock indicators |

---

## Testing Scenarios

### Test Case 1: Non-Enrolled Preview
- [ ] Can click "View Module" on any module
- [ ] Can view module page content
- [ ] Can view previewable lessons
- [ ] Cannot view non-previewable lessons
- [ ] See enrollment CTA

### Test Case 2: Enrolled Sequential Access
- [ ] Module 1 accessible immediately
- [ ] Other modules show 🔒 Locked
- [ ] First lesson in Module 1 accessible
- [ ] Other lessons locked until previous completed
- [ ] Module 2 unlocks after Module 1 complete

### Test Case 3: URL Manipulation
- [ ] Direct URL to locked module redirects
- [ ] Direct URL to locked lesson redirects
- [ ] Error message explains why locked
- [ ] Returns to course page safely

---

**Status**: ✅ **IMPLEMENTED**
**Date**: October 13, 2025
**Version**: 1.0
