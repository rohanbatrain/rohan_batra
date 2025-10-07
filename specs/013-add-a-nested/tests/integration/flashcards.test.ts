/**
 * Integration Tests for Nested Decks & Spaced Repetition
 * Tests end-to-end workflows
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose, { Types } from 'mongoose';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import FlashcardCardModel from '@/models/FlashcardCard';
import { buildDeckTree, validateDeckMove, getDeckBreadcrumbs } from '@/lib/decks/tree';
import { calculateNextReview, initializeScheduling, isCardDue } from '@/lib/scheduler/sm2';
import { parseBulkImportFile } from '@/lib/flashcards/bulk-import';
import { exportDecksV2, importDecksV2 } from '@/lib/flashcards/export-import-v2';

// Note: Requires actual MongoDB connection for integration tests
// Set MONGODB_URI environment variable

describe('Nested Decks Integration', () => {
  let ownerId: Types.ObjectId;

  beforeAll(async () => {
    if (!process.env.MONGODB_URI) {
      console.warn('Skipping integration tests: MONGODB_URI not set');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    ownerId = new Types.ObjectId();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 1) return;
    
    // Clean up test data
    await FlashcardDeckModel.deleteMany({ ownerId });
    await FlashcardCardModel.deleteMany({});
  });

  it('should create nested deck hierarchy', async () => {
    if (mongoose.connection.readyState !== 1) return;

    // Create root deck
    const rootDeck = new FlashcardDeckModel({
      title: 'Programming',
      slug: 'programming',
      ownerId,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });
    await rootDeck.save();

    // Create child deck
    const childDeck = new FlashcardDeckModel({
      title: 'TypeScript',
      slug: 'typescript',
      ownerId,
      parentDeckId: rootDeck._id,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });
    await childDeck.save();

    // Verify auto-computed fields
    expect(childDeck.path).toBe('programming/typescript');
    expect(childDeck.level).toBe(1);

    // Create grandchild deck
    const grandchildDeck = new FlashcardDeckModel({
      title: 'Advanced',
      slug: 'advanced',
      ownerId,
      parentDeckId: childDeck._id,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });
    await grandchildDeck.save();

    expect(grandchildDeck.path).toBe('programming/typescript/advanced');
    expect(grandchildDeck.level).toBe(2);
  });

  it('should build deck tree from flat list', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const root = await FlashcardDeckModel.create({
      title: 'Root',
      slug: 'root',
      ownerId,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    const child1 = await FlashcardDeckModel.create({
      title: 'Child 1',
      slug: 'child1',
      ownerId,
      parentDeckId: root._id,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    const child2 = await FlashcardDeckModel.create({
      title: 'Child 2',
      slug: 'child2',
      ownerId,
      parentDeckId: root._id,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    const decks = await FlashcardDeckModel.find({ ownerId }).lean();
    const tree = buildDeckTree(decks);

    expect(tree).toHaveLength(1);
    expect(tree[0].title).toBe('Root');
    expect(tree[0].children).toHaveLength(2);
  });

  it('should prevent creating cycles', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const deck1 = await FlashcardDeckModel.create({
      title: 'Deck 1',
      slug: 'deck1',
      ownerId,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    const deck2 = await FlashcardDeckModel.create({
      title: 'Deck 2',
      slug: 'deck2',
      ownerId,
      parentDeckId: deck1._id,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    // Try to make deck1 a child of deck2 (would create cycle)
    const validation = await validateDeckMove(
      deck1._id.toString(),
      deck2._id.toString()
    );

    expect(validation.valid).toBe(false);
    expect(validation.error).toContain('cycle');
  });

  it('should get deck breadcrumbs', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const root = await FlashcardDeckModel.create({
      title: 'Root',
      slug: 'root',
      ownerId,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    const child = await FlashcardDeckModel.create({
      title: 'Child',
      slug: 'child',
      ownerId,
      parentDeckId: root._id,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    const grandchild = await FlashcardDeckModel.create({
      title: 'Grandchild',
      slug: 'grandchild',
      ownerId,
      parentDeckId: child._id,
      status: 'draft',
      visibility: 'private',
      cardCount: 0,
    });

    const breadcrumbs = await getDeckBreadcrumbs(grandchild._id.toString());

    expect(breadcrumbs).toHaveLength(3);
    expect(breadcrumbs[0].title).toBe('Root');
    expect(breadcrumbs[1].title).toBe('Child');
    expect(breadcrumbs[2].title).toBe('Grandchild');
  });
});

describe('SM-2 Spaced Repetition', () => {
  it('should initialize scheduling for new card', () => {
    const scheduling = initializeScheduling();

    expect(scheduling.intervalDays).toBe(1);
    expect(scheduling.easeFactor).toBe(2.5);
    expect(scheduling.repetitions).toBe(0);
    expect(scheduling.nextReviewAt).toBeInstanceOf(Date);
  });

  it('should calculate next review for "good" response', () => {
    const current = initializeScheduling();
    const next = calculateNextReview(current, 'good');

    expect(next.intervalDays).toBe(3); // 1 * 2.5, min 3
    expect(next.easeFactor).toBe(2.5); // Unchanged
    expect(next.repetitions).toBe(1);
    expect(next.nextReviewAt).toBeDefined();
    if (next.nextReviewAt && current.nextReviewAt) {
      expect(next.nextReviewAt.getTime()).toBeGreaterThan(current.nextReviewAt.getTime());
    }
  });

  it('should reset on "again" response', () => {
    const current = {
      intervalDays: 7,
      easeFactor: 2.5,
      repetitions: 3,
      lastReviewedAt: new Date(),
      nextReviewAt: new Date(Date.now() + 7 * 86400000),
    };

    const next = calculateNextReview(current, 'again');

    expect(next.intervalDays).toBe(1); // Reset to 1
    expect(next.easeFactor).toBeLessThan(2.5); // Decreased
    expect(next.repetitions).toBe(0); // Reset
  });

  it('should detect due cards', () => {
    const dueCard = {
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: new Date(Date.now() - 86400000),
      nextReviewAt: new Date(Date.now() - 1000),
    };

    const notDueCard = {
      intervalDays: 1,
      easeFactor: 2.5,
      repetitions: 0,
      lastReviewedAt: new Date(),
      nextReviewAt: new Date(Date.now() + 86400000),
    };

    expect(isCardDue(dueCard)).toBe(true);
    expect(isCardDue(notDueCard)).toBe(false);
  });
});

describe('Bulk Import', () => {
  it('should parse Markdown format', async () => {
    const markdown = `---
title: Test Deck
---

## Card 1
Q: What is TypeScript?
A: A typed superset of JavaScript
Tags: typescript, programming

---

## Card 2
Q: What is Next.js?
A: A React framework`;

    const result = await parseBulkImportFile(markdown, 'md');

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(2);
    expect(result.cards![0].prompt.text).toContain('TypeScript');
    expect(result.cards![0].tags).toContain('typescript');
  });

  it('should parse JSON format', async () => {
    const json = JSON.stringify({
      cards: [
        {
          prompt: { text: 'Question 1' },
          response: { text: 'Answer 1' },
          tags: ['tag1'],
        },
        {
          prompt: { text: 'Question 2' },
          response: { text: 'Answer 2' },
        },
      ],
    });

    const result = await parseBulkImportFile(json, 'json');

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(2);
  });

  it('should parse CSV format', async () => {
    const csv = `question,answer,tags
What is X?,X is Y,tag1;tag2
What is Z?,Z is W,tag3`;

    const result = await parseBulkImportFile(csv, 'csv');

    expect(result.success).toBe(true);
    expect(result.cards).toHaveLength(2);
    expect(result.cards![0].tags).toContain('tag1');
  });
});

describe('Export/Import V2', () => {
  let ownerId: Types.ObjectId;

  beforeAll(async () => {
    if (!process.env.MONGODB_URI) return;
    await mongoose.connect(process.env.MONGODB_URI);
    ownerId = new Types.ObjectId();
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
    }
  });

  beforeEach(async () => {
    if (mongoose.connection.readyState !== 1) return;
    await FlashcardDeckModel.deleteMany({ ownerId });
    await FlashcardCardModel.deleteMany({});
  });

  it('should export deck with children', async () => {
    if (mongoose.connection.readyState !== 1) return;

    // Create hierarchy
    const root = await FlashcardDeckModel.create({
      title: 'Root',
      slug: 'root',
      ownerId,
      status: 'published',
      visibility: 'public',
      cardCount: 0,
    });

    const child = await FlashcardDeckModel.create({
      title: 'Child',
      slug: 'child',
      ownerId,
      parentDeckId: root._id,
      status: 'published',
      visibility: 'public',
      cardCount: 0,
    });

    // Add cards
    await FlashcardCardModel.create({
      deckId: root._id,
      type: 'basic',
      prompt: { text: 'Q1' },
      response: { text: 'A1' },
      order: 1,
    });

    // Export
    const exported = await exportDecksV2(ownerId);

    expect(exported.version).toBe('2.0');
    expect(exported.decks).toHaveLength(1);
    expect(exported.decks[0].title).toBe('Root');
    expect(exported.decks[0].children).toHaveLength(1);
    expect(exported.decks[0].children[0].title).toBe('Child');
    expect(exported.decks[0].cards).toHaveLength(1);
  });

  it('should import deck hierarchy', async () => {
    if (mongoose.connection.readyState !== 1) return;

    const exportData = {
      version: '2.0' as const,
      exportedAt: new Date().toISOString(),
      ownerId: ownerId.toString(),
      decks: [
        {
          title: 'Imported Root',
          slug: 'imported-root',
          path: 'imported-root',
          level: 0,
          cardCount: 1,
          dueCount: 0,
          status: 'published',
          visibility: 'public',
          cards: [
            {
              prompt: { text: 'Import Q' },
              response: { text: 'Import A' },
              order: 1,
            },
          ],
          children: [
            {
              title: 'Imported Child',
              slug: 'imported-child',
              path: 'imported-root/imported-child',
              level: 1,
              cardCount: 0,
              dueCount: 0,
              status: 'published',
              visibility: 'public',
              cards: [],
              children: [],
              metadata: {
                exportedAt: new Date().toISOString(),
                version: '2.0',
              },
            },
          ],
          metadata: {
            exportedAt: new Date().toISOString(),
            version: '2.0',
          },
        },
      ],
    };

    const result = await importDecksV2(ownerId, exportData);

    expect(result.decksImported).toBe(2);
    expect(result.cardsImported).toBe(1);

    const decks = await FlashcardDeckModel.find({ ownerId });
    expect(decks).toHaveLength(2);

    const rootDeck = decks.find((d) => d.slug === 'imported-root');
    const childDeck = decks.find((d) => d.slug === 'imported-child');

    expect(rootDeck).toBeDefined();
    expect(childDeck).toBeDefined();
    expect(childDeck!.parentDeckId?.toString()).toBe(rootDeck!._id.toString());
  });
});
