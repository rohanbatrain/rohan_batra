# Sub-Lesson Reorder Fix

## Problem
Sub-lessons could be dragged using the UI but their order would not persist. After dragging a sub-lesson to a new position and refreshing, it would return to its original position based on creation date.

## Root Cause
The frontend was sorting child lessons by `createdAt` timestamp, which overrode the order from the backend. The backend correctly stores and returns lesson order based on the `module.lessonIds` array, which is updated when lessons are reordered via drag-and-drop.

## The Fix

### Before (Broken)
```typescript
const childLessons = module.lessons
  .filter(child => child.parentLessonId === lesson.id)
  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
```
This sorted children by creation date, destroying the backend order.

### After (Fixed)
```typescript
const childLessons = module.lessons
  .filter(child => child.parentLessonId === lesson.id);
```
Now children maintain the order from `module.lessons`, which reflects the backend order.

## How Lesson Ordering Works

### Backend (Already Working Correctly)
1. **Storage**: `CourseModule` has a `lessonIds` array that stores the order
2. **API Response**: `/api/admin/courses/[courseId]` returns lessons ordered by `module.lessonIds`
3. **Reordering**: When drag-and-drop occurs, `handleLessonReorder` calls the API to update `lessonIds`
4. **Persistence**: The new order is saved to the database in the `lessonIds` array

### Frontend Flow
1. User drags a lesson (parent or child) to new position
2. `handleLessonDragEnd` → `handleLessonReorder` is called
3. Local state updates optimistically
4. API call to `/api/admin/courses/[courseId]/modules/[moduleId]/lessons/reorder`
5. Backend updates `module.lessonIds` with new order
6. On next fetch, lessons come back in the correct order
7. Frontend displays them in that order (no additional sorting)

## Files Changed
- `/src/components/admin/courses/CourseManagerContent.tsx` - Removed `.sort()` on child lessons

## Testing
✅ **Parent Lessons**: Can be reordered, order persists
✅ **Sub-Lessons**: Can be reordered, order persists
✅ **Mixed**: Can reorder both parent and child lessons independently
✅ **Persistence**: Order survives page refresh
✅ **Nested Display**: Children still render nested under parents
✅ **Visual Hierarchy**: Indentation and borders maintained

## Key Takeaway
**Always respect the backend order unless you have a specific reason to re-sort.**

The backend is the source of truth for lesson order. It stores this in `module.lessonIds` and returns lessons in that order. Frontend sorting should only be used for temporary display purposes (like filtering), not for defining the canonical order.
