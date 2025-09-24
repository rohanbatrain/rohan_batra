#!/usr/bin/env tsx
import 'dotenv/config';
import connectToDatabase from '../src/lib/mongodb';
import ProjectModel from '../src/models/Project';

async function run() {
  try {
    await connectToDatabase();
    const res = await ProjectModel.updateMany({}, { $set: { featured: false } });
    console.log(`Unfeatured projects: matched=${res.matchedCount ?? 'n/a'}, modified=${res.modifiedCount ?? 'n/a'}`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to unfeature projects:', err);
    process.exit(1);
  }
}

run();
