# Course Page Lesson Buttons Fix

## Problems Fixed

### 1. Preview Button Showing for Enrolled Users
**Issue**: Preview button was always showing, even when user was enrolled
**Expected**: Only show Preview for non-enrolled users (to entice them to enroll)

### 2. Start Button Not Working
**Issue**: Start button linked to hash anchor (`#lesson-{id}`) which did nothing
**Expected**: Start button should open the lesson content

## Changes Made

### Parent Lessons
**Before:**
```tsx
{/* PROBLEM: Always showed both Start AND Preview */}
{enrollment ? (
  <Link href={`/courses/${course.slug}#lesson-${id}`}>Start</Link>
) : null}

{l.isPreviewable ? (
  <Link href={`/courses/preview/${id}`}>Preview</Link>
) : (
  <span>Preview N/A</span>
)}
```

**After:**
```tsx
{/* ✅ FIXED: Enrolled users only see Start button */}
{enrollment ? (
  <Link href={`/courses/preview/${String(l._id)}`}
    className='border-blue-600 bg-blue-600 text-white'>
    Start
  </Link>
) : null}

{/* ✅ FIXED: Non-enrolled users only see Preview */}
{!enrollment && l.isPreviewable ? (
  <Link href={`/courses/preview/${String(l._id)}`}
    className='bg-blue-100 text-blue-700'>
    Preview
  </Link>
) : !enrollment ? (
  <span>Preview N/A</span>
) : null}
```

### Sub-Lessons
Same fix applied to sub-lessons with smaller styling:
```tsx
{enrollment ? (
  <Link href={`/courses/preview/${String(s._id)}`}
    className='bg-blue-600 text-white text-[11px]'>
    Start
  </Link>
) : null}

{!enrollment && s.isPreviewable ? (
  <Link href={`/courses/preview/${String(s._id)}`}
    className='bg-blue-100 text-blue-700 text-[11px]'>
    Preview
  </Link>
) : !enrollment ? (
  <span>Preview N/A</span>
) : null}
```

## User Experience

### For Non-Enrolled Users:
- ✅ See **Preview** button (if lesson is previewable)
- ✅ See "Preview N/A" text (if lesson is not previewable)
- ❌ No Start button (they need to enroll first)

### For Enrolled Users:
- ✅ See **Start** button (blue background, prominent)
- ❌ No Preview button (they're enrolled, they get full access)
- ❌ No "Preview N/A" text

## Visual Differences

### Start Button (Enrolled):
- **Color**: Blue background (#2563eb)
- **Text**: White
- **Style**: Bold, prominent CTA
- **Action**: Opens lesson content

### Preview Button (Non-Enrolled):
- **Color**: Light blue background (#dbeafe)
- **Text**: Blue (#1d4ed8)
- **Style**: Softer, secondary action
- **Action**: Opens preview of lesson

## Benefits

1. **Clearer UX**: Enrolled vs non-enrolled users see different actions
2. **Less Clutter**: Don't show both buttons to same user
3. **Working Buttons**: Start button actually navigates to lesson content
4. **Better Conversion**: Preview entices non-enrolled users to enroll
5. **Logical Flow**: Enrolled users get direct access via Start button

## File Changed
- `/src/app/courses/[slug]/page.tsx` - Updated button logic for both parent lessons and sub-lessons

## Testing Checklist
- [ ] Non-enrolled user: Only sees Preview (or "Preview N/A")
- [ ] Enrolled user: Only sees Start button (blue, prominent)
- [ ] Start button: Opens lesson in preview page
- [ ] Preview button: Opens lesson preview
- [ ] Sub-lessons: Same behavior as parent lessons
- [ ] Blog lessons: Preview links to blog post
