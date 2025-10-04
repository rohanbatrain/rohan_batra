# Sub-Lessons: Before & After Visual Comparison

## 🎨 What You'll See Now

### BEFORE Implementation (Flat List):
```
┌─────────────────────────────────────────────────────────────┐
│ #0 — Motivation and Probability Fundamentals                │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☰ ☐ Randomness and Uncertainty               [Edit][Del]│ │
│ │     — • standalone • 30 min                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☰ ☐ Probability Models and Sample Space     [Edit][Del]│ │
│ │     — • standalone • 60 min                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☰ ☐ Axioms of Probability                   [Edit][Del]│ │
│ │     — • standalone • 55 min                              │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### AFTER Implementation (With Hierarchy):
```
┌─────────────────────────────────────────────────────────────┐
│ #0 — Motivation and Probability Fundamentals                │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☰ ☐ Randomness and Uncertainty               [Edit][Del]│ │ ← PARENT
│ │     — • standalone • 30 min                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│     │                                                         │
│     ├─┐ ┌──────────────────────────────────────────────┐    │
│     │ │ │ ☰ ☐ └─ Types of Randomness     [Edit][Del] │    │ ← CHILD (Draggable!)
│     │ │ │     — • standalone • 10 min                  │    │
│     │ └─┘ └──────────────────────────────────────────────┘    │
│     │                                                         │
│     ├─┐ ┌──────────────────────────────────────────────┐    │
│     │ │ │ ☰ ☐ └─ Sources of Randomness   [Edit][Del] │    │ ← CHILD (Draggable!)
│     │ │ │     — • standalone • 10 min                  │    │
│     │ └─┘ └──────────────────────────────────────────────┘    │
│     │                                                         │
│     └─┐ ┌──────────────────────────────────────────────┐    │
│       │ │ ☰ ☐ └─ Measuring Uncertainty   [Edit][Del] │    │ ← CHILD (Draggable!)
│       │ │     — • standalone • 10 min                  │    │
│       └─┘ └──────────────────────────────────────────────┘    │
│                                                               │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ☰ ☐ Probability Models and Sample Space     [Edit][Del]│ │ ← PARENT
│ │     — • standalone • 60 min                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎯 Key Visual Features

### 1. Indentation
Child lessons are pushed to the right with extra spacing, making the hierarchy obvious.

### 2. Left Border
A vertical line connects all children to visually show they belong to the parent above.

### 3. Tree Symbol
Each child has `└─` prefix to reinforce it's a sub-item.

### 4. Lighter Background
Child lessons have a slightly muted background to differentiate from parents.

### 5. Grip Icons on BOTH
- **Parent**: ☰ Full grip icon - drag to reorder among parents
- **Children**: ☰ Full grip icon - drag to reorder among siblings

## 🖱️ Drag & Drop in Action

### Dragging a Parent:
```
BEFORE DRAG:
☰ Randomness and Uncertainty
    ☰ └─ Child A
    ☰ └─ Child B
☰ Probability Models
☰ Axioms of Probability

[User grabs Randomness and drags down]

DURING DRAG (ghosted):
☰ Probability Models
☰ Axioms of Probability
◌ [Drop zone indicator]
⬚ Randomness and Uncertainty (dragging...)
    ⬚ └─ Child A (moving with parent)
    ⬚ └─ Child B (moving with parent)

AFTER DROP:
☰ Probability Models
☰ Axioms of Probability
☰ Randomness and Uncertainty
    ☰ └─ Child A
    ☰ └─ Child B
```

### Dragging a Child:
```
BEFORE DRAG:
☰ Randomness and Uncertainty
    ☰ └─ Types of Randomness
    ☰ └─ Sources of Randomness
    ☰ └─ Measuring Uncertainty

[User grabs "Measuring Uncertainty" and drags up]

DURING DRAG:
☰ Randomness and Uncertainty
    ◌ [Drop zone]
    ⬚ └─ Measuring Uncertainty (dragging...)
    ☰ └─ Types of Randomness
    ◌ [Drop zone]
    ☰ └─ Sources of Randomness
    ◌ [Drop zone]

AFTER DROP:
☰ Randomness and Uncertainty
    ☰ └─ Measuring Uncertainty  ← Moved to top!
    ☰ └─ Types of Randomness
    ☰ └─ Sources of Randomness
```

## 📱 Responsive Layout

### Desktop View (>768px):
```
┌────────────────────────────────────────────────────┐
│ ☰ ☐ Lesson Title                    [Edit] [Delete]│
└────────────────────────────────────────────────────┘
```

### Mobile View (<768px):
```
┌─────────────────────┐
│ ☰ ☐ Lesson Title    │
│                     │
│ [Edit]   [Delete]   │
└─────────────────────┘
```

## 🎨 Color Scheme

### Parent Lesson:
- **Background**: `bg-background` (standard)
- **Border**: `border-muted`
- **Hover**: `hover:border-primary/50` (blue highlight)

### Child Lesson:
- **Background**: `bg-muted/10` (10% muted - lighter)
- **Border**: `border-muted/60` (60% muted - softer)
- **Left Border**: `border-l-2 border-muted` (2px solid)
- **Hover**: `hover:border-primary/30` (subtle blue)

## 🔄 States & Animations

### Normal State:
```
┌─────────────────────────────────────┐
│ ☰ ☐ └─ Lesson Title     [Edit][Del]│
└─────────────────────────────────────┘
```

### Hover State:
```
┌═════════════════════════════════════┐  ← Border brightens
│ ☰ ☐ └─ Lesson Title     [Edit][Del]│
└═════════════════════════════════════┘
```

### Dragging State (Semi-transparent):
```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│ ☰ ☐ └─ Lesson Title     [Edit][Del]│  ← Opacity 50%
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

### Selected State (Checkbox checked):
```
┌─────────────────────────────────────┐
│ ☰ ☑ └─ Lesson Title     [Edit][Del]│  ← Checkbox filled
└─────────────────────────────────────┘
```

## 🎓 Real Example from Your Course

### Module: Motivation and Probability Fundamentals

#### What You See Now (After Refresh):

```
#0 — Motivation and Probability Fundamentals
Duration: 540 min  9 lessons

┌──────────────────────────────────────────────────────────┐
│ ☰ ☐ Randomness and Uncertainty              [Edit][Delete]│
│     — • standalone • 30 min                               │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ☰ ☐ Probability Models and Sample Space    [Edit][Delete]│
│     — • standalone • 60 min                               │
└──────────────────────────────────────────────────────────┘

... (more lessons) ...
```

#### What You Can Create:

```
#0 — Motivation and Probability Fundamentals
Duration: 540 min  9 lessons

┌──────────────────────────────────────────────────────────┐
│ ☰ ☐ Randomness and Uncertainty              [Edit][Delete]│
│     — • standalone • 30 min                               │
└──────────────────────────────────────────────────────────┘
  │
  ├─┐ ┌────────────────────────────────────────────────┐
  │ │ │ ☰ ☐ └─ Types of Randomness      [Edit][Delete]│
  │ │ │     — • standalone • 10 min                    │
  │ └─┘ └────────────────────────────────────────────────┘
  │
  ├─┐ ┌────────────────────────────────────────────────┐
  │ │ │ ☰ ☐ └─ Deterministic vs Stochastic [Edit][Del]│
  │ │ │     — • standalone • 10 min                    │
  │ └─┘ └────────────────────────────────────────────────┘
  │
  └─┐ ┌────────────────────────────────────────────────┐
    │ │ ☰ ☐ └─ Measuring Uncertainty   [Edit][Delete]│
    │ │     — • standalone • 10 min                    │
    └─┘ └────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ ☰ ☐ Probability Models and Sample Space    [Edit][Delete]│
│     — • standalone • 60 min                               │
└──────────────────────────────────────────────────────────┘
  │
  ├─┐ ┌────────────────────────────────────────────────┐
  │ │ │ ☰ ☐ └─ Sample Space Basics     [Edit][Delete]│
  │ │ │     — • standalone • 20 min                    │
  │ └─┘ └────────────────────────────────────────────────┘
  │
  └─┐ ┌────────────────────────────────────────────────┐
    │ │ ☰ ☐ └─ Event Types             [Edit][Delete]│
    │ │     — • standalone • 20 min                    │
    └─┘ └────────────────────────────────────────────────┘
```

## ✅ How to Test

1. **Refresh your course page**: `http://localhost:3000/admin/courses/[courseId]`
2. **Look for the hierarchy**: If you've already created children, they should show indented
3. **Try dragging**: 
   - Grab the ☰ icon on a child lesson
   - Drag up or down
   - Release - it should reorder!
4. **Create new children**:
   - Click "Add lesson"
   - Select a parent from dropdown
   - Save and see it appear indented

## 🎉 You're All Set!

Your sub-lessons are now:
- ✅ Visually hierarchical
- ✅ Fully draggable
- ✅ Easy to reorganize
- ✅ Clear parent-child relationships

Enjoy organizing your course content! 🚀
