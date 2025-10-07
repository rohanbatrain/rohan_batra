/**
 * Migration: Add nested deck support to existing flashcards
 * Date: 2025-10-07
 * 
 * This migration adds:
 * 1. parentDeckId, path, level, dueCount to FlashcardDeck
 * 2. scheduling fields to FlashcardCard
 * 
 * Usage:
 *   ts-node migrations/2025-10-07-add-nested-decks.ts [--dry-run]
 */

import mongoose from 'mongoose';
import FlashcardDeckModel from '../src/models/FlashcardDeck';
import FlashcardCardModel from '../src/models/FlashcardCard';
import { initializeScheduling } from '../src/lib/scheduler/sm2';

const BATCH_SIZE = 1000;

interface MigrationStats {
  decksProcessed: number;
  decksUpdated: number;
  cardsProcessed: number;
  cardsUpdated: number;
  errors: string[];
}

async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is required');
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB');
}

async function migrateDecks(dryRun: boolean): Promise<MigrationStats['decksProcessed']> {
  let processed = 0;
  let updated = 0;

  console.log('\n📦 Migrating FlashcardDecks...');

  // Process in batches
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const decks = await FlashcardDeckModel.find({})
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    if (decks.length === 0) {
      hasMore = false;
      break;
    }

    for (const deck of decks) {
      processed++;

      // Check if deck already has nested fields
      if (deck.parentDeckId !== undefined && deck.path !== undefined && deck.level !== undefined) {
        continue; // Already migrated
      }

      if (!dryRun) {
        try {
          await FlashcardDeckModel.updateOne(
            { _id: deck._id },
            {
              $set: {
                parentDeckId: null,
                path: deck.slug,
                level: 0,
                dueCount: 0,
              },
            }
          );
          updated++;
        } catch (error) {
          console.error(`Error updating deck ${deck._id}:`, error);
        }
      } else {
        updated++; // Count what would be updated
      }

      if (processed % 100 === 0) {
        console.log(`  Processed ${processed} decks...`);
      }
    }

    skip += BATCH_SIZE;
  }

  console.log(`✅ Decks: ${processed} processed, ${updated} ${dryRun ? 'would be' : ''} updated`);
  return processed;
}

async function migrateCards(dryRun: boolean): Promise<MigrationStats['cardsProcessed']> {
  let processed = 0;
  let updated = 0;

  console.log('\n🎴 Migrating FlashcardCards...');

  // Process in batches
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const cards = await FlashcardCardModel.find({})
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    if (cards.length === 0) {
      hasMore = false;
      break;
    }

    for (const card of cards) {
      processed++;

      // Check if card already has scheduling fields
      if (card.scheduling !== undefined) {
        continue; // Already migrated
      }

      if (!dryRun) {
        try {
          const defaultScheduling = initializeScheduling();
          await FlashcardCardModel.updateOne(
            { _id: card._id },
            {
              $set: {
                scheduling: defaultScheduling,
              },
            }
          );
          updated++;
        } catch (error) {
          console.error(`Error updating card ${card._id}:`, error);
        }
      } else {
        updated++; // Count what would be updated
      }

      if (processed % 500 === 0) {
        console.log(`  Processed ${processed} cards...`);
      }
    }

    skip += BATCH_SIZE;
  }

  console.log(`✅ Cards: ${processed} processed, ${updated} ${dryRun ? 'would be' : ''} updated`);
  return processed;
}

async function verifyMigration(): Promise<boolean> {
  console.log('\n🔍 Verifying migration...');

  // Check decks
  const decksWithoutNested = await FlashcardDeckModel.countDocuments({
    $or: [
      { parentDeckId: { $exists: false } },
      { path: { $exists: false } },
      { level: { $exists: false } },
    ],
  });

  if (decksWithoutNested > 0) {
    console.error(`❌ ${decksWithoutNested} decks still missing nested fields`);
    return false;
  }

  // Check cards
  const cardsWithoutScheduling = await FlashcardCardModel.countDocuments({
    scheduling: { $exists: false },
  });

  if (cardsWithoutScheduling > 0) {
    console.error(`❌ ${cardsWithoutScheduling} cards still missing scheduling fields`);
    return false;
  }

  console.log('✅ Migration verification passed');
  return true;
}

async function rollback(dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log('\n⏪ Rollback (dry run)...');
    return;
  }

  console.log('\n⏪ Rolling back migration...');
  console.warn('WARNING: This will remove nested deck and scheduling fields!');

  // Remove nested fields from decks
  await FlashcardDeckModel.updateMany(
    {},
    {
      $unset: {
        parentDeckId: '',
        path: '',
        level: '',
        dueCount: '',
      },
    }
  );

  // Remove scheduling fields from cards
  await FlashcardCardModel.updateMany(
    {},
    {
      $unset: {
        scheduling: '',
      },
    }
  );

  console.log('✅ Rollback complete');
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const shouldRollback = args.includes('--rollback');
  const skipVerification = args.includes('--skip-verification');

  console.log('🚀 Nested Decks Migration');
  console.log('='.repeat(50));

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made');
  }

  if (shouldRollback) {
    console.log('⚠️  ROLLBACK MODE - Will remove nested fields');
  }

  console.log('');

  const stats: MigrationStats = {
    decksProcessed: 0,
    decksUpdated: 0,
    cardsProcessed: 0,
    cardsUpdated: 0,
    errors: [],
  };

  try {
    await connectDatabase();

    const startTime = Date.now();

    if (shouldRollback) {
      await rollback(dryRun);
    } else {
      // Run migrations
      stats.decksProcessed = await migrateDecks(dryRun);
      stats.cardsProcessed = await migrateCards(dryRun);

      // Verify if not dry run and not skipped
      if (!dryRun && !skipVerification) {
        const verified = await verifyMigration();
        if (!verified) {
          throw new Error('Migration verification failed');
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`  Decks processed: ${stats.decksProcessed}`);
    console.log(`  Cards processed: ${stats.cardsProcessed}`);
    console.log(`  Duration: ${duration}s`);
    console.log(`  Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
    console.log('='.repeat(50));

    if (dryRun) {
      console.log('\n💡 Run without --dry-run to apply changes');
    } else {
      console.log('\n✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// Run migration
if (require.main === module) {
  main().catch(console.error);
}

export { main as runMigration };
