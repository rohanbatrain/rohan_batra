/**
 * Export/Import V2 Format
 * Supports nested deck structure and scheduling data
 *
 * Format: JSON with hierarchy preservation
 */

import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import { Types } from 'mongoose';

export interface ExportV2Card {
  prompt: {
    text?: string;
    richText?: string;
    media?: {
      lottieIds?: string[];
      imageUrls?: string[];
      audioUrl?: string;
    };
  };
  response: {
    text?: string;
    richText?: string;
    media?: {
      lottieIds?: string[];
      imageUrls?: string[];
      audioUrl?: string;
    };
  };
  hint?: string;
  explanation?: string;
  tags?: string[];
  order: number;
  scheduling?: {
    intervalDays: number;
    easeFactor: number;
    repetitions: number;
    lastReviewedAt?: string | null;
    nextReviewAt?: string;
  };
}

export interface ExportV2Deck {
  title: string;
  slug: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  status: string;
  visibility: string;
  path: string;
  level: number;
  cardCount: number;
  dueCount: number;
  cards: ExportV2Card[];
  children: ExportV2Deck[]; // Nested children
  metadata: {
    exportedAt: string;
    version: string;
  };
}

export interface ExportV2Format {
  version: '2.0';
  exportedAt: string;
  ownerId: string;
  decks: ExportV2Deck[];
}

/**
 * Export decks to V2 format (with nested structure)
 */
export async function exportDecksV2(
  ownerId: Types.ObjectId,
  deckIds?: string[]
): Promise<ExportV2Format> {
  // Get decks
  const query: any = { createdBy: ownerId };
  if (deckIds && deckIds.length > 0) {
    query._id = { $in: deckIds.map(id => new Types.ObjectId(id)) };
  }

  const decks = await FlashcardDeckModel.find(query).lean();

  // Build hierarchy
  const deckMap = new Map<string, any>();
  const rootDecks: any[] = [];

  // First pass: create map
  for (const deck of decks) {
    deckMap.set(deck._id.toString(), {
      ...deck,
      children: [],
      cards: [],
    });
  }

  // Second pass: build tree
  for (const deck of decks) {
    const deckId = deck._id.toString();
    const deckNode = deckMap.get(deckId)!;

    if (deck.parentDeckId) {
      const parentId = deck.parentDeckId.toString();
      const parent = deckMap.get(parentId);
      if (parent) {
        parent.children.push(deckNode);
      } else {
        // Parent not in export, treat as root
        rootDecks.push(deckNode);
      }
    } else {
      rootDecks.push(deckNode);
    }
  }

  // Fetch cards for all decks
  for (const deck of decks) {
    const cards = await FlashcardCardModel.find({ deckId: deck._id })
      .sort({ order: 1 })
      .lean();

    const deckNode = deckMap.get(deck._id.toString())!;
    deckNode.cards = cards.map(card => ({
      prompt: card.prompt,
      response: card.response,
      hint: card.hint,
      explanation: card.explanation,
      tags: card.tags,
      order: card.order,
      scheduling: card.scheduling
        ? {
            intervalDays: card.scheduling.intervalDays,
            easeFactor: card.scheduling.easeFactor,
            repetitions: card.scheduling.repetitions,
            lastReviewedAt:
              card.scheduling.lastReviewedAt?.toISOString() || null,
            nextReviewAt: card.scheduling.nextReviewAt?.toISOString(),
          }
        : undefined,
    }));
  }

  // Format output
  const formatDeck = (deck: any): ExportV2Deck => ({
    title: deck.title,
    slug: deck.slug,
    description: deck.description,
    tags: deck.tags || [],
    categories: deck.categories || [],
    status: deck.status,
    visibility: deck.visibility,
    path: deck.path,
    level: deck.level,
    cardCount: deck.cardCount,
    dueCount: deck.dueCount,
    cards: deck.cards,
    children: deck.children.map(formatDeck),
    metadata: {
      exportedAt: new Date().toISOString(),
      version: '2.0',
    },
  });

  return {
    version: '2.0',
    exportedAt: new Date().toISOString(),
    ownerId: ownerId.toString(),
    decks: rootDecks.map(formatDeck),
  };
}

/**
 * Import decks from V2 format
 */
export async function importDecksV2(
  ownerId: Types.ObjectId,
  data: ExportV2Format,
  options: {
    mergeStrategy?: 'skip' | 'overwrite' | 'duplicate';
    preserveScheduling?: boolean;
  } = {}
): Promise<{
  decksImported: number;
  cardsImported: number;
  errors: string[];
}> {
  const { mergeStrategy = 'skip', preserveScheduling = false } = options;

  const result = {
    decksImported: 0,
    cardsImported: 0,
    errors: [] as string[],
  };

  // Validate version
  if (data.version !== '2.0') {
    result.errors.push(`Unsupported export version: ${data.version}`);
    return result;
  }

  // Import decks recursively
  const importDeck = async (
    deckData: ExportV2Deck,
    parentDeckId: Types.ObjectId | null = null
  ): Promise<void> => {
    try {
      // Check if deck exists
      let deck = await FlashcardDeckModel.findOne({
        createdBy: ownerId,
        slug: deckData.slug,
      });

      if (deck && mergeStrategy === 'skip') {
        // Skip existing deck
        return;
      }

      if (deck && mergeStrategy === 'overwrite') {
        // Update existing deck
        deck.title = deckData.title;
        deck.description = deckData.description;
        deck.tags = deckData.tags || [];
        deck.categories = deckData.categories || [];
        deck.parentDeckId = parentDeckId;
      } else {
        // Create new deck (duplicate or new)
        const slug = deck ? `${deckData.slug}-${Date.now()}` : deckData.slug;

        deck = new FlashcardDeckModel({
          slug,
          title: deckData.title,
          description: deckData.description,
          tags: deckData.tags || [],
          categories: deckData.categories || [],
          status: deckData.status,
          visibility: deckData.visibility,
          createdBy: ownerId,
          parentDeckId,
          cardCount: 0,
        });
      }

      await deck.save();
      result.decksImported++;

      // Import cards
      if (mergeStrategy === 'overwrite') {
        // Delete existing cards
        await FlashcardCardModel.deleteMany({ deckId: deck._id });
      }

      for (const cardData of deckData.cards) {
        try {
          const card = new FlashcardCardModel({
            deckId: deck._id,
            type: 'basic',
            prompt: cardData.prompt,
            response: cardData.response,
            hint: cardData.hint,
            explanation: cardData.explanation,
            tags: cardData.tags || [],
            order: cardData.order,
            scheduling:
              preserveScheduling && cardData.scheduling
                ? {
                    intervalDays: cardData.scheduling.intervalDays,
                    easeFactor: cardData.scheduling.easeFactor,
                    repetitions: cardData.scheduling.repetitions,
                    lastReviewedAt: cardData.scheduling.lastReviewedAt
                      ? new Date(cardData.scheduling.lastReviewedAt)
                      : null,
                    nextReviewAt: cardData.scheduling.nextReviewAt
                      ? new Date(cardData.scheduling.nextReviewAt)
                      : new Date(),
                  }
                : undefined,
          });

          await card.save();
          result.cardsImported++;
        } catch (error) {
          result.errors.push(
            `Error importing card: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      // Update deck card count
      deck.cardCount = await FlashcardCardModel.countDocuments({
        deckId: deck._id,
      });
      await deck.save();

      // Import children recursively
      for (const childData of deckData.children) {
        await importDeck(childData, deck._id);
      }
    } catch (error) {
      result.errors.push(
        `Error importing deck ${deckData.slug}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  // Import all root decks
  for (const deckData of data.decks) {
    await importDeck(deckData);
  }

  return result;
}

/**
 * Export single deck with descendants
 */
export async function exportDeckWithChildren(
  deckId: string,
  ownerId: Types.ObjectId
): Promise<ExportV2Format> {
  // Get deck and all descendants
  const deck = await FlashcardDeckModel.findOne({
    _id: new Types.ObjectId(deckId),
    ownerId,
  });

  if (!deck) {
    throw new Error('Deck not found');
  }

  // Get all descendant decks using path prefix
  const descendants = await FlashcardDeckModel.find({
    ownerId,
    path: new RegExp(`^${deck.path}/`),
  });

  const allDeckIds = [
    deck._id.toString(),
    ...descendants.map(d => d._id.toString()),
  ];

  return exportDecksV2(ownerId, allDeckIds);
}
