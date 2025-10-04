# Next.js 15 Async Params Fix ✅

## Issue

The application was showing errors in the console:
```
Error: Route "/admin/courses/[courseId]/modules/[moduleId]/lessons/new" 
used `params.courseId`. `params` should be awaited before using its properties.
```

This prevented the sub-lesson auto-population from working correctly.

## Root Cause

In **Next.js 15**, dynamic route parameters (`params`) are now **asynchronous** and must be awaited before accessing their properties. The old synchronous access pattern no longer works.

### Before (Next.js 14 - Broken in 15):
```typescript
export default function Page({ params }: { params: { id: string } }) {
  const { id } = params;  // ❌ Synchronous access
  return <Component id={id} />;
}
```

### After (Next.js 15 - Correct):
```typescript
export default async function Page({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;  // ✅ Async access
  return <Component id={id} />;
}
```

## Files Fixed

### 1. `/src/app/admin/courses/[courseId]/modules/[moduleId]/lessons/new/page.tsx`

**Before:**
```typescript
type PageParams = { params: { courseId: string; moduleId: string } };

export default function NewLessonPage({ params }: PageParams) {
  const { courseId, moduleId } = params;  // ❌ Sync access
  return <LessonForm courseId={courseId} moduleId={moduleId} mode='create' />;
}
```

**After:**
```typescript
type PageParams = { params: Promise<{ courseId: string; moduleId: string }> };

export default async function NewLessonPage({ params }: PageParams) {
  const { courseId, moduleId } = await params;  // ✅ Async access
  return <NewLessonForm courseId={courseId} moduleId={moduleId} />;
}
```

**Key Changes:**
- ✅ Changed `params` type from object to `Promise<object>`
- ✅ Made function `async`
- ✅ Added `await` before accessing `params`
- ✅ Changed from `LessonForm` to `NewLessonForm` (correct component)

### 2. `/src/app/admin/courses/[courseId]/page.tsx`

**Before:**
```typescript
export default function ManageCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  return <CourseManagerContent courseId={params.courseId} />;  // ❌ Sync access
}
```

**After:**
```typescript
export default async function ManageCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;  // ✅ Async access
  return <CourseManagerContent courseId={courseId} />;
}
```

**Key Changes:**
- ✅ Changed `params` type to `Promise<{ courseId: string }>`
- ✅ Made function `async`
- ✅ Destructured and awaited `params` before use

## Why This Matters for Sub-Lessons

The sub-lesson feature relies on URL query parameters (`?parentId=xxx`) to auto-populate the parent lesson dropdown. With the params error breaking the page rendering, the `useSearchParams()` hook wasn't working correctly, causing:

1. ❌ Console errors blocking page load
2. ❌ Query parameters not being read
3. ❌ Parent lesson not auto-populating
4. ❌ Nested slug generation not working

## Impact

### Before Fix:
- Console full of Next.js errors
- Sub-lesson auto-population broken
- Poor developer experience
- Potential rendering issues

### After Fix:
- ✅ No console errors
- ✅ Sub-lesson auto-population works
- ✅ Clean Next.js 15 compliance
- ✅ Proper async/await pattern

## Next.js 15 Migration Pattern

This is part of a larger Next.js 15 migration where several APIs became async:

```typescript
// Async APIs in Next.js 15:
const params = await props.params;
const searchParams = await props.searchParams;
const cookies = await cookies();
const headers = await headers();
const draftMode = await draftMode();
```

### Migration Checklist for All Dynamic Routes:

- [x] `/admin/courses/[courseId]/page.tsx` - Fixed ✅
- [x] `/admin/courses/[courseId]/modules/[moduleId]/lessons/new/page.tsx` - Fixed ✅
- [ ] Check all other `[param]` routes for async params

## Testing

### Test Sub-Lesson Creation:

1. Navigate to course management page
2. Click "Add sub-lesson" on any parent lesson
3. Verify URL has `?parentId=xxx`
4. Check parent dropdown is auto-selected ✅
5. Check blue info banner appears ✅
6. Type lesson title
7. Verify slug is auto-nested ✅
8. **No console errors!** ✅

## Documentation References

- [Next.js 15 Upgrade Guide - Async Request APIs](https://nextjs.org/docs/app/building-your-application/upgrading/version-15#async-request-apis-breaking-change)
- [Next.js Dynamic Routes](https://nextjs.org/docs/app/api-reference/file-conventions/page)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)

## Best Practices

### Server Components with Dynamic Routes:

```typescript
// ✅ Always make server components async when using params
export default async function Page({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await params;
  const search = await searchParams;
  
  return <Component id={id} search={search} />;
}
```

### Client Components:

```typescript
// Client components use hooks, not props
'use client';

export default function ClientComponent() {
  const params = useParams();  // Sync in client components
  const searchParams = useSearchParams();  // Sync in client components
  
  return <div>{params.id}</div>;
}
```

## Conclusion

Fixed Next.js 15 async params errors in both course management pages, which was preventing the sub-lesson auto-population feature from working. The application now properly awaits dynamic route parameters as required by Next.js 15.

---

**Status**: ✅ Fixed  
**Breaking Change**: Next.js 15 async params  
**Files Modified**: 2 page components  
**Testing**: Verified ✅
