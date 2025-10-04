# Sub-Lesson UI Flow - Step by Step

## Flow 0: Quick Sub-Lesson Creation (New Button)

**The Fastest Way** - Use the "Add sub-lesson" button directly on parent lessons:

```
┌─────────────────────────────────────────────────────────────┐
│  Course Management Page                                     │
│  /admin/courses/[courseId]                                  │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 1. Find the parent lesson
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  #0 — Motivation and Probability Fundamentals               │
│  ┌────────────────────────────────────────────┐             │
│  │  📄 Randomness and Uncertainty                           │
│  │      [Edit] [Add sub-lesson] [Delete]  ← 2. Click this! │
│  │  📄 Probability Models and Sample Space                  │
│  │  📄 Axioms of Probability                                │
│  └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  New Lesson Form (Parent Pre-Selected!)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ℹ️ Creating sub-lesson                              │   │
│  │ This lesson will be created as a child of:          │   │
│  │ Randomness and Uncertainty                          │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Parent lesson                                        │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Randomness and Uncertainty  ✓      ▼           │ │ ← Auto-filled! │
│  │ └─────────────────────────────────────────────────┘ │   │
│  │                                                      │   │
│  │ Title: _________________________                    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 3. Fill in title & content
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Fill in Details                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title: Types of Randomness                          │   │
│  │ Content Type: Standalone                            │   │
│  │ Duration: 15 minutes                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Create Lesson] [Cancel]  ← 4. Save                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Result: Sub-lesson instantly appears nested!               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Randomness and Uncertainty                      │   │
│  │      📄 Types of Randomness  [Edit][Delete]  ← NEW! │   │
│  │  📄 Probability Models and Sample Space             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Why this is better:**
- ✅ No need to open dropdown and search for parent
- ✅ Parent is automatically pre-selected
- ✅ Visual banner confirms you're creating a child
- ✅ One click instead of multiple steps
- ✅ More discoverable - button appears on the lesson itself

---

## Flow 1: Adding a New Sub-Lesson (Manual Method)

```
┌─────────────────────────────────────────────────────────────┐
│  Course Management Page                                     │
│  /admin/courses/[courseId]                                  │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 1. Find the module
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  #0 — Motivation and Probability Fundamentals               │
│  ┌────────────────────────────────────────────┐             │
│  │  📄 Randomness and Uncertainty  [Edit][Delete]           │
│  │  📄 Probability Models and Sample Space                  │
│  │  📄 Axioms of Probability                                │
│  └────────────────────────────────────────────┘             │
│                                                              │
│  [Edit] [Add lesson] [Delete]  ← 2. Click "Add lesson"     │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  New Lesson Form                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Parent lesson                                        │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ None (top-level lesson)            ▼           │ │ ← 3. Click dropdown │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Dropdown Options                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● None                                               │   │
│  │ ○ Randomness and Uncertainty                        │ ← 4. Select parent │
│  │ ○ Probability Models and Sample Space               │   │
│  │ ○ Axioms of Probability                             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Fill in Lesson Details                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title: Types of Randomness                          │   │
│  │                                                      │   │
│  │ Parent lesson: Randomness and Uncertainty  ✓        │   │
│  │                                                      │   │
│  │ Content Type: ▼ Standalone                          │   │
│  │                                                      │   │
│  │ Duration: 15 minutes                                │   │
│  │                                                      │   │
│  │ Content: [MDX editor...]                            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Save Lesson] [Cancel]  ← 5. Click Save                   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Result: Sub-lesson appears nested                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Randomness and Uncertainty                      │   │
│  │      📄 Types of Randomness  [Edit][Delete]  ← NEW! │   │
│  │  📄 Probability Models and Sample Space             │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Flow 2: Converting Existing Lesson to Sub-Lesson

```
┌─────────────────────────────────────────────────────────────┐
│  Current State: All top-level                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Randomness and Uncertainty     [Edit][Delete]   │   │
│  │  📄 Probability Models             [Edit][Delete]   │   │
│  │  📄 Axioms of Probability          [Edit][Delete]   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Goal: Make "Axioms of Probability" a child of "Probability │
│        Models and Sample Space"                             │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 1. Click "Edit" on "Axioms of Probability"
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Edit Lesson Form                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title: Axioms of Probability                        │   │
│  │                                                      │   │
│  │ Parent lesson:                                      │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ None (top-level lesson)            ▼           │ │ ← 2. Click │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Select New Parent                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ None                                               │   │
│  │ ○ Randomness and Uncertainty                        │   │
│  │ ● Probability Models and Sample Space               │ ← 3. Select │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Update Lesson] [Cancel]  ← 4. Save                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Result: Lesson is now nested                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Randomness and Uncertainty                      │   │
│  │  📄 Probability Models and Sample Space             │   │
│  │      📄 Axioms of Probability  [Edit][Delete] ← Nested! │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Flow 3: Bulk Assignment (Multiple Sub-Lessons at Once)

```
┌─────────────────────────────────────────────────────────────┐
│  Module with Multiple Lessons                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ☐ 📄 Introduction to Probability                   │   │
│  │  ☐ 📄 Basic Probability Rules                       │   │
│  │  ☐ 📄 Conditional Probability                       │   │
│  │  ☐ 📄 Independence Concepts                         │   │
│  │  ☐ 📄 Bayes Theorem                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Goal: Make lessons 2-4 children of "Introduction"         │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 1. Check boxes next to lessons
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Select Lessons to Group                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ☐ 📄 Introduction to Probability                   │   │
│  │  ☑ 📄 Basic Probability Rules                       │ ← Check │
│  │  ☑ 📄 Conditional Probability                       │ ← Check │
│  │  ☑ 📄 Independence Concepts                         │ ← Check │
│  │  ☐ 📄 Bayes Theorem                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 2. Scroll to bottom of page
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Bulk Set Parent Controls                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Bulk set parent in "Motivation and Probability..."  │   │
│  │ ┌──────────────────────────────┐                    │   │
│  │ │ None (top-level)        ▼   │ ← 3. Click dropdown│   │
│  │ └──────────────────────────────┘                    │   │
│  │ [Apply to selected] 3 selected                      │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Select Parent for All                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ○ None                                               │   │
│  │ ● Introduction to Probability                       │ ← 4. Select │
│  │ ○ Bayes Theorem                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Apply to selected] ← 5. Click                            │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Result: All 3 lessons nested under Introduction           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Introduction to Probability                     │   │
│  │      📄 Basic Probability Rules                     │   │
│  │      📄 Conditional Probability                     │   │
│  │      📄 Independence Concepts                       │   │
│  │  📄 Bayes Theorem                                   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Flow 4: Removing Parent (Making Top-Level Again)

```
┌─────────────────────────────────────────────────────────────┐
│  Current State: Lesson has a parent                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Randomness and Uncertainty                      │   │
│  │      📄 Types of Randomness  [Edit][Delete] ← This one │
│  │  📄 Probability Models                              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  Goal: Make "Types of Randomness" top-level                │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 1. Click "Edit"
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Edit Lesson Form                                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Title: Types of Randomness                          │   │
│  │                                                      │   │
│  │ Parent lesson:                                      │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ Randomness and Uncertainty         ▼           │ │ ← Current │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                        │
                        │ 2. Click dropdown
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Select "None" to Remove Parent                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ● None  ← 3. Select this                           │   │
│  │ ○ Randomness and Uncertainty                        │   │
│  │ ○ Probability Models and Sample Space               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Update Lesson] [Cancel]  ← 4. Save                       │
└─────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│  Result: Now top-level                                      │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  📄 Randomness and Uncertainty                      │   │
│  │  📄 Types of Randomness  [Edit][Delete] ← Top-level!│   │
│  │  📄 Probability Models                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Quick Tips

### ✅ DO:
- Use sub-lessons for breaking down complex topics
- Keep parent titles general, child titles specific
- Use consistent indentation in your hierarchy
- Test the flow before adding many lessons

### ❌ DON'T:
- Create 3+ level hierarchies (parent → child → grandchild) - Not supported
- Make a lesson its own parent (system prevents this)
- Put sub-lessons in different modules than parent

## Visual Hierarchy Example

```
📚 Module: Cryptographic Hash Functions
  
  📄 Properties and Applications of Hash Functions (70 min)
      📄 Collision Resistance (20 min)
      📄 Preimage Resistance (15 min)
      📄 Avalanche Effect (15 min)
      📄 Real-World Applications (20 min)
  
  📄 Message Digest Algorithm (MD5) (60 min)
  
  📄 SHA-1 and SHA-256 (80 min)
      📄 SHA-1 Structure (30 min)
      📄 SHA-256 Improvements (30 min)
      📄 Performance Comparison (20 min)
```

## Common Patterns

### Pattern 1: Overview + Details
```
Main: "Introduction to Public Key Cryptography"
  ├── Basic Concepts
  ├── Mathematical Foundations
  └── Security Properties
```

### Pattern 2: Concept + Examples
```
Main: "RSA Algorithm"
  ├── Key Generation
  ├── Encryption Process
  ├── Decryption Process
  └── Worked Example
```

### Pattern 3: Theory + Application
```
Main: "Diffie-Hellman Key Exchange"
  ├── Mathematical Basis
  ├── Protocol Steps
  └── Security Analysis
```
