#!/usr/bin/env tsx
/**
 * Fix Parent Lesson Durations Script
 * 
 * This script updates parent lessons that are containers (no content)
 * to have estimatedDurationMinutes = 0 to avoid double-counting.
 * 
 * Usage:
 *   pnpm tsx scripts/fix-parent-lesson-durations.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local explicitly
config({ path: resolve(process.cwd(), '.env.local') });

import connectToDatabase from '../src/lib/mongodb';
import CourseLessonModel from '../src/models/CourseLesson';

async function hasOwnContent(lesson: any): Promise<boolean> {
  return Boolean(
    lesson.standaloneContent ||
    lesson.externalResource ||
    lesson.blogSlug ||
    lesson.quizId
  );
}

async function run() {
  await connectToDatabase();

  console.log('🔧 Starting parent lesson duration fix...\n');

  // Find all top-level lessons (potential parents)
  const topLevelLessons = await CourseLessonModel.find({
    parentLessonId: null,
  });

  console.log(`📊 Found ${topLevelLessons.length} top-level lessons\n`);

  let containersFound = 0;
  let containersFixed = 0;
  let parentsWithContent = 0;
  let skipped = 0;

  for (const lesson of topLevelLessons) {
    // Check if this lesson has sub-lessons
    const subLessonsCount = await CourseLessonModel.countDocuments({
      parentLessonId: lesson._id,
    });

    if (subLessonsCount > 0) {
      // This is a parent lesson
      const hasContent = await hasOwnContent(lesson);

      if (!hasContent) {
        // Container parent - should have duration = 0
        containersFound++;

        if (lesson.estimatedDurationMinutes !== 0) {
          console.log(
            `🔄 Fixing "${lesson.title}": ${lesson.estimatedDurationMinutes}m → 0m (${subLessonsCount} sub-lessons)`
          );

          lesson.estimatedDurationMinutes = 0;
          await lesson.save();
          containersFixed++;
        } else {
          console.log(
            `✅ "${lesson.title}": Already 0m (${subLessonsCount} sub-lessons)`
          );
          skipped++;
        }
      } else {
        // Parent with content - duration should be parent's own time
        parentsWithContent++;
        console.log(
          `📝 "${lesson.title}": ${lesson.estimatedDurationMinutes}m + ${subLessonsCount} sub-lessons (has content)`
        );
      }
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Container parents found: ${containersFound}`);
  console.log(`   Container parents fixed: ${containersFixed}`);
  console.log(`   Container parents already correct: ${skipped}`);
  console.log(`   Parents with content (unchanged): ${parentsWithContent}`);
  console.log(`   Total top-level lessons: ${topLevelLessons.length}`);

  console.log('\n✅ Migration complete!');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  });
