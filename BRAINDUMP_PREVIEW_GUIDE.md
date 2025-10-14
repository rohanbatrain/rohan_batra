# Braindump Preview Guide

## How to Preview Braindumps (Private, Unlisted, or Public)

### Problem
You created a braindump with `visibility: private` or `visibility: unlisted` and want to see how it will look to viewers **before** making it public.

### Solution

There are **3 ways** to preview your braindumps:

---

## 1. ✨ Preview Mode (Recommended) - NEW!

**Access**: `/braindump/preview/[id]`

**Features**:
- ✅ Preview ANY braindump (private, unlisted, or public)
- ✅ Shows exactly how it will appear to viewers
- ✅ Displays visibility status banner
- ✅ Works for braindumps without slugs
- ✅ Analytics tracking disabled (doesn't inflate view counts)
- ✅ Owner-only access (authenticated)

**How to Use**:

### From Admin Panel:
1. Go to `/admin/braindump`
2. Find your braindump
3. Click the **3-dot menu (⋮)**
4. Select **"👁️ Preview"**
5. Opens in new tab with preview mode banner

### Direct URL:
```
/braindump/preview/<your-braindump-id>
```

**Example**:
```
/braindump/preview/67064a8b3e4f2c001a5b8d91
```

---

## 2. 🌐 Public Page (For Unlisted/Public Only)

**Access**: `/braindump/[slug]`

**Limitations**:
- ❌ Does NOT work for `private` braindumps (403 Forbidden)
- ✅ Works for `unlisted` braindumps (with slug)
- ✅ Works for `public` braindumps (with slug)
- ⚠️ Increments view count
- ⚠️ Tracks analytics

**How to Use**:

### From Admin Panel:
1. Set visibility to `unlisted` or `public`
2. A slug is auto-generated
3. Click **3-dot menu (⋮)**
4. Select **"🔗 View Public Page"**

### Direct URL:
```
/braindump/<your-slug>
```

**Example**:
```
/braindump/my-thoughts-on-react-19-abc123
```

---

## 3. 🔧 Change Visibility Temporarily

**Process**:
1. Edit braindump in admin panel
2. Change `visibility` to `unlisted` or `public`
3. View public page
4. Change back to `private` if needed

**Note**: Slug persists even after changing back to private.

---

## Comparison Table

| Method | Private | Unlisted | Public | Analytics | Requires Auth |
|--------|---------|----------|--------|-----------|---------------|
| **Preview Mode** | ✅ | ✅ | ✅ | ❌ Disabled | ✅ Yes |
| **Public Page** | ❌ | ✅ | ✅ | ✅ Enabled | ❌ No |
| **Temp Change** | ⚠️ Manual | ✅ | ✅ | ✅ Enabled | ❌ No |

---

## Understanding Visibility Levels

### 🔒 Private
- **Only you** can see it (in admin panel)
- **No public URL** generated
- **Not searchable**
- **Not in listings**
- **Use case**: Draft braindumps, personal notes

### 👁️‍🗨️ Unlisted
- **Anyone with link** can view
- **Public URL** generated (with slug)
- **Not searchable** (noindex)
- **Not in listings**
- **Use case**: Sharing specific content with specific people

### 🌍 Public
- **Everyone** can view
- **Public URL** generated (with slug)
- **Searchable** (appears in search)
- **In listings** (appears on /braindump page)
- **Use case**: Blog posts, public content

---

## Preview Mode Features

### Visual Indicators

When in preview mode, you'll see:

1. **Sticky Banner** at top:
   ```
   🔍 PREVIEW MODE | 🔒 PRIVATE
   ```

2. **Visibility Message**:
   - 🔒 Private: "Only you can see it"
   - 👁️‍🗨️ Unlisted: "Anyone with link can view"
   - 🌍 Public: "Appears in listings and search"

3. **Footer Info**:
   - How it appears to viewers
   - Analytics status
   - Public URL (if applicable)

### Example Preview URLs

```bash
# Preview private braindump
/braindump/preview/67064a8b3e4f2c001a5b8d91

# Preview unlisted braindump
/braindump/preview/67064a8b3e4f2c001a5b8d92

# Preview public braindump
/braindump/preview/67064a8b3e4f2c001a5b8d93
```

---

## 403 Error Fix

### Problem
```
POST /api/admin/braindump 403 in 25ms
```

This happens when:
- ❌ CSRF token missing or invalid
- ❌ Not authenticated
- ❌ Missing admin role (if role-based)

### Solution

#### For API Calls:

```typescript
// 1. Get CSRF token first
const csrfResponse = await fetch('/api/csrf-token');
const { token } = await csrfResponse.json();

// 2. Include in request
const response = await fetch('/api/admin/braindump', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': token, // ← Required!
  },
  body: JSON.stringify({
    content: 'New braindump',
    visibility: 'private',
  }),
});
```

#### For Forms:

```tsx
'use client';

import { useEffect, useState } from 'react';

export function BraindumpForm() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch CSRF token on mount
    fetch('/api/csrf-token')
      .then(res => res.json())
      .then(data => setCsrfToken(data.token));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const response = await fetch('/api/admin/braindump', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': csrfToken, // ← Use token
      },
      body: JSON.stringify({ /* ... */ }),
    });
  };
}
```

---

## Quick Reference

### Preview Private Braindump
```
1. Admin Panel → Braindump → Menu (⋮) → Preview
2. Or: /braindump/preview/<id>
```

### Preview Unlisted Braindump
```
Option 1: /braindump/preview/<id> (no analytics)
Option 2: /braindump/<slug> (with analytics)
```

### Preview Public Braindump
```
Option 1: /braindump/preview/<id> (no analytics)
Option 2: /braindump/<slug> (with analytics)
```

### Get Braindump ID
```typescript
// From admin panel URL
/admin/braindump -> Card shows ID in menu

// From API response
const response = await fetch('/api/admin/braindump');
const data = await response.json();
console.log(data.braindumps[0]._id); // <-- ID here
```

---

## Testing the Preview Feature

### 1. Create Test Braindump
```bash
# In your app
1. Go to /admin/braindump
2. Create new braindump
3. Set visibility to "Private"
4. Save
```

### 2. Preview It
```bash
# Click menu → Preview
# Or manually:
/braindump/preview/<your-id>
```

### 3. Verify Banner
```
Should see:
- 🔍 PREVIEW MODE badge
- 🔒 PRIVATE indicator
- "Only you can see it" message
- Back to Admin link
```

### 4. Check Access Control
```bash
# Try accessing in incognito/another browser
# Should redirect to sign-in
/braindump/preview/<id> -> /sign-in?redirect=...
```

---

## Troubleshooting

### "Braindump Not Found" in Preview
- ✅ Check braindump belongs to you (userId matches)
- ✅ Check ID is correct MongoDB ObjectId
- ✅ Check you're logged in with correct account

### "403 Forbidden" on Public Page
- ✅ Braindump is set to `private` (use preview instead)
- ✅ Change to `unlisted` or `public` to use public page

### "Sign In Required"
- ✅ Preview requires authentication
- ✅ Public page does NOT require auth (for unlisted/public)

### Preview Shows Old Content
- ✅ Hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)
- ✅ Check you saved changes in admin panel

---

## Best Practices

### 1. Use Preview for Drafts
```
✅ Keep as private while editing
✅ Use preview mode to check formatting
✅ Share preview link with trusted reviewers
❌ Don't set to public until ready
```

### 2. Test Before Publishing
```
✅ Preview in desktop browser
✅ Preview in mobile (responsive)
✅ Check all links work
✅ Verify formatting looks good
✅ Then set to public
```

### 3. Share Unlisted Carefully
```
✅ Unlisted = anyone with link can view
⚠️ Don't share unlisted links publicly
⚠️ Consider using private + preview instead
```

---

## API Endpoints Reference

### Preview (Authenticated)
```
GET /braindump/preview/[id]
Auth: Required (Clerk)
Access: Owner only
Returns: Full preview with banner
```

### Public View (Unauthenticated)
```
GET /braindump/[slug]
Auth: Not required
Access: Public/Unlisted only
Returns: Public view (increments analytics)
```

### Admin API (Authenticated + CSRF)
```
POST /api/admin/braindump
Auth: Required (Clerk)
CSRF: Required (X-CSRF-Token header)
Access: Authenticated users
```

---

## Summary

**To preview ANY braindump (private, unlisted, or public):**

1. **Easiest**: Admin panel → Menu (⋮) → "Preview" ✨
2. **Direct**: `/braindump/preview/<id>`
3. **Public only**: `/braindump/<slug>` (for unlisted/public)

**The preview feature solves:**
- ✅ Can't view private braindumps publicly
- ✅ Want to see how it looks before publishing
- ✅ Need to test without inflating analytics
- ✅ Secure owner-only preview access

**New files created:**
- `src/app/(authenticated)/braindump/preview/[id]/page.tsx` - Preview page
- `src/components/admin/braindump/BraindumpCard.tsx` - Added preview button
