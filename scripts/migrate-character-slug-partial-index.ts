/*
  Migration: Make Character.slug unique only for non-deleted documents

  - Drops any existing unique index on { slug: 1 }
  - Creates a partial unique index { slug: 1 } with partialFilterExpression deletedAt: { $exists: false }

  Usage:
    pnpm tsx scripts/migrate-character-slug-partial-index.ts
*/

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function run() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  if (!uri) throw new Error('MONGODB_URI missing');
  if (!dbName) throw new Error('MONGODB_DB_NAME missing');

  const conn = await mongoose.createConnection(uri, { dbName }).asPromise();
  const collection = (conn.db as any).collection('characters');

  const indexes: Array<{ key: Record<string, number>; name?: string }> =
    await collection.indexes();
  const slugIdx = indexes.find(
    i => JSON.stringify(i.key) === JSON.stringify({ slug: 1 })
  );

  if (slugIdx && slugIdx.name) {
    console.log(`Dropping existing slug index: ${slugIdx.name}`);
    await collection.dropIndex(slugIdx.name).catch((e: any) => {
      console.warn('Drop index warning:', e?.message || String(e));
    });
  } else {
    console.log('No existing slug index found on characters');
  }

  console.log('Creating partial unique index on slug where not deleted...');
  await collection.createIndex(
    { slug: 1 },
    {
      unique: true,
      name: 'slug_unique_active',
      partialFilterExpression: { deletedAt: null },
    }
  );

  console.log('Done.');
  await conn.close();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
