#!/usr/bin/env tsx
import 'dotenv/config';
import connectToDatabase from '../src/lib/mongodb';
import FlashcardDeckModel from '../src/models/FlashcardDeck';

async function checkSpecificDeck() {
  await connectToDatabase();

  // Find the deck from the screenshot
  const deck = await FlashcardDeckModel.findOne({
    slug: 'lesson-limiting-distributions-and-stirling-s-approximation'
  }).select('title slug path level parentDeckId linkTargets');

  if (!deck) {
    console.log('❌ Deck not found');
    process.exit(1);
  }

  console.log('\n🔍 Deck from Screenshot:');
  console.log(`  Title: ${deck.title}`);
  console.log(`  Slug: ${deck.slug}`);
  console.log(`  Level: ${deck.level}`);
  console.log(`  Path: ${deck.path}`);
  console.log(`  ParentDeckId: ${deck.parentDeckId || 'NULL (ERROR!)'}`);

  if (deck.parentDeckId) {
    const parent = await FlashcardDeckModel.findById(deck.parentDeckId)
      .select('title slug level');
    
    console.log('\n✅ Parent Deck (should exist):');
    console.log(`  Title: ${parent?.title}`);
    console.log(`  Slug: ${parent?.slug}`);
    console.log(`  Level: ${parent?.level}`);
  } else {
    console.log('\n❌ ERROR: Lesson deck has NO parent!');
    console.log('   This is the problem - lesson decks should have a module deck as parent.');
  }

  // Check linkTargets
  console.log('\n📎 Link Targets:');
  console.log(JSON.stringify(deck.linkTargets, null, 2));

  // Check if this is from migration or manual creation
  const allLessonDecks = await FlashcardDeckModel.find({
    'linkTargets.scope': 'lesson'
  }).select('title parentDeckId');

  const withoutParent = allLessonDecks.filter(d => !d.parentDeckId);
  const withParent = allLessonDecks.filter(d => d.parentDeckId);

  console.log(`\n📊 Lesson Deck Statistics:`);
  console.log(`  Total lesson decks: ${allLessonDecks.length}`);
  console.log(`  With parent (correct): ${withParent.length}`);
  console.log(`  Without parent (broken): ${withoutParent.length}`);

  if (withoutParent.length > 0) {
    console.log('\n⚠️  Broken decks (no parent):');
    withoutParent.forEach(d => {
      console.log(`    - ${d.title}`);
    });
  }

  process.exit(0);
}

checkSpecificDeck().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
