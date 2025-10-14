import { notFound, redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import connectToDatabase from '@/lib/mongodb';
import CourseModel from '@/models/Course';
import CourseLessonModel from '@/models/CourseLesson';
import CourseModuleModel from '@/models/CourseModule';
import CourseEnrollmentModel from '@/models/CourseEnrollment';
import CourseProgressModel from '@/models/CourseProgress';
import UserModel from '@/models/User';
import FlashcardDeckModel from '@/models/FlashcardDeck';
import { Metadata } from 'next';
import Link from 'next/link';
import { formatMinutes } from '@/lib/courses/format';
import { BookOpen, CheckCircle2, Circle, Clock, ChevronDown } from 'lucide-react';
import { KnowledgeGraph } from '@/components/courses/KnowledgeGraph';
import { StudyButton } from '@/components/flashcards/StudyButton';
import { isModuleLocked } from '@/lib/courses/unlock-logic';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string; moduleId: string }>;
};

// Helper to build ordered lesson list with sub-lessons
function buildOrderedLessons(module: any, lessons: any[]) {
  // Top-level lessons (no parent)
  const topLessons = lessons.filter(l => !l.parentLessonId);
  
  // Order by module's lessonIds if available
  const orderedTop = Array.isArray(module.lessonIds) && module.lessonIds.length
    ? (module.lessonIds as any[])
        .map((id: any) => topLessons.find(l => String(l._id) === String(id)))
        .filter(Boolean)
    : topLessons.sort((a: any, b: any) => a.title.localeCompare(b.title));

  // Attach sub-lessons grouped by parent
  const childrenMap = new Map<string, any[]>();
  for (const l of lessons) {
    if (l.parentLessonId) {
      const k = String(l.parentLessonId);
      if (!childrenMap.has(k)) childrenMap.set(k, []);
      childrenMap.get(k)!.push(l);
    }
  }

  return orderedTop.map((l: any) => {
    const children = childrenMap.get(String(l._id)) || [];
    let orderedChildren = children;
    
    if (Array.isArray(l.childOrder) && l.childOrder.length) {
      const idSet = new Set(l.childOrder.map((id: any) => String(id)));
      const map = new Map(children.map((c: any) => [String(c._id), c]));
      orderedChildren = l.childOrder
        .map((id: any) => map.get(String(id)))
        .filter(Boolean);
      
      // Append remaining children not in childOrder
      const remaining = children.filter((c: any) => !idSet.has(String(c._id)));
      orderedChildren = [
        ...orderedChildren,
        ...remaining.sort((a: any, b: any) => a.title.localeCompare(b.title)),
      ];
    } else {
      orderedChildren = children.sort((a: any, b: any) =>
        a.title.localeCompare(b.title)
      );
    }
    
    return { ...l, subLessons: orderedChildren };
  });
}

export async function generateMetadata(ctx: PageProps): Promise<Metadata> {
  const { slug, moduleId } = await ctx.params;
  
  await connectToDatabase();
  
  const course = await CourseModel.findOne({ slug }).lean();
  if (!course || course.status !== 'published' || course.visibility !== 'public') {
    return { title: 'Module not found' };
  }

  const module = await CourseModuleModel.findById(moduleId).lean();
  if (!module || String(module.courseId) !== String(course._id)) {
    return { title: 'Module not found' };
  }

  const title = `${module.title} - ${course.title}`;
  const description = module.summary || course.summary?.slice(0, 150);

  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function ModulePage(ctx: PageProps) {
  const { slug, moduleId } = await ctx.params;

  try {
    await connectToDatabase();
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw new Error('Database connection unavailable. Please try again later.');
  }

  // Fetch course
  const course = await CourseModel.findOne({ slug }).lean();
  if (!course) return notFound();
  
  // Only show published public courses
  if (course.status !== 'published' || course.visibility !== 'public') {
    return notFound();
  }

  // Fetch module
  const module = await CourseModuleModel.findById(moduleId).lean();
  if (!module || String(module.courseId) !== String(course._id)) {
    return notFound();
  }
  
  // Fetch flashcard deck for this module (if exists)
  const moduleDeck = await FlashcardDeckModel.findOne({
    'linkTargets.scope': 'module',
    'linkTargets.moduleId': module._id,
  })
    .select('_id title cardCount')
    .lean();

  // Fetch all modules for navigation
  const allModules = await CourseModuleModel.find({ courseId: course._id })
    .select('_id title order')
    .sort({ order: 1 })
    .lean();

  // Fetch lessons for this module
  const lessons = await CourseLessonModel.find({
    courseId: course._id,
    moduleId: module._id,
  })
    .select(
      'title contentType estimatedDurationMinutes isPreviewable parentLessonId childOrder'
    )
    .lean();

  const orderedLessons = buildOrderedLessons(module, lessons as any[]);

  // Enrollment/progress for current user (if signed in)
  const { userId } = await auth();
  let enrollment: any = null;
  let progress: any = null;
  let moduleProgress: any = null;

  if (userId) {
    const userDoc = await UserModel.findOne({ clerkId: userId }).lean() as {
      _id: any;
    } | null;
    if (userDoc?._id) {
      enrollment = await CourseEnrollmentModel.findOne({
        courseId: course._id,
        userId: userDoc._id,
      }).lean();

      if (enrollment) {
        progress = await CourseProgressModel.findOne({
          enrollmentId: enrollment._id,
        }).lean();

        // Find progress for this specific module
        if (progress?.moduleProgress) {
          moduleProgress = progress.moduleProgress.find(
            (mp: any) => String(mp.moduleId) === String(module._id)
          );
        }
      }
    }
  }

  // Calculate module completion status
  const completedLessonIds = new Set(
    progress?.completedLessonIds?.map((id: any) => String(id)) || []
  );

  const totalLessons = orderedLessons.length;
  const completedLessonsCount = orderedLessons.filter(l =>
    completedLessonIds.has(String(l._id))
  ).length;
  
  const isModuleComplete = totalLessons > 0 && completedLessonsCount === totalLessons;
  const moduleCompletionPercentage = totalLessons > 0
    ? Math.round((completedLessonsCount / totalLessons) * 100)
    : 0;

  // Find current module index for navigation
  const currentModuleIndex = allModules.findIndex(
    m => String(m._id) === String(module._id)
  );
  const prevModule = currentModuleIndex > 0 ? allModules[currentModuleIndex - 1] : null;
  const nextModule = currentModuleIndex < allModules.length - 1
    ? allModules[currentModuleIndex + 1]
    : null;

  // Check if module is locked for enrolled users
  if (enrollment) {
    // Build full course outline to check module lock status
    const allCourseModules = await CourseModuleModel.find({ courseId: course._id })
      .select('_id title order lessonIds')
      .sort({ order: 1 })
      .lean();
    
    // Fetch all lessons for all modules to properly check completion
    const allLessons = await CourseLessonModel.find({ courseId: course._id })
      .select('_id moduleId parentLessonId childOrder')
      .lean();
    
    // Build module structure with lessons
    const modulesWithLessons = allCourseModules.map((m: any) => {
      const moduleLessons = allLessons.filter(
        (l: any) => String(l.moduleId) === String(m._id)
      );
      return {
        ...m,
        lessons: buildOrderedLessons(m, moduleLessons as any[]),
      };
    });
    
    // Check if current module is locked
    const completedIds = progress?.completedLessonIds?.map((id: any) => String(id)) || [];
    const lockStatus = isModuleLocked(currentModuleIndex, modulesWithLessons as any[], completedIds);
    
    if (lockStatus.isLocked) {
      // Redirect to course page with error message
      redirect(`/courses/${course.slug}?message=module-locked&reason=${encodeURIComponent(lockStatus.reason || 'Complete previous modules first')}`);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Mobile Course Overview */}
        <div className="lg:hidden mb-6">
          <details
            open
            className="bg-card rounded-xl border shadow-sm overflow-hidden group"
          >
            <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors select-none">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Course Overview
              </h3>
              <svg
                className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </summary>

            <div className="p-5 pt-0 space-y-4">
              <Link href={`/courses/${course.slug}`} className="block group">
                <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                  {course.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {module.title}
                </p>
              </Link>

              {progress && (
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Course Progress</span>
                    <span className="font-medium">{progress.percentageComplete}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${progress.percentageComplete}%` }}
                    />
                  </div>
                </div>
              )}

              <Link
                href={`/courses/${course.slug}`}
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Course
              </Link>
            </div>
          </details>
        </div>

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-80 xl:w-96 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              <details
                open
                className="bg-card rounded-xl border shadow-sm overflow-hidden group"
              >
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors select-none">
                  <h3 className="font-semibold text-base flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-primary" />
                    Course Overview
                  </h3>
                  <svg
                    className="h-5 w-5 text-muted-foreground transition-transform group-open:rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>

                <div className="p-5 pt-0 space-y-4">
                  <Link href={`/courses/${course.slug}`} className="block group">
                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                      {course.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.title}
                    </p>
                  </Link>

                  {progress && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">Course Progress</span>
                        <span className="font-medium">{progress.percentageComplete}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress.percentageComplete}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/courses/${course.slug}`}
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to Course
                  </Link>
                </div>
              </details>

              {/* Knowledge Graph (if enabled) */}
              {course.showKnowledgeGraph && (
                <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
                  <KnowledgeGraph
                    courseSlug={course.slug}
                    includeProgress={!!enrollment}
                  />
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 space-y-6">
            {/* Module Header */}
            <div className="bg-card rounded-xl border shadow-sm p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span>Module {module.order + 1}</span>
                    {module.estimatedDurationMinutes && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{formatMinutes(module.estimatedDurationMinutes)}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-3">{module.title}</h1>
                  {module.summary && (
                    <p className="text-muted-foreground text-lg">{module.summary}</p>
                  )}
                </div>

                {enrollment && (
                  <div className="flex flex-col items-end gap-2">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                        isModuleComplete
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {isModuleComplete ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Complete</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-4 w-4" />
                          <span>{moduleCompletionPercentage}%</span>
                        </>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {completedLessonsCount} of {totalLessons} lessons
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Flashcard Section (if module deck exists with cards) */}
            {moduleDeck && moduleDeck.cardCount > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl border shadow-sm p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">Study Materials Available</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Review <strong>{moduleDeck.cardCount}</strong> flashcard{moduleDeck.cardCount > 1 ? 's' : ''} from this module and all its lessons
                    </p>
                  </div>
                  <StudyButton
                    scope='module'
                    courseId={String(course._id)}
                    moduleId={String(module._id)}
                    cardCount={moduleDeck.cardCount}
                    variant="default"
                  />
                </div>
              </div>
            )}

            {/* Lessons List */}
            <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">Lessons</h2>
              </div>

              <div className="divide-y">
                {orderedLessons.map((lesson: any, index: number) => {
                  const isCompleted = completedLessonIds.has(String(lesson._id));
                  const canAccess = enrollment || lesson.isPreviewable;

                  return (
                    <div key={String(lesson._id)}>
                      {/* Main Lesson */}
                      <Link
                        href={
                          canAccess
                            ? `/courses/${course.slug}/lesson/${lesson._id}`
                            : `/courses/${course.slug}`
                        }
                        className={`block p-4 hover:bg-accent/50 transition-colors ${
                          !canAccess ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1">
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2 mb-1">
                              <span className="text-sm text-muted-foreground">
                                Lesson {index + 1}
                              </span>
                              {!canAccess && (
                                <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                  Enroll to access
                                </span>
                              )}
                              {lesson.isPreviewable && !enrollment && (
                                <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                  Preview
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                              {lesson.title}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="capitalize">{lesson.contentType}</span>
                              {lesson.estimatedDurationMinutes && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    <span>{formatMinutes(lesson.estimatedDurationMinutes)}</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>

                      {/* Sub-lessons */}
                      {lesson.subLessons && lesson.subLessons.length > 0 && (
                        <div className="bg-muted/30 border-t">
                          {lesson.subLessons.map((subLesson: any, subIndex: number) => {
                            const isSubCompleted = completedLessonIds.has(
                              String(subLesson._id)
                            );
                            const canAccessSub = enrollment || subLesson.isPreviewable;

                            return (
                              <Link
                                key={String(subLesson._id)}
                                href={
                                  canAccessSub
                                    ? `/courses/${course.slug}/lesson/${subLesson._id}`
                                    : `/courses/${course.slug}`
                                }
                                className={`block p-4 pl-16 hover:bg-accent/50 transition-colors border-t first:border-t-0 ${
                                  !canAccessSub ? 'opacity-60' : ''
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  <div className="flex-shrink-0 mt-1">
                                    {isSubCompleted ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-500" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-muted-foreground" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2 mb-1">
                                      <span className="text-xs text-muted-foreground">
                                        {index + 1}.{subIndex + 1}
                                      </span>
                                      {!canAccessSub && (
                                        <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                                          Enroll to access
                                        </span>
                                      )}
                                      {subLesson.isPreviewable && !enrollment && (
                                        <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                                          Preview
                                        </span>
                                      )}
                                    </div>
                                    <h4 className="text-sm font-medium group-hover:text-primary transition-colors">
                                      {subLesson.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                      <span className="capitalize">{subLesson.contentType}</span>
                                      {subLesson.estimatedDurationMinutes && (
                                        <>
                                          <span>•</span>
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>
                                              {formatMinutes(subLesson.estimatedDurationMinutes)}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Module Navigation */}
            <div className="flex justify-between items-center gap-4">
              {prevModule ? (
                <Link
                  href={`/courses/${course.slug}/module/${prevModule._id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors"
                >
                  <span>←</span>
                  <div className="text-left">
                    <div className="text-xs text-muted-foreground">Previous Module</div>
                    <div className="text-sm font-medium line-clamp-1">
                      {prevModule.title}
                    </div>
                  </div>
                </Link>
              ) : (
                <div />
              )}

              {nextModule ? (
                <Link
                  href={`/courses/${course.slug}/module/${nextModule._id}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-accent transition-colors ml-auto"
                >
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Next Module</div>
                    <div className="text-sm font-medium line-clamp-1">
                      {nextModule.title}
                    </div>
                  </div>
                  <span>→</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
