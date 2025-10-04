# User Preferences Fix - Settings Page Not Saving ✅

## Problem Identified

The User Preferences dropdown in `/admin/settings` was **NOT saving** when changed.

### Root Cause

The settings page was trying to:
1. **Read** from a non-existent site setting (`user.editor.preference`)
2. **Write** to the correct user preferences API
3. But the **display value** was always reading from site settings (which didn't exist)

**Result:** The dropdown appeared to never save because it was reading from the wrong source!

---

## What Was Broken

### Before (Broken Code)

```tsx
// ❌ WRONG: Reading from site settings
<Select
  value={
    String(
      data.settings.find(s => s.key === 'user.editor.preference')?.value
    ) || 'rich-html'
  }
  onValueChange={async editorType => {
    // ✅ This part was correct - saves to user preferences API
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      body: JSON.stringify({ editor: editorType }),
    });
  }}
>
```

**Problem:**
- `data.settings.find(s => s.key === 'user.editor.preference')` always returned `undefined`
- Dropdown always showed `'rich-html'` (the default)
- Even after saving, the dropdown didn't update because it was reading from wrong place

---

## What Was Fixed

### After (Fixed Code)

```tsx
// Added state for user preference
const [userEditorPreference, setUserEditorPreference] = useState<'rich-html' | 'mdx'>('rich-html');

// Added effect to fetch actual user preference
useEffect(() => {
  (async () => {
    try {
      const res = await fetch('/api/user/preferences', { credentials: 'include' });
      if (res.ok) {
        const json = await res.json();
        if (json.preferences?.editor) {
          setUserEditorPreference(json.preferences.editor);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user preferences:', error);
    }
  })();
}, []);

// Fixed dropdown to use state
<Select
  value={userEditorPreference}  // ✅ Now reads from correct source
  onValueChange={async editorType => {
    await fetch('/api/user/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ editor: editorType }),
    });
    setUserEditorPreference(editorType as 'rich-html' | 'mdx');  // ✅ Update local state
    toast({ title: 'Editor preference saved' });
    setTimeout(() => window.location.reload(), 1000);
  }}
>
```

---

## Files Modified

### `/src/app/admin/settings/page.tsx`

**Changes:**
1. Added `userEditorPreference` state variable
2. Added `useEffect` to fetch user preference from `/api/user/preferences` on mount
3. Updated Select component to read from `userEditorPreference` state
4. Updated `onValueChange` to update local state after saving
5. Fixed help text to use state instead of site settings
6. Added `credentials: 'include'` to fetch calls (best practice)

---

## How It Works Now

### User Flow

1. **User opens** `/admin/settings`
2. **Page loads:**
   - Fetches site settings (for other controls)
   - **NEW:** Fetches user preferences from `/api/user/preferences`
   - Dropdown displays current user preference (e.g., "MDX")
3. **User changes** dropdown to "Rich HTML"
4. **onChange handler:**
   - Sends PATCH request to `/api/user/preferences`
   - Updates local state: `setUserEditorPreference('rich-html')`
   - Shows toast notification
   - Reloads page after 1 second
5. **After reload:**
   - Dropdown now shows "Rich HTML" ✅
   - ContentEditor components use new preference ✅

---

## API Flow

```
┌─────────────────┐
│  Settings Page  │
└────────┬────────┘
         │
         │ GET /api/user/preferences
         ├────────────────────────────────┐
         │                                 │
         │ Response:                       │
         │ { preferences: {                │
         │     editor: "mdx"               │
         │   }                             │
         │ }                               │
         │◄────────────────────────────────┘
         │
         │ User changes dropdown
         │
         │ PATCH /api/user/preferences
         ├────────────────────────────────┐
         │ Body: { editor: "rich-html" }  │
         │                                 │
         │ Updates MongoDB:                │
         │ User.preferences.editor         │
         │◄────────────────────────────────┘
         │
         │ setUserEditorPreference()
         │ Page reload
         │
         │ GET /api/user/preferences
         │ (shows new value)
         ▼
```

---

## Testing Checklist

### ✅ Before Testing
- [x] Dev server running (`pnpm dev`)
- [x] User logged in to admin panel
- [x] User model has `preferences.editor` field
- [x] API endpoint `/api/user/preferences` exists

### ✅ Test Steps

1. **Open** `http://localhost:3000/admin/settings`
2. **Verify** "User Preferences" card is visible
3. **Check** dropdown shows current preference (default: Rich HTML)
4. **Click** dropdown → Select "MDX (Markdown)"
5. **Verify** toast notification appears: "Editor preference saved"
6. **Wait** for page reload (1 second)
7. **Check** dropdown now shows "MDX (Markdown)" ✅
8. **Open** `http://localhost:3000/admin/characters/new`
9. **Verify** Description field shows "📝 MDX" badge ✅
10. **Go back** to settings
11. **Switch** to "Rich HTML"
12. **Verify** dropdown updates after reload ✅
13. **Go to** character form
14. **Verify** badge now shows "🎨 Rich HTML" ✅

---

## Related Files

### Working Correctly (No Changes Needed)
- ✅ `/src/app/api/user/preferences/route.ts` - API endpoint (already working)
- ✅ `/src/models/User.ts` - User model with preferences field (already working)
- ✅ `/src/components/admin/ContentEditor.tsx` - Fetches and uses preference (already working)

### Fixed
- ✅ `/src/app/admin/settings/page.tsx` - Now reads from correct source

---

## Why This Happened

### Conceptual Confusion

The original implementation confused two different concepts:

1. **Site Settings** (`/api/admin/settings`)
   - Global settings for the entire site
   - Stored in `SiteSetting` model
   - Example: timezone, feature flags
   - **NOT per-user**

2. **User Preferences** (`/api/user/preferences`)
   - Personal settings for each user
   - Stored in `User.preferences` field
   - Example: editor type, theme
   - **Per-user, private**

The settings page was trying to display a **user preference** using the **site settings** data source.

---

## Prevention

### Code Review Checklist

When implementing preference/settings UI:

- [ ] **Identify data source**: Site setting or user preference?
- [ ] **Use correct API**: `/api/admin/settings` vs `/api/user/preferences`
- [ ] **Verify read/write consistency**: Read from same source you write to
- [ ] **Test the loop**: Save → Reload → Verify display
- [ ] **Check default values**: What happens if preference doesn't exist?

---

## Additional Notes

### Credentials: Include

Added `credentials: 'include'` to all fetch calls:

```tsx
fetch('/api/user/preferences', {
  credentials: 'include'  // ← Important for cookies/auth
})
```

This ensures authentication cookies are sent with the request, even though the page is already authenticated. This is a best practice for cross-origin requests and explicit credential handling.

---

## Summary

**Problem:** Settings dropdown showed wrong value and appeared not to save
**Root Cause:** Reading from site settings instead of user preferences
**Solution:** Added state and fetch call to read from correct API
**Result:** Dropdown now correctly shows and saves user preference ✅

**Time to fix:** 5 minutes
**Impact:** HIGH - User preferences now work correctly across the system
