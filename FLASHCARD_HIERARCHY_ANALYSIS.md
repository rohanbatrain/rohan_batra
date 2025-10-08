# Flashcard Deck Hierarchy - Analysis & Implementation Strategy

## 🎯 Requirement

Create a hierarchical flashcard deck system:

```
Course Deck (Root)
├── Module 1 Deck
│   ├── Lesson 1.1 Deck
│   ├── Lesson 1.2 Deck
│   │   ├── Sub-lesson 1.2.1 Deck
│   │   └── Sub-lesson 1.2.2 Deck
│   └── Lesson 1.3 Deck
├── Module 2 Deck
│   ├── Lesson 2.1 Deck
│   └── Lesson 2.2 Deck
└── Module 3 Deck
```

**User Flexibility:**
- Study **entire course** → All cards from all nested decks
- Study **specific module** → All cards from module + its lessons/sub-lessons
- Study **specific lesson** → Only cards from that lesson (+ sub-lessons if any)
- Study **specific sub-lesson** → Only cards from that sub-lesson

---

## 📊 Current System Analysis

### ✅ What Already Exists

#### 1. Hierarchical Deck Support (ALREADY IMPLEMENTED!)

The `FlashcardDeck` model **ALREADY HAS** the necessary fields for hierarchy:

```typescript
// From src/models/FlashcardDeck.ts
export interface IFlashcardDeck {
  parentDeckId?: mongoose.Types.ObjectId | null;  // ✅ Parent reference
  path: string;                                    // ✅ Full path (e.g., "course/module/lesson")
  level: number;                                   // ✅ Depth level (0=course, 1=module, 2=lesson)
  // ... other fields
}
```

**Auto-computed Fields:**
- `path` - Automatically built from parent hierarchy (e.g., `"probability-fundamentals/module-1/lesson-1"`)
- `level` - Automatically computed (0 for root, 1 for children, etc.)
- Max level: 6 (plenty for course → module → lesson → sub-lesson)

#### 2. Link Targets (Content Association)

Each deck can link to specific course content:

```typescript
linkTargets: Array<{
  scope: 'standalone' | 'course' | 'module' | 'lesson';
  courseId?: mongoose.Types.ObjectId | null;
  moduleId?: mongoose.Types.ObjectId | null;
  lessonId?: mongoose.Types.ObjectId | null;
}>;
```

**Current Usage:**
- Decks can be linked to courses, modules, or lessons
- Validation ensures proper IDs for each scope

#### 3. Course/Module/Lesson References

All three entities **already have** `flashcardDeckIds` arrays:

```typescript
// Course model
flashcardDeckIds: mongoose.Types.ObjectId[];

// CourseModule model
flashcardDeckIds?: mongoose.Types.ObjectId[];

// CourseLesson model (including sub-lessons)
flashcardDeckIds?: mongoose.Types.ObjectId[];
```

#### 4. Cards Belong to Decks

```typescript
// FlashcardCard model
deckId: mongoose.Types.ObjectId; // Each card belongs to ONE deck
```

---

## 🎨 Recommended Implementation Strategy

### Option A: Nested Deck Hierarchy (RECOMMENDED)

**Structure:**
```
Course: "Probability Fundamentals" (Root Deck)
  ├── Module: "Motivation & Probability" (Child Deck)
  │   ├── Lesson: "Randomness & Uncertainty" (Child Deck)
  │   │   ├── Sub-lesson: "Introduction to Randomness" (Child Deck)
  │   │   └── Sub-lesson: "Types of Uncertainty" (Child Deck)
  │   └── Lesson: "Probability Models" (Child Deck)
  └── Module: "Bayes Theorem" (Child Deck)
```

**How It Works:**
1. **Course Deck** - Root deck (level 0), no parent
2. **Module Decks** - Children of course deck (level 1), `parentDeckId = courseDeckId`
3. **Lesson Decks** - Children of module decks (level 2), `parentDeckId = moduleDeckId`
4. **Sub-lesson Decks** - Children of lesson decks (level 3), `parentDeckId = lessonDeckId`

**Cards:**
- Cards belong DIRECTLY to their specific deck (lesson or sub-lesson level)
- Module and course decks DON'T have their own cards (they aggregate from children)

**Querying:**
```typescript
// Study entire course
const allDecks = await FlashcardDeck.find({
  path: { $regex: `^${courseSlug}` } // All decks under this course
});
const allCards = await FlashcardCard.find({
  deckId: { $in: allDecks.map(d => d._id) }
});

// Study specific module
const moduleDecks = await FlashcardDeck.find({
  path: { $regex: `^${courseSlug}/${moduleSlug}` }
});
const moduleCards = await FlashcardCard.find({
  deckId: { $in: moduleDecks.map(d => d._id) }
});

// Study specific lesson
const lessonCards = await FlashcardCard.find({ deckId: lessonDeckId });

// Study lesson + sub-lessons
const lessonAndSubDecks = await FlashcardDeck.find({
  $or: [
    { _id: lessonDeckId },
    { path: { $regex: `^${lessonDeck.path}/` } }
  ]
});
const allLessonCards = await FlashcardCard.find({
  deckId: { $in: lessonAndSubDecks.map(d => d._id) }
});
```

---

### Option B: Flat Decks with Aggregation (Alternative)

**Structure:**
- Each lesson/sub-lesson has its OWN standalone deck (no parent relationships)
- Virtual aggregation decks created on-the-fly for course/module views

**Pros:**
- Simpler queries (no path matching needed)
- Each deck is independently manageable

**Cons:**
- No explicit hierarchy in database
- Harder to visualize structure
- More complex aggregation logic

**Verdict:** NOT RECOMMENDED - Doesn't leverage existing `parentDeckId` system

---

## 🛠️ Implementation Steps (Option A)

### Step 1: Create Utility Functions

Create `/src/lib/flashcards/hierarchy.ts`:

```typescript
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import mongoose from 'mongoose';

/**
 * Get or create course root deck
 */
export async function getOrCreateCourseDeck(
  courseId: string,
  courseSlug: string,
  courseTitle: string,
  createdBy: string
) {
  // Check if root deck exists (linked to course)
  let deck = await FlashcardDeckModel.findOne({
    'linkTargets.scope': 'course',
    'linkTargets.courseId': new mongoose.Types.ObjectId(courseId),
    parentDeckId: null, // Root deck
  });

  if (!deck) {
    // Create root course deck
    deck = await FlashcardDeckModel.create({
      slug: `${courseSlug}-deck`,
      title: `${courseTitle} - Complete Deck`,
      subtitle: 'All cards from all modules and lessons',
      parentDeckId: null, // Root
      level: 0, // Will be auto-set
      path: '', // Will be auto-set
      status: 'published',
      visibility: 'public',
      cardCount: 0, // Aggregate from children
      linkTargets: [{
        scope: 'course',
        courseId: new mongoose.Types.ObjectId(courseId),
      }],
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });
  }

  return deck;
}

/**
 * Get or create module deck (child of course deck)
 */
export async function getOrCreateModuleDeck(
  moduleId: string,
  moduleTitle: string,
  courseId: string,
  courseDeckId: string,
  createdBy: string
) {
  let deck = await FlashcardDeckModel.findOne({
    'linkTargets.scope': 'module',
    'linkTargets.moduleId': new mongoose.Types.ObjectId(moduleId),
  });

  if (!deck) {
    const moduleSlug = moduleTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    deck = await FlashcardDeckModel.create({
      slug: `module-${moduleSlug}`,
      title: `${moduleTitle} - Module Deck`,
      parentDeckId: new mongoose.Types.ObjectId(courseDeckId),
      status: 'published',
      visibility: 'public',
      cardCount: 0,
      linkTargets: [{
        scope: 'module',
        courseId: new mongoose.Types.ObjectId(courseId),
        moduleId: new mongoose.Types.ObjectId(moduleId),
      }],
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });
  }

  return deck;
}

/**
 * Get or create lesson deck (child of module deck)
 */
export async function getOrCreateLessonDeck(
  lessonId: string,
  lessonTitle: string,
  courseId: string,
  moduleId: string,
  moduleDeckId: string,
  parentLessonId: string | null, // For sub-lessons
  parentLessonDeckId: string | null, // For sub-lessons
  createdBy: string
) {
  let deck = await FlashcardDeckModel.findOne({
    'linkTargets.scope': 'lesson',
    'linkTargets.lessonId': new mongoose.Types.ObjectId(lessonId),
  });

  if (!deck) {
    const lessonSlug = lessonTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Determine parent deck (module deck or parent lesson deck for sub-lessons)
    const parentDeckId = parentLessonDeckId 
      ? new mongoose.Types.ObjectId(parentLessonDeckId)
      : new mongoose.Types.ObjectId(moduleDeckId);
    
    deck = await FlashcardDeckModel.create({
      slug: parentLessonId ? `sub-lesson-${lessonSlug}` : `lesson-${lessonSlug}`,
      title: `${lessonTitle} - Lesson Deck`,
      parentDeckId,
      status: 'published',
      visibility: 'public',
      cardCount: 0,
      linkTargets: [{
        scope: 'lesson',
        courseId: new mongoose.Types.ObjectId(courseId),
        moduleId: new mongoose.Types.ObjectId(moduleId),
        lessonId: new mongoose.Types.ObjectId(lessonId),
      }],
      createdBy: new mongoose.Types.ObjectId(createdBy),
    });
  }

  return deck;
}

/**
 * Get all cards for a deck and its children (recursive)
 */
export async function getAllCardsInHierarchy(deckId: string) {
  const deck = await FlashcardDeckModel.findById(deckId);
  if (!deck) return [];

  // Find all descendant decks using path
  const descendantDecks = await FlashcardDeckModel.find({
    path: { $regex: `^${deck.path}` },
  });

  // Include current deck + all descendants
  const allDeckIds = [deck._id, ...descendantDecks.map(d => d._id)];

  // Get all cards from these decks
  const cards = await FlashcardCardModel.find({
    deckId: { $in: allDeckIds },
  }).sort({ deckId: 1, order: 1 });

  return cards;
}

/**
 * Update card counts for deck and all ancestors
 */
export async function updateDeckCardCounts(deckId: string) {
  let currentDeck = await FlashcardDeckModel.findById(deckId);
  
  while (currentDeck) {
    // Count direct cards in this deck
    const directCardCount = await FlashcardCardModel.countDocuments({
      deckId: currentDeck._id,
    });

    // Count cards in all descendant decks
    const descendantDecks = await FlashcardDeckModel.find({
      path: { $regex: `^${currentDeck.path}/` },
    });
    
    const descendantCardCount = await FlashcardCardModel.countDocuments({
      deckId: { $in: descendantDecks.map(d => d._id) },
    });

    // Update total card count
    currentDeck.cardCount = directCardCount + descendantCardCount;
    await currentDeck.save();

    // Move to parent
    if (currentDeck.parentDeckId) {
      currentDeck = await FlashcardDeckModel.findById(currentDeck.parentDeckId);
    } else {
      currentDeck = null;
    }
  }
}
```

---

### Step 2: Create API Endpoint for Deck Creation

Update `/src/app/api/admin/courses/[courseId]/modules/[moduleId]/lessons/[lessonId]/decks/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CourseLessonModel from '@/models/CourseLesson';
import CourseModuleModel from '@/models/CourseModule';
import CourseModel from '@/models/Course';
import UserModel from '@/models/User';
import {
  getOrCreateCourseDeck,
  getOrCreateModuleDeck,
  getOrCreateLessonDeck,
} from '@/lib/flashcards/hierarchy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; moduleId: string; lessonId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, moduleId, lessonId } = await params;

    await connectToDatabase();

    // Get user
    const user = await UserModel.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify lesson exists
    const lesson = await CourseLessonModel.findById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    // Get module and course
    const module = await CourseModuleModel.findById(moduleId);
    const course = await CourseModel.findById(courseId);

    if (!module || !course) {
      return NextResponse.json(
        { error: 'Module or course not found' },
        { status: 404 }
      );
    }

    // 1. Get or create course root deck
    const courseDeck = await getOrCreateCourseDeck(
      courseId,
      course.slug,
      course.title,
      String(user._id)
    );

    // 2. Get or create module deck (child of course deck)
    const moduleDeck = await getOrCreateModuleDeck(
      moduleId,
      module.title,
      courseId,
      String(courseDeck._id),
      String(user._id)
    );

    // 3. Determine if this is a sub-lesson
    const parentLessonId = lesson.parentLessonId
      ? String(lesson.parentLessonId)
      : null;

    let parentLessonDeckId = null;
    if (parentLessonId) {
      // Get parent lesson's deck
      const parentLesson = await CourseLessonModel.findById(parentLessonId);
      if (parentLesson && parentLesson.flashcardDeckIds?.length) {
        parentLessonDeckId = String(parentLesson.flashcardDeckIds[0]);
      }
    }

    // 4. Get or create lesson/sub-lesson deck
    const lessonDeck = await getOrCreateLessonDeck(
      lessonId,
      lesson.title,
      courseId,
      moduleId,
      String(moduleDeck._id),
      parentLessonId,
      parentLessonDeckId,
      String(user._id)
    );

    // 5. Link deck to lesson if not already linked
    if (!lesson.flashcardDeckIds?.some(id => String(id) === String(lessonDeck._id))) {
      lesson.flashcardDeckIds = lesson.flashcardDeckIds || [];
      lesson.flashcardDeckIds.push(lessonDeck._id);
      await lesson.save();
    }

    return NextResponse.json({
      success: true,
      deck: lessonDeck,
      hierarchy: {
        course: courseDeck,
        module: moduleDeck,
        lesson: lessonDeck,
      },
    });
  } catch (error: any) {
    console.error('Error creating lesson deck hierarchy:', error);
    return NextResponse.json(
      { error: 'Failed to create deck hierarchy', details: error.message },
      { status: 500 }
    );
  }
}
```

---

### Step 3: Create Study Session API

Create `/src/app/api/flashcards/study/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import { getAllCardsInHierarchy } from '@/lib/flashcards/hierarchy';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope'); // 'course' | 'module' | 'lesson'
    const courseId = searchParams.get('courseId');
    const moduleId = searchParams.get('moduleId');
    const lessonId = searchParams.get('lessonId');

    await connectToDatabase();

    let deck;

    // Find the appropriate deck based on scope
    if (scope === 'lesson' && lessonId) {
      deck = await FlashcardDeckModel.findOne({
        'linkTargets.scope': 'lesson',
        'linkTargets.lessonId': lessonId,
      });
    } else if (scope === 'module' && moduleId) {
      deck = await FlashcardDeckModel.findOne({
        'linkTargets.scope': 'module',
        'linkTargets.moduleId': moduleId,
      });
    } else if (scope === 'course' && courseId) {
      deck = await FlashcardDeckModel.findOne({
        'linkTargets.scope': 'course',
        'linkTargets.courseId': courseId,
        parentDeckId: null, // Root deck
      });
    }

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    // Get all cards in hierarchy
    const cards = await getAllCardsInHierarchy(String(deck._id));

    return NextResponse.json({
      deck,
      cardCount: cards.length,
      cards: cards.map(card => ({
        id: card._id,
        deckId: card.deckId,
        type: card.type,
        prompt: card.prompt,
        response: card.response,
        hint: card.hint,
        explanation: card.explanation,
        tags: card.tags,
        order: card.order,
      })),
    });
  } catch (error: any) {
    console.error('Error fetching flashcards for study:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flashcards', details: error.message },
      { status: 500 }
    );
  }
}
```

---

### Step 4: Update Types

Update `/src/types/courses.ts`:

```typescript
export interface FlashcardDeck {
  _id?: string;
  slug: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  coverImage?: string | null;
  parentDeckId?: string | null;      // ✅ Add this
  path: string;                       // ✅ Add this
  level: number;                      // ✅ Add this
  tags: string[];
  categories: string[];
  status: FlashcardDeckStatus;
  visibility: FlashcardDeckVisibility;
  isFeatured: boolean;
  estimatedReviewMinutes?: number | null;
  cardCount: number;
  dueCount?: number;                  // ✅ Add this
  linkTargets: FlashcardDeckLinkTarget[];
  cards?: FlashcardCard[];
  analytics?: FlashcardDeckAnalytics;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date | null;
}
```

---

### Step 5: Create UI Components

Create `/src/components/flashcards/DeckHierarchySelector.tsx`:

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, FolderOpen, FileText } from 'lucide-react';

interface DeckHierarchySelectorProps {
  courseId: string;
  courseTitle: string;
  modules: Array<{
    id: string;
    title: string;
    deckId?: string;
    cardCount?: number;
    lessons: Array<{
      id: string;
      title: string;
      deckId?: string;
      cardCount?: number;
      subLessons?: Array<{
        id: string;
        title: string;
        deckId?: string;
        cardCount?: number;
      }>;
    }>;
  }>;
  courseDeckId?: string;
  totalCards?: number;
}

export function DeckHierarchySelector({
  courseId,
  courseTitle,
  modules,
  courseDeckId,
  totalCards = 0,
}: DeckHierarchySelectorProps) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set()
  );
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(
    new Set()
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const toggleLesson = (lessonId: string) => {
    setExpandedLessons(prev => {
      const next = new Set(prev);
      if (next.has(lessonId)) {
        next.delete(lessonId);
      } else {
        next.add(lessonId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Course Level */}
      {courseDeckId && (
        <Link
          href={`/flashcards/study?scope=course&courseId=${courseId}`}
          className="flex items-center justify-between p-4 bg-card border rounded-xl hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">{courseTitle}</h3>
              <p className="text-sm text-muted-foreground">Study entire course</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-semibold">{totalCards} cards</div>
          </div>
        </Link>
      )}

      {/* Module Level */}
      <div className="space-y-2">
        {modules.map(module => (
          <div key={module.id} className="border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between p-4 bg-card hover:bg-accent transition-colors">
              <button
                onClick={() => toggleModule(module.id)}
                className="flex items-center gap-2 flex-1"
              >
                <ChevronRight
                  className={`h-4 w-4 transition-transform ${
                    expandedModules.has(module.id) ? 'rotate-90' : ''
                  }`}
                />
                <FolderOpen className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{module.title}</span>
              </button>
              {module.deckId && (
                <Link
                  href={`/flashcards/study?scope=module&moduleId=${module.id}`}
                  className="px-3 py-1 text-sm border rounded-lg hover:bg-background"
                  onClick={e => e.stopPropagation()}
                >
                  Study ({module.cardCount || 0})
                </Link>
              )}
            </div>

            {/* Lessons under module */}
            {expandedModules.has(module.id) && (
              <div className="bg-muted/30 p-2 space-y-1">
                {module.lessons.map(lesson => (
                  <div key={lesson.id}>
                    <div className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        {lesson.subLessons && lesson.subLessons.length > 0 ? (
                          <button
                            onClick={() => toggleLesson(lesson.id)}
                            className="flex items-center gap-2 flex-1"
                          >
                            <ChevronRight
                              className={`h-3 w-3 transition-transform ${
                                expandedLessons.has(lesson.id) ? 'rotate-90' : ''
                              }`}
                            />
                            <FileText className="h-3.5 w-3.5 text-blue-500" />
                            <span className="text-sm">{lesson.title}</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="h-3.5 w-3.5 text-blue-500 ml-5" />
                            <span className="text-sm">{lesson.title}</span>
                          </div>
                        )}
                      </div>
                      {lesson.deckId && (
                        <Link
                          href={`/flashcards/study?scope=lesson&lessonId=${lesson.id}`}
                          className="px-2 py-0.5 text-xs border rounded hover:bg-background"
                          onClick={e => e.stopPropagation()}
                        >
                          Study ({lesson.cardCount || 0})
                        </Link>
                      )}
                    </div>

                    {/* Sub-lessons */}
                    {expandedLessons.has(lesson.id) &&
                      lesson.subLessons &&
                      lesson.subLessons.length > 0 && (
                        <div className="ml-8 mt-1 space-y-1">
                          {lesson.subLessons.map(subLesson => (
                            <div
                              key={subLesson.id}
                              className="flex items-center justify-between p-2 bg-card rounded"
                            >
                              <div className="flex items-center gap-2">
                                <FileText className="h-3 w-3 text-green-500" />
                                <span className="text-xs">{subLesson.title}</span>
                              </div>
                              {subLesson.deckId && (
                                <Link
                                  href={`/flashcards/study?scope=lesson&lessonId=${subLesson.id}`}
                                  className="px-2 py-0.5 text-xs border rounded hover:bg-background"
                                >
                                  Study ({subLesson.cardCount || 0})
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 📋 Migration Strategy

### For Existing Courses

1. **Run Migration Script** - Create parent decks for existing decks
2. **Update Paths** - Recalculate paths based on new hierarchy
3. **Link Existing Decks** - Associate existing decks with course/module/lesson structure

Create `/scripts/migrate-flashcard-hierarchy.ts`:

```typescript
import connectToDatabase from '@/lib/mongodb';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import CourseModel from '@/models/Course';
import CourseModuleModel from '@/models/CourseModule';
import CourseLessonModel from '@/models/CourseLesson';
import {
  getOrCreateCourseDeck,
  getOrCreateModuleDeck,
  getOrCreateLessonDeck,
  updateDeckCardCounts,
} from '@/lib/flashcards/hierarchy';

async function migrateFlashcardHierarchy() {
  await connectToDatabase();

  const courses = await CourseModel.find({ status: 'published' });

  for (const course of courses) {
    console.log(`Processing course: ${course.title}`);

    // 1. Create course root deck
    const courseDeck = await getOrCreateCourseDeck(
      String(course._id),
      course.slug,
      course.title,
      String(course.createdBy)
    );

    // 2. Process modules
    const modules = await CourseModuleModel.find({
      courseId: course._id,
    }).sort({ order: 1 });

    for (const module of modules) {
      console.log(`  Processing module: ${module.title}`);

      const moduleDeck = await getOrCreateModuleDeck(
        String(module._id),
        module.title,
        String(course._id),
        String(courseDeck._id),
        String(course.createdBy)
      );

      // 3. Process lessons
      const lessons = await CourseLessonModel.find({
        moduleId: module._id,
        parentLessonId: null, // Top-level only
      });

      for (const lesson of lessons) {
        console.log(`    Processing lesson: ${lesson.title}`);

        const lessonDeck = await getOrCreateLessonDeck(
          String(lesson._id),
          lesson.title,
          String(course._id),
          String(module._id),
          String(moduleDeck._id),
          null,
          null,
          String(course.createdBy)
        );

        // 4. Process sub-lessons
        const subLessons = await CourseLessonModel.find({
          parentLessonId: lesson._id,
        });

        for (const subLesson of subLessons) {
          console.log(`      Processing sub-lesson: ${subLesson.title}`);

          await getOrCreateLessonDeck(
            String(subLesson._id),
            subLesson.title,
            String(course._id),
            String(module._id),
            String(moduleDeck._id),
            String(lesson._id),
            String(lessonDeck._id),
            String(course.createdBy)
          );
        }
      }
    }

    // 5. Update all card counts
    console.log(`Updating card counts for course: ${course.title}`);
    await updateDeckCardCounts(String(courseDeck._id));
  }

  console.log('Migration complete!');
}

// Run migration
migrateFlashcardHierarchy()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
```

---

## ✅ Summary

### What Already Exists ✅
- `parentDeckId` field in FlashcardDeck
- `path` and `level` auto-computation
- `linkTargets` for content association
- `flashcardDeckIds` arrays on Course, Module, Lesson
- Card-to-deck relationship

### What Needs to Be Built 🔨
1. **Utility Functions** - Create/get decks, query hierarchy, update counts
2. **API Endpoints** - Create deck hierarchies, fetch cards for study
3. **UI Components** - Deck selector, study interface
4. **Migration Script** - Convert existing decks to hierarchical structure

### Benefits 🎯
- **User Flexibility** - Study at any level (course/module/lesson/sub-lesson)
- **Automatic Aggregation** - Parent decks include all child cards
- **Efficient Queries** - Path-based regex queries
- **Scalable** - Works for unlimited nesting (max level: 6)
- **Maintains Independence** - Each deck is still independently editable

### Next Steps 📝
1. Create `/src/lib/flashcards/hierarchy.ts` with utility functions
2. Create API endpoint for creating deck hierarchies
3. Create study session API
4. Build UI components for deck selection
5. Run migration for existing courses
6. Update admin UI to show hierarchy

---

## 🎯 Final Architecture

```
Course: "Probability Fundamentals" (Root Deck)
  slug: probability-fundamentals-deck
  path: probability-fundamentals-deck
  level: 0
  parentDeckId: null
  cardCount: 150 (aggregate from all children)
  
  ├── Module: "Module 1" (Child Deck)
  │     slug: module-motivation-probability
  │     path: probability-fundamentals-deck/module-motivation-probability
  │     level: 1
  │     parentDeckId: [course deck ID]
  │     cardCount: 50 (aggregate from lessons)
  │     
  │     ├── Lesson: "Randomness" (Child Deck)
  │     │     slug: lesson-randomness
  │     │     path: probability-fundamentals-deck/module-motivation-probability/lesson-randomness
  │     │     level: 2
  │     │     parentDeckId: [module deck ID]
  │     │     cardCount: 15 (direct cards)
  │     │     cards: [Card 1, Card 2, ...]
  │     │
  │     └── Lesson: "Uncertainty" (Child Deck)
  │           cardCount: 20
  │           
  │           ├── Sub-lesson: "Types" (Child Deck)
  │           │     path: .../lesson-uncertainty/sub-lesson-types
  │           │     level: 3
  │           │     cardCount: 10 (direct cards)
  │           │     cards: [Card A, Card B, ...]
  │           │
  │           └── Sub-lesson: "Examples" (Child Deck)
  │                 cardCount: 10
  │                 cards: [...]
```

**This architecture leverages the EXISTING database schema and adds minimal new code to enable the requested hierarchy!** 🚀
