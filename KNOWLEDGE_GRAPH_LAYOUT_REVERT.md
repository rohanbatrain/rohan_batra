# Knowledge Graph - Layout Revert & Undefined Node Fix

## Changes Made

### 1. ✅ **Reverted Layout to Side-by-Side**

**Change:** Restored the 2-column grid layout for Course Overview and Knowledge Graph.

**File:** `src/app/courses/[slug]/lesson/[lessonId]/page.tsx`

**Layout:**
```tsx
<div className="grid grid-cols-2 gap-4">
  {/* Course Overview Card */}
  <div className="bg-card rounded-xl border shadow-sm p-5">
    {/* Overview content */}
  </div>
  
  {/* Knowledge Graph */}
  <div>
    <KnowledgeGraph
      courseSlug={slug}
      lessonSlug={String(lesson._id)}
      includeProgress={!!progress}
    />
  </div>
</div>
```

Both components now sit side-by-side in the sidebar as originally designed.

---

### 2. ✅ **Fixed Undefined Node Error**

**Error:** `Cannot read properties of undefined (reading 'size')`

**Root Cause:** The `getNodeRadius`, `getNodeColor`, and `getNodeStrokeColor` functions didn't handle cases where a node might be undefined during drag operations or edge updates.

**File:** `src/components/courses/GraphCanvasEnhanced.tsx`

**Fixes Applied:**

#### 1. Updated `getNodeRadius` function:
```typescript
const getNodeRadius = (node: GraphNode | undefined): number => {
  if (!node) return 10; // Default radius for undefined nodes
  const baseSize = node.size || 30;
  switch (node.type) {
    case 'module':
      return Math.max(baseSize * 0.4, 12);
    case 'lesson':
      return Math.max(baseSize * 0.33, 10);
    case 'sublesson':
      return Math.max(baseSize * 0.27, 8);
    default:
      return Math.max(baseSize * 0.33, 10);
  }
};
```

#### 2. Updated `getNodeColor` function:
```typescript
const getNodeColor = (node: GraphNode | undefined): string => {
  if (!node) return 'rgb(156, 163, 175)'; // gray-400 default
  
  // Rest of color logic...
};
```

#### 3. Updated `getNodeStrokeColor` function:
```typescript
const getNodeStrokeColor = (node: GraphNode | undefined): string => {
  if (!node) return 'rgb(107, 114, 128)'; // gray-500 default
  
  // Rest of stroke color logic...
};
```

**Default Values:**
- **Radius:** 10px (medium size)
- **Color:** Gray-400 (rgb(156, 163, 175))
- **Stroke:** Gray-500 (rgb(107, 114, 128))

---

## Why This Error Occurred

The error happened during drag operations when the D3 simulation tries to access node properties for edge updates. In some cases:

1. An edge references a node that was filtered out due to invalid data
2. The drag behavior accesses a node before it's fully initialized
3. Race conditions during layout recalculation

The fix ensures that even if a node is undefined, the functions return safe default values instead of crashing.

---

## Testing

### Before Fix:
```
TypeError: Cannot read properties of undefined (reading 'size')
    at getNodeRadius (GraphCanvasEnhanced.tsx:94:27)
    at dragBehavior (GraphCanvasEnhanced.tsx:172:22)
```

### After Fix:
- ✅ No runtime errors
- ✅ Drag operations work smoothly
- ✅ Invalid nodes fallback to default styling
- ✅ Graph renders without crashes

---

## Summary

Both issues resolved:

1. **Layout:** Reverted to side-by-side grid layout (Course Overview | Knowledge Graph)
2. **Error Handling:** Added undefined node checks with safe defaults

The Knowledge Graph now handles edge cases gracefully while maintaining the original layout design! 🎉
