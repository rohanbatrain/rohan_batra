import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseLessonModel from '@/models/CourseLesson';
import CourseModuleModel from '@/models/CourseModule';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import UserModel from '@/models/User';
import { Metadata } from 'next';

interface LessonPageProps {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { slug, lessonId } = await params;
  
  await connectToDatabase();
  
  const course = await CourseModel.findOne({ slug }).lean();
  const lesson = await CourseLessonModel.findById(lessonId).lean();
  
  if (!course || !lesson) {
    return {
      title: 'Lesson Not Found',
    };
  }
  
  return {
    title: `${lesson.title} - ${course.title}`,
    description: `Learn ${lesson.title} in the ${course.title} course`,
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { slug, lessonId } = await params;
  const { userId: clerkUserId } = await auth();
  
  await connectToDatabase();
  
  // Fetch course
  const course = await CourseModel.findOne({ slug }).lean();
  if (!course) {
    notFound();
  }
  
  // Fetch lesson
  const lesson = await CourseLessonModel.findById(lessonId).lean();
  if (!lesson) {
    notFound();
  }
  
  // Verify lesson belongs to this course
  if (lesson.courseId.toString() !== course._id.toString()) {
    notFound();
  }
  
  // Fetch module for breadcrumb
  const module = await CourseModuleModel.findById(lesson.moduleId).lean();
  if (!module) {
    notFound();
  }
  
  // Check enrollment and progress
  let enrollment = null;
  let progress = null;
  let user = null;
  
  if (clerkUserId) {
    const foundUser = await UserModel.findOne({ clerkId: clerkUserId }).lean();
    
    if (foundUser && !Array.isArray(foundUser)) {
      user = foundUser;
      enrollment = await CourseEnrollmentModel.findOne({
        courseId: course._id,
        userId: user._id,
      }).lean();
      
      if (enrollment) {
        progress = await CourseProgressModel.findOne({
          enrollmentId: enrollment._id,
        }).lean();
      }
    }
  }
  
  // Check authorization
  const isEnrolled = !!enrollment;
  const isPreviewable = lesson.isPreviewable;
  
  if (!isEnrolled && !isPreviewable) {
    redirect(`/courses/${slug}?message=enroll-required`);
  }
  
  // Check if lesson is completed
  const isCompleted = progress?.completedLessonIds?.some(
    (id: any) => id.toString() === lesson._id.toString()
  ) ?? false;
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground">
          <a href={`/courses/${slug}`} className="hover:text-foreground">
            {course.title}
          </a>
          <span className="mx-2">›</span>
          <span>{module.title}</span>
          <span className="mx-2">›</span>
          <span className="text-foreground">{lesson.title}</span>
        </nav>
        
        {/* Lesson Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
          
          {isCompleted && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 rounded-full text-sm">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Completed
            </div>
          )}
          
          {!isEnrolled && isPreviewable && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-full text-sm ml-2">
              Preview Mode
            </div>
          )}
        </div>
        
        {/* Lesson Content */}
        <div className="prose dark:prose-invert max-w-none mb-12">
          {lesson.contentType === 'blog' && (
            <div className="bg-card rounded-lg p-6 border">
              <p className="text-muted-foreground">
                This lesson is linked to a blog post: <strong>{lesson.blogSlug}</strong>
              </p>
            </div>
          )}
          
          {lesson.contentType === 'standalone' && (
            <div className="bg-card rounded-lg p-6 border">
              {lesson.standaloneFormat === 'mdx' ? (
                <div dangerouslySetInnerHTML={{ __html: lesson.standaloneContent || '' }} />
              ) : (
                <p className="text-muted-foreground">Novel.sh content viewer coming soon</p>
              )}
            </div>
          )}
          
          {lesson.contentType === 'video' && lesson.externalResource && (
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Video Lesson</h3>
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <a 
                  href={lesson.externalResource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Watch on {lesson.externalResource.provider}
                </a>
              </div>
            </div>
          )}
          
          {lesson.contentType === 'quiz' && (
            <div className="bg-card rounded-lg p-6 border">
              <p className="text-muted-foreground">Quiz ID: {lesson.quizId?.toString()}</p>
              <p className="text-sm">Quiz viewer coming soon</p>
            </div>
          )}
          
          {lesson.contentType === 'flashcards' && (
            <div className="bg-card rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Flashcard Review</h3>
              <p className="text-muted-foreground mb-4">
                This lesson focuses on flashcard review for spaced repetition learning.
              </p>
              {lesson.flashcardDeckIds && lesson.flashcardDeckIds.length > 0 ? (
                <div>
                  <p className="text-sm">Flashcard decks: {lesson.flashcardDeckIds.length}</p>
                  <button className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    Start Review
                  </button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No flashcard decks linked yet.</p>
              )}
            </div>
          )}
        </div>
        
        {/* Flashcard Section (if decks exist) */}
        {lesson.flashcardDeckIds && lesson.flashcardDeckIds.length > 0 && lesson.contentType !== 'flashcards' && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Study Materials</h2>
            <div className="bg-card rounded-lg p-6 border">
              <div className="flex items-center gap-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold">Flashcards Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Review {lesson.flashcardDeckIds.length} flashcard deck{lesson.flashcardDeckIds.length > 1 ? 's' : ''} to reinforce this lesson
                  </p>
                </div>
                <button className="ml-auto px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                  Review Now
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Actions */}
        {isEnrolled && (
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium">
              {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
            </button>
            <a 
              href={`/courses/${slug}`}
              className="px-6 py-3 border rounded-lg hover:bg-accent font-medium"
            >
              Back to Course
            </a>
          </div>
        )}
        
        {!isEnrolled && (
          <a 
            href={`/courses/${slug}`}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium"
          >
            Enroll to Access Full Lesson
          </a>
        )}
      </div>
    </div>
  );
}
