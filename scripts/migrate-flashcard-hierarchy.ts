#!/usr/bin/env tsx
/**
 * Migration script to create flashcard deck hierarchy for existing courses
 * 
 * Usage: DOTENV_CONFIG_PATH=.env.local node --import tsx -r dotenv/config scripts/migrate-flashcard-hierarchy.ts
 */

import connectToDatabase from '../src/lib/mongodb';
import CourseModel from '../src/models/Course';
import CourseModuleModel from '../src/models/CourseModule';
import CourseLessonModel from '../src/models/CourseLesson';
import FlashcardDeckModel from '../src/models/FlashcardDeck';
import FlashcardCardModel from '../src/models/FlashcardCard';
import {
  getOrCreateCourseDeck,
  getOrCreateModuleDeck,
  getOrCreateLessonDeck,
  updateDeckCardCounts,
} from '../src/lib/flashcards/hierarchy';

async function migrateFlashcardHierarchy() {
  console.log('🚀 Starting flashcard hierarchy migration...\n');

  await connectToDatabase();

  // Get all published courses
  const courses = await CourseModel.find({ status: 'published' });
  console.log(`Found ${courses.length} courses\n`);

  let totalCourseDeck = 0;
  let totalModuleDecks = 0;
  let totalLessonDecks = 0;

  for (const course of courses) {
    console.log(`\n📚 Processing course: ${course.title}`);
    console.log(`   Slug: ${course.slug}`);

    try {
      // Create/get course root deck
      const courseDeck = await getOrCreateCourseDeck(
        course._id.toString(),
        course.slug,
        course.title,
        course.createdBy.toString()
      );

      console.log(`   ✅ Course deck: ${courseDeck.title} (${courseDeck._id})`);
      totalCourseDeck++;

      // Add to course if not already there
      if (!course.flashcardDeckIds?.includes(courseDeck._id)) {
        course.flashcardDeckIds = course.flashcardDeckIds || [];
        course.flashcardDeckIds.push(courseDeck._id);
        await course.save();
        console.log(`   📌 Linked course deck to course`);
      }

      // Get all modules
      const modules = await CourseModuleModel.find({
        courseId: course._id,
      }).sort({ order: 1 });

      console.log(`   Found ${modules.length} modules`);

      for (const module of modules) {
        console.log(`\n   📂 Module: ${module.title}`);

        // Create/get module deck
        const moduleDeck = await getOrCreateModuleDeck(
          module._id.toString(),
          module.title,
          course._id.toString(),
          courseDeck._id.toString(),
          course.createdBy.toString()
        );

        console.log(`      ✅ Module deck: ${moduleDeck.title} (level ${moduleDeck.level})`);
        totalModuleDecks++;

        // Add to module if not already there
        if (!module.flashcardDeckIds?.includes(moduleDeck._id)) {
          module.flashcardDeckIds = module.flashcardDeckIds || [];
          module.flashcardDeckIds.push(moduleDeck._id);
          await module.save();
          console.log(`      📌 Linked module deck to module`);
        }

        // Get all lessons in module
        const lessons = await CourseLessonModel.find({
          courseId: course._id,
          moduleId: module._id,
          parentLessonId: null,
        }).sort({ order: 1 });

        console.log(`      Found ${lessons.length} lessons`);

        for (const lesson of lessons) {
          console.log(`\n      📄 Lesson: ${lesson.title}`);

          // Create/get lesson deck
          const lessonDeck = await getOrCreateLessonDeck(
            lesson._id.toString(),
            lesson.title,
            course._id.toString(),
            module._id.toString(),
            moduleDeck._id.toString(),
            null,
            null,
            course.createdBy.toString()
          );

          console.log(`         ✅ Lesson deck: ${lessonDeck.title} (level ${lessonDeck.level})`);
          totalLessonDecks++;

          // Add to lesson if not already there
          if (!lesson.flashcardDeckIds?.includes(lessonDeck._id)) {
            lesson.flashcardDeckIds = lesson.flashcardDeckIds || [];
            lesson.flashcardDeckIds.push(lessonDeck._id);
            await lesson.save();
            console.log(`         📌 Linked lesson deck to lesson`);
          }

          // Link existing flashcard cards to lesson deck if they exist
          if (lesson.flashcardDeckIds && lesson.flashcardDeckIds.length > 0) {
            const cardCount = await FlashcardCardModel.countDocuments({
              deckId: { $in: lesson.flashcardDeckIds },
            });
            if (cardCount > 0) {
              console.log(`         🃏 Found ${cardCount} existing cards`);
            }
          }

          // Get sub-lessons
          const subLessons = await CourseLessonModel.find({
            parentLessonId: lesson._id,
          }).sort({ order: 1 });

          if (subLessons.length > 0) {
            console.log(`         Found ${subLessons.length} sub-lessons`);

            for (const subLesson of subLessons) {
              console.log(`\n         📝 Sub-lesson: ${subLesson.title}`);

              const subLessonDeck = await getOrCreateLessonDeck(
                subLesson._id.toString(),
                subLesson.title,
                course._id.toString(),
                module._id.toString(),
                moduleDeck._id.toString(),
                lesson._id.toString(),
                lessonDeck._id.toString(),
                course.createdBy.toString()
              );

              console.log(`            ✅ Sub-lesson deck: ${subLessonDeck.title} (level ${subLessonDeck.level})`);
              totalLessonDecks++;

              // Add to sub-lesson if not already there
              if (!subLesson.flashcardDeckIds?.includes(subLessonDeck._id)) {
                subLesson.flashcardDeckIds = subLesson.flashcardDeckIds || [];
                subLesson.flashcardDeckIds.push(subLessonDeck._id);
                await subLesson.save();
                console.log(`            📌 Linked sub-lesson deck to sub-lesson`);
              }
            }
          }
        }
      }

      // Update card counts for entire hierarchy
      console.log(`\n   🔢 Updating card counts for hierarchy...`);
      await updateDeckCardCounts(courseDeck._id.toString());
      
      // Reload and display final counts
      const updatedCourseDeck = await FlashcardDeckModel.findById(courseDeck._id);
      console.log(`   ✅ Course deck total cards: ${updatedCourseDeck?.cardCount || 0}`);

    } catch (error) {
      console.error(`   ❌ Error processing course: ${error}`);
    }
  }

  console.log('\n\n📊 Migration Summary:');
  console.log(`   Courses processed: ${courses.length}`);
  console.log(`   Course decks created: ${totalCourseDeck}`);
  console.log(`   Module decks created: ${totalModuleDecks}`);
  console.log(`   Lesson/sub-lesson decks created: ${totalLessonDecks}`);
  console.log(`   Total decks: ${totalCourseDeck + totalModuleDecks + totalLessonDecks}`);
  console.log('\n✨ Migration complete!\n');

  process.exit(0);
}

// Run migration
migrateFlashcardHierarchy().catch(error => {
  console.error('❌ Migration failed:', error);
  process.exit(1);
});
