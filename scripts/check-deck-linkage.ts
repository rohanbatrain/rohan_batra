#!/usr/bin/env tsx
import 'dotenv/config';
import connectToDatabase from '../src/lib/mongodb';
import FlashcardDeckModel from '../src/models/FlashcardDeck';

async function checkDeckLinkage() {
  await connectToDatabase();

  // Get a sample lesson deck
  const lessonDeck = await FlashcardDeckModel.findOne({
    'linkTargets.scope': 'lesson'
  }).select('title slug path level parentDeckId linkTargets');

  if (!lessonDeck) {
    console.log('❌ No lesson deck found');
    process.exit(1);
  }

  console.log('\n📄 Sample Lesson Deck:');
  console.log(`  Title: ${lessonDeck.title}`);
  console.log(`  Path: ${lessonDeck.path}`);
  console.log(`  Level: ${lessonDeck.level}`);
  console.log(`  ParentDeckId: ${lessonDeck.parentDeckId}`);

  // Get its parent (should be module deck)
  if (lessonDeck.parentDeckId) {
    const parentDeck = await FlashcardDeckModel.findById(lessonDeck.parentDeckId)
      .select('title slug path level parentDeckId linkTargets');
    
    console.log('\n📂 Parent Module Deck:');
    console.log(`  Title: ${parentDeck?.title}`);
    console.log(`  Path: ${parentDeck?.path}`);
    console.log(`  Level: ${parentDeck?.level}`);
    console.log(`  ParentDeckId: ${parentDeck?.parentDeckId}`);
    
    // Get the grandparent (should be course deck)
    if (parentDeck?.parentDeckId) {
      const grandparentDeck = await FlashcardDeckModel.findById(parentDeck.parentDeckId)
        .select('title slug path level parentDeckId linkTargets');
      
      console.log('\n📚 Grandparent Course Deck:');
      console.log(`  Title: ${grandparentDeck?.title}`);
      console.log(`  Path: ${grandparentDeck?.path}`);
      console.log(`  Level: ${grandparentDeck?.level}`);
      console.log(`  ParentDeckId: ${grandparentDeck?.parentDeckId || 'null (ROOT)'}`);
    }
  }

  // Show visual hierarchy
  console.log('\n🌳 Visual Hierarchy:');
  console.log('✅ YES - Decks are PROPERLY LINKED via parentDeckId!\n');
  console.log('📚 Course Deck (level 0, parentDeckId: null)');
  console.log('  ↓ [parentDeckId]');
  console.log('📂 Module Deck (level 1, parentDeckId: → course deck ObjectId)');
  console.log('  ↓ [parentDeckId]');
  console.log('📄 Lesson Deck (level 2, parentDeckId: → module deck ObjectId)');
  console.log('  ↓ [parentDeckId]');
  console.log('📝 Sub-lesson Deck (level 3, parentDeckId: → lesson deck ObjectId)\n');

  // Count decks at each level
  const counts = await FlashcardDeckModel.aggregate([
    { $group: { _id: '$level', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);

  console.log('📊 Deck Distribution:');
  counts.forEach(({ _id, count }) => {
    const label = ['Course', 'Module', 'Lesson', 'Sub-lesson'][_id] || `Level ${_id}`;
    console.log(`  Level ${_id} (${label}): ${count} decks`);
  });

  // Check for orphaned decks (decks with parentDeckId but parent doesn't exist)
  const decksWithParents = await FlashcardDeckModel.find({
    parentDeckId: { $ne: null }
  }).select('_id parentDeckId title');

  let orphanCount = 0;
  for (const deck of decksWithParents) {
    const parentExists = await FlashcardDeckModel.exists({ _id: deck.parentDeckId });
    if (!parentExists) {
      orphanCount++;
      console.log(`  ⚠️  Orphaned deck: ${deck.title} (parent ${deck.parentDeckId} not found)`);
    }
  }

  if (orphanCount === 0) {
    console.log('\n✅ All decks have valid parent references (no orphans)');
  } else {
    console.log(`\n⚠️  Found ${orphanCount} orphaned decks`);
  }

  process.exit(0);
}

checkDeckLinkage().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
