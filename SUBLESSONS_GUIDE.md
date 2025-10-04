# Sub-Lessons (Child Lessons) - Complete Guide

## Overview

The course system supports hierarchical lesson structures where lessons can have sub-lessons (child lessons). This creates a tree structure:

```
Module
├── Lesson 1 (Parent)
│   ├── Sub-lesson 1.1 (Child)
│   ├── Sub-lesson 1.2 (Child)
│   └── Sub-lesson 1.3 (Child)
├── Lesson 2 (Parent)
│   └── Sub-lesson 2.1 (Child)
└── Lesson 3 (Top-level, no parent)
```

## How to Add Sub-Lessons

### Method 1: When Creating a New Lesson

1. **Navigate to Course**: Go to `/admin/courses/[courseId]`
2. **Click "Add lesson"** on the module where you want to add a sub-lesson
3. **Select Parent Lesson**: In the "Parent lesson" dropdown, select the lesson you want this to be a child of
4. **Fill in Details**: Add title, content, etc.
5. **Save**: The new lesson will appear nested under the parent lesson

### Method 2: When Editing an Existing Lesson

1. **Click "Edit"** on the lesson you want to make a sub-lesson
2. **Change Parent**: In the "Parent lesson" dropdown, select the parent lesson
3. **Save**: The lesson will now appear nested under the selected parent

### Method 3: Bulk Assignment (Multiple Sub-Lessons)

At the bottom of the course management page, you'll see bulk assignment controls:

1. **Select Multiple Lessons**: Check the boxes next to lessons you want to make sub-lessons
2. **Choose Parent**: In the "Bulk set parent in [Module Name]" dropdown, select the parent lesson
3. **Click "Apply to selected"**: All selected lessons become children of that parent

## Parent Lesson Rules

### ✅ Valid Parent Lessons
- Top-level lessons (lessons with no parent)
- You can only see lessons from the SAME module

### ❌ Invalid Parent Lessons
- A lesson cannot be its own parent
- Lessons that already have a parent (cannot create 3+ level hierarchies)
- Lessons from different modules

## Clearing Parent (Making Top-Level)

To remove a parent and make a sub-lesson top-level again:

1. **Edit the lesson**
2. **Parent lesson dropdown**: Select "None"
3. **Save**: The lesson becomes top-level

## Visual Hierarchy

When viewing the course in admin:

```
📚 Module: Introduction to Cryptography
  📄 Lesson 1: Historical Development
  📄 Lesson 2: Basic Concepts
      📄 Sub: Encryption Types
      📄 Sub: Key Management
      📄 Sub: Security Properties
  📄 Lesson 3: Classical Cryptography
```

## Use Cases

### 1. **Topic Breakdown**
```
Main Topic: "Object-Oriented Programming Concepts"
  ├── Sub: Encapsulation
  ├── Sub: Inheritance
  ├── Sub: Polymorphism
  └── Sub: Abstraction
```

### 2. **Theory + Practice**
```
Main: "RSA Encryption Algorithm"
  ├── Sub: Mathematical Foundation
  ├── Sub: Implementation Steps
  └── Sub: Practical Example
```

### 3. **Progressive Learning**
```
Main: "Web Security Fundamentals"
  ├── Sub: Authentication Basics
  ├── Sub: Session Management
  ├── Sub: CSRF Protection
  └── Sub: XSS Prevention
```

## Example Workflow: Adding Sub-Lessons to "Randomness and Uncertainty"

Let's say you want to add 3 sub-lessons to "Randomness and Uncertainty":

### Step-by-Step:

1. **Go to**: `/admin/courses/[probability-course-id]`
2. **Find** the "Motivation and Probability Fundamentals" module
3. **Click** "Add lesson" button on that module
4. **Fill in**:
   - Title: "Sources of Randomness"
   - Parent lesson: "Randomness and Uncertainty" ← Select this!
   - Content type: standalone
   - Content: Your content here
   - Duration: 15 minutes
5. **Save**

Repeat for additional sub-lessons:
- "Measuring Uncertainty"
- "Randomness in Computing"

### Result:
```
Randomness and Uncertainty (30 min)
  ├── Sources of Randomness (15 min)
  ├── Measuring Uncertainty (15 min)
  └── Randomness in Computing (15 min)
```

## Technical Details

### Database Structure
```typescript
{
  _id: "lesson-id",
  title: "Sub-lesson title",
  parentLessonId: "parent-lesson-id", // References parent lesson
  moduleId: "module-id",
  courseId: "course-id",
  // ... other fields
}
```

### API Behavior
- **Creating**: POST `/api/admin/courses/[courseId]/modules/[moduleId]/lessons`
  - Include `parentLessonId` in request body
  - Use `null` or omit for top-level lessons

- **Updating**: PUT `/api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]`
  - Change `parentLessonId` to move between parents
  - Set to `null` to make top-level

- **Bulk Update**: POST `/api/admin/courses/[courseId]/modules/[moduleId]/lessons/bulk-parent`
  ```json
  {
    "lessonIds": ["lesson-1", "lesson-2", "lesson-3"],
    "parentLessonId": "parent-lesson-id" // or null
  }
  ```

## UI Components Fixed

We recently fixed the parent lesson selector to work properly:
- ✅ No more empty string errors
- ✅ "None" option works correctly
- ✅ Can clear parent relationships
- ✅ Dropdown shows only valid parent options

## Best Practices

### 📝 Naming Convention
Use clear hierarchical titles:
- Parent: "Probability Distributions"
- Children: "Discrete Distributions", "Continuous Distributions", "Special Cases"

### ⏱️ Duration Management
- Parent duration should reflect the ENTIRE topic (including all sub-lessons)
- Or, set parent to 0 and let sub-lessons carry the time
- Be consistent within your course

### 📊 Progress Tracking
- Students see progress at both parent and child levels
- Completing all children automatically completes the parent
- Use `progressWeight` to adjust importance

### 🎯 Content Organization
- Use parents for overview/introduction content
- Use children for detailed, specific topics
- Keep hierarchy to 2 levels maximum (parent → children)

## Troubleshooting

### "Cannot set parent" error
- ✅ Make sure you're selecting a top-level lesson
- ✅ Check that parent is in the same module
- ✅ Ensure you're not creating circular references

### Sub-lessons not showing
- ✅ Refresh the course page
- ✅ Check the lesson was saved with correct parentLessonId
- ✅ Verify the parent lesson exists

### Bulk assignment not working
- ✅ Select at least one lesson
- ✅ Choose a valid parent from the dropdown
- ✅ Ensure all selected lessons are in the same module as parent

## Quick Reference

| Action | Location | Steps |
|--------|----------|-------|
| Add sub-lesson | Add lesson button | Select parent in "Parent lesson" dropdown |
| Change parent | Edit lesson | Change "Parent lesson" dropdown value |
| Remove parent | Edit lesson | Select "None" in "Parent lesson" dropdown |
| Bulk assign | Bottom of course page | Select lessons → Choose parent → Apply |
| Clear all parents | Bulk controls | Select lessons → Choose "None" → Apply |

---

**Note**: The parent-child system is designed for **2-level hierarchies only**. If you need more complex structures, consider organizing content into separate modules instead.
