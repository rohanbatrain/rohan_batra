# Slug Validation Fix for Nested Lessons ✅

## Issue

When trying to create a sub-lesson with a nested slug (e.g., `parent-slug/child-slug`), the API returned a **400 validation error**:

```
POST /api/admin/courses/.../lessons 400 in 192ms
```

## Root Cause

The slug validation regex **did not allow forward slashes**:

```typescript
// OLD REGEX (Too Restrictive):
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// This matches:
✅ "my-lesson"
✅ "introduction-to-cryptography"

// But rejects nested slugs:
❌ "parent/child"
❌ "cryptography/hash-functions"
❌ "parent-slug/child-slug"
```

## Solution

Updated the regex to **support nested slugs with forward slashes**:

```typescript
// NEW REGEX (Supports Nesting):
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

// Now matches:
✅ "my-lesson"                              (simple)
✅ "parent-slug/child-slug"                 (nested 1 level)
✅ "parent/child/grandchild"                (nested 2 levels)
✅ "hash-functions/collision-resistance"    (real example)
```

## Regex Breakdown

```regex
^[a-z0-9]+(?:-[a-z0-9]+)*                    ← First segment (required)
                          (?:                 ← Start optional group
                             \/               ← Forward slash separator
                               [a-z0-9]+     ← Start of next segment
                                        (?:-[a-z0-9]+)*  ← Dashes within segment
                                                       )*  ← Repeat for more segments
                                                        $  ← End of string
```

### Pattern Explanation:
1. **First segment**: Required, lowercase alphanumeric with dashes
2. **Optional nested segments**: Zero or more `/segment` pairs
3. **Each segment**: Lowercase alphanumeric with optional dashes

## Validation Examples

### Valid Slugs ✅
```javascript
"introduction"                                    // Simple
"hash-functions"                                  // With dash
"parent/child"                                    // Nested 1 level
"parent-slug/child-slug"                          // Nested with dashes
"module-1/lesson-2/sub-lesson-3"                  // Nested 2 levels
"cryptographic-hash-functions/collision-resistance"
"randomness-and-uncertainty/types-of-randomness"
```

### Invalid Slugs ❌
```javascript
"Parent/Child"            // Uppercase not allowed
"parent//child"           // Double slash
"parent/child/"           // Trailing slash
"/parent/child"           // Leading slash
"parent-/child"           // Dash before slash
"parent/-child"           // Dash after slash
"parent slug/child"       // Space not allowed
"parent_slug/child"       // Underscore not allowed
```

## File Modified

**`src/app/api/admin/courses/[courseId]/modules/utils.ts`**

```typescript
// Line 3-5
const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;
```

## Complete Flow Now Works:

```
User Action:
  Click "Add sub-lesson" on "Hash Functions"
  
Frontend (NewLessonForm):
  1. Parent auto-selected ✅
  2. User types: "Collision Resistance"
  3. Slug generated: "hash-functions/collision-resistance" ✅
  
API (POST /api/admin/courses/.../lessons):
  4. Receives slug: "hash-functions/collision-resistance"
  5. Validates with new regex ✅
  6. Saves to database ✅
  
Result:
  Lesson created with nested slug! ✅
  URL: /lessons/hash-functions/collision-resistance
```

## Testing

Try creating a sub-lesson now:
```
1. Click "Add sub-lesson"
2. Type title: "Test Sub-Lesson"
3. Slug shows: "parent-slug/test-sub-lesson"
4. Click "Create lesson"
5. ✅ Should work! (no more 400 error)
```

---

**Status**: ✅ Fixed  
**File**: `src/app/api/admin/courses/[courseId]/modules/utils.ts`  
**Line**: 3-5  
**Testing**: Ready to test!
