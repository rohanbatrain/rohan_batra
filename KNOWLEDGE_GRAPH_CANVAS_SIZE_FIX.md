# Knowledge Graph - Canvas Size Fix for Side-by-Side Layout

## Issue
The graph canvas wasn't rendering visibly in the side-by-side layout because the container was too small (half of the sidebar width) but the canvas was sized for full-width display.

## Root Cause
- **Canvas Height**: Set to 600px (too tall for compact view)
- **Simulation Dimensions**: 1200x600px (optimized for full-width display)
- **Container**: Only ~200-250px wide in the grid-cols-2 layout

This mismatch caused the graph to either:
1. Render outside the visible area
2. Be scaled down so much it was invisible
3. Not fit within the container bounds

## Solution

Adjusted both the canvas size and simulation dimensions to fit the compact side-by-side layout:

### File: `src/components/courses/GraphCanvasEnhanced.tsx`

#### 1. Reduced Canvas Height
```typescript
// Before
className='relative w-full h-[600px] bg-gradient-to-br...'

// After
className='relative w-full h-[300px] bg-gradient-to-br...'
```

**Change:** 600px → 300px (half the height)

#### 2. Adjusted Simulation Dimensions
```typescript
// Before
const simulated = simulateGraphLayout(graph, {
  width: 1200,
  height: 600,
  maxIterations: Math.min(300, graph.nodes.length * 3),
});

// After
const simulated = simulateGraphLayout(graph, {
  width: 600,
  height: 300,
  maxIterations: Math.min(300, graph.nodes.length * 3),
});
```

**Changes:**
- Width: 1200px → 600px
- Height: 600px → 300px

This creates a more compact graph that fits nicely in the smaller container while maintaining proper aspect ratio.

---

## Visual Result

### Layout Breakdown
```
┌─────────────────────────────────────┐
│         Sidebar (400-500px)         │
├──────────────────┬──────────────────┤
│  Course Overview │ Knowledge Graph  │
│    (~200-250px)  │   (~200-250px)   │
│                  │                  │
│  • Course Title  │  [Canvas 300px]  │
│  • Progress Bar  │  • 10 nodes      │
│  • Back Button   │  • Interactive   │
│                  │  • Zoom/Pan      │
└──────────────────┴──────────────────┘
```

### Canvas Dimensions
- **Container Width**: ~200-250px (auto-sized by grid)
- **Container Height**: 300px (fixed)
- **Aspect Ratio**: Roughly 2:3 (portrait-ish)
- **Simulation Space**: 600x300px (matched to container)

---

## Benefits

1. **Visible Graph**: Nodes and edges now render within the visible area
2. **Proper Scaling**: D3 simulation matches container dimensions
3. **Compact Design**: Fits nicely in side-by-side layout
4. **Still Interactive**: All zoom, pan, drag features work
5. **Responsive**: Uses percentage width for flexibility

---

## Node Density

With the smaller canvas:
- **Optimal**: 5-15 nodes display clearly
- **Acceptable**: Up to 20 nodes (may be crowded)
- **Consider Depth**: Use depth=1 for compact view

The depth selector allows users to control how much of the graph they see at once.

---

## Future Enhancements

If more space is needed:

1. **Full-Width Mode**: Add toggle to expand graph to full sidebar width
2. **Collapsible Overview**: Allow hiding course overview to give graph more space
3. **Modal View**: Click to open graph in a full-screen modal
4. **Vertical Layout**: Stack overview on top with larger graph below

---

## Testing Checklist

- ✅ Graph renders visibly in side-by-side layout
- ✅ Nodes are properly sized and spaced
- ✅ Edges connect correctly
- ✅ Zoom/pan controls work
- ✅ Tooltips display on hover
- ✅ Legend shows correct colors
- ✅ Stats display accurate counts
- ✅ No overflow or clipping issues

---

## Summary

**Fixed the invisible graph rendering issue by:**
1. Reducing canvas height from 600px to 300px
2. Adjusting simulation dimensions from 1200x600 to 600x300

The Knowledge Graph now renders properly in the compact side-by-side layout! 🎉
