# Experience CRUD Fix - Admin Access Issue

## Problem
When trying to create a new experience on the admin page (`/admin/experience/new`), users were being redirected to the home page instead of being able to access the form.

## Root Cause
The issue was caused by **inconsistent authentication checks** between the admin layout and the experience pages:

1. **Admin Layout** (`src/app/admin/layout.tsx`):
   - Uses `currentUser()` from Clerk
   - Checks role via `user.publicMetadata?.role`
   - Allows both 'admin' and 'editor' roles

2. **Experience Pages** (before fix):
   - Used `auth()` from Clerk  
   - Checked role via `sessionClaims?.metadata?.role`
   - Only allowed 'admin' role initially
   - **Problem**: `sessionClaims?.metadata` and `publicMetadata` are different Clerk properties

This mismatch meant that even if a user passed the layout authentication, they would fail the page-level check and get redirected.

## Files Fixed

### 1. `/src/app/admin/experience/new/page.tsx`
**Changes:**
- ✅ Changed from `auth()` to `currentUser()`
- ✅ Changed from `sessionClaims?.metadata?.role` to `user.publicMetadata?.role`
- ✅ Changed redirect from `/` to `/access-denied` for unauthorized users
- ✅ Allow both 'admin' and 'editor' roles

### 2. `/src/app/admin/experience/[id]/edit/page.tsx`
**Changes:**
- ✅ Changed from `auth()` to `currentUser()`
- ✅ Changed from `sessionClaims?.metadata?.role` to `user.publicMetadata?.role`
- ✅ Changed redirect from `/` to `/access-denied` for unauthorized users
- ✅ Allow both 'admin' and 'editor' roles

## Implementation Details

### Before (Incorrect):
```tsx
import { auth } from '@clerk/nextjs/server';

export default async function NewExperiencePage() {
  const { userId, sessionClaims } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const role = (sessionClaims?.metadata as { role?: string })?.role;
  if (role !== 'admin') {
    redirect('/');
  }
  // ...
}
```

### After (Correct):
```tsx
import { currentUser } from '@clerk/nextjs/server';

export default async function NewExperiencePage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in?redirect_url=/admin/experience/new');
  }

  const userRole = (user.publicMetadata?.role as string) || 'user';
  if (!['editor', 'admin'].includes(userRole)) {
    redirect('/access-denied');
  }
  // ...
}
```

## Related Systems (Already Correct)

The following were already implemented correctly and did not need changes:

### API Routes
- ✅ `/api/admin/experience/route.ts` - Correctly checks for 'admin' or 'editor' role
- ✅ `/api/admin/experience/[id]/route.ts` - Correctly checks for 'admin' or 'editor' role
- ✅ `/api/admin/experience/reorder/route.ts` - Correctly checks for 'admin' or 'editor' role

### Components
- ✅ `ExperienceForm.tsx` - Correctly submits to API and handles responses
- ✅ `AdminExperienceListClient.tsx` - Correctly displays and manages experiences

### Middleware
- ✅ `src/middleware.ts` - Correctly protects admin routes

## Testing Checklist

- [ ] Admin user can access `/admin/experience/new`
- [ ] Admin user can create a new experience
- [ ] Admin user can edit existing experiences
- [ ] Admin user can delete experiences
- [ ] Admin user can reorder experiences via drag-and-drop
- [ ] Editor user can access `/admin/experience/new`
- [ ] Editor user can create a new experience
- [ ] Editor user can edit existing experiences
- [ ] Regular user (non-admin/editor) gets redirected to `/access-denied`
- [ ] Unauthenticated users get redirected to `/sign-in`

## Best Practices Applied

1. **Consistent Authentication Pattern**: Now matches the pattern used in other admin pages (e.g., `/admin/books`)
2. **Proper Redirect URLs**: Includes redirect_url parameter for better UX after sign-in
3. **Role-Based Access Control**: Allows both 'admin' and 'editor' roles consistently across all experience-related endpoints
4. **User-Friendly Error Handling**: Redirects to `/access-denied` instead of home page for unauthorized access

## Related Documentation

- Clerk Authentication: Uses `currentUser()` for server-side auth checks
- Role Access: Roles stored in Clerk's `publicMetadata.role` field
- Middleware: Global route protection in `src/middleware.ts`
- API Security: All admin API routes check user role from database
