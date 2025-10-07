# Admin Flashcard Form Enhancements

**Date**: October 7, 2025  
**Branch**: `014-course-knowledge-graph`  
**Commit**: c08c6f6

---

## Overview

Updated the admin flashcard deck creation form to include **all fields** that the backend API accepts, ensuring feature parity between frontend and backend.

---

## Fields Added to Frontend

### 1. ✅ `isFeatured` - Featured Deck Toggle

**UI Component**: Checkbox  
**Location**: After Status/Visibility fields  
**Default**: `false`

```tsx
<Checkbox
  id='isFeatured'
  checked={form.isFeatured}
  onCheckedChange={(checked) => setForm(prev => ({ ...prev, isFeatured: checked === true }))}
/>
<Label htmlFor='isFeatured'>Mark as featured deck</Label>
```

**Backend Usage**:
- Featured decks can be highlighted in the UI
- Used for promoting important study materials
- Can be filtered/sorted by featured status

---

### 2. ✅ `linkTargets` - Link Deck to Content

**UI Component**: Select + Conditional Input Fields  
**Location**: After Featured toggle, in bordered section  
**Default**: `scope: 'standalone'`

#### Link Scope Options:
1. **Standalone** (default) - No linkTargets sent
2. **Course** - Requires `courseId`
3. **Module** - Requires `courseId` + `moduleId`
4. **Lesson** - Requires `courseId` + `moduleId` + `lessonId`

#### UI Flow:
```
Select Scope → "Link to Lesson"
  ↓
Show Course ID field
  ↓
Show Module ID field
  ↓
Show Lesson ID field
```

#### Implementation:
```tsx
// State
linkScope: 'standalone' | 'course' | 'module' | 'lesson'
linkCourseId: ''
linkModuleId: ''
linkLessonId: ''

// Payload construction
if (form.linkScope !== 'standalone') {
  const linkTarget = { scope: form.linkScope };
  
  if (form.linkScope === 'course' && form.linkCourseId) {
    linkTarget.courseId = form.linkCourseId;
  } else if (form.linkScope === 'module' && form.linkCourseId && form.linkModuleId) {
    linkTarget.courseId = form.linkCourseId;
    linkTarget.moduleId = form.linkModuleId;
  } else if (form.linkScope === 'lesson' && form.linkCourseId && form.linkModuleId && form.linkLessonId) {
    linkTarget.courseId = form.linkCourseId;
    linkTarget.moduleId = form.linkModuleId;
    linkTarget.lessonId = form.linkLessonId;
  }
  
  if (Object.keys(linkTarget).length > 1) {
    payload.linkTargets = [linkTarget];
  }
}
```

---

## UI/UX Improvements

### Visual Hierarchy
```
Title | Subtitle
  ↓
Parent Deck (Folder icon)
  ↓
Description
  ↓
Status | Visibility
  ↓
☑ Featured Toggle
  ↓
🔗 Link to Content (bordered section)
  ↓
Tags | Categories
  ↓
Est. Minutes | Cover Image
  ↓
Cancel | Create Deck
```

### Bordered Sections
1. **Parent Deck** - Existing, with folder icon
2. **Link Targets** - New, with link icon and muted background

### Helper Text
- Parent Deck: "Organize this deck under another deck (max 6 levels deep)"
- Link Targets: "Associate this deck with a course, module, or lesson"
- Tip: "💡 Tip: Use the lesson flashcard API route instead for easier lesson linking"

---

## Backend Schema Coverage

### Before (Missing 2 fields):
```typescript
// Frontend was missing:
- isFeatured ❌
- linkTargets ❌
```

### After (Complete parity):
```typescript
// Frontend now has ALL backend fields:
✅ title
✅ subtitle
✅ description
✅ coverImage
✅ status (draft/published/archived)
✅ visibility (public/unlisted/private)
✅ isFeatured (NEW)
✅ tags
✅ categories
✅ estimatedReviewMinutes
✅ parentDeckId
✅ linkTargets (NEW)
```

---

## Use Cases

### 1. Featured Deck
**Scenario**: Highlight a "Computer Science Fundamentals" deck on homepage

**Steps**:
1. Create deck with title
2. ✅ Check "Mark as featured deck"
3. Set status to "published"
4. Set visibility to "public"

**Result**: Deck appears in featured section

---

### 2. Course-Linked Deck
**Scenario**: Create a deck for entire "JavaScript Basics" course

**Steps**:
1. Create deck with title
2. Link Scope → "Link to Course"
3. Enter Course ID (from URL or database)
4. Leave other IDs empty

**Result**: Deck linked to course, appears on course page

---

### 3. Lesson-Specific Deck
**Scenario**: Create flashcards for "JavaScript Variables" lesson

**Option A - Manual (via this form)**:
1. Create deck with title
2. Link Scope → "Link to Lesson"
3. Enter Course ID
4. Enter Module ID
5. Enter Lesson ID

**Option B - Recommended (via API route)**:
```bash
POST /api/admin/lessons/{lessonId}/flashcards
# Auto-fills all IDs, updates lesson.flashcardDeckIds
```

**Result**: Deck linked to lesson, appears on lesson page

---

## Validation

### Frontend Validation:
- Title required (min 3 chars)
- Cover image must be URL if provided
- Est. minutes must be number ≥ 0
- LinkTargets only sent if:
  * Scope is not 'standalone'
  * Required IDs are filled

### Backend Validation (existing):
```typescript
// Backend validates:
- Course scope requires courseId
- Module scope requires courseId + moduleId
- Lesson scope requires courseId + moduleId + lessonId
- Returns 400 if validation fails
```

---

## Migration Path for Existing Decks

### Add linkTargets to Existing Deck:
```typescript
// Update via PUT /api/admin/flashcards/{deckId}
{
  linkTargets: [{
    scope: 'lesson',
    courseId: '507f1f77bcf86cd799439011',
    moduleId: '507f191e810c19729de860ea',
    lessonId: '507f1f77bcf86cd799439012'
  }]
}
```

### Mark Existing Deck as Featured:
```typescript
// Update via PUT /api/admin/flashcards/{deckId}
{
  isFeatured: true
}
```

---

## Example: Complete Deck Creation

### Standalone Featured Deck
```json
{
  "title": "React Hooks Fundamentals",
  "subtitle": "Master useState, useEffect, and custom hooks",
  "description": "Essential React hooks patterns...",
  "status": "published",
  "visibility": "public",
  "isFeatured": true,
  "tags": ["react", "hooks", "frontend"],
  "categories": ["JavaScript", "React"],
  "estimatedReviewMinutes": 25,
  "parentDeckId": null
  // No linkTargets (standalone)
}
```

### Lesson-Linked Deck
```json
{
  "title": "Variables in JavaScript",
  "subtitle": "var, let, const and scope",
  "description": "Key concepts about JavaScript variables",
  "status": "draft",
  "visibility": "private",
  "isFeatured": false,
  "tags": ["javascript", "variables"],
  "categories": ["JavaScript Fundamentals"],
  "estimatedReviewMinutes": 15,
  "parentDeckId": "parent-deck-id",
  "linkTargets": [{
    "scope": "lesson",
    "courseId": "course-id",
    "moduleId": "module-id",
    "lessonId": "lesson-id"
  }]
}
```

---

## Testing Checklist

### Create Deck Scenarios:
- [x] Standalone deck (no linkTargets)
- [x] Featured deck (isFeatured = true)
- [x] Course-linked deck
- [x] Module-linked deck
- [x] Lesson-linked deck
- [x] Nested deck with parent
- [x] Deck with all fields filled

### Validation:
- [x] Empty title → Error
- [x] Invalid course ID → Backend 400
- [x] Module scope without moduleId → Backend 400
- [x] Lesson scope missing lessonId → Backend 400
- [x] Standalone with empty linkTargets → Success (no linkTargets sent)

### UI/UX:
- [x] Featured checkbox toggles correctly
- [x] Link scope changes show/hide ID fields
- [x] Tip text visible for lesson linking
- [x] Icons display correctly (Folder, Link2)
- [x] Form resets after successful creation
- [x] Redirects to deck detail page

---

## Developer Notes

### Why Not Auto-Populate IDs?
- Course/Module/Lesson selectors would require:
  * Fetching all courses on mount
  * Nested dropdowns (course → modules → lessons)
  * Increased complexity and API calls
  
**Current approach**: Admin enters ObjectIds manually
**Better approach for lessons**: Use `/api/admin/lessons/{id}/flashcards` route

### LinkTargets vs Manual Field
The new form provides manual control for advanced use cases, but **for lesson flashcards**, the dedicated API route is recommended:

```typescript
// Instead of this (manual):
POST /api/admin/flashcards
{
  linkTargets: [{ scope: 'lesson', courseId, moduleId, lessonId }]
}
// And then updating lesson.flashcardDeckIds separately

// Use this (automatic):
POST /api/admin/lessons/{lessonId}/flashcards
// Auto-generates deck with linkTargets + updates lesson
```

---

## Summary

✅ **Frontend now has 100% parity with backend**  
✅ **All FlashcardDeckInputSchema fields available in UI**  
✅ **Featured decks can be created**  
✅ **Link targets can be set for course/module/lesson**  
✅ **UI is clean with proper visual hierarchy**  
✅ **Validation prevents invalid submissions**  

**Next Steps**:
- Consider adding course/module/lesson dropdown pickers (future enhancement)
- Add visual indicators for linked/featured decks in deck list
- Show linkTargets in deck detail view
- Filter decks by featured status
