# Knowledge Graph Quick Reference

## 🎨 Visual Enhancements Summary

### Component Files Updated
1. **KnowledgeGraph.tsx** - Main container with enhanced UI
2. **GraphCanvasEnhanced.tsx** - New D3 visualization component
3. **GraphControls.tsx** - Streamlined controls
4. **GraphNodeTooltip.tsx** - Premium tooltip design

---

## 🎯 Key Features

### Node Types & Colors
- **Module**: Blue-500 (`#3B82F6`) - 12px radius
- **Lesson**: Violet-500 (`#8B5CF6`) - 10px radius  
- **Sub-Lesson**: Purple-500 (`#A855F7`) - 8px radius
- **Completed**: Green-500 (`#22C55E`) with ✓
- **Locked**: Gray-500 (`#6B7280`) with 🔒

### Edge Types
- **Regular**: Gray solid lines (1.5px)
- **Prerequisites**: Amber dashed lines (2.5px, 5,5 pattern)

### Interactive Features
- **Hover**: Nodes scale 1.3x with glow
- **Drag**: Reposition nodes smoothly
- **Zoom**: Mouse wheel or +/- keys
- **Pan**: Click and drag canvas
- **Click**: Navigate to content

### Keyboard Shortcuts
- `+` or `=` → Zoom in
- `-` or `_` → Zoom out
- `0` → Reset view
- `Esc` → Deselect node

---

## 📦 Component Structure

```
<KnowledgeGraph>
  <Card> (gradient background)
    <CardHeader> (animated gradient)
      <Network Icon> (primary badge)
      <CardTitle> (with node count)
      <Toggle Button>
    
    <CardContent> (fade-in animation)
      <Controls Panel>
        <GraphControls /> (depth selector)
        <Refresh Button>
      
      <Graph Container> (rounded with shadow)
        <GraphCanvasEnhanced />
          - SVG with D3 interactions
          - Nodes with glow effects
          - Edges with arrowheads
          - Tooltips on hover
      
      <Legend> (color-coded)
        - Module, Lesson, Sub-Lesson
        - Completed, Locked
        - Prerequisites
      
      <Stats Panel>
        - Node count
        - Connection count
        - Depth level
```

---

## 🎨 Design Tokens

### Backgrounds
- Card: `bg-gradient-to-br from-card to-card/50`
- Header: `bg-gradient-to-r from-primary/5 to-transparent`
- Canvas: `bg-gradient-to-br from-background to-muted/10`
- Controls: `bg-muted/50`

### Shadows
- Card: `shadow-lg`
- Canvas: `shadow-inner`
- Nodes: SVG filter `drop-shadow(0 2px 3px rgba(0,0,0,0.3))`

### Animations
- Content reveal: `animate-in fade-in-50 duration-300`
- Node hover: `transition-all 0.2s`
- Edge highlight: `transition: opacity 0.2s`

### Typography
- Headers: `font-semibold`
- Labels: `font-medium text-xs`
- Stats: `text-[10px] opacity-60`

---

## 🔧 Props & Configuration

### KnowledgeGraph Props
```typescript
{
  courseSlug: string;      // Course identifier
  lessonSlug?: string;     // Optional lesson focus
  includeProgress?: boolean; // Show completion state
}
```

### Graph Controls
```typescript
{
  depth: number;           // 1-3 levels
  onDepthChange: (n) => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
}
```

### Canvas Props
```typescript
{
  graph: KnowledgeGraph;   // Graph data
  selectedNodeId?: string; // Highlight node
  onNodeClick?: (id) => void;
}
```

---

## 📊 Data Flow

1. **SWR Fetch** → `/api/courses/{slug}/lessons/{id}/graph?depth={n}`
2. **Layout Simulation** → D3 force-directed layout
3. **SVG Rendering** → Nodes, edges, labels
4. **User Interaction** → Zoom, pan, drag, click
5. **Tooltip Display** → Hover details
6. **Navigation** → Click to view content

---

## 🎯 User Experience

### Loading States
- Skeleton animation
- "Generating graph layout..." message
- Spinner with backdrop blur

### Error States
- Red icon with error message
- Retry button
- Helpful error text

### Empty States
- Network icon (grayed)
- "No content to visualize"
- Guidance text

### Success States
- Interactive graph
- Real-time stats
- Responsive legend
- Keyboard shortcuts hint

---

## 🚀 Performance

### Optimizations
- Ref-based memoization (prevents re-renders)
- Conditional layout simulation
- D3 transition throttling
- SVG filter caching
- Edge case validation

### Scalability
- Works with 1-100+ nodes
- Adjustable depth (1-3 levels)
- Progressive layout calculation
- Efficient drag updates

---

## 📱 Responsive Design

### Mobile (< 640px)
- Simplified legend
- Touch-friendly controls
- Smaller font sizes
- Full-width canvas

### Tablet (640px-1024px)
- 2-column legend
- Medium spacing
- Balanced layout

### Desktop (> 1024px)
- Full feature set
- Enhanced hover effects
- Keyboard shortcuts
- Larger tooltips

---

## 🧪 Testing Checklist

### Visual Tests
- [ ] All node colors correct
- [ ] Sizes match type (module > lesson > sub-lesson)
- [ ] Hover effects smooth
- [ ] Tooltips positioned correctly
- [ ] Legend matches nodes
- [ ] Stats accurate

### Interaction Tests
- [ ] Zoom in/out works
- [ ] Pan gesture smooth
- [ ] Nodes draggable
- [ ] Edges update on drag
- [ ] Click navigates
- [ ] Keyboard shortcuts work

### Data Tests
- [ ] Modules render
- [ ] Lessons render
- [ ] Sub-lessons render
- [ ] Prerequisites show as dashed
- [ ] Locked nodes have lock icon
- [ ] Completed nodes have check
- [ ] Progress shows when partial

### State Tests
- [ ] Loading shows skeleton
- [ ] Error shows retry
- [ ] Empty shows guidance
- [ ] Depth change refreshes

---

## 🔄 API Integration

### Endpoint
```
GET /api/courses/[courseId]/lessons/[lessonSlug]/graph
```

### Query Parameters
- `depth`: 1-3 (default: 1)
- `includeProgress`: boolean (default: true)

### Response Format
```typescript
{
  nodes: GraphNode[];
  edges: GraphEdge[];
  metadata: {
    nodeCount: number;
    edgeCount: number;
    depth: number;
  }
}
```

### Node Structure
```typescript
{
  id: string;
  label: string;
  type: 'module' | 'lesson' | 'sublesson';
  color?: string;
  size?: number;
  locked?: boolean;
  completed?: boolean;
  progress?: number;
  duration?: number;
  href?: string;
  x?: number;  // Set by D3
  y?: number;  // Set by D3
}
```

---

## 💡 Tips & Best Practices

### For Developers
1. Always import `GraphCanvasEnhanced` (not `GraphCanvas`)
2. Use refs for D3 comparisons to prevent re-renders
3. Validate node positions before rendering
4. Add loading states for better UX
5. Test with varying node counts (1, 10, 50+)

### For Designers
1. Maintain color consistency with design system
2. Keep contrast ratios accessible (4.5:1)
3. Use smooth transitions (200-300ms)
4. Add visual feedback for all interactions
5. Consider dark mode in color choices

### For Content Creators
1. Limit depth to 3 levels max
2. Keep node labels under 20 characters
3. Use prerequisites sparingly
4. Test graph with actual course data
5. Ensure logical content hierarchy

---

## 🎉 Summary

The enhanced Knowledge Graph now provides:
- **Professional visuals** with gradients and shadows
- **Smooth interactions** with animations
- **Clear information hierarchy** with tooltips
- **Accessible design** with ARIA labels
- **Responsive layout** for all devices
- **Performance optimized** for smooth 60fps

All module, lesson, and sub-lesson content is properly visualized with intuitive color coding and interactive features.
