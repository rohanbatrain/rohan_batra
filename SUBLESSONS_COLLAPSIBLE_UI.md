# Sub-Lessons Collapsible UI Implementation

## Overview
Implemented collapsible/expandable UI for parent lessons that have sub-lessons (children). This provides better organization and cleaner interface when there are many sub-lessons, matching the user's desired UX pattern.

## What Was Implemented

### 1. **Collapse State Management**
- Added `collapsedLessons` state (Set<string>) to track which parent lessons are collapsed
- Implemented `toggleLessonCollapse(lessonId: string)` function to toggle collapse state
- State persists during the session (not in localStorage yet)

### 2. **Visual Indicators**
- **Chevron Button**: Added animated chevron to parent lessons with children
  - `ChevronRight` icon when collapsed
  - `ChevronDown` icon when expanded
  - Positioned next to the lesson title
  - Smooth hover effect with `hover:bg-muted` transition
  
- **Sub-lesson Count Badge**: Shows number of sub-lessons
  - Example: "2 sub-lessons" or "1 sub-lesson"
  - Uses secondary variant badge
  - Only shows on parent lessons with children

### 3. **Conditional Rendering**
- Children only render when parent is NOT collapsed
- Added check: `!collapsedLessons.has(lesson.id)`
- Maintains visual hierarchy with indentation and border-l when expanded
- Preserves drag-and-drop functionality

### 4. **Updated Components**

#### CourseManagerContent.tsx Changes:
```typescript
// Added imports
import { ChevronRight, ChevronDown } from 'lucide-react';

// Added state
const [collapsedLessons, setCollapsedLessons] = useState<Set<string>>(new Set());

// Added toggle function
const toggleLessonCollapse = (lessonId: string) => {
  setCollapsedLessons(prev => {
    const next = new Set(prev);
    if (next.has(lessonId)) {
      next.delete(lessonId);
    } else {
      next.add(lessonId);
    }
    return next;
  });
};

// Updated SortableModuleCard props
<SortableModuleCard
  // ... existing props
  collapsedLessons={collapsedLessons}
  onToggleLessonCollapse={toggleLessonCollapse}
/>

// Updated SortableLessonRow with collapse props
<SortableLessonRow
  // ... existing props
  hasChildren={childLessons.length > 0}
  isCollapsed={collapsedLessons.has(lesson.id)}
  onToggleCollapse={() => onToggleLessonCollapse(lesson.id)}
  childCount={childLessons.length}
/>

// Conditional child rendering
{childLessons.length > 0 && !collapsedLessons.has(lesson.id) && (
  <div className='ml-8 space-y-2 border-l-2 border-muted pl-4'>
    {/* render children */}
  </div>
)}
```

#### SortableLessonRow Interface Updates:
```typescript
interface SortableLessonRowProps {
  // ... existing props
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  childCount?: number;
}
```

#### UI Structure:
```tsx
<div className='flex items-center gap-2 font-medium'>
  {hasChildren && !isChild && onToggleCollapse && (
    <button
      type='button'
      onClick={onToggleCollapse}
      className='rounded p-0.5 hover:bg-muted transition'
      aria-label={isCollapsed ? 'Expand sub-lessons' : 'Collapse sub-lessons'}
    >
      {isCollapsed ? (
        <ChevronRight className='h-4 w-4 text-muted-foreground' />
      ) : (
        <ChevronDown className='h-4 w-4 text-muted-foreground' />
      )}
    </button>
  )}
  {isChild && <span className='text-muted-foreground'>└─</span>}
  <span>{lesson.title}</span>
  {hasChildren && !isChild && childCount > 0 && (
    <Badge variant='secondary' className='text-xs'>
      {childCount} sub-lesson{childCount === 1 ? '' : 's'}
    </Badge>
  )}
</div>
```

## User Experience

### Default State
- All parent lessons start **expanded** (children visible)
- Easy to see the full hierarchy at a glance

### Collapsed State
- Click chevron to collapse → children hidden
- Chevron rotates to point right (`ChevronRight`)
- Badge shows sub-lesson count
- Cleaner view when there are many sub-lessons

### Expanded State  
- Click chevron to expand → children visible
- Chevron points down (`ChevronDown`)
- Full hierarchy with indentation and tree symbols (└─)
- Badge still shows count for reference

## Features

✅ **Clean UI**: Reduces visual clutter for courses with many sub-lessons
✅ **Intuitive**: Familiar chevron pattern (like file explorers)
✅ **Accessible**: ARIA labels for screen readers
✅ **Performant**: Uses React Set for O(1) lookups
✅ **Consistent**: Matches existing module/lesson visual hierarchy
✅ **Interactive**: Smooth hover effects and transitions
✅ **Informative**: Count badge shows number of sub-lessons at a glance

## Technical Details

### State Type
```typescript
const [collapsedLessons, setCollapsedLessons] = useState<Set<string>>(new Set());
```
- Uses `Set<string>` for efficient O(1) lookup
- Stores lesson IDs that are collapsed
- Empty set = all expanded

### Toggle Logic
```typescript
const toggleLessonCollapse = (lessonId: string) => {
  setCollapsedLessons(prev => {
    const next = new Set(prev);
    if (next.has(lessonId)) {
      next.delete(lessonId);  // Expand
    } else {
      next.add(lessonId);     // Collapse
    }
    return next;
  });
};
```

### Conditional Rendering
```typescript
{childLessons.length > 0 && !collapsedLessons.has(lesson.id) && (
  // Render children only when NOT collapsed
)}
```

## Testing Checklist

- [x] Chevron appears only on parent lessons with children
- [x] Chevron toggles between right (collapsed) and down (expanded)
- [x] Children hide/show when chevron is clicked
- [x] Sub-lesson count badge displays correctly
- [x] Drag-and-drop works for both parent and child lessons
- [x] **Drag-and-drop order persists for sub-lessons**
- [x] Visual hierarchy maintained (indentation, borders, tree symbols)
- [x] No TypeScript errors
- [x] ARIA labels present for accessibility
- [x] **Sub-lessons appear nested under parent (not at bottom level)**
- [x] **Sub-lessons maintain backend order (respects drag-and-drop)**

## Bug Fixes Applied

### Issue #1: Sub-lessons appearing at bottom instead of nested
**Problem**: When creating a new sub-lesson, it was appearing at the same level as parent lessons at the bottom of the list, instead of being nested under its parent.

**Root Cause**: 
1. The `parentLessonId` field was not being returned in the API response
2. Child lessons weren't being sorted by creation date

**Solution**:
1. Added `parentLessonId` to the API response in `/src/app/api/admin/courses/[courseId]/route.ts`
2. Added `createdAt` field to the `LessonDetail` interface
3. Child lessons now maintain the order from the backend (based on `module.lessonIds` array)

**Files Changed**:
- `/src/app/api/admin/courses/[courseId]/route.ts` - Added `parentLessonId` to lesson mapping
- `/src/components/admin/courses/CourseManagerContent.tsx` - Added `createdAt` to interface

### Issue #2: Cannot reorder sub-lessons via drag-and-drop
**Problem**: Sub-lessons could be dragged but their order wouldn't persist - they would reset to creation date order.

**Root Cause**: 
Frontend was sorting child lessons by `createdAt`, overriding the backend order which reflects drag-and-drop changes stored in `module.lessonIds`.

**Solution**:
Removed the `.sort()` call on child lessons - now they maintain the order from the backend:
```typescript
// BEFORE (broken):
const childLessons = module.lessons
  .filter(child => child.parentLessonId === lesson.id)
  .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

// AFTER (fixed):
const childLessons = module.lessons
  .filter(child => child.parentLessonId === lesson.id);
```

**How It Works**:
1. Backend returns lessons ordered by `module.lessonIds` array
2. When you drag-and-drop a lesson (parent or child), `handleLessonReorder` updates the backend
3. Backend saves the new order in `module.lessonIds`
4. Next fetch returns lessons in the updated order
5. Frontend now respects this order instead of re-sorting

**Files Changed**:
- `/src/components/admin/courses/CourseManagerContent.tsx` - Removed `.sort()` call

## Future Enhancements (Optional)

1. **Persist State**: Save collapse state to localStorage
2. **Collapse All/Expand All**: Bulk actions for all parent lessons in a module
3. **Auto-collapse**: Option to auto-collapse lessons with many children
4. **Animation**: Smooth transition when expanding/collapsing
5. **Keyboard Navigation**: Arrow keys to expand/collapse

---

## Consumer-Facing Collapsible UI (Course Page)

### Overview
Implemented collapsible UI for parent lessons with sub-lessons on the student course page (`/courses/[slug]`), matching the module collapse pattern.

### Implementation Details

#### File: `src/app/courses/[slug]/page.tsx`

**Structure**:
- Lessons with sub-lessons use `<details>` element (native HTML collapsible)
- Lessons without sub-lessons use standard `<div>` layout
- Default state: **open** (sub-lessons visible)

**Key Features**:
```tsx
{Array.isArray(l.subLessons) && l.subLessons.length > 0 ? (
  <details className='group/details' open>
    <summary className='flex cursor-pointer items-center justify-between gap-4...'>
      {/* Parent lesson info: completion status, title, metadata */}
      {/* Start/Review button for enrolled users */}
      {/* Preview button for non-enrolled users */}
      
      {/* Rotating chevron icon */}
      <svg className='...transition-transform duration-200 group-open/details:rotate-180'>
        {/* Down chevron (▼) */}
      </svg>
    </summary>
    
    {/* Collapsible sub-lessons list */}
    <div className='border-t border-gray-100 bg-gradient-to-r...'>
      <ul className='divide-y...'>
        {l.subLessons.map((s) => (
          <li>
            {/* Sub-lesson with tree symbol (└─), completion status, buttons */}
          </li>
        ))}
      </ul>
    </div>
  </details>
) : (
  /* Regular lesson without sub-lessons */
  <div className='flex items-center justify-between...'>
    {/* Standard lesson layout */}
  </div>
)}
```

### Consumer UX Benefits

**Before**:
- All sub-lessons always visible
- Long course outlines difficult to scan
- No way to collapse completed sections

**After**:
- ✅ Sub-lessons collapsible by clicking parent lesson
- ✅ Chevron rotates (▼ → ►) to indicate state
- ✅ Opens by default so nothing hidden
- ✅ Cleaner course outline for courses with many sub-lessons
- ✅ Users can collapse to focus on remaining work

### Visual Indicators

- **Chevron Down** (▼): Sub-lessons visible/expanded
- **Chevron Rotated** (►): Sub-lessons hidden/collapsed (180° rotation)
- **Hover Effect**: Summary has hover background (`hover:bg-gray-50 dark:hover:bg-gray-800/50`)
- **Cursor**: Pointer on summary to show interactivity
- **Click Prevention**: Buttons have `onClick={(e) => e.stopPropagation()}` so Start/Review/Preview don't trigger collapse

### Accessibility

- ✅ Native `<details>` element provides keyboard navigation (Enter/Space)
- ✅ `aria-label` on Start/Review/Preview buttons
- ✅ Semantic HTML for screen readers
- ✅ High contrast mode compatible
- ✅ Focus visible on summary when keyboard navigating

### Technical Notes

**Chevron Animation**:
```tsx
<svg className='h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 group-open/details:rotate-180'>
```
- Uses Tailwind's `group-open/details` variant
- `transition-transform duration-200` for smooth rotation
- Rotates 180° when details element opens

**Stop Propagation for Buttons**:
```tsx
<Link
  href={`/courses/${course.slug}/lesson/${String(l._id)}`}
  onClick={(e) => e.stopPropagation()}
  // ...
>
  Start
</Link>
```
- Prevents summary click event when clicking buttons
- Allows navigating to lessons without collapsing

### Consistency with Admin UI

Both admin and consumer UIs now have collapsible sub-lessons:

| Feature | Admin (Course Manager) | Consumer (Course Page) |
|---------|------------------------|------------------------|
| Collapse Mechanism | Custom state + chevron button | Native `<details>` element |
| Default State | Expanded | Expanded (`open` attribute) |
| Icon | ChevronRight/ChevronDown (Lucide) | SVG chevron path |
| Styling | Card-based, drag-and-drop | List-based, read-only |
| Purpose | Edit and organize | View and navigate |

---

## Related Files

**Admin UI**:
- `/src/components/admin/courses/CourseManagerContent.tsx` - Admin collapsible implementation
- `/src/components/admin/courses/NewLessonForm.tsx` - Sub-lesson creation
- `/src/components/admin/courses/LessonForm.tsx` - Sub-lesson editing

**Consumer UI**:
- `/src/app/courses/[slug]/page.tsx` - Course page collapsible implementation
- `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx` - Lesson viewer

## Documentation References

- `SUBLESSONS_IMPLEMENTATION_COMPLETE.md` - Full sub-lesson feature
- `SUBLESSONS_VISUAL_GUIDE.md` - Visual hierarchy documentation
- `SUBLESSONS_UI_FLOW.md` - User flow for creating sub-lessons
- `SUBLESSONS_CONSUMER_VIEW.md` - Consumer-facing features
