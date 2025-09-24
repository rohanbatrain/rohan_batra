#!/usr/bin/env tsx
import 'dotenv/config';
import connectToDatabase from '../src/lib/mongodb';
import ProjectModel from '../src/models/Project';

async function run() {
  try {
    await connectToDatabase();
    const total = await ProjectModel.countDocuments({});
    const featured = await ProjectModel.countDocuments({ featured: true });
    console.log(`[portfolio:check] total=${total} featured=${featured}`);
    if (featured > 0) {
      const examples = await ProjectModel.find({ featured: true }).limit(5).select('title slug featured');
      console.log('[portfolio:check] sample featured:', examples.map(e => ({ title: e.title, slug: e.slug })));
    }
    process.exit(0);
  } catch (err) {
    console.error('[portfolio:check] failed:', err);
    process.exit(1);
  }
}

run();
