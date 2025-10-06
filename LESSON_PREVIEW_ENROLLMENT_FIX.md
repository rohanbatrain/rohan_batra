# Lesson Preview Page - Enrollment Access Fix

## Problem
The "Start" button for enrolled users was linking to `/courses/preview/[lessonId]`, but the preview page had a hard-coded check that **only allowed previewable lessons**:

```typescript
// Before - BROKEN
if (!lesson || !lesson.isPreviewable) return notFound();
```

This meant:
- ❌ Enrolled users couldn't view non-previewable lessons
- ❌ "Start" button didn't work for most lessons
- ❌ Only way to view lessons was if they were marked as previewable

## Root Cause
The app doesn't have a separate "lesson viewer" route for enrolled students. It was using the "preview" route for both:
1. **Preview** (non-enrolled users viewing previewable lessons)
2. **Full lesson access** (enrolled users viewing any lesson)

But the preview page only checked `isPreviewable`, not enrollment status.

## Solution
Made the preview page **enrollment-aware**:

### Before (Broken)
```typescript
const lesson = await CourseLesson.findById(lessonId).lean();
if (!lesson || !lesson.isPreviewable) return notFound();
```

### After (Fixed)
```typescript
const lesson = await CourseLesson.findById(lessonId).lean();
if (!lesson) return notFound();

// Check if user is enrolled
const { userId } = await auth();
let isEnrolled = false;

if (userId) {
  const userDoc = (await User.findOne({ clerkId: userId }).lean()) as { _id: any } | null;
  if (userDoc && userDoc._id) {
    const enrollment = await CourseEnrollment.findOne({
      courseId: lesson.courseId,
      userId: userDoc._id
    }).lean();
    isEnrolled = !!enrollment;
  }
}

// Allow access if: enrolled OR lesson is previewable
if (!isEnrolled && !lesson.isPreviewable) {
  return notFound();
}
```

## Logic Flow

### For Non-Enrolled Users:
1. User clicks "Preview" on a previewable lesson
2. Page checks: `isPreviewable === true`?
3. ✅ If yes → Show lesson
4. ❌ If no → 404 Not Found

### For Enrolled Users:
1. User clicks "Start" on any lesson
2. Page checks: Is user enrolled in this course?
3. ✅ If yes → Show lesson (regardless of `isPreviewable`)
4. ❌ If no → Check if previewable
   - ✅ If previewable → Show lesson
   - ❌ If not previewable → 404 Not Found

## Benefits

✅ **Enrolled users can now view ALL lessons** (not just previewable ones)
✅ **Preview still works** for non-enrolled users on previewable lessons
✅ **Start button now works** - leads to actual lesson content
✅ **Security maintained** - non-enrolled users still can't access non-previewable lessons
✅ **No new routes needed** - reused existing preview page intelligently

## Files Changed

### 1. `/src/app/courses/preview/[lessonId]/page.tsx`
**Added imports:**
```typescript
import CourseEnrollment from '@/models/CourseEnrollment';
import User from '@/models/User';
import { auth } from '@clerk/nextjs/server';
```

**Added enrollment check:**
- Fetches user from Clerk ID
- Checks if CourseEnrollment exists
- Sets `isEnrolled` flag

**Updated access logic:**
```typescript
// Old: Only previewable
if (!lesson || !lesson.isPreviewable) return notFound();

// New: Enrolled OR previewable
if (!isEnrolled && !lesson.isPreviewable) return notFound();
```

### 2. `/src/app/courses/[slug]/page.tsx`
**Start button already points to preview** (from previous fix):
```typescript
{enrollment ? (
  <Link href={`/courses/preview/${String(l._id)}`}>
    Start
  </Link>
) : null}
```

## Testing Checklist

### Non-Enrolled User:
- [ ] Can preview previewable lessons (Preview button)
- [ ] Cannot access non-previewable lessons (404)
- [ ] Does not see Start button

### Enrolled User:
- [ ] Can view ALL lessons via Start button
- [ ] Can view previewable lessons  
- [ ] Can view non-previewable lessons
- [ ] Does not see Preview button (only Start)

### Security:
- [ ] Non-enrolled users still blocked from non-previewable lessons
- [ ] Enrolled users in different course can't access lessons
- [ ] Unauthenticated users can only preview

## Architecture Note

### Current Approach:
- Single route `/courses/preview/[lessonId]` serves both preview and full lesson viewing
- Access control via enrollment check
- **Pros**: Simple, no duplicate code
- **Cons**: URL says "preview" even for full lesson access

### Alternative (Future):
Could create separate routes:
- `/courses/preview/[lessonId]` - Preview only
- `/courses/[slug]/learn/[lessonId]` - Full lesson for enrolled users
- **Pros**: Clearer URLs, better separation of concerns
- **Cons**: More routes, duplicate rendering logic

For now, the current approach works well and is maintainable.
