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
      slug: `${courseSlug}-complete-deck`,
      title: `${courseTitle} - Complete Deck`,
      subtitle: 'All cards from all modules and lessons',
      parentDeckId: null, // Root
      status: 'published',
      visibility: 'public',
      cardCount: 0, // Aggregate from children
      linkTargets: [
        {
          scope: 'course',
          courseId: new mongoose.Types.ObjectId(courseId),
        },
      ],
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
      linkTargets: [
        {
          scope: 'module',
          courseId: new mongoose.Types.ObjectId(courseId),
          moduleId: new mongoose.Types.ObjectId(moduleId),
        },
      ],
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
      slug: parentLessonId
        ? `sub-lesson-${lessonSlug}`
        : `lesson-${lessonSlug}`,
      title: `${lessonTitle} - ${parentLessonId ? 'Sub-lesson' : 'Lesson'} Deck`,
      parentDeckId,
      status: 'published',
      visibility: 'public',
      cardCount: 0,
      linkTargets: [
        {
          scope: 'lesson',
          courseId: new mongoose.Types.ObjectId(courseId),
          moduleId: new mongoose.Types.ObjectId(moduleId),
          lessonId: new mongoose.Types.ObjectId(lessonId),
        },
      ],
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
    path: { $regex: `^${deck.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/` },
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
      path: {
        $regex: `^${currentDeck.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`,
      },
    });

    const descendantCardCount = await FlashcardCardModel.countDocuments({
      deckId: { $in: descendantDecks.map(d => d._id) },
    });

    // Update total card count
    currentDeck.cardCount = directCardCount + descendantCardCount;
    await currentDeck.save();

    // Move to parent
    if (currentDeck.parentDeckId) {
      currentDeck = await FlashcardDeckModel.findById(
        currentDeck.parentDeckId
      );
    } else {
      currentDeck = null;
    }
  }
}

/**
 * Get deck by scope (course, module, or lesson)
 */
export async function getDeckByScope(
  scope: 'course' | 'module' | 'lesson',
  courseId?: string,
  moduleId?: string,
  lessonId?: string
) {
  let query: any = {
    'linkTargets.scope': scope,
  };

  if (scope === 'course' && courseId) {
    query['linkTargets.courseId'] = new mongoose.Types.ObjectId(courseId);
    query['parentDeckId'] = null; // Root deck
  } else if (scope === 'module' && moduleId) {
    query['linkTargets.moduleId'] = new mongoose.Types.ObjectId(moduleId);
  } else if (scope === 'lesson' && lessonId) {
    query['linkTargets.lessonId'] = new mongoose.Types.ObjectId(lessonId);
  }

  return await FlashcardDeckModel.findOne(query);
}

/**
 * Get all decks in hierarchy with card counts
 */
export async function getCourseDeckHierarchy(courseId: string) {
  const courseDeck = await FlashcardDeckModel.findOne({
    'linkTargets.scope': 'course',
    'linkTargets.courseId': new mongoose.Types.ObjectId(courseId),
    parentDeckId: null,
  });

  if (!courseDeck) return null;

  // Get all decks under this course
  const allDecks = await FlashcardDeckModel.find({
    path: {
      $regex: `^${courseDeck.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`,
    },
  }).sort({ level: 1, path: 1 });

  return {
    courseDeck,
    allDecks,
  };
}
