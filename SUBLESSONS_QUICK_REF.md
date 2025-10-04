# Sub-Lessons Quick Reference Card

## 🎯 What Are Sub-Lessons?

Sub-lessons are **child lessons** that belong to a parent lesson, creating a 2-level hierarchy:

```
Parent Lesson
  ├── Sub-lesson 1
  ├── Sub-lesson 2
  └── Sub-lesson 3
```

## 🚀 Four Ways to Add Sub-Lessons

### Method 1: Quick Button (⭐ Fastest!)
```
1. Find parent lesson on course page
2. Click "Add sub-lesson" button next to it
3. Form opens with parent pre-selected!
4. Fill in title and content
5. Save
```

### Method 2: During Creation
```
1. Click "Add lesson" on module
2. Fill in title and details
3. Parent lesson dropdown → Select parent
4. Save
```

### Method 3: Edit Existing
```
1. Click "Edit" on lesson
2. Parent lesson dropdown → Select parent
3. Save
```

### Method 4: Bulk Assignment
```
1. Check boxes on multiple lessons
2. Scroll to bottom
3. "Bulk set parent" dropdown → Select parent
4. Click "Apply to selected"
```

## 📋 Rules

✅ **Can Do:**
- Make any top-level lesson a parent
- Move lessons between parents
- Clear parent (select "None")
- Bulk assign multiple lessons

❌ **Cannot Do:**
- Make a lesson its own parent
- Create 3+ level hierarchies
- Parent to lesson in different module
- Parent to a lesson that already has a parent

## 🎨 Example Use Cases

### Breaking Down Complex Topics
```
📄 Symmetric Key Cryptography (Parent)
    📄 DES Algorithm
    📄 AES Algorithm
    📄 Block Cipher Modes
```

### Progressive Learning Path
```
📄 Web Security Basics (Parent)
    📄 Authentication
    📄 Session Management
    📄 CSRF Protection
```

### Theory + Practice
```
📄 RSA Encryption (Parent)
    📄 Mathematical Foundation
    📄 Implementation
    📄 Practical Example
```

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Can't see parent option | Only top-level lessons show in dropdown |
| Changes not saving | Refresh page and try again |
| Wrong hierarchy | Edit lesson and select "None" to reset |
| Bulk not working | Ensure all lessons are in same module |

## 📍 Where to Find

- **Admin URL**: `/admin/courses/[courseId]`
- **Parent dropdown**: In "Add lesson" or "Edit lesson" forms
- **Bulk controls**: Bottom of course management page

## 💡 Pro Tips

1. **Name clearly**: Use descriptive titles that show the relationship
   - Parent: "Introduction to Cryptography"
   - Child: "Caesar Cipher", "Substitution Cipher"

2. **Manage duration**: Set parent to overview (30 min) + children details
   
3. **Use bulk for speed**: Select multiple lessons and assign parent at once

4. **Keep it simple**: Stick to 2 levels maximum

5. **Preview hierarchy**: Check the visual indentation on course page

## 🎓 Your Current Course Example

Based on your screenshot, you could organize like this:

```
📚 #0 — Motivation and Probability Fundamentals

📄 Randomness and Uncertainty (30 min)
    📄 Sources of Randomness (10 min)
    📄 Deterministic vs Stochastic (10 min)
    📄 Measuring Uncertainty (10 min)

📄 Probability Models and Sample Space (60 min)
    📄 Sample Space Basics (20 min)
    📄 Event Types (20 min)
    📄 Probability Models (20 min)

📄 Axioms of Probability (55 min)
    📄 Kolmogorov Axioms (20 min)
    📄 Properties from Axioms (20 min)
    📄 Applications (15 min)
```

## Next Steps

1. ✅ Open your course: http://localhost:3000/admin/courses/[id]
2. ✅ Click "Add lesson" on a module
3. ✅ Try selecting a parent from the dropdown
4. ✅ Save and see the nested structure!

---

**Need Help?** 
- See `SUBLESSONS_GUIDE.md` for complete documentation
- See `SUBLESSONS_UI_FLOW.md` for visual step-by-step flows
