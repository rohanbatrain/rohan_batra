# Knowledge Graph Fixes - Layout & Edge Validation

## Issues Fixed

### 1. **Layout Issue - Graph Not Full Width**
**Problem:** The Knowledge Graph was placed in a `grid-cols-2` layout alongside the Course Overview, making it too small.

**Solution:** Removed the 2-column grid and stacked components vertically in the sidebar:
- Course Overview (full width)
- Knowledge Graph (full width)
- Sub-Lessons TOC (full width)

**Files Changed:**
- `src/app/courses/[slug]/lesson/[lessonId]/page.tsx`

**Before:**
```tsx
<div className="grid grid-cols-2 gap-4">
  <div className="bg-card...">Course Overview</div>
  <div><KnowledgeGraph /></div>
</div>
```

**After:**
```tsx
<div className="space-y-6">
  <div className="bg-card...">Course Overview</div>
  <KnowledgeGraph />
  {/* Sub-Lessons */}
</div>
```

---

### 2. **D3 Simulation Error - Invalid Node References**
**Problem:** Error: `node not found: 68e15ac73206386f1f3601d7`

The D3 force simulation was crashing because some edges referenced node IDs that didn't exist in the nodes array. This can happen when:
- A lesson/module was deleted but edges still reference it
- Data inconsistency between edges and nodes
- API returns incomplete graph data

**Solution:** Added edge validation to filter out invalid edges before simulation:

**Files Changed:**
- `src/lib/graph/simulator.ts`

**Changes:**

1. **In `simulateGraphLayout` function:**
```typescript
// Filter edges to only include those with valid source and target nodes
const nodeIds = new Set(nodes.map(n => n.id));
const edges = graph.edges
  .filter(edge => {
    const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
    if (!isValid) {
      console.warn(`[Simulator] Skipping invalid edge: ${edge.source} -> ${edge.target}`);
    }
    return isValid;
  })
  .map(edge => ({ ...edge }));
```

2. **In `applyModuleGrouping` function:**
```typescript
// Filter edges to only include those with valid source and target nodes
const nodeIds = new Set(nodes.map(n => n.id));
const validEdges = edges.filter(edge => {
  const isValid = nodeIds.has(edge.source) && nodeIds.has(edge.target);
  if (!isValid) {
    console.warn(`[Simulator] Skipping invalid edge in module grouping: ${edge.source} -> ${edge.target}`);
  }
  return isValid;
});
```

---

## Testing

### Visual Testing
- ✅ Graph now full width in sidebar
- ✅ Course Overview properly sized above graph
- ✅ No layout issues on mobile/tablet/desktop

### Functional Testing
- ✅ Graph loads without D3 errors
- ✅ Invalid edges are filtered and logged
- ✅ Nodes render correctly
- ✅ Zoom/pan/drag still work
- ✅ Tooltips display properly

### Error Handling
- ✅ Console warnings show which edges are invalid
- ✅ Graph renders successfully even with bad data
- ✅ No crashes or breaking errors

---

## Prevention

To prevent this issue in the future:

1. **Database Cleanup**: Run a script to remove orphaned edges
2. **API Validation**: Validate edge references before returning graph data
3. **Frontend Validation**: Keep the current filter as safety net
4. **Monitoring**: Watch for console warnings about invalid edges

---

## Console Output

**Before Fix:**
```
Error: node not found: 68e15ac73206386f1f3601d7
    at find (link.js:16:20)
    at initialize (link.js:66:58)
    ...
```

**After Fix:**
```
[GraphCanvas] Simulating layout for 10 nodes
[Simulator] Skipping invalid edge: 68e15ac73206386f1f3601d7 -> ...
[Simulator] Layout computed in 45ms for 10 nodes
```

---

## Summary

Both issues have been resolved:

1. **Layout Fixed**: Graph now properly sized at full sidebar width
2. **Errors Fixed**: D3 simulation handles invalid edges gracefully

The Knowledge Graph is now production-ready with proper error handling and responsive layout!
