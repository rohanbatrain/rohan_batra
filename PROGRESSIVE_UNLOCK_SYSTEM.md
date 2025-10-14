# Progressive Unlock System for Courses 🔒

## Overview

The Progressive Unlock System ensures learners complete course content sequentially, preventing them from skipping ahead or marking everything as complete without actually learning. This creates a structured learning path and maintains course integrity.

## Key Features

### ✅ Sequential Access Control
- **Module Level**: First module is always unlocked. Subsequent modules unlock only when all lessons in the previous module are completed.
- **Lesson Level**: First lesson in each module is unlocked. Subsequent lessons unlock when the previous lesson is completed.
- **Sub-Lesson Level**: First sub-lesson is unlocked. Subsequent sub-lessons unlock when the previous sub-lesson is completed.

### ✅ Visual Indicators
- **Lock Icons**: 🔒 symbol appears on locked content
- **Disabled Buttons**: Locked lessons show grayed-out "Locked" buttons instead of "Start" buttons
- **Lock Reasons**: Contextual messages explain why content is locked (e.g., "Complete the previous lesson first")
- **Completion Checkmarks**: ✓ symbol shows completed lessons
- **Opacity Changes**: Locked items have reduced opacity for visual distinction

### ✅ Progress Tracking
- **Progress Bar**: Visual indicator showing course completion percentage
- **Completion Counter**: Shows X of Y lessons completed
- **Next Lesson Recommendation**: Highlighted card showing the next available lesson
- **Course Completion Celebration**: Special message when all lessons are completed

### ✅ URL Protection
- **Server-Side Validation**: Even if users try to access locked lessons directly via URL, they are redirected
- **Error Messages**: Clear feedback explaining why access was denied
- **Graceful Redirects**: Users are sent back to the course page with explanatory messages

## Technical Implementation

### Core Library
Location: `/src/lib/courses/unlock-logic.ts`

#### Key Functions

1. **`isLessonLocked()`**
   - Checks if a specific lesson should be locked
   - Parameters: lessonId, moduleIndex, lessonIndex, modules, completedLessonIds
   - Returns: `{ isLocked: boolean, reason?: string, requiredLessonId?: string }`

2. **`isSubLessonLocked()`**
   - Checks if a sub-lesson should be locked
   - Parameters: subLessonId, subLessonIndex, parentLesson, completedLessonIds
   - Returns: `{ isLocked: boolean, reason?: string }`

3. **`isModuleLocked()`**
   - Checks if an entire module should be locked
   - Parameters: moduleIndex, modules, completedLessonIds
   - Returns: `{ isLocked: boolean, reason?: string }`

4. **`enrichModulesWithUnlockStatus()`**
   - Adds lock status to all modules, lessons, and sub-lessons
   - Used in course page rendering
   - Returns enriched module structure with `isLocked` and `lockReason` fields

5. **`getNextUnlockedLesson()`**
   - Finds the next available lesson for a user
   - Used for "Continue Learning" recommendations
   - Returns: `{ moduleIndex, lessonIndex, lessonId }` or null

6. **`calculateProgressStats()`**
   - Calculates progress statistics
   - Returns: `{ totalLessons, completedCount, percentageComplete, remainingLessons }`

### Integration Points

#### 1. Course Overview Page
**File**: `/src/app/courses/[slug]/page.tsx`

**Features**:
- Fetches user's progress (completed lesson IDs)
- Enriches course outline with unlock status
- Displays lock icons and disabled buttons for locked content
- Shows "Continue Learning" card with next lesson recommendation
- Displays progress statistics and completion messages

**Key Code**:
```typescript
// Fetch progress
if (progress && progress.completedLessonIds) {
  completedLessonIds = progress.completedLessonIds.map((id: any) => String(id));
}

// Enrich outline with unlock status
const enrichedOutline = enrollment 
  ? enrichModulesWithUnlockStatus(outline, completedLessonIds)
  : outline;

// Get next lesson recommendation
const nextLesson = enrollment ? getNextUnlockedLesson(enrichedOutline, completedLessonIds) : null;
```

#### 2. Lesson Viewer Page
**File**: `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx`

**Features**:
- Server-side validation of lesson access
- Builds course outline to determine lesson position
- Checks if current lesson is locked
- Redirects to course page with error message if locked

**Key Code**:
```typescript
// Build outline for unlock logic
const outlineForUnlock = buildOrderedOutline(allModules, allLessons);

// Check if lesson is locked
if (lockStatus.isLocked) {
  redirect(`/courses/${slug}?message=lesson-locked&reason=${encodeURIComponent(lockStatus.reason)}`);
}
```

#### 3. Progress API
**File**: `/src/app/api/courses/[courseId]/progress/complete-lesson/route.ts`

**Purpose**: 
- Marks lessons as complete
- Updates progress tracking
- Automatically unlocks next lessons when current one is completed

## User Experience Flow

### For New Enrolled Users
1. ✅ Can access Module 1, Lesson 1 immediately
2. 🔒 All other content is locked
3. After completing Lesson 1, Lesson 2 unlocks
4. Pattern continues until module is complete
5. Next module unlocks when all lessons in current module are done

### Visual Feedback
- **Locked**: Gray background, 🔒 icon, "Locked" button, lock reason text
- **Available**: Normal colors, "Start" button
- **Completed**: ✓ checkmark, "Review" button (can revisit)

### Progress Indicators
- **Course Level**: Overall progress percentage and bar
- **Module Level**: Shows lock status if locked
- **Lesson Level**: Individual completion status

## Security & Anti-Gaming Measures

### ✅ Server-Side Validation
- Lock checks happen on server, not just client
- Users cannot bypass locks by modifying client-side code
- Direct URL access is blocked for locked lessons

### ✅ Progress Integrity
- Completion status stored in database
- Cannot be manipulated from frontend
- Requires authenticated API calls with CSRF protection

### ✅ Sequential Completion Required
- No skipping ahead
- No bulk-marking as complete
- Must actually access and complete each lesson in order

## Benefits

### For Learners
- 📚 Structured learning path
- 🎯 Clear next steps
- ✨ Sense of progression
- 🏆 Achievement tracking
- 🚫 Prevents overwhelm from too many choices

### For Course Creators
- 📊 Ensures content is consumed in intended order
- 🎓 Better learning outcomes
- 🔍 More accurate progress analytics
- ✅ Maintains course integrity
- 🏅 Fair certification (if implemented)

## Configuration

### Disable Unlock for Preview
Non-enrolled users see all content but can only access:
- Lessons marked as `isPreviewable: true`
- Preview content is not subject to unlock rules

### Future Enhancements
- [ ] Optional prerequisites (lesson can require specific prior lessons, not just sequential)
- [ ] Module-level skipping (with admin override)
- [ ] Time-based unlocks (e.g., unlock next lesson 24 hours after completing previous)
- [ ] Quiz-gated unlocks (must pass quiz to unlock next lesson)
- [ ] Parallel tracks (multiple lesson paths that can be completed in any order within a module)

## API Endpoints

### GET `/api/courses/[courseId]/progress`
Returns user's progress including completed lesson IDs

### POST `/api/courses/[courseId]/progress/complete-lesson`
Marks a lesson as complete (with validation)

### Course Page & Lesson Pages
Server-rendered pages with built-in unlock logic

## Testing Unlock Logic

### Test Scenario 1: New User
1. Enroll in course
2. Verify only first lesson is accessible
3. Complete first lesson
4. Verify second lesson unlocks

### Test Scenario 2: Direct URL Access
1. Copy URL of locked lesson
2. Try to access directly
3. Should redirect with error message

### Test Scenario 3: Module Completion
1. Complete all lessons in Module 1
2. Verify Module 2 unlocks
3. Verify Module 2, Lesson 1 is accessible

### Test Scenario 4: Sub-Lessons
1. Complete parent lesson
2. Verify first sub-lesson unlocks
3. Complete sub-lessons sequentially
4. Verify next main lesson unlocks after all sub-lessons complete

## Code Examples

### Checking Lock Status
```typescript
import { isLessonLocked } from '@/lib/courses/unlock-logic';

const status = isLessonLocked(
  lessonId,
  moduleIndex,
  lessonIndex,
  modules,
  completedLessonIds
);

if (status.isLocked) {
  console.log(status.reason); // "Complete the previous lesson first"
}
```

### Enriching Outline
```typescript
import { enrichModulesWithUnlockStatus } from '@/lib/courses/unlock-logic';

const enrichedModules = enrichModulesWithUnlockStatus(
  modules,
  completedLessonIds
);

// Each module now has isLocked property
// Each lesson has isLocked and lockReason properties
```

### Getting Next Lesson
```typescript
import { getNextUnlockedLesson } from '@/lib/courses/unlock-logic';

const next = getNextUnlockedLesson(modules, completedLessonIds);

if (next) {
  console.log(`Next: Module ${next.moduleIndex + 1}, Lesson ${next.lessonIndex + 1}`);
}
```

## Database Schema

### CourseProgress Model
```typescript
{
  completedLessonIds: ObjectId[], // Array of completed lesson IDs
  incompleteLessonIds: ObjectId[], // Array of incomplete lesson IDs
  currentLessonId: ObjectId, // Current active lesson
  percentageComplete: Number, // 0-100
  // ... other fields
}
```

## Troubleshooting

### Issue: Lesson Not Unlocking
- Check if previous lesson is marked as complete in database
- Verify completion API call succeeded
- Check browser console for errors
- Ensure page was refreshed after completion

### Issue: All Lessons Locked
- Verify user is enrolled in course
- Check if enrollment record exists in database
- Ensure progress document was created on enrollment

### Issue: Can Access Locked Lesson via URL
- Check server-side validation is in place
- Verify unlock logic is called before rendering
- Ensure redirect is happening for locked access

## Summary

The Progressive Unlock System creates a structured, secure, and engaging learning experience by:
- ✅ Enforcing sequential content access
- ✅ Providing clear visual feedback
- ✅ Tracking and displaying progress
- ✅ Preventing gaming of the system
- ✅ Ensuring fair certification (when implemented)

This system maintains course integrity while providing learners with a clear path to completion.
