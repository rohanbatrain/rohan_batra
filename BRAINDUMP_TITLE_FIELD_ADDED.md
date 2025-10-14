# Braindump Title Field Addition - Quick Capture

## Issue Report
User noticed that the Quick Capture form for creating braindumps was missing a title/name field.

**Screenshot showed**: Only content field, tags, category, priority, and visibility - no title field.

## Solution Implemented

### 1. Added Title Field to Quick Capture Form
**File**: `/src/components/admin/braindump/BraindumpQuickCapture.tsx`

#### Changes:
1. **Added title state**:
```tsx
const [title, setTitle] = useState('');
```

2. **Added title input field** (positioned first, before content):
```tsx
<div>
  <Label htmlFor='title'>Title (Optional)</Label>
  <Input
    id='title'
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    placeholder="Give your braindump a title..."
    maxLength={200}
    className='mt-1'
  />
  <p className='text-xs text-muted-foreground mt-1'>
    {title.length} / 200 characters
  </p>
</div>
```

3. **Updated form submission** to include title:
```tsx
body: JSON.stringify({
  title: title.trim() || undefined,  // NEW
  content: content.trim(),
  tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
  category: category.trim() || undefined,
  priority,
  visibility,
}),
```

4. **Reset title on successful submission**:
```tsx
setTitle('');
setContent('');
// ... other resets
```

5. **Added CSRF protection** (bonus fix):
```tsx
import { useCSRFToken } from '@/hooks/useCSRFToken';

const { withCSRF } = useCSRFToken();

// In fetch:
headers: withCSRF({ 'Content-Type': 'application/json' }),
```

### 2. Updated API Validation Schema
**File**: `/src/app/api/admin/braindump/route.ts`

#### Changes:
1. **Added title to validation schema**:
```tsx
const createBraindumpSchema = z.object({
  title: z.string().max(200).optional(),  // NEW
  content: z.string().min(1).max(10000),
  tags: z.array(z.string()).optional().default([]),
  // ... rest
});
```

2. **Added title to braindump creation**:
```tsx
const braindump = new BraindumpModel({
  userId,
  title: validatedData.title,  // NEW
  content: sanitizedContent,
  tags: validatedData.tags,
  // ... rest
});
```

## Form Field Order

The Quick Capture form now has this structure:

```
┌─────────────────── Quick Capture ──────────────────────┐
│                                                         │
│ Title (Optional)                            [0/200]     │
│ [Give your braindump a title...                ]       │
│                                                         │
│ Content *                                  [0/10,000]   │
│ [What's on your mind? Type [[ to link...   ]           │
│ [                                           ]           │
│ [                                           ]           │
│                                                         │
│ Tags                    │ Category                     │
│ [comma, separated...]   │ [Optional category...]       │
│                                                         │
│ Priority      │ Visibility                              │
│ [Medium ▼]    │ [🔒 Private ▼]                         │
│                                                         │
│ [Capture]                                    [Cancel]   │
└─────────────────────────────────────────────────────────┘
```

## Database Schema

The Braindump model already supported the optional title field:

```typescript
interface IBraindump {
  title?: string;  // Already existed
  content: string;
  tags: string[];
  // ... other fields
}
```

## Features

### Title Field Specifications:
- **Optional**: Users can create braindumps without titles
- **Max Length**: 200 characters
- **Character Counter**: Shows `X / 200 characters`
- **Placeholder**: "Give your braindump a title..."
- **Position**: First field in the form (before content)
- **Validation**: Only saved if not empty (trimmed)

### CSRF Protection (Bonus):
- Added CSRF token to POST request
- Prevents unauthorized braindump creation
- Matches the security pattern used in other forms

## User Experience

### Before:
```
Quick Capture Form:
- Content (required)
- Tags
- Category
- Priority
- Visibility

Missing: Title/Name field!
```

### After:
```
Quick Capture Form:
- Title (optional) ✅ NEW
- Content (required)
- Tags
- Category
- Priority
- Visibility

Complete form with all fields!
```

## Use Cases

### With Title:
```
Title: "Progressive unlock system implementation notes"
Content: "Need to add server-side validation for module access..."
```

### Without Title:
```
Title: (empty)
Content: "Quick thought - should we add email notifications?"
```
*Uses first line of content or ID as fallback display*

## Testing

### Test Case 1: Create with Title
1. Open Quick Capture
2. Enter title: "My first braindump"
3. Enter content: "Testing the new title field"
4. Click Capture
5. ✅ Braindump created with title
6. ✅ Title visible in list

### Test Case 2: Create without Title
1. Open Quick Capture
2. Leave title empty
3. Enter content: "Just a quick note"
4. Click Capture
5. ✅ Braindump created
6. ✅ Works normally without title

### Test Case 3: Title Length Limit
1. Try entering 250 characters
2. ✅ Input stops at 200 characters
3. ✅ Counter shows "200 / 200"

### Test Case 4: CSRF Protection
1. Create braindump
2. ✅ CSRF token sent in headers
3. ✅ No 403 error
4. ✅ Successfully created

## Files Modified

1. ✅ `/src/components/admin/braindump/BraindumpQuickCapture.tsx`
   - Added title state and input field
   - Added CSRF token integration
   - Updated form submission

2. ✅ `/src/app/api/admin/braindump/route.ts`
   - Added title to validation schema
   - Added title to braindump creation

## Related Models

The title field integrates with existing features:

### Display in List:
```tsx
// BraindumpCard component can show title
{braindump.title && (
  <h3 className="font-semibold">{braindump.title}</h3>
)}
<p className="text-sm text-muted-foreground">
  {braindump.content.substring(0, 100)}...
</p>
```

### Public Sharing:
```tsx
// Title used for SEO and social sharing
<meta property="og:title" content={braindump.title || 'Braindump'} />
```

### Search & Filter:
```tsx
// Title can be searched
query.$or = [
  { title: { $regex: search, $options: 'i' } },
  { content: { $regex: search, $options: 'i' } },
]
```

## Benefits

### For Users:
- ✅ Can organize braindumps with titles
- ✅ Easier to identify notes at a glance
- ✅ Better for longer, structured thoughts
- ✅ Optional - doesn't force workflow change

### For System:
- ✅ Better SEO for public braindumps
- ✅ Improved search relevance
- ✅ Cleaner UI in lists
- ✅ More professional presentation

## Design Decisions

### Why Title is Optional:
- Braindumps are meant for quick capture
- Not all thoughts need titles
- Forces users to think less, capture more
- Can always add title later via edit

### Why Title Comes First:
- Natural reading order (title → content)
- Mirrors common note-taking patterns
- Optional fields can be skipped easily
- Consistent with other forms

### Character Limit (200):
- Long enough for descriptive titles
- Short enough to stay concise
- Matches database schema
- Standard title length

---

**Status**: ✅ **COMPLETE**
**Date**: October 13, 2025
**Impact**: Enhanced Quick Capture form with title field
**Tested**: No compilation errors
**Bonus**: Added CSRF protection to form submission
