#!/usr/bin/env tsx
/**
 * Test the API fix for parent deck display
 * This simulates what the UI does when fetching deck data
 */
import 'dotenv/config';
import connectToDatabase from '../src/lib/mongodb';
import { sanitizeDeck } from '../src/app/api/admin/flashcards/schemas';
import FlashcardDeckModel from '../src/models/FlashcardDeck';

async function testAPIResponse() {
  await connectToDatabase();

  console.log('🧪 Testing API Response for Parent Deck Display\n');

  // Get the deck from the screenshot
  const deck = await FlashcardDeckModel.findOne({
    slug: 'lesson-limiting-distributions-and-stirling-s-approximation'
  }).lean();

  if (!deck) {
    console.log('❌ Deck not found');
    process.exit(1);
  }

  console.log('📦 Raw Database Document:');
  console.log(`  Title: ${deck.title}`);
  console.log(`  ParentDeckId: ${deck.parentDeckId}`);
  console.log(`  Path: ${deck.path}`);
  console.log(`  Level: ${deck.level}`);

  // Simulate API sanitization
  const sanitized = sanitizeDeck(deck);

  console.log('\n📡 API Response (sanitized):');
  console.log(`  id: ${sanitized.id}`);
  console.log(`  title: ${sanitized.title}`);
  console.log(`  parentDeckId: ${sanitized.parentDeckId || 'NULL (BUG!)'}`);
  console.log(`  path: ${sanitized.path || 'NULL (BUG!)'}`);
  console.log(`  level: ${sanitized.level}`);

  // Check if fields are present
  console.log('\n✅ Verification:');
  
  if (sanitized.parentDeckId) {
    console.log('  ✓ parentDeckId field is present in API response');
  } else {
    console.log('  ✗ parentDeckId field is MISSING (UI will show "None")');
  }

  if (sanitized.path) {
    console.log('  ✓ path field is present in API response');
  } else {
    console.log('  ✗ path field is MISSING');
  }

  if (sanitized.level !== undefined && sanitized.level !== null) {
    console.log('  ✓ level field is present in API response');
  } else {
    console.log('  ✗ level field is MISSING');
  }

  // Simulate UI behavior
  console.log('\n🖥️  UI Behavior Simulation:');
  const formValue = sanitized.parentDeckId ?? '__none__';
  
  if (formValue === '__none__') {
    console.log('  UI will display: "None (top-level deck)" ❌');
  } else {
    console.log(`  UI will display: Parent deck with ID ${formValue} ✅`);
    console.log('  (Will look up parent deck title from availableDecks)');
  }

  // Summary
  console.log('\n📊 Test Result:');
  if (sanitized.parentDeckId && sanitized.path && sanitized.level !== undefined) {
    console.log('  ✅ FIX SUCCESSFUL! All hierarchy fields are present.');
    console.log('  The UI should now display the parent deck correctly.');
  } else {
    console.log('  ❌ FIX INCOMPLETE! Some fields are still missing.');
    console.log('  The UI will continue to show "None (top-level deck)".');
  }

  process.exit(0);
}

testAPIResponse().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
