# Enroll/Unenroll Redirect Fix

## Problem
The enroll and unenroll API routes were throwing errors:
```
Error: URL is malformed "/courses/...". Please use only absolute URLs
```

## Root Cause
`NextResponse.redirect()` requires an **absolute URL** (with protocol and domain), not a relative path. The code was passing relative paths like:
- `/courses/probability-entropy-and-monte-carlo-simulation`
- `/courses`
- `/sign-in`

## Solution
Construct absolute URLs using the request's origin:

### Before (Broken)
```typescript
// ❌ Relative path - causes error
return NextResponse.redirect('/courses/my-course');
return NextResponse.redirect(`/courses/${course.slug}`);
```

### After (Fixed)
```typescript
// ✅ Absolute URL using request origin
const url = new URL(req.url);
return NextResponse.redirect(new URL('/courses/my-course', url.origin));
return NextResponse.redirect(new URL(`/courses/${course.slug}`, url.origin));
```

## Files Changed

### 1. `/src/app/api/courses/[courseId]/enroll/route.ts`
**Fixed redirects in POST method:**
- After successful enrollment → redirects to course page
- If already enrolled → redirects to course page

**Changes:**
```typescript
// Extract URL for origin
const url = new URL(req.url);

// Create absolute redirect URL
const backTo = new URL(`/courses/${course.slug}`, url.origin);
return NextResponse.redirect(backTo);
```

### 2. `/src/app/api/courses/[courseId]/unenroll/route.ts`
**Fixed all redirects in POST method:**
- No auth → `/sign-in`
- Course not found → `/courses`
- User not found → `/courses/{slug}`
- Success → `/courses/{slug}`
- Error catch → `/courses`

**Changes:**
```typescript
// Extract URL early for use throughout
const url = new URL(req.url);

// All redirects now use absolute URLs
if (!userId) {
  return NextResponse.redirect(new URL('/sign-in', url.origin));
}

if (!course) {
  return NextResponse.redirect(new URL('/courses', url.origin));
}

// Success case
return NextResponse.redirect(new URL(`/courses/${course.slug}`, url.origin));
```

## Testing
✅ **Enroll**: User clicks "Enroll Now" → enrolls → redirects to course page
✅ **Already Enrolled**: User clicks "Enroll Now" again → redirects without error
✅ **Unenroll**: User clicks "Unenroll" → unenrolls → redirects to course page
✅ **Error Handling**: All error cases redirect properly

## Key Takeaway
In Next.js 13+ App Router:
- **Always use absolute URLs** with `NextResponse.redirect()`
- Get the origin from `new URL(req.url).origin`
- Construct redirect URL: `new URL('/path', origin)`

## Related Documentation
https://nextjs.org/docs/messages/middleware-relative-urls
