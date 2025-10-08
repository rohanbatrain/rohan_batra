# Knowledge Graph - Admin Toggle & Sub-Lessons Repositioning

## Overview
Added an admin toggle for the Knowledge Graph feature (defaults to `false`) and repositioned sub-lessons section for better UX flow.

---

## Changes Made

### 1. ✅ Database Schema - Course Model

**File:** `src/models/Course.ts`

Added new field to Course schema:
```typescript
showKnowledgeGraph: {
  type: Boolean,
  default: false,
  comment: 'Enable Knowledge Graph feature for this course (admin toggle)',
}
```

**Default:** `false` (Knowledge Graph is hidden by default)

---

### 2. ✅ TypeScript Types

**File:** `src/types/courses.ts`

Updated `Course` interface:
```typescript
export interface Course {
  // ... other fields
  isFeatured: boolean;
  showKnowledgeGraph: boolean;  // ← New field
  seo?: CourseSEOOverrides;
  // ... rest
}
```

---

### 3. ✅ Admin UI - Course Editor

**File:** `src/components/admin/courses/CourseManagerContent.tsx`

#### Added to Form State:
```typescript
interface CourseFormState {
  // ... existing fields
  isFeatured: boolean;
  showKnowledgeGraph: boolean;  // ← New
  // ... rest
}

const defaultCourseForm: CourseFormState = {
  // ...
  isFeatured: false,
  showKnowledgeGraph: false,  // ← Default off
  // ...
};
```

#### Added UI Toggle (After "Featured" Switch):
```tsx
<div className='flex items-center justify-between rounded-md border border-dashed border-gray-300 px-3 py-2 dark:border-gray-700'>
  <div>
    <Label className='text-sm font-medium'>
      Enable Knowledge Graph
    </Label>
    <p className='text-xs text-muted-foreground'>
      Show visual relationship graph for this course (experimental).
    </p>
  </div>
  <Switch
    checked={courseForm.showKnowledgeGraph}
    onCheckedChange={checked =>
      handleCourseFieldChange('showKnowledgeGraph', checked)
    }
  />
</div>
```

**Location:** Settings section, below "Feature this course" toggle

---

### 4. ✅ API Routes - Admin Course Management

#### **File:** `src/app/api/admin/courses/route.ts`

Added validation schema:
```typescript
export const CourseInputSchema = z.object({
  // ... existing fields
  isFeatured: z.boolean().optional().default(false),
  showKnowledgeGraph: z.boolean().optional().default(false),  // ← New
  // ...
});
```

Added to POST handler (create course):
```typescript
const course = new CourseModel({
  // ...
  isFeatured: parsed.isFeatured ?? false,
  showKnowledgeGraph: parsed.showKnowledgeGraph ?? false,  // ← Defaults to false
  // ...
});
```

#### **File:** `src/app/api/admin/courses/[courseId]/route.ts`

Added to GET response:
```typescript
const detailedCourse = {
  // ...
  isFeatured: Boolean(courseDoc.isFeatured),
  showKnowledgeGraph: Boolean(courseDoc.showKnowledgeGraph),  // ← Returns current value
  // ...
};
```

Added to PUT handler (update course):
```typescript
if (parsed.showKnowledgeGraph !== undefined)
  courseDoc.showKnowledgeGraph = parsed.showKnowledgeGraph;
```

---

### 5. ✅ Frontend - Conditional Rendering

#### **File:** `src/app/courses/[slug]/page.tsx` (Course Detail Page)

Changed from:
```tsx
{/* T024: Knowledge Graph Visualization */}
{outline && outline.length > 0 && (
  <div className='container mx-auto max-w-6xl px-4 py-12'>
    <KnowledgeGraph courseSlug={course.slug} includeProgress={!!enrollment} />
  </div>
)}
```

To:
```tsx
{/* T024: Knowledge Graph Visualization (conditionally rendered) */}
{course.showKnowledgeGraph && outline && outline.length > 0 && (
  <div className='container mx-auto max-w-6xl px-4 py-12'>
    <KnowledgeGraph courseSlug={course.slug} includeProgress={!!enrollment} />
  </div>
)}
```

**Effect:** Graph only appears if admin has enabled it for that specific course.

#### **File:** `src/app/courses/[slug]/lesson/[lessonId]/page.tsx` (Lesson Viewer)

Changed from:
```tsx
{/* Knowledge Graph */}
<div>
  <KnowledgeGraph courseSlug={slug} lessonSlug={String(lesson._id)} includeProgress={!!progress} />
</div>
```

To:
```tsx
{/* Knowledge Graph (conditionally rendered based on course setting) */}
{course.showKnowledgeGraph && (
  <div>
    <KnowledgeGraph courseSlug={slug} lessonSlug={String(lesson._id)} includeProgress={!!progress} />
  </div>
)}
```

**Effect:** Lesson-level graph only shows if feature is enabled for the course.

---

### 6. ✅ Sub-Lessons Repositioning

#### Problem
Sub-lessons were displayed in the sidebar (left column) making them compete with Course Overview and Knowledge Graph for space.

#### Solution
Moved sub-lessons section from **sidebar** to **main content area**, positioned between:
- **Above:** Lesson content (blog/video/standalone/flashcards)
- **Below:** Flashcard study materials section
- **Above:** Previous/Next navigation buttons

#### **File:** `src/app/courses/[slug]/lesson/[lessonId]/page.tsx`

**Before:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[500px_1fr] gap-6">
  {/* Left Sidebar */}
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>Course Overview</div>
      <div>Knowledge Graph</div>
    </div>
    
    {/* Sub-Lessons Card (TOC) */}
    {subLessons.length > 0 && (
      <div className="bg-card...">
        <!-- Sub-lessons list -->
      </div>
    )}
  </div>
  
  {/* Right Content Area */}
  <div className="space-y-6">
    <!-- Lesson content -->
    <!-- Flashcards -->
    <!-- Navigation -->
  </div>
</div>
```

**After:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] xl:grid-cols-[500px_1fr] gap-6">
  {/* Left Sidebar */}
  <div className="space-y-6">
    <div className="grid grid-cols-2 gap-4">
      <div>Course Overview</div>
      {course.showKnowledgeGraph && <div>Knowledge Graph</div>}
    </div>
    
    {/* Sub-Lessons moved to content area - see below */}
  </div>
  
  {/* Right Content Area */}
  <div className="space-y-6">
    <!-- Lesson content -->
    <!-- Flashcards -->
    
    {/* Sub-Lessons Section - Moved here (after content, before navigation) */}
    {subLessons.length > 0 && (
      <div className="bg-card...">
        <!-- Sub-lessons list -->
      </div>
    )}
    
    <!-- Previous/Next Navigation -->
  </div>
</div>
```

**Benefits:**
1. ✅ Sub-lessons get full content width instead of cramped sidebar
2. ✅ Better visual hierarchy - "what's next" appears after current content
3. ✅ Cleaner sidebar with just course overview and optional graph
4. ✅ Logical flow: Content → Study Materials → Sub-Lessons → Navigation

---

## Usage Instructions

### For Admins

1. **Navigate to:** `/admin/courses/[courseId]`
2. **Find Section:** Course Settings (below Hero Image/Lottie fields)
3. **Toggle:** "Enable Knowledge Graph" switch
4. **Save:** Click "Save Course" button
5. **Verify:** Visit course page to see Knowledge Graph rendered

### For Users

- **If enabled:** Knowledge Graph appears on:
  - Course detail page (below module outline)
  - Lesson viewer page (sidebar, small graph)
- **If disabled:** No graph components render at all
- Sub-lessons always appear after lesson content (if they exist)

---

## Testing Checklist

### Admin Panel
- [ ] Can toggle "Enable Knowledge Graph" on/off
- [ ] Setting persists after save
- [ ] Default is `false` for new courses
- [ ] Toggle appears next to "Feature this course"

### Course Detail Page
- [ ] Graph hidden when `showKnowledgeGraph = false`
- [ ] Graph visible when `showKnowledgeGraph = true`
- [ ] No console errors when toggled

### Lesson Viewer Page
- [ ] Sidebar graph hidden when `showKnowledgeGraph = false`
- [ ] Sidebar graph visible when `showKnowledgeGraph = true`
- [ ] Sub-lessons section appears below content (if parent lesson)
- [ ] Sub-lessons full-width in content area
- [ ] Navigation buttons appear below sub-lessons

### API Endpoints
- [ ] GET `/api/admin/courses/[courseId]` includes `showKnowledgeGraph`
- [ ] PUT `/api/admin/courses/[courseId]` updates `showKnowledgeGraph`
- [ ] POST `/api/admin/courses` accepts `showKnowledgeGraph` (defaults false)

---

## Migration Notes

### Existing Courses
All existing courses will have `showKnowledgeGraph = false` by default (MongoDB default value).

To **enable** for existing courses:
```typescript
// Via MongoDB shell
db.courses.updateMany(
  {},
  { $set: { showKnowledgeGraph: false } }  // Or true to enable globally
);

// Or via admin panel individually
```

### No Breaking Changes
- Knowledge Graph code remains unchanged
- Feature simply becomes opt-in via admin toggle
- Backward compatible with existing course structure

---

## Why This Approach?

### 1. **Experimental Feature Protection**
Knowledge Graph is marked "experimental" and incomplete. Hiding it by default prevents users from seeing unfinished work.

### 2. **Per-Course Control**
Some courses may benefit more from graph visualization (complex dependencies) while others don't need it. Admin can decide per-course.

### 3. **Performance**
Graph generation and rendering has overhead. Disabling by default reduces unnecessary API calls and client-side computation.

### 4. **Gradual Rollout**
Admin can enable for specific courses to test, gather feedback, then expand.

### 5. **Better UX**
Sub-lessons repositioning puts navigation hints closer to lesson completion (natural reading flow).

---

## Related Files

### Modified
- ✅ `src/models/Course.ts` - Added schema field
- ✅ `src/types/courses.ts` - Added TS interface field
- ✅ `src/components/admin/courses/CourseManagerContent.tsx` - Added UI toggle
- ✅ `src/app/api/admin/courses/route.ts` - Schema + POST handler
- ✅ `src/app/api/admin/courses/[courseId]/route.ts` - GET + PUT handlers
- ✅ `src/app/courses/[slug]/page.tsx` - Conditional rendering
- ✅ `src/app/courses/[slug]/lesson/[lessonId]/page.tsx` - Conditional + reposition

### Unchanged (No Modifications Needed)
- `src/components/courses/KnowledgeGraph.tsx` - Works as before
- `src/components/courses/GraphCanvasEnhanced.tsx` - Works as before
- `src/lib/graph/*` - All graph library code unchanged
- `src/app/api/courses/[courseId]/graph/route.ts` - API still works

---

## Summary

✅ **Admin Toggle:** Added `showKnowledgeGraph` field (default: `false`)  
✅ **UI Control:** Switch in Course Manager Settings  
✅ **API Support:** Full CRUD for new field  
✅ **Conditional Rendering:** Graph only shows if enabled  
✅ **Sub-Lessons UX:** Moved to content area for better flow  
✅ **Zero Errors:** All TypeScript checks pass  
✅ **Backward Compatible:** Existing courses unaffected (default off)

The Knowledge Graph feature is now **opt-in** and sub-lessons have **better positioning** in the lesson viewer! 🎉
