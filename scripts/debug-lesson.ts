#!/usr/bin/env tsx
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import connectToDatabase from '../src/lib/mongodb';
import CourseLessonModel from '../src/models/CourseLesson';

async function run() {
  await connectToDatabase();

  const lesson = await CourseLessonModel.findOne({ 
    title: 'Randomness and Uncertainty' 
  }).lean();

  if (lesson) {
    console.log('\n📋 Lesson Details:');
    console.log('Title:', lesson.title);
    console.log('Duration:', lesson.estimatedDurationMinutes, 'minutes');
    console.log('Has standaloneContent:', !!lesson.standaloneContent);
    console.log('Has externalResource:', !!lesson.externalResource);
    console.log('Has blogSlug:', !!lesson.blogSlug);
    console.log('Has quizId:', !!lesson.quizId);
    console.log('ContentType:', lesson.contentType);
    console.log('Parent ID:', lesson.parentLessonId);

    // Check sub-lessons
    const subLessons = await CourseLessonModel.find({
      parentLessonId: lesson._id
    }).lean();

    console.log('\n📚 Sub-lessons:', subLessons.length);
    subLessons.forEach((sub, i) => {
      console.log(`  ${i + 1}. ${sub.title}: ${sub.estimatedDurationMinutes}m`);
    });

    // Calculate total
    const subTotal = subLessons.reduce((sum, s) => sum + s.estimatedDurationMinutes, 0);
    const hasContent = !!(lesson.standaloneContent || lesson.externalResource || lesson.blogSlug || lesson.quizId);
    const parentDuration = hasContent ? lesson.estimatedDurationMinutes : 0;
    const total = parentDuration + subTotal;

    console.log('\n🔢 Calculation:');
    console.log('  Has content:', hasContent);
    console.log('  Parent duration:', parentDuration, 'm');
    console.log('  Sub-lessons total:', subTotal, 'm');
    console.log('  TOTAL:', total, 'm');
  } else {
    console.log('❌ Lesson not found');
  }

  process.exit(0);
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
