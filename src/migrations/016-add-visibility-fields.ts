/**
 * Migration: Add Visibility Fields to Braindump Model
 * Feature: 016-braindump-visibility-public
 * Date: October 9, 2025
 * 
 * This migration extends the existing Braindump schema with:
 * - visibility field (private/unlisted/public)
 * - slug field for SEO-friendly URLs
 * - publicMetadata for tracking views/shares
 * - editHistory for collaborative editing
 * - sharedWith for explicit access control
 * 
 * SAFETY: Zero downtime - all existing braindumps default to 'private'
 */

import mongoose from 'mongoose';
import Braindump from '../models/Braindump';

interface MigrationResult {
  success: boolean;
  updated: number;
  errors: string[];
  duration: number;
}

/**
 * Forward migration: Add new fields
 */
export async function up(): Promise<MigrationResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let updated = 0;

  try {
    console.log('🔄 Starting migration: 016-add-visibility-fields');

    // Step 1: Add new fields with default values to existing documents
    const result = await Braindump.updateMany(
      { visibility: { $exists: false } }, // Only documents without visibility field
      {
        $set: {
          visibility: 'private', // Safe default - preserves existing privacy
          publicMetadata: {
            viewCount: 0,
            shareCount: 0,
            sharesByPlatform: {
              twitter: 0,
              linkedin: 0,
              facebook: 0,
              email: 0,
              copy: 0,
            },
          },
          editHistory: [],
          sharedWith: [],
        },
      }
    );

    updated = result.modifiedCount;
    console.log(`✅ Updated ${updated} existing braindumps with visibility fields`);

    // Step 2: Create indexes for new fields
    console.log('🔄 Creating indexes...');
    
    await Braindump.collection.createIndex(
      { visibility: 1, createdAt: -1 },
      { name: 'visibility_createdAt_idx' }
    );
    console.log('✅ Created index: visibility + createdAt');

    await Braindump.collection.createIndex(
      { userId: 1, visibility: 1 },
      { name: 'userId_visibility_idx' }
    );
    console.log('✅ Created index: userId + visibility');

    await Braindump.collection.createIndex(
      { slug: 1 },
      { unique: true, sparse: true, name: 'slug_unique_idx' }
    );
    console.log('✅ Created index: slug (unique, sparse)');

    await Braindump.collection.createIndex(
      { visibility: 1, tags: 1 },
      { name: 'visibility_tags_idx' }
    );
    console.log('✅ Created index: visibility + tags');

    await Braindump.collection.createIndex(
      { visibility: 1, 'publicMetadata.viewCount': -1 },
      { name: 'visibility_viewCount_idx' }
    );
    console.log('✅ Created index: visibility + viewCount');

    // Step 3: Verify migration
    const privateCount = await Braindump.countDocuments({ visibility: 'private' });
    const totalCount = await Braindump.countDocuments();
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`   Total braindumps: ${totalCount}`);
    console.log(`   Set to private: ${privateCount}`);
    console.log(`   Duration: ${Date.now() - startTime}ms`);

    return {
      success: true,
      updated,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMsg);
    console.error('❌ Migration failed:', errorMsg);
    
    return {
      success: false,
      updated,
      errors,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Rollback migration: Remove new fields
 * WARNING: This will lose all visibility settings and public metadata
 */
export async function down(): Promise<MigrationResult> {
  const startTime = Date.now();
  const errors: string[] = [];
  let updated = 0;

  try {
    console.log('🔄 Rolling back migration: 016-add-visibility-fields');
    console.warn('⚠️  WARNING: This will remove all visibility settings and public metadata!');

    // Step 1: Remove new fields
    const result = await Braindump.updateMany(
      {},
      {
        $unset: {
          visibility: '',
          slug: '',
          publicMetadata: '',
          editHistory: '',
          sharedWith: '',
        },
      }
    );

    updated = result.modifiedCount;
    console.log(`✅ Removed visibility fields from ${updated} braindumps`);

    // Step 2: Drop indexes
    console.log('🔄 Dropping indexes...');
    
    try {
      await Braindump.collection.dropIndex('visibility_createdAt_idx');
      await Braindump.collection.dropIndex('userId_visibility_idx');
      await Braindump.collection.dropIndex('slug_unique_idx');
      await Braindump.collection.dropIndex('visibility_tags_idx');
      await Braindump.collection.dropIndex('visibility_viewCount_idx');
      console.log('✅ Dropped all visibility-related indexes');
    } catch (indexError) {
      // Indexes might not exist, continue anyway
      console.warn('⚠️  Some indexes could not be dropped (may not exist)');
    }

    console.log(`\n📊 Rollback Summary:`);
    console.log(`   Duration: ${Date.now() - startTime}ms`);

    return {
      success: true,
      updated,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    errors.push(errorMsg);
    console.error('❌ Rollback failed:', errorMsg);
    
    return {
      success: false,
      updated,
      errors,
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Verify migration was successful
 */
export async function verify(): Promise<boolean> {
  try {
    // Check that visibility field exists on at least one document
    const sample = await Braindump.findOne({ visibility: { $exists: true } });
    if (!sample) {
      console.error('❌ Verification failed: No documents have visibility field');
      return false;
    }

    // Check that indexes exist
    const indexes = await Braindump.collection.getIndexes();
    const requiredIndexes = [
      'visibility_createdAt_idx',
      'userId_visibility_idx',
      'slug_unique_idx',
      'visibility_tags_idx',
      'visibility_viewCount_idx',
    ];

    for (const indexName of requiredIndexes) {
      if (!indexes[indexName]) {
        console.error(`❌ Verification failed: Index ${indexName} not found`);
        return false;
      }
    }

    console.log('✅ Migration verification passed');
    return true;
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return false;
  }
}

// CLI execution
if (require.main === module) {
  const command = process.argv[2];

  mongoose
    .connect(process.env.MONGODB_URI!)
    .then(async () => {
      console.log('📦 Connected to MongoDB');

      switch (command) {
        case 'up':
          const upResult = await up();
          process.exit(upResult.success ? 0 : 1);
        case 'down':
          const downResult = await down();
          process.exit(downResult.success ? 0 : 1);
        case 'verify':
          const isValid = await verify();
          process.exit(isValid ? 0 : 1);
        default:
          console.error('Usage: tsx migrations/016-add-visibility-fields.ts [up|down|verify]');
          process.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ Failed to connect to MongoDB:', error);
      process.exit(1);
    });
}

export default { up, down, verify };
