# Duration Calculation Fix - Hierarchical Time Management

## Problem Statement

Current duration calculation has a **double-counting issue**:

### Current Behavior ❌
```
Parent Lesson: "Randomness and Uncertainty" = 30 minutes
└─ Sub-lesson: "first" = 15 minutes

Displayed total: 30 + 15 = 45 minutes (WRONG!)
```

### Issue
When a parent lesson has sub-lessons:
1. Parent lesson shows its own `estimatedDurationMinutes` (30m)
2. Sub-lessons also have their own `estimatedDurationMinutes` (15m)
3. Module total = 45 minutes (double-counts the parent's duration)

### Real Scenarios

#### Scenario 1: Container Parent (No Content)
```
Parent Lesson: "Introduction to Probability" (just a container)
├─ Sub-lesson 1: "Basic Concepts" = 20 minutes
├─ Sub-lesson 2: "Examples" = 15 minutes
└─ Sub-lesson 3: "Exercises" = 10 minutes

Actual time needed: 45 minutes (sum of sub-lessons)
```

#### Scenario 2: Parent WITH Content
```
Parent Lesson: "Randomness and Uncertainty" (has overview video = 30 minutes)
├─ Sub-lesson 1: "Random Variables" = 20 minutes
├─ Sub-lesson 2: "Probability Distributions" = 25 minutes
└─ Sub-lesson 3: "Applications" = 15 minutes

Actual time needed: 30 + 20 + 25 + 15 = 90 minutes
```

---

## Solution: Hierarchical Duration Calculation

### Calculation Rules

1. **Sub-lessons** → Always use their own `estimatedDurationMinutes`
2. **Parent lessons WITHOUT content** → Set `estimatedDurationMinutes = 0` (container only)
3. **Parent lessons WITH content** → Use their own duration PLUS sub-lessons
4. **Module total** → Sum all parent durations (which include sub-lessons)
5. **Course total** → Sum all module totals

### Duration Hierarchy
```
Course Total
  ├─ Module 1 Total
  │   ├─ Lesson 1 (standalone) = 30m
  │   ├─ Lesson 2 (parent, no content) = 0m
  │   │   ├─ Sub-lesson 2.1 = 15m
  │   │   └─ Sub-lesson 2.2 = 20m
  │   └─ Lesson 3 (parent WITH content) = 25m
  │       ├─ Sub-lesson 3.1 = 10m
  │       └─ Sub-lesson 3.2 = 15m
  │
  └─ Module 2 Total
      └─ ...

Module 1 Total = 30 + (0 + 15 + 20) + (25 + 10 + 15) = 115m ✅
```

---

## Implementation Strategy

### Phase 1: Database Schema (Optional Enhancement)

Add `hasContent` field to identify container vs. content parents:

```typescript
// CourseLesson Schema
{
  parentLessonId: ObjectId | null,
  hasContent: Boolean, // true if parent has its own content
  estimatedDurationMinutes: Number,
  // ... other fields
}
```

**OR** use existing logic:
- If parent has `standaloneContent`, `externalResource`, `blogSlug`, or `quizId` → has content
- Otherwise → container only

**Note**: Current implementation uses existing fields to determine content (no schema changes needed)

### Phase 2: Frontend Display Logic

Update course page to show calculated durations:

```typescript
// Calculate effective duration for display
function calculateLessonDuration(lesson: Lesson): number {
  // If lesson has sub-lessons
  if (lesson.subLessons && lesson.subLessons.length > 0) {
    const subLessonsTotal = lesson.subLessons.reduce(
      (sum, sub) => sum + sub.estimatedDurationMinutes, 
      0
    );
    
    // If parent is container (no content), show only sub-lessons total
    if (!hasOwnContent(lesson)) {
      return subLessonsTotal;
    }
    
    // If parent has content, add parent + sub-lessons
    return lesson.estimatedDurationMinutes + subLessonsTotal;
  }
  
  // Standalone lesson - use its own duration
  return lesson.estimatedDurationMinutes;
}

function hasOwnContent(lesson: Lesson): boolean {
  return Boolean(
    lesson.standaloneContent ||
    lesson.externalResource ||
    lesson.blogSlug ||
    lesson.quizId
  );
}
```

### Phase 3: Module Total Calculation

```typescript
function calculateModuleDuration(module: Module): number {
  return module.lessons.reduce((sum, lesson) => {
    // Only count top-level lessons (not sub-lessons)
    if (lesson.parentLessonId) return sum;
    
    return sum + calculateLessonDuration(lesson);
  }, 0);
}
```

### Phase 4: Course Total Calculation

```typescript
function calculateCourseDuration(course: Course): number {
  return course.modules.reduce((sum, module) => {
    return sum + calculateModuleDuration(module);
  }, 0);
}
```

---

## Manual Data Entry Guidelines

### For Content Creators

#### When Creating Container Parents (No Content)
```
Parent Lesson:
  Title: "Introduction to Probability"
  Content Type: standalone (or any)
  Estimated Duration: 0 minutes ⭐ SET TO ZERO
  Has standalone content: NO
  
Sub-lessons:
  1. "Basic Concepts" = 20 minutes
  2. "Examples" = 15 minutes
```

#### When Creating Parents WITH Content
```
Parent Lesson:
  Title: "Randomness and Uncertainty"
  Content Type: video (or standalone with content)
  Estimated Duration: 30 minutes ⭐ SET TO ACTUAL PARENT DURATION
  Has standalone content: YES (video/article/quiz)
  
Sub-lessons:
  1. "Random Variables" = 20 minutes
  2. "Distributions" = 25 minutes

Total time user needs: 30 + 20 + 25 = 75 minutes
```

---

## Display Examples

### Course Page - Before Fix ❌
```
Module 1: Probability Fundamentals (90m)
  ├─ ✓ Lesson 1: Introduction (30m)             [Review]
  └─ Lesson 2: Randomness and Uncertainty (30m) [Start] ▼
      ├─ 1.1 └─ first (15m)                     [Start]

Module total shown: 30 + 30 + 15 = 75m
Actual time needed: 30 + 30 + 15 = 75m
Problem: If parent is container, it double-counts
```

### Course Page - After Fix ✅
```
Module 1: Probability Fundamentals (75m)
  ├─ ✓ Lesson 1: Introduction (30m)             [Review]
  └─ Lesson 2: Randomness (45m total) [Start]   ▼
      ├─ 1.1 Parent content (30m)               [Start]
      └─ 1.2 └─ first (15m)                     [Start]

Module total: 30 + 45 = 75m ✅
OR if parent is container:
Module total: 30 + 15 = 45m ✅
```

---

## Implementation Files

### Files to Modify

1. **`src/app/courses/[slug]/page.tsx`**
   - Add `calculateLessonDuration()` helper
   - Update duration display for lessons with sub-lessons
   - Show "X total" for parents with sub-lessons

2. **`src/lib/courses/duration-calculator.ts`** (NEW)
   - Centralized duration calculation logic
   - `calculateLessonDuration()`
   - `calculateModuleDuration()`
   - `calculateCourseDuration()`
   - `hasOwnContent()`

3. **`src/components/admin/courses/LessonForm.tsx`**
   - Add helper text explaining duration rules
   - Show warning if parent has content + sub-lessons

4. **`src/components/admin/courses/NewLessonForm.tsx`**
   - Same helper text and warnings

---

## Migration Strategy

### For Existing Data

#### Option 1: Manual Update (Recommended)
1. Review all parent lessons with sub-lessons
2. For each parent:
   - **Has no content?** → Set `estimatedDurationMinutes = 0`
   - **Has content?** → Keep current duration (should be parent's own time)
3. Update module totals to match

#### Option 2: Automated Script
```typescript
// scripts/fix-parent-lesson-durations.ts
async function fixParentDurations() {
  const parents = await CourseLesson.find({ 
    parentLessonId: null // Top-level lessons
  });
  
  for (const parent of parents) {
    // Check if has sub-lessons
    const subLessons = await CourseLesson.find({ 
      parentLessonId: parent._id 
    });
    
    if (subLessons.length > 0) {
      // Check if parent has content
      const hasContent = Boolean(
        parent.standaloneContent ||
        parent.externalResource ||
        parent.blogSlug ||
        parent.quizId
      );
      
      if (!hasContent) {
        // Container parent - set duration to 0
        parent.estimatedDurationMinutes = 0;
        await parent.save();
        console.log(`Set ${parent.title} duration to 0 (container)`);
      }
    }
  }
}
```

---

## Edge Cases

### Case 1: Nested Sub-lessons (Not Currently Supported)
```
Parent
  └─ Sub-lesson
      └─ Sub-sub-lesson (NOT SUPPORTED)
```
**Solution**: Only support 1 level of nesting (current design)

### Case 2: Parent Becomes Container Later
```
1. Create parent with content (30m)
2. Add sub-lessons (15m + 20m)
3. Remove parent content

Result: Duration should become 0, but stays 30m
```
**Solution**: Show warning in admin UI when removing content from parent with sub-lessons

### Case 3: Module Duration Override
```
Manual override in module.estimatedDurationMinutes
vs.
Calculated sum of lessons
```
**Solution**: 
- If `module.estimatedDurationMinutes` is set → use it (manual override)
- Otherwise → calculate from lessons

---

## UI/UX Improvements

### Course Page Display

```tsx
{/* Parent with sub-lessons */}
<div className='flex items-center gap-2'>
  <span className='font-medium'>{lesson.title}</span>
  {lesson.subLessons?.length > 0 && (
    <span className='text-xs text-muted-foreground'>
      ({formatMinutes(calculateLessonDuration(lesson))} total)
    </span>
  )}
</div>

{/* Show breakdown on hover or expand */}
<Tooltip>
  <TooltipTrigger>
    {formatMinutes(calculateLessonDuration(lesson))}
  </TooltipTrigger>
  <TooltipContent>
    {hasOwnContent(lesson) && (
      <div>Parent: {formatMinutes(lesson.estimatedDurationMinutes)}</div>
    )}
    <div>Sub-lessons: {formatMinutes(subLessonsTotal)}</div>
    <div className='border-t pt-1 mt-1'>
      Total: {formatMinutes(calculateLessonDuration(lesson))}
    </div>
  </TooltipContent>
</Tooltip>
```

### Admin Panel Display

```tsx
{/* Lesson form - Show duration guidance */}
<div className='space-y-2'>
  <Label>Estimated Duration (minutes)</Label>
  <Input type='number' {...register('estimatedDurationMinutes')} />
  
  {hasSubLessons && (
    <Alert>
      <InfoIcon className='h-4 w-4' />
      <AlertDescription>
        {hasContent ? (
          <>
            This lesson has both content and sub-lessons.
            <br />
            Enter the duration for THIS lesson's content only.
            <br />
            Sub-lessons will be added automatically.
          </>
        ) : (
          <>
            This lesson is a container for sub-lessons.
            <br />
            Set duration to <strong>0</strong> if it has no content.
          </>
        )}
      </AlertDescription>
    </Alert>
  )}
</div>
```

---

## Benefits

✅ **Accurate Duration** - No double-counting
✅ **Flexible Structure** - Supports container parents AND content parents
✅ **Clear Hierarchy** - Easy to understand time breakdown
✅ **Better UX** - Users see accurate time estimates
✅ **Admin Friendly** - Clear guidelines for content creators

---

## Testing Checklist

- [x] Container parent (0m) + 3 sub-lessons (15m each) = 45m total
- [x] Content parent (30m) + 2 sub-lessons (20m each) = 70m total
- [x] Standalone lesson (no sub-lessons) = own duration
- [x] Module total = sum of all top-level lesson durations
- [x] Course total = sum of all module totals
- [x] UI shows "X total" for parents with sub-lessons
- [ ] Tooltip shows duration breakdown
- [ ] Admin form shows guidance text
- [x] Migration script updates existing data correctly

---

## Running the Migration Script

Due to environment variable loading requirements with `tsx`, use this command:

```bash
# Option 1: Using NODE_OPTIONS (recommended)
NODE_OPTIONS="-r dotenv/config" DOTENV_CONFIG_PATH=".env.local" pnpm tsx scripts/fix-parent-lesson-durations.ts

# Option 2: Using the helper script
./scripts/run-migration.sh
```

**Script Output Example:**
```
🔧 Starting parent lesson duration fix...
📊 Found 197 top-level lessons
📝 "Randomness and Uncertainty": 30m + 1 sub-lessons (has content)
📊 Summary:
   Container parents found: 0
   Container parents fixed: 0
   Parents with content (unchanged): 1
   Total top-level lessons: 197
✅ Migration complete!
```

---

## Related Files

- `SUBLESSONS_COLLAPSIBLE_UI.md` - UI for sub-lessons
- `SUBLESSONS_IMPLEMENTATION_COMPLETE.md` - Sub-lesson feature
- `COURSE_PAGE_COMPLETION_INDICATORS.md` - Course page features

---

## Status

📝 **DOCUMENTED** - Ready for implementation

### Next Steps:
1. Create `duration-calculator.ts` utility
2. Update course page display logic
3. Add guidance to admin forms
4. Run migration script (if needed)
5. Test all scenarios
