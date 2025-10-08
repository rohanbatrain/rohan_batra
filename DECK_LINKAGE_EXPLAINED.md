# Flashcard Deck Linkage - CONFIRMED ✅

## Question: Do lesson decks link to each other?

**Answer: YES! All decks are properly linked via `parentDeckId` field.**

---

## 🔗 How Decks Are Linked

### Database Structure

Each deck has a `parentDeckId` field that points to its parent deck:

```typescript
{
  _id: ObjectId("68e620c5950ac410bea7b2b0"),
  title: "Axioms of Probability - Lesson Deck",
  parentDeckId: ObjectId("68e620c5950ac410bea7b2af"), // ← Points to Module Deck
  path: "course-deck/module-deck/lesson-deck",
  level: 2
}
```

---

## 🌳 Actual Hierarchy (from your database)

```
📚 Probability, Entropy, and Monte Carlo Simulation - Complete Deck
   _id: 68e620c5950ac410bea7b2a3
   level: 0
   parentDeckId: null (ROOT)
   ↓
   ├─ 📂 Motivation and Probability Fundamentals - Module Deck
   │    _id: 68e620c5950ac410bea7b2af
   │    level: 1
   │    parentDeckId: 68e620c5950ac410bea7b2a3 ← Points to Course Deck
   │    ↓
   │    ├─ 📄 Axioms of Probability - Lesson Deck
   │    │    _id: 68e620c5950ac410bea7b2b0
   │    │    level: 2
   │    │    parentDeckId: 68e620c5950ac410bea7b2af ← Points to Module Deck
   │    │
   │    ├─ 📄 Bayes' Theorem - Lesson Deck
   │    │    level: 2
   │    │    parentDeckId: 68e620c5950ac410bea7b2af ← Points to Module Deck
   │    │
   │    └─ 📄 Randomness and Uncertainty - Lesson Deck
   │         level: 2
   │         parentDeckId: 68e620c5950ac410bea7b2af ← Points to Module Deck
   │         ↓
   │         └─ 📝 first - Sub-lesson Deck
   │              level: 3
   │              parentDeckId: [lesson deck ID] ← Points to Lesson Deck
   │
   └─ 📂 [5 more modules, each with their own lesson decks...]
```

---

## ✅ Verification Results

**Ran verification script** (`scripts/check-deck-linkage.ts`):

```
📊 Deck Distribution:
  Level 0 (Course):     1 deck
  Level 1 (Module):     6 decks
  Level 2 (Lesson):     45 decks
  Level 3 (Sub-lesson): 1 deck
  Total:                53 decks

✅ All decks have valid parent references (no orphans)
✅ Every deck correctly points to its parent via parentDeckId
✅ Path field is auto-computed from parent relationships
```

---

## 🔍 How It Works

### 1. Parent-Child Relationship

Each deck stores its parent's ObjectId:

```typescript
// Module Deck
{
  _id: "68e620c5950ac410bea7b2af",
  title: "Motivation and Probability Fundamentals - Module Deck",
  parentDeckId: "68e620c5950ac410bea7b2a3", // ← Course Deck ID
  level: 1
}

// Lesson Deck
{
  _id: "68e620c5950ac410bea7b2b0",
  title: "Axioms of Probability - Lesson Deck",
  parentDeckId: "68e620c5950ac410bea7b2af", // ← Module Deck ID
  level: 2
}
```

### 2. Automatic Path Computation

The `path` field is automatically computed using a pre-validate hook:

```typescript
FlashcardDeckSchema.pre('validate', async function(next) {
  if (this.parentDeckId) {
    const parent = await FlashcardDeck.findById(this.parentDeckId);
    if (parent) {
      this.level = parent.level + 1;
      this.path = `${parent.path}/${this.slug}`;
    }
  }
});
```

Result:
```
Course:     "probability-entropy-and-monte-carlo-simulation-complete-deck"
Module:     "probability-entropy.../module-motivation-and-probability-fundamentals"
Lesson:     "probability-entropy.../module-motivation.../lesson-axioms-of-probability"
Sub-lesson: "probability-entropy.../module-motivation.../lesson-axioms.../sub-lesson-first"
```

### 3. Querying the Hierarchy

**Get all children of a deck:**
```typescript
const children = await FlashcardDeck.find({
  parentDeckId: deckId
});
```

**Get all descendants (children + grandchildren + ...):**
```typescript
const descendants = await FlashcardDeck.find({
  path: { $regex: `^${deck.path}/` }
});
```

**Walk up the tree to root:**
```typescript
let currentDeck = await FlashcardDeck.findById(deckId);
while (currentDeck.parentDeckId) {
  currentDeck = await FlashcardDeck.findById(currentDeck.parentDeckId);
}
// currentDeck is now the root (course deck)
```

---

## 📚 Linkage Types

### Type 1: Vertical Links (Parent-Child)
**Via `parentDeckId` field:**
- Lesson → Module → Course
- Enables hierarchy traversal
- Used for aggregating cards

### Type 2: Content Links
**Via `linkTargets` field:**
- Deck → Course/Module/Lesson entity
- Enables finding deck for a specific lesson
- Used for navigation

Example:
```typescript
// Lesson Deck linking to Lesson entity
{
  linkTargets: [{
    scope: 'lesson',
    courseId: ObjectId("..."),
    moduleId: ObjectId("..."),
    lessonId: ObjectId("68e15ac73206386f1f3601d9") // ← The actual lesson
  }]
}
```

---

## 🎯 Benefits of This Linkage

1. **Study at Any Level**
   ```typescript
   // Study entire course
   const allCards = await getAllCardsInHierarchy(courseDeckId);
   
   // Study module only
   const moduleCards = await getAllCardsInHierarchy(moduleDeckId);
   
   // Study lesson only
   const lessonCards = await getAllCardsInHierarchy(lessonDeckId);
   ```

2. **Card Count Aggregation**
   ```
   Sub-lesson: 10 cards
   Lesson: 10 + 15 = 25 cards (includes sub-lesson)
   Module: 25 + 30 + 45 = 100 cards (all lessons)
   Course: 100 + 200 + 300 = 600 cards (all modules)
   ```

3. **Navigation**
   ```typescript
   // From lesson deck, get module deck
   const moduleDeck = await FlashcardDeck.findById(lessonDeck.parentDeckId);
   
   // From lesson deck, get course deck
   const courseDeck = await FlashcardDeck.findById(moduleDeck.parentDeckId);
   ```

---

## 🔧 Testing Linkage

Run verification script:
```bash
pnpm tsx scripts/check-deck-linkage.ts
```

Or add to package.json:
```json
"scripts": {
  "admin:check-deck-links": "DOTENV_CONFIG_PATH=.env.local node --import tsx -r dotenv/config scripts/check-deck-linkage.ts"
}
```

---

## ✅ Conclusion

**YES, decks are properly linked!**

- ✅ Every deck has a `parentDeckId` (except root course deck)
- ✅ `parentDeckId` points to valid parent deck
- ✅ No orphaned decks (all parents exist)
- ✅ Path is auto-computed from parent relationships
- ✅ Level is auto-computed from parent relationships
- ✅ 53 decks in perfect hierarchical structure

**The linkage is working exactly as designed!** 🎉
