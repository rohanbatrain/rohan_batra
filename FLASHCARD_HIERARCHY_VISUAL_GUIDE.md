# Flashcard Deck Hierarchy - Visual Reference

## 🎯 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    COURSE ROOT DECK                         │
│  "Probability Fundamentals - Complete Deck"                 │
│  Level: 0 | Path: "probability-fundamentals-deck"          │
│  Total Cards: 150 (aggregated from all children)           │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼─────┐   ┌────────▼─────┐
│  MODULE 1    │   │  MODULE 2    │   │  MODULE 3    │
│  Deck        │   │  Deck        │   │  Deck        │
│  Level: 1    │   │  Level: 1    │   │  Level: 1    │
│  50 cards    │   │  60 cards    │   │  40 cards    │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                  │
   ┌───┴───┐          ┌───┴───┐          ┌───┴───┐
   │       │          │       │          │       │
┌──▼──┐ ┌─▼──┐    ┌──▼──┐ ┌─▼──┐    ┌──▼──┐ ┌─▼──┐
│L 1.1│ │L 1.2│   │L 2.1│ │L 2.2│   │L 3.1│ │L 3.2│
│Deck │ │Deck │   │Deck │ │Deck │   │Deck │ │Deck │
│Lv:2 │ │Lv:2 │   │Lv:2 │ │Lv:2 │   │Lv:2 │ │Lv:2 │
│15   │ │25   │   │30   │ │20   │   │15   │ │15   │
│cards│ │cards│   │cards│ │cards│   │cards│ │cards│
└─────┘ └──┬──┘   └─────┘ └─────┘   └─────┘ └─────┘
           │
       ┌───┴───┐
       │       │
    ┌──▼──┐ ┌─▼──┐
    │SL   │ │SL   │
    │1.2.1│ │1.2.2│
    │Deck │ │Deck │
    │Lv:3 │ │Lv:3 │
    │10   │ │15   │
    │cards│ │cards│
    └─────┘ └─────┘
```

**Legend:**
- **L** = Lesson
- **SL** = Sub-lesson
- **Lv** = Level (depth in hierarchy)

---

## 🗄️ Database Schema

### FlashcardDeck Model
```
┌─────────────────────────────────────┐
│ FlashcardDeck                       │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ slug: string (unique)               │
│ title: string                       │
│ parentDeckId: ObjectId | null  ✨   │  ← Links to parent deck
│ path: string (auto-computed)   ✨   │  ← Full hierarchical path
│ level: number (0-6)            ✨   │  ← Depth in tree
│ cardCount: number                   │  ← Includes children
│ linkTargets: [{                     │
│   scope: 'course|module|lesson' ✨  │  ← What it's linked to
│   courseId: ObjectId               │
│   moduleId: ObjectId               │
│   lessonId: ObjectId               │
│ }]                                  │
│ status: 'draft|published|archived'  │
│ createdBy: ObjectId                 │
│ createdAt: Date                     │
└─────────────────────────────────────┘
```

**✨ = Critical for hierarchy**

### FlashcardCard Model
```
┌─────────────────────────────────────┐
│ FlashcardCard                       │
├─────────────────────────────────────┤
│ _id: ObjectId                       │
│ deckId: ObjectId  ✨                │  ← Belongs to ONE deck
│ type: 'basic|cloze|qa|image'        │
│ prompt: {                           │
│   text: string                      │
│   richText: string                  │
│   media: { images, audio }          │
│ }                                   │
│ response: { ... }                   │
│ hint: string                        │
│ explanation: string                 │
│ tags: string[]                      │
│ order: number                       │
│ scheduling: { ... }                 │
└─────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Creating a Lesson Deck

```
User creates lesson
        │
        ▼
┌───────────────────┐
│ Check if course   │──No──▶ Create course root deck
│ deck exists?      │           (level 0, no parent)
└────────┬──────────┘
         │ Yes
         ▼
┌───────────────────┐
│ Check if module   │──No──▶ Create module deck
│ deck exists?      │           (level 1, parent = course deck)
└────────┬──────────┘
         │ Yes
         ▼
┌───────────────────┐
│ Is this a         │──Yes─▶ Get parent lesson deck
│ sub-lesson?       │           (parent = parent lesson deck)
└────────┬──────────┘
         │ No
         ▼
┌───────────────────┐
│ Create lesson     │
│ deck              │
│ (level 2,         │
│  parent = module) │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Add cards to      │
│ lesson deck       │
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ Update card       │
│ counts up tree    │
│ (lesson→module→   │
│  course)          │
└───────────────────┘
```

---

## 🎓 Study Session Flow

### Study Entire Course

```
User clicks "Study Course"
         │
         ▼
Find course root deck
(linkTargets.scope = 'course')
         │
         ▼
Find ALL decks with path starting with course path
(path regex: "^probability-fundamentals-deck")
         │
         ▼
Get ALL cards from those decks
(deckId IN [all found deck IDs])
         │
         ▼
Return 150 cards
(from all modules, lessons, sub-lessons)
```

### Study Specific Module

```
User clicks "Study Module"
         │
         ▼
Find module deck
(linkTargets.scope = 'module',
 linkTargets.moduleId = moduleId)
         │
         ▼
Find ALL decks with path starting with module path
(path regex: "^probability-fundamentals-deck/module-1")
         │
         ▼
Get ALL cards from those decks
         │
         ▼
Return 50 cards
(from module's lessons + sub-lessons)
```

### Study Specific Lesson

```
User clicks "Study Lesson"
         │
         ▼
Find lesson deck
(linkTargets.scope = 'lesson',
 linkTargets.lessonId = lessonId)
         │
         ▼
Check if lesson has sub-lessons
         │
    Yes  │  No
    ┌────┴────┐
    │         │
    ▼         ▼
Find sub-   Return
lesson      lesson
decks       cards
(path       only
 regex)     (15 cards)
    │
    ▼
Return lesson
+ sub-lesson
cards
(15 + 10 = 25)
```

---

## 📊 Path Examples

### Course Root Deck
```
slug: "probability-fundamentals-deck"
path: "probability-fundamentals-deck"
level: 0
parentDeckId: null
```

### Module Deck
```
slug: "module-motivation-probability"
path: "probability-fundamentals-deck/module-motivation-probability"
level: 1
parentDeckId: [course deck ID]
```

### Lesson Deck
```
slug: "lesson-randomness-uncertainty"
path: "probability-fundamentals-deck/module-motivation-probability/lesson-randomness-uncertainty"
level: 2
parentDeckId: [module deck ID]
```

### Sub-lesson Deck
```
slug: "sub-lesson-types-of-uncertainty"
path: "probability-fundamentals-deck/module-motivation-probability/lesson-randomness-uncertainty/sub-lesson-types-of-uncertainty"
level: 3
parentDeckId: [parent lesson deck ID]
```

---

## 🔍 Query Patterns

### Find All Descendant Decks

```typescript
// Using path regex
const descendants = await FlashcardDeck.find({
  path: { $regex: `^${parentDeck.path}/` }
});
```

**Example:**
```
Parent path: "probability-fundamentals-deck/module-1"

Matches:
✅ "probability-fundamentals-deck/module-1/lesson-1"
✅ "probability-fundamentals-deck/module-1/lesson-2"
✅ "probability-fundamentals-deck/module-1/lesson-2/sub-lesson-1"

Does NOT match:
❌ "probability-fundamentals-deck/module-2/lesson-1"
❌ "probability-fundamentals-deck" (parent itself)
```

### Find Direct Children Only

```typescript
// Using parentDeckId
const children = await FlashcardDeck.find({
  parentDeckId: parentDeck._id
});
```

### Find Root Decks (Courses)

```typescript
const rootDecks = await FlashcardDeck.find({
  level: 0,
  parentDeckId: null
});
```

---

## 🎨 UI Mockup

### Deck Selector Component

```
┌─────────────────────────────────────────────────┐
│  📚 Probability Fundamentals                    │
│  Study entire course              [150 cards] ▶ │
├─────────────────────────────────────────────────┤
│  ▼ 📂 Module 1: Motivation & Probability        │
│     Study this module              [50 cards] ▶ │
│     │                                            │
│     ├─ 📄 Lesson 1.1: Randomness                │
│     │  Study this lesson           [15 cards] ▶ │
│     │                                            │
│     ├─ 📄 Lesson 1.2: Uncertainty                │
│     │  Study this lesson           [25 cards] ▶ │
│     │  │                                         │
│     │  ├─ 📄 1.2.1: Types                       │
│     │  │  Study sub-lesson         [10 cards] ▶ │
│     │  │                                         │
│     │  └─ 📄 1.2.2: Examples                    │
│     │     Study sub-lesson         [15 cards] ▶ │
│     │                                            │
│     └─ 📄 Lesson 1.3: Probability Models        │
│        Study this lesson           [10 cards] ▶ │
│                                                  │
│  ▶ 📂 Module 2: Bayes Theorem                   │
│     Study this module              [60 cards] ▶ │
│                                                  │
│  ▶ 📂 Module 3: Monte Carlo Methods             │
│     Study this module              [40 cards] ▶ │
└─────────────────────────────────────────────────┘
```

**Legend:**
- **▼** = Expanded
- **▶** = Collapsed
- **📚** = Course
- **📂** = Module
- **📄** = Lesson/Sub-lesson

---

## 📈 Card Count Aggregation

```
                Course Deck
                 (150)
                   │
        ┌──────────┼──────────┐
        │          │          │
    Module 1   Module 2   Module 3
      (50)       (60)       (40)
        │          │          │
    ┌───┴───┐  ┌───┴───┐  ┌───┴───┐
    │       │  │       │  │       │
  L1.1    L1.2 L2.1   L2.2 L3.1  L3.2
  (15)    (25) (30)   (20) (15)  (15)
          │
      ┌───┴───┐
      │       │
   SL1.2.1 SL1.2.2
    (10)    (15)
```

**Calculation:**
- **L1.2:** 25 cards (includes 10 + 15 from sub-lessons)
- **Module 1:** 50 cards (15 + 25 + 10 from lessons)
- **Course:** 150 cards (50 + 60 + 40 from modules)

**Update Trigger:**
When a card is added to **SL1.2.1**:
1. Update **SL1.2.1** count: 10 → 11
2. Update **L1.2** count: 25 → 26
3. Update **Module 1** count: 50 → 51
4. Update **Course** count: 150 → 151

---

## 🧩 Complete Example

### Probability Fundamentals Course

```
Course: "Probability Fundamentals"
  ID: 507f1f77bcf86cd799439011
  Root Deck: 507fAAA...
  Path: "probability-fundamentals-deck"
  Total: 150 cards
  
  Module 1: "Motivation and Probability Fundamentals"
    ID: 507f1f77bcf86cd799439012
    Deck: 507fBBB...
    Path: "probability-fundamentals-deck/module-motivation-probability"
    Total: 50 cards
    
    Lesson 1.1: "Randomness and Uncertainty"
      ID: 507f1f77bcf86cd799439013
      Deck: 507fCCC...
      Path: ".../lesson-randomness-uncertainty"
      Cards: 15 (direct)
      
      Card 1:
        Prompt: "What is randomness?"
        Response: "Unpredictability in outcomes..."
      
      Card 2:
        Prompt: "Define uncertainty"
        Response: "Lack of complete knowledge..."
      
      ...Card 15
    
    Lesson 1.2: "Probability Models and Sample Space"
      ID: 507f1f77bcf86cd799439014
      Deck: 507fDDD...
      Path: ".../lesson-probability-models"
      Total: 25 cards (10 direct + 15 from sub-lessons)
      
      Sub-lesson 1.2.1: "Introduction to Probability Models"
        ID: 507f1f77bcf86cd799439015
        Deck: 507fEEE...
        Path: ".../sub-lesson-intro-probability-models"
        Cards: 10 (direct)
        
        Card 1:
          Prompt: "What is a probability model?"
          Response: "A mathematical framework..."
        
        ...Card 10
      
      Sub-lesson 1.2.2: "Sample Space Examples"
        ID: 507f1f77bcf86cd799439016
        Deck: 507fFFF...
        Path: ".../sub-lesson-sample-space-examples"
        Cards: 15 (direct)
```

---

## ✅ Benefits Summary

| Feature | Before | After |
|---------|--------|-------|
| **Flexibility** | Fixed deck per lesson | Study at any level |
| **Organization** | Flat list | Hierarchical tree |
| **Discovery** | Manual search | Visual navigation |
| **Scalability** | Limited | Unlimited nesting |
| **Aggregation** | Manual | Automatic |

---

## 🚀 Implementation Status

- ✅ **Database Schema** - Already supports hierarchy
- ✅ **Path Auto-computation** - Already implemented
- ❌ **Utility Functions** - Need to create
- ❌ **API Endpoints** - Need to create
- ❌ **UI Components** - Need to create
- ❌ **Migration Script** - Need to create

**Estimate:** ~8 hours total implementation time

**Impact:** High - Major UX improvement for studying! 🎯
