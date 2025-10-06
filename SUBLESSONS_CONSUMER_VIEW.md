# Sub-Lessons on Consumer/Student Lesson Pages

## Current State
✅ **Course Outline Page** (`/courses/[slug]/page.tsx`) already shows sub-lessons:
- Displays parent lessons with sub-lesson count badge
- Shows nested sub-lessons with tree symbols (└─)
- Hierarchical numbering (1, 1.1, 1.2, etc.)
- Preview/Start buttons for each lesson

## Missing Feature
❌ **Individual Lesson Page** doesn't show sub-lessons at the bottom

## What Needs to Be Implemented

### User Flow
When a student is viewing a parent lesson that has sub-lessons:
1. Student reads/watches the main lesson content
2. **At the bottom**, they see: "This lesson has X sub-lessons"
3. A list of sub-lessons with links to navigate to them
4. This helps students understand the learning path and easily navigate to next steps

### Example UI
```
┌─────────────────────────────────────────┐
│ [Main Lesson Content]                   │
│                                         │
│ Video/Text/Quiz content here...        │
│                                         │
│ ... content continues ...              │
│                                         │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 📚 Sub-Lessons                          │
│                                         │
│ This lesson includes 3 sub-lessons:     │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ 1.1 Introduction to Variables     │  │
│ │ └─ Standalone • 15 min          │  │
│ │                    [Start →]     │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ 1.2 Variable Types                │  │
│ │ └─ Video • 20 min               │  │
│ │                    [Start →]     │  │
│ └───────────────────────────────────┘  │
│                                         │
│ ┌───────────────────────────────────┐  │
│ │ 1.3 Practice Exercise             │  │
│ │ └─ Quiz • 10 min                │  │
│ │                    [Start →]     │  │
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

[← Previous Lesson]  [Next Lesson →]
```

## Implementation Steps

### 1. Find/Create Lesson Viewer Component
**Question**: How are individual lessons displayed to students?
- Is there a `/courses/[slug]/lessons/[lessonId]` route?
- Or are lessons displayed inline on the course page?
- Or is there a separate lesson viewer component?

**Action**: Search for the lesson viewing logic and component.

### 2. Update Lesson Data Fetching
Add logic to fetch sub-lessons when loading a lesson:

```typescript
// In lesson page/component
const fetchLessonWithChildren = async (lessonId: string) => {
  const response = await fetch(`/api/lessons/${lessonId}`);
  const lesson = await response.json();
  
  // Fetch sub-lessons if this is a parent
  if (lesson.id) {
    const childrenResponse = await fetch(
      `/api/lessons?parentId=${lesson.id}`
    );
    const children = await childrenResponse.json();
    return { ...lesson, subLessons: children };
  }
  
  return lesson;
};
```

### 3. Create SubLessonsSection Component

```typescript
// src/components/lessons/SubLessonsSection.tsx
interface SubLesson {
  id: string;
  title: string;
  slug: string;
  contentType: string;
  estimatedDurationMinutes: number;
  isCompleted?: boolean;
}

interface SubLessonsSectionProps {
  subLessons: SubLesson[];
  courseSlug: string;
  parentLessonNumber?: string; // e.g., "1"
}

export default function SubLessonsSection({ 
  subLessons, 
  courseSlug,
  parentLessonNumber 
}: SubLessonsSectionProps) {
  if (!subLessons || subLessons.length === 0) return null;

  return (
    <section className='mt-12 rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 p-6 dark:border-gray-700 dark:from-blue-950/20 dark:to-purple-950/20'>
      <div className='mb-4 flex items-center gap-2'>
        <span className='text-2xl'>📚</span>
        <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
          Sub-Lessons
        </h2>
      </div>
      
      <p className='mb-6 text-gray-600 dark:text-gray-400'>
        This lesson includes {subLessons.length} sub-lesson
        {subLessons.length !== 1 ? 's' : ''}:
      </p>
      
      <div className='space-y-3'>
        {subLessons.map((subLesson, index) => (
          <Link
            key={subLesson.id}
            href={`/courses/${courseSlug}#lesson-${subLesson.id}`}
            className='group block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-600'
          >
            <div className='flex items-center justify-between gap-4'>
              <div className='flex items-start gap-3'>
                <span className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-100 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                  {parentLessonNumber ? `${parentLessonNumber}.${index + 1}` : index + 1}
                </span>
                
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-gray-400 dark:text-gray-600'>└─</span>
                    <h3 className='font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400'>
                      {subLesson.title}
                    </h3>
                    {subLesson.isCompleted && (
                      <span className='text-green-500'>✓</span>
                    )}
                  </div>
                  
                  <div className='mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                    <span className='capitalize'>{subLesson.contentType}</span>
                    <span>•</span>
                    <span>{subLesson.estimatedDurationMinutes} min</span>
                  </div>
                </div>
              </div>
              
              <button className='flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'>
                Start
                <span className='group-hover:translate-x-0.5 transition-transform'>→</span>
              </button>
            </div>
          </Link>
        ))}
      </div>
      
      <div className='mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30'>
        <p className='text-sm text-blue-800 dark:text-blue-300'>
          💡 <strong>Tip:</strong> Complete these sub-lessons in order for the best learning experience.
        </p>
      </div>
    </section>
  );
}
```

### 4. Add to Lesson Viewer
In your lesson viewer component (wherever lesson content is displayed):

```typescript
// src/app/courses/[slug]/lessons/[lessonId]/page.tsx (or similar)
export default async function LessonPage({ params }) {
  const lesson = await fetchLesson(params.lessonId);
  const subLessons = await fetchSubLessons(params.lessonId);
  
  return (
    <div>
      {/* Lesson content */}
      <LessonContent lesson={lesson} />
      
      {/* Sub-lessons section at the bottom */}
      <SubLessonsSection 
        subLessons={subLessons}
        courseSlug={params.slug}
        parentLessonNumber={lesson.number}
      />
      
      {/* Navigation */}
      <LessonNavigation />
    </div>
  );
}
```

### 5. API Endpoint for Sub-Lessons
Create an endpoint to fetch sub-lessons:

```typescript
// src/app/api/lessons/[lessonId]/sub-lessons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import CourseLessonModel from '@/models/CourseLesson';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lessonId: string }> }
) {
  const { lessonId } = await params;
  
  const subLessons = await CourseLessonModel.find({
    parentLessonId: lessonId
  })
  .select('_id title slug contentType estimatedDurationMinutes')
  .sort({ createdAt: 1 })
  .lean();
  
  return NextResponse.json(
    subLessons.map(l => ({
      id: l._id.toString(),
      title: l.title,
      slug: l.slug,
      contentType: l.contentType,
      estimatedDurationMinutes: l.estimatedDurationMinutes
    }))
  );
}
```

## Benefits

1. **Clear Learning Path**: Students see what sub-topics are covered
2. **Easy Navigation**: Direct links to each sub-lesson
3. **Progress Tracking**: Can show completion status per sub-lesson
4. **Better UX**: No need to go back to course outline to find sub-lessons
5. **Context**: Students understand the structure while learning

## Next Steps

1. **Locate lesson viewer**: Find where individual lessons are displayed to students
2. **Implement API**: Create endpoint to fetch sub-lessons
3. **Create component**: Build the SubLessonsSection component
4. **Integrate**: Add to lesson viewer page
5. **Test**: Verify navigation and display with real sub-lessons
6. **Style**: Match existing course/lesson design system

## Questions to Answer

- Where is the individual lesson content displayed?
- Is there a dedicated lesson viewer page?
- How are students navigating between lessons currently?
- Should clicking a sub-lesson navigate or open in same view?
- Should we show parent lesson info when viewing a sub-lesson?
