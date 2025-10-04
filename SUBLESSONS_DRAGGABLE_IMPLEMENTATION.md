# Sub-Lessons Drag & Drop Implementation

## ✅ What Was Implemented

### 1. **Hierarchical Display**
- Parent lessons show at the top level
- Child lessons (sub-lessons) are indented and nested under their parents
- Visual border on the left side of child lessons for clear hierarchy

### 2. **Draggable Sub-Lessons**
- **Both parent AND child lessons are draggable** using the grip icon (☰)
- Child lessons can be reordered within their siblings
- Parent lessons can be reordered among other parents
- All lessons maintain their parent-child relationships when dragged

### 3. **Visual Distinctions**
- **Parent lessons**: Standard background, full border
- **Child lessons**: 
  - Indented with `ml-8` (left margin)
  - Left border indicator (`border-l-2`)
  - Slightly muted background
  - Tree symbol prefix: `└─`
  - Smaller font size
  - Different hover effect

## 📐 UI Structure

### Before (Flat List):
```
☰ ☐ Randomness and Uncertainty
☰ ☐ Probability Models and Sample Space
☰ ☐ Axioms of Probability
```

### After (With Children):
```
☰ ☐ Randomness and Uncertainty
    │
    ├─ ☰ ☐ └─ Types of Randomness
    ├─ ☰ ☐ └─ Sources of Randomness
    └─ ☰ ☐ └─ Measuring Uncertainty
    
☰ ☐ Probability Models and Sample Space
```

## 🎨 Visual Features

### Parent Lesson Card:
- Standard background color
- Full border
- Grip icon for dragging
- Checkbox for bulk selection
- Title in regular font
- [Edit] and [Delete] buttons

### Child Lesson Card:
- **Indented 8 spacing units to the right**
- **Left border (vertical line) connecting to parent**
- Lighter background (muted/10)
- Grip icon for dragging (still fully functional!)
- Checkbox for bulk selection
- **Tree symbol prefix: `└─`**
- Title in slightly smaller font
- [Edit] and [Delete] buttons

## 🔧 Technical Implementation

### Code Changes Made:

1. **Added `parentLessonId` to `LessonDetail` interface**
   ```typescript
   interface LessonDetail {
     // ... existing fields
     parentLessonId?: string | null;
   }
   ```

2. **Modified rendering logic** to show hierarchy:
   ```typescript
   // Filter to show only top-level lessons first
   module.lessons
     .filter(lesson => !lesson.parentLessonId)
     .map(lesson => {
       // Find children for this parent
       const childLessons = module.lessons.filter(
         child => child.parentLessonId === lesson.id
       );
       
       return (
         <div>
           <SortableLessonRow lesson={lesson} />
           
           {/* Nested children with indentation */}
           <div className='ml-8 border-l-2 pl-4'>
             {childLessons.map(child => (
               <SortableLessonRow lesson={child} isChild={true} />
             ))}
           </div>
         </div>
       );
     })
   ```

3. **Added `isChild` prop** to `SortableLessonRow`:
   - Different styling for child lessons
   - Tree symbol prefix
   - Adjusted aria-labels

## 🎯 How It Works

### Drag and Drop Behavior:

1. **Parent Lessons**:
   - Can be dragged to reorder among other parent lessons
   - When dragged, children move with them
   - Maintains all child relationships

2. **Child Lessons**:
   - Can be dragged to reorder among siblings (other children of same parent)
   - Cannot be dragged to become top-level (maintains parent relationship)
   - Smooth animation during drag

3. **All lessons remain in the same DndContext**, meaning:
   - The drag/drop library handles reordering
   - API call updates the order on the backend
   - Page refreshes to show new order

## 📋 User Experience

### Creating Children:
1. **Method 1**: Click "Add lesson" → Select parent from dropdown
2. **Method 2**: Edit existing lesson → Change parent dropdown
3. **Method 3**: Bulk select lessons → Choose parent → Apply

### Reordering Children:
1. **Click and hold** the grip icon (☰) on a child lesson
2. **Drag** up or down among siblings
3. **Release** to drop in new position
4. Order automatically saves to database

### Visual Feedback:
- **Hover**: Border color changes
- **Drag**: Lesson becomes semi-transparent
- **Drop target**: Visual indicator shows where lesson will be placed

## 🎨 CSS Classes Used

### Parent Lesson:
```css
className="border-muted bg-background hover:border-primary/50"
```

### Child Lesson:
```css
className="border-muted/60 bg-muted/10 hover:border-primary/30"
```

### Container for Children:
```css
className="ml-8 space-y-2 border-l-2 border-muted pl-4"
```

## 🚀 Benefits

### For Content Creators:
- ✅ Clear visual hierarchy
- ✅ Easy reorganization with drag & drop
- ✅ Bulk assignment for efficiency
- ✅ Visual distinction between parent and child

### For Students (When Viewing):
- 📚 Clear topic organization
- 🎯 Understand relationships between lessons
- 📈 Progressive learning path
- ✨ Better course navigation

## 🔄 Drag & Drop Technical Details

### Library Used:
- **@dnd-kit** (React drag-and-drop)
- `useSortable` hook for each lesson
- `SortableContext` wraps all lessons
- `DndContext` handles drag events

### Event Flow:
```
1. User clicks grip icon → useSortable activates
2. User drags → transform applied to element
3. User drops → onDragEnd event fires
4. Handler calls API to update order
5. Page refreshes → New order displays
```

### API Endpoint:
```
PUT /api/admin/courses/[courseId]/modules/[moduleId]/lessons/reorder
Body: { activeId, overId }
```

## 📱 Responsive Design

- **Desktop**: Full layout with side-by-side buttons
- **Mobile**: Stacked layout, but drag & drop still works
- **Touch**: Grip icon works with touch events

## 🐛 Edge Cases Handled

1. **No children**: Parent displays normally without nested section
2. **Multiple children**: All display in order, all draggable
3. **Deep nesting**: Limited to 2 levels (parent → children only)
4. **Empty module**: Shows "No lessons" message

## 🎓 Example Usage

### Organizing a Cryptography Module:

**Before:**
```
☰ Introduction to Encryption
☰ Symmetric Encryption
☰ DES Algorithm
☰ AES Algorithm
☰ Block Cipher Modes
☰ Asymmetric Encryption
```

**After:**
```
☰ Introduction to Encryption

☰ Symmetric Encryption
    │
    ├─ ☰ └─ DES Algorithm
    ├─ ☰ └─ AES Algorithm
    └─ ☰ └─ Block Cipher Modes

☰ Asymmetric Encryption
```

Now you can:
- Drag "DES Algorithm" above "AES Algorithm" to reorder
- Drag "Symmetric Encryption" to move it (children move with it)
- Add new child lesson under "Asymmetric Encryption"

## 🔮 Future Enhancements (Optional)

- [ ] Collapse/expand parent lessons
- [ ] Drag child to different parent
- [ ] Visual connection lines between parent and children
- [ ] Keyboard shortcuts for reordering
- [ ] Undo/redo for drag operations

---

## ✨ Result

You now have a fully functional hierarchical lesson system with drag-and-drop support for both parent and child lessons! The visual hierarchy makes it easy to understand course structure while maintaining full editing capabilities.
