# Nested Deck UI Support Added

**Date**: October 7, 2025  
**Status**: ✅ **COMPLETE**

---

## Overview

Added **parent deck selection** to both the create and edit flashcard deck forms, enabling users to organize decks into hierarchical structures directly from the UI.

---

## Changes Made

### 1. DeckCreateContent.tsx (Create Form)
**File**: `src/components/admin/flashcards/DeckCreateContent.tsx`

**Added Features**:
- ✅ Parent deck selector dropdown
- ✅ Loads available decks from `/api/admin/flashcards?tree=true`
- ✅ Flattens tree structure for dropdown display
- ✅ Excludes decks at max depth (level 5) from selection
- ✅ Visual indentation showing deck hierarchy
- ✅ Sends `parentDeckId` in POST payload
- ✅ Folder icon indicator
- ✅ Helper text explaining max depth

**New Imports**:
```tsx
import { useEffect } from 'react'; // Added
import { Folder } from 'lucide-react'; // Added
```

**New State**:
```tsx
const [loadingDecks, setLoadingDecks] = useState(false);
const [availableDecks, setAvailableDecks] = useState<Array<{ 
  id: string; 
  title: string; 
  level: number; 
  path: string 
}>>([]);
const [form, setForm] = useState({
  // ... existing fields
  parentDeckId: '', // NEW
});
```

**UI Added**:
```tsx
<div className='space-y-2'>
  <Label htmlFor='parentDeck' className='flex items-center gap-2'>
    <Folder className='h-4 w-4' />
    Parent Deck (Optional)
  </Label>
  <Select value={form.parentDeckId} onValueChange={v => set('parentDeckId', v)}>
    <SelectTrigger>
      <SelectValue placeholder='None (top-level deck)' />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value=''>None (top-level deck)</SelectItem>
      {availableDecks.map(deck => (
        <SelectItem key={deck.id} value={deck.id}>
          <span style={{ paddingLeft: `${deck.level * 12}px` }}>
            {deck.level > 0 && '└─ '}
            {deck.title}
          </span>
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <p className='text-xs text-muted-foreground'>
    Organize this deck under another deck (max 6 levels deep)
  </p>
</div>
```

---

### 2. DeckManagerContent.tsx (Edit Form)
**File**: `src/components/admin/flashcards/DeckManagerContent.tsx`

**Added Features**:
- ✅ Parent deck selector dropdown (same as create form)
- ✅ Loads available decks excluding current deck and descendants
- ✅ Excludes decks at max depth from selection
- ✅ Populates current `parentDeckId` when loading deck data
- ✅ Sends updated `parentDeckId` in PUT payload
- ✅ Folder icon indicator
- ✅ Helper text for moving decks

**Interface Updates**:
```tsx
interface DeckDetail {
  // ... existing fields
  parentDeckId?: string | null; // NEW
  path?: string; // NEW
  level?: number; // NEW
}

interface DeckFormState {
  // ... existing fields
  parentDeckId: string; // NEW
}
```

**New State**:
```tsx
const [loadingDecks, setLoadingDecks] = useState(false);
const [availableDecks, setAvailableDecks] = useState<Array<{ 
  id: string; 
  title: string; 
  level: number; 
  path: string 
}>>([]);
```

**Logic Added**:
- `useEffect` to load available parent decks
- Excludes current deck (`node.id === deckId`) to prevent cycles
- Excludes descendants (automatically via tree structure)
- Excludes max-depth decks (`node.level >= MAX_DEPTH - 1`)

**UI Added**: (Same as create form, placed after Description field)

---

## Technical Details

### API Integration
Both forms use the existing API endpoints:

**GET Decks (for dropdown)**:
```
GET /api/admin/flashcards?tree=true
```
Returns hierarchical deck structure with `level`, `path`, `children`.

**POST Create Deck**:
```json
POST /api/admin/flashcards
{
  "title": "New Deck",
  "parentDeckId": "parent_deck_id_or_null",
  // ... other fields
}
```

**PUT Update Deck**:
```json
PUT /api/admin/flashcards/[deckId]
{
  "parentDeckId": "new_parent_id_or_null",
  // ... other fields
}
```

### Validation
- Max hierarchy depth: **6 levels** (enforced by backend)
- Create form: Excludes level 5 decks from parent selection
- Edit form: Excludes current deck and its descendants to prevent cycles
- Backend validates moves via `validateDeckMove()` utility

### User Experience
1. **Visual Hierarchy**: Decks shown with indentation (`└─`) based on level
2. **Loading States**: Shows "Loading decks..." while fetching
3. **Clear Labels**: "None (top-level deck)" option always available
4. **Helper Text**: Explains max depth and purpose
5. **Icon**: Folder icon indicates organizational structure

---

## Examples

### Creating a Nested Deck
1. Navigate to `/admin/flashcards/new`
2. Fill in title (e.g., "TypeScript Basics")
3. Select parent deck (e.g., "Programming" > "TypeScript")
4. Click "Create deck"
5. Result: Deck created at path `Programming/TypeScript/TypeScript Basics`

### Moving an Existing Deck
1. Navigate to `/admin/flashcards/[deckId]`
2. Change "Parent Deck" dropdown to new parent
3. Click "Save deck"
4. Result: Deck moved to new location in hierarchy
5. Backend automatically updates `path` and `level` fields

---

## Screenshots Reference

**Before**: Form showed Title, Subtitle, Description, Status, Visibility, Tags, Categories, Est. minutes, Cover image

**After**: Same fields PLUS "Parent Deck (Optional)" dropdown between Subtitle and Description showing:
- None (top-level deck)
- └─ Child Deck 1
- └─ Child Deck 2
-    └─ Grandchild Deck

---

## Testing Checklist

### Create Form
- [x] Can create top-level deck (parentDeckId = null)
- [x] Can create child deck under existing deck
- [x] Dropdown shows all available decks
- [x] Visual indentation works correctly
- [x] Cannot select level 5 decks as parents
- [x] Loading state shows while fetching decks

### Edit Form
- [x] Current parentDeckId loads correctly
- [x] Can move deck to new parent
- [x] Can move deck to top-level (select "None")
- [x] Cannot select self as parent
- [x] Cannot select own descendant as parent
- [x] Backend prevents cycle creation

### Edge Cases
- [x] Works when no decks exist (shows only "None")
- [x] Works when all decks are at max depth
- [x] Form validation still works
- [x] Save operation includes parentDeckId

---

## Next Steps (Optional Enhancements)

1. **Tree View Visualization**: Add DeckTree component to deck list page
2. **Breadcrumbs**: Show deck path in edit form header
3. **Drag & Drop**: Allow dragging decks to reorganize hierarchy
4. **Bulk Move**: Select multiple decks and move them together
5. **Context Menu**: Right-click to move/reorganize decks

---

## Files Modified

1. ✅ `src/components/admin/flashcards/DeckCreateContent.tsx` (85 lines added)
2. ✅ `src/components/admin/flashcards/DeckManagerContent.tsx` (96 lines added)

**Total Changes**: ~180 lines added

---

## Deployment Notes

- ✅ No database migration required
- ✅ No breaking changes
- ✅ Backward compatible (parentDeckId defaults to null)
- ✅ Feature flag: `FEATURE_NESTED_DECKS` (should already be enabled)
- ✅ Works with existing API endpoints

---

## Summary

Both the **create** and **edit** flashcard deck forms now support nested deck organization through an intuitive parent deck selector. Users can:

- Create decks at any level (up to 6 deep)
- Move existing decks to new parents
- Visualize hierarchy through indented dropdown options
- Prevent cycles and invalid moves (enforced by backend)

The implementation is production-ready, fully integrated with the existing nested deck system, and requires no additional configuration.

**Status**: ✅ **READY FOR USE**
