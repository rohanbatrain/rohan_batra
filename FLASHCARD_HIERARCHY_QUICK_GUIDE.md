# Flashcard Deck Hierarchy - Quick Implementation Guide

## 🎯 Goal

Create nested flashcard decks:
- **Course Deck** → All cards from entire course
- **Module Decks** → All cards from module's lessons
- **Lesson Decks** → Cards specific to lesson
- **Sub-lesson Decks** → Cards specific to sub-lesson

Users can study at ANY level!

---

## ✅ Good News: System Already Supports This!

The database schema **ALREADY HAS** everything needed:

```typescript
// FlashcardDeck model ALREADY has:
parentDeckId?: mongoose.Types.ObjectId;  // ✅ Parent reference
path: string;                             // ✅ Auto-computed path
level: number;                            // ✅ Auto-computed depth (0-6)
linkTargets: [{                          // ✅ Links to course/module/lesson
  scope: 'course' | 'module' | 'lesson',
  courseId, moduleId, lessonId
}];
```

**No schema changes needed!** 🎉

---

## 🏗️ Architecture

```
Course Deck (Level 0)
├── Module 1 Deck (Level 1)
│   ├── Lesson 1.1 Deck (Level 2) → Has cards
│   ├── Lesson 1.2 Deck (Level 2) → Has cards
│   │   ├── Sub-lesson 1.2.1 (Level 3) → Has cards
│   │   └── Sub-lesson 1.2.2 (Level 3) → Has cards
│   └── Lesson 1.3 Deck (Level 2) → Has cards
└── Module 2 Deck (Level 1)
    └── Lesson 2.1 Deck (Level 2) → Has cards
```

**Key Points:**
- Only **lesson/sub-lesson decks** have actual cards
- **Course/module decks** aggregate cards from children
- Path auto-computed: `"course-slug/module-slug/lesson-slug"`

---

## 📝 What Needs to Be Built

### 1. Utility Functions (`/src/lib/flashcards/hierarchy.ts`)

```typescript
// Create or get course root deck
getOrCreateCourseDeck(courseId, courseSlug, courseTitle, createdBy)

// Create or get module deck (child of course)
getOrCreateModuleDeck(moduleId, moduleTitle, courseId, courseDeckId, createdBy)

// Create or get lesson deck (child of module or parent lesson)
getOrCreateLessonDeck(
  lessonId, 
  lessonTitle, 
  courseId, 
  moduleId, 
  moduleDeckId,
  parentLessonId, // null for top-level lessons
  parentLessonDeckId, // null for top-level lessons
  createdBy
)

// Get all cards in deck + descendants
getAllCardsInHierarchy(deckId)

// Update card counts for deck and ancestors
updateDeckCardCounts(deckId)
```

### 2. API Endpoints

#### Create Deck Hierarchy
```
POST /api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/decks
```
Creates full hierarchy (course → module → lesson deck) if doesn't exist.

#### Study Session
```
GET /api/flashcards/study?scope=course&courseId=...
GET /api/flashcards/study?scope=module&moduleId=...
GET /api/flashcards/study?scope=lesson&lessonId=...
```
Returns all cards at that level + descendants.

### 3. UI Components

- `DeckHierarchySelector` - Tree view of all decks
- "Study" buttons at each level
- Card count badges
- Collapsible/expandable tree

### 4. Migration Script

Convert existing flat decks to hierarchical structure.

---

## 🔍 How Queries Work

### Study Entire Course
```typescript
// Find all decks under course path
const allDecks = await FlashcardDeck.find({
  path: { $regex: `^${courseSlug}` }
});

// Get all cards from those decks
const cards = await FlashcardCard.find({
  deckId: { $in: allDecks.map(d => d._id) }
});
```

### Study Specific Module
```typescript
// Find all decks under module path
const moduleDecks = await FlashcardDeck.find({
  path: { $regex: `^${courseSlug}/${moduleSlug}` }
});

const cards = await FlashcardCard.find({
  deckId: { $in: moduleDecks.map(d => d._id) }
});
```

### Study Specific Lesson (Including Sub-lessons)
```typescript
// Find lesson deck
const lessonDeck = await FlashcardDeck.findOne({
  'linkTargets.lessonId': lessonId
});

// Find all sub-lesson decks
const subDecks = await FlashcardDeck.find({
  path: { $regex: `^${lessonDeck.path}/` }
});

// Get cards from lesson + sub-lessons
const cards = await FlashcardCard.find({
  deckId: { $in: [lessonDeck._id, ...subDecks.map(d => d._id)] }
});
```

---

## 📊 Example Data Structure

### Course Deck
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "slug": "probability-fundamentals-deck",
  "title": "Probability Fundamentals - Complete Deck",
  "parentDeckId": null,
  "path": "probability-fundamentals-deck",
  "level": 0,
  "cardCount": 150,  // Aggregate from all children
  "linkTargets": [{
    "scope": "course",
    "courseId": "507f..."
  }]
}
```

### Module Deck
```json
{
  "_id": "507f1f77bcf86cd799439012",
  "slug": "module-motivation-probability",
  "title": "Motivation & Probability - Module Deck",
  "parentDeckId": "507f1f77bcf86cd799439011",  // Course deck
  "path": "probability-fundamentals-deck/module-motivation-probability",
  "level": 1,
  "cardCount": 50,  // Aggregate from lessons
  "linkTargets": [{
    "scope": "module",
    "courseId": "507f...",
    "moduleId": "507f..."
  }]
}
```

### Lesson Deck (Has Actual Cards)
```json
{
  "_id": "507f1f77bcf86cd799439013",
  "slug": "lesson-randomness-uncertainty",
  "title": "Randomness & Uncertainty - Lesson Deck",
  "parentDeckId": "507f1f77bcf86cd799439012",  // Module deck
  "path": "probability-fundamentals-deck/module-motivation-probability/lesson-randomness-uncertainty",
  "level": 2,
  "cardCount": 15,  // Direct cards
  "linkTargets": [{
    "scope": "lesson",
    "courseId": "507f...",
    "moduleId": "507f...",
    "lessonId": "507f..."
  }]
}
```

### Sub-lesson Deck (Has Actual Cards)
```json
{
  "_id": "507f1f77bcf86cd799439014",
  "slug": "sub-lesson-types-of-uncertainty",
  "title": "Types of Uncertainty - Sub-lesson Deck",
  "parentDeckId": "507f1f77bcf86cd799439013",  // Parent lesson deck
  "path": "probability-fundamentals-deck/module-motivation-probability/lesson-randomness-uncertainty/sub-lesson-types-of-uncertainty",
  "level": 3,
  "cardCount": 10,  // Direct cards
  "linkTargets": [{
    "scope": "lesson",
    "courseId": "507f...",
    "moduleId": "507f...",
    "lessonId": "507f..."  // Sub-lesson ID
  }]
}
```

---

## 🎯 Implementation Priority

### Phase 1: Core Utilities ⭐⭐⭐
- Create `/src/lib/flashcards/hierarchy.ts`
- Implement `getOrCreate*` functions
- Implement `getAllCardsInHierarchy`
- Implement `updateDeckCardCounts`

### Phase 2: API Endpoints ⭐⭐
- Create deck creation endpoint
- Create study session endpoint
- Test with Postman/Thunder Client

### Phase 3: UI Components ⭐
- Build `DeckHierarchySelector`
- Add "Study" buttons to course/module/lesson pages
- Show card counts

### Phase 4: Migration
- Run migration script on existing courses
- Verify hierarchy correctness

---

## 🧪 Testing Scenarios

### Scenario 1: New Course
1. Create course
2. Create module → auto-creates course deck
3. Create lesson → auto-creates module deck
4. Add cards to lesson deck
5. Verify counts propagate up to module → course

### Scenario 2: Study Entire Course
1. Navigate to course page
2. Click "Study All Cards"
3. Verify all cards from all lessons/sub-lessons included

### Scenario 3: Study Specific Module
1. Navigate to module page
2. Click "Study Module"
3. Verify only that module's lesson cards included

### Scenario 4: Study Specific Lesson
1. Navigate to lesson page
2. Click "Study Lesson"
3. Verify lesson + sub-lesson cards included

---

## 📚 Benefits

| Level | User Action | Cards Included |
|-------|-------------|----------------|
| **Course** | "Study entire course" | All lessons + sub-lessons (150 cards) |
| **Module** | "Study this module" | All lessons in module (50 cards) |
| **Lesson** | "Study this lesson" | Lesson + its sub-lessons (25 cards) |
| **Sub-lesson** | "Study this sub-lesson" | Just sub-lesson (10 cards) |

**Flexibility:** Users can drill down or zoom out as needed! 🎯

---

## 🚀 Next Steps

1. **Read Full Analysis:** `FLASHCARD_HIERARCHY_ANALYSIS.md`
2. **Create Utilities:** Start with `/src/lib/flashcards/hierarchy.ts`
3. **Test Queries:** Verify path regex matching works
4. **Build API:** Create deck creation endpoint
5. **Add UI:** Build deck selector component
6. **Migrate:** Run migration on existing courses

---

## ✅ Summary

**Current State:**  
✅ Database schema supports hierarchy (parentDeckId, path, level)  
✅ Link targets connect decks to courses/modules/lessons  
✅ Cards belong to specific decks  

**What's Missing:**  
❌ Utility functions to create/query hierarchy  
❌ API endpoints for study sessions  
❌ UI to select study scope  
❌ Migration for existing decks  

**Effort Estimate:**  
- **Utilities:** 2-3 hours
- **API:** 1-2 hours
- **UI:** 2-3 hours
- **Migration:** 1 hour
- **Total:** ~8 hours

**Complexity:** **Medium** (leverages existing schema, straightforward queries)

**Impact:** **High** (major UX improvement, enables flexible studying)

🎯 **Recommendation:** Implement Option A (Nested Deck Hierarchy) - it's the most scalable and user-friendly approach!
