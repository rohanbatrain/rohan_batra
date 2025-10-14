# Braindump Linking System

## Overview

The braindump system now supports **Obsidian-style linking** with automatic title resolution for seamless note interconnection.

---

## Title Field

### Required Field ✅
The **title** field is now **required** for all braindumps to enable automatic link resolution.

**Why?**
- When you write `[[braindumpId]]`, the system displays the **title** of that note
- Makes links human-readable instead of showing cryptic IDs
- Enables Obsidian-style workflows

**Example:**
```
Braindump ID: 68ec88f2ecd84cd488d39e5f
Title: "Weekly Planning Notes"

When linked: [[68ec88f2ecd84cd488d39e5f]]
Displays as: 🔗 Weekly Planning Notes
```

---

## Linking Formats

### 1. ID-Based Linking (Recommended)

**Format**: `[[braindumpId]]` or `[[braindumpId|Custom Text]]`

**Auto-Resolution:**
```markdown
[[68ec88f2ecd84cd488d39e5f]]
```
↓ Displays as:
```
🔗 Weekly Planning Notes
```

**Custom Display:**
```markdown
[[68ec88f2ecd84cd488d39e5f|my planning doc]]
```
↓ Displays as:
```
🔗 my planning doc
```

### 2. Title-Based Linking (Obsidian-style)

**Format**: `[[Note Title]]` or `[[Note Title|Custom Text]]`

**Auto-Search:**
```markdown
[[Weekly Planning]]
```
↓ Searches for braindumps with title matching "Weekly Planning"

**Custom Display:**
```markdown
[[Weekly Planning|planning notes]]
```
↓ Displays as:
```
🔗 planning notes
```

---

## How It Works

### Link Detection

The system automatically detects link type:

1. **24 hex characters** → ID-based link
   - Example: `[[68ec88f2ecd84cd488d39e5f]]`
   - Validates as MongoDB ObjectId
   - Fetches title from database

2. **Any other text** → Title-based link
   - Example: `[[My Notes]]`
   - Searches braindumps by title
   - Creates search query

### Title Resolution

**For ID-based links:**
1. Parse `[[id]]` from content
2. Fetch braindump metadata from `/api/admin/braindump/[id]`
3. Display `braindump.title` or fallback to `Note [last6chars]`
4. Cache results for performance

**For title-based links:**
1. Parse `[[title]]` from content
2. Create search URL: `/admin/braindump?search=title`
3. Display title text directly
4. No database lookup needed (search on click)

---

## Quick Capture Form

### Title Field

```tsx
<Label htmlFor='title'>Title</Label>
<Input
  id='title'
  required
  placeholder="Give your braindump a title..."
  maxLength={200}
/>
<p>Used for [[id]] linking</p>
```

**Validation:**
- ✅ Required field
- ✅ Max 200 characters
- ✅ Cannot be empty
- ✅ Trimmed automatically

---

## Examples

### Example 1: Meeting Notes

```markdown
Title: Q4 Planning Meeting

Content:
Discussed priorities with team. Key points:
- Launch timeline moved to [[67abc123def456789012345a|Product Roadmap]]
- Budget approved (see [[Budget Discussion]])
- Follow up on [[68ec88f2ecd84cd488d39e5f]])

Next steps in [[Action Items]].
```

**Rendered:**
```
Discussed priorities with team. Key points:
- Launch timeline moved to 🔗 Product Roadmap
- Budget approved (see 🔗 Budget Discussion)
- Follow up on 🔗 Weekly Planning Notes

Next steps in 🔗 Action Items.
```

### Example 2: Custom Display Text

```markdown
Title: Project Notes

Content:
Refer to the [[68ec88f2ecd84cd488d39e5f|planning session]] for details.
Also check [[Architecture Decisions|tech specs]].
```

**Rendered:**
```
Refer to the 🔗 planning session for details.
Also check 🔗 tech specs.
```

---

## API Schema

### Create Braindump

```typescript
POST /api/admin/braindump

{
  title: string (required, min: 1, max: 200),
  content: string (required, min: 1, max: 10000),
  tags: string[],
  category?: string,
  priority: 'low' | 'medium' | 'high' | 'urgent',
  visibility: 'private' | 'unlisted' | 'public'
}
```

### Response

```typescript
{
  _id: string,
  title: string,
  content: string,
  linkedTo: string[], // Array of linked braindump IDs
  linkedFrom: string[], // Array of braindumps linking to this one
  ...
}
```

---

## Technical Implementation

### Link Parser

**File:** `/src/lib/braindump/link-parser.ts`

```typescript
export interface BraindumpLink {
  raw: string;              // [[...]]
  braindumpId?: string;     // ObjectId (if ID-based)
  linkText?: string;        // Title text (if title-based)
  displayText?: string;     // Custom display text
  linkType: 'id' | 'title'; // Detected type
  startIndex: number;
  endIndex: number;
}
```

### Rendering Component

**File:** `/src/components/admin/braindump/BraindumpCard.tsx`

```typescript
// Fetch linked braindump titles
useEffect(() => {
  const links = parseBraindumpLinks(braindump.content);
  const idLinks = links.filter(l => l.linkType === 'id');
  
  // Fetch metadata for each linked braindump
  idLinks.forEach(async (link) => {
    const res = await fetch(`/api/admin/braindump/${link.braindumpId}`);
    const data = await res.json();
    // Cache: { id → { title } }
  });
}, [braindump.content]);

// Render with resolved titles
{link.displayText || linkedData?.title || `Note ${id.slice(-6)}`}
```

---

## Migration Guide

### For Existing Braindumps

**Braindumps without titles:**
- Will display as `Note [last6chars]` in links
- Update recommended: Add titles to improve readability

**Updating old braindumps:**
```typescript
PUT /api/admin/braindump/[id]
{
  title: "Descriptive Title Here"
}
```

### For New Braindumps

- Title field is **required**
- Cannot submit without title
- Client-side validation prevents empty submissions

---

## Best Practices

### 1. Descriptive Titles
✅ **Good:** "Q4 Product Roadmap Planning"
❌ **Bad:** "Notes" or "Untitled"

### 2. Unique Titles
- Use unique titles for better title-based linking
- Duplicate titles will show multiple results in search

### 3. Link Format Choice

**Use ID-based** when:
- You know the exact braindump to link
- You want guaranteed link resolution
- You're linking from autocomplete

**Use title-based** when:
- Writing naturally (Obsidian-style)
- You want flexible search-based linking
- Title is more memorable than ID

### 4. Custom Display Text

Use custom display when:
- Context needs different wording
- Shortening long titles
- Grammatical flow

Example:
```markdown
❌ Based on [[Q4 Product Roadmap Planning Session Notes]], we decided...
✅ Based on [[68ec88f2ecd84cd488d39e5f|the roadmap]], we decided...
```

---

## Autocomplete System

The autocomplete component helps you insert ID-based links:

1. Type `[[` in the content field
2. Search for braindumps by title/content
3. Select a braindump
4. Auto-inserts: `[[braindumpId|Title]]`

**File:** `/src/components/admin/braindump/BraindumpLinkAutocomplete.tsx`

---

## Backlinks

The system automatically tracks bidirectional links:

```typescript
// Forward links (linkedTo)
Braindump A → [[B]] → Braindump B

// Backlinks (linkedFrom)
Braindump B.linkedFrom = [A]
```

**Benefits:**
- See which braindumps reference this one
- Build knowledge graph
- Discover connections

---

## Future Enhancements

### Planned Features

1. **Title-based link resolution**
   - Cache title → ID mappings
   - Direct navigation instead of search
   - Ambiguity handling for duplicates

2. **Link graph visualization**
   - Interactive network graph
   - Explore connections visually
   - Identify clusters

3. **Broken link detection**
   - Warn when linked braindump deleted
   - Suggest alternatives
   - Cleanup utilities

4. **Smart suggestions**
   - Suggest related braindumps while typing
   - Based on content similarity
   - Based on existing link patterns

---

## Troubleshooting

### Links not rendering?
- Ensure title field is set
- Check if braindump ID is valid (24 hex chars)
- Verify braindump exists in database

### Title not showing?
- Title field must be non-empty
- May need to refresh if recently updated
- Check browser console for fetch errors

### Search not working for title-based links?
- Ensure search functionality is implemented
- Check URL encoding of special characters
- Verify search endpoint is accessible

---

**Last Updated:** October 13, 2025
**Status:** ✅ Production Ready
**Version:** 2.0 (Obsidian-style linking)
