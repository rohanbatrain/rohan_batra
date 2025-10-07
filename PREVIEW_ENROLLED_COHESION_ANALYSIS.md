# Preview vs Enrolled Mode Cohesion Analysis

## Current State

### Two Routes Serving Lessons

#### 1. Preview Route: `/courses/preview/[lessonId]`
**Purpose**: Allow non-enrolled users to preview previewable lessons

**Features**:
- ✅ Checks `isPreviewable` flag
- ✅ Checks enrollment status
- ✅ Renders content (blog, standalone, video, quiz placeholder, flashcards placeholder)
- ✅ Simple layout with "Back to course" link
- ✅ MDX rendering with syntax highlighting
- ✅ Novel.sh JSON rendering
- ❌ NO completion tracking
- ❌ NO progress indicators
- ❌ NO flashcard integration
- ❌ NO navigation to next/previous lessons
- ❌ NO breadcrumbs
- ❌ Does NOT use course slug (harder to track)

**Code Location**: `/src/app/courses/preview/[lessonId]/page.tsx`

#### 2. Full Lesson Route: `/courses/[slug]/lesson/[lessonId]`
**Purpose**: Full lesson viewer for enrolled users

**Features**:
- ✅ Checks `isPreviewable` flag
- ✅ Checks enrollment status
- ✅ Shows "Preview Mode" badge if not enrolled
- ✅ Redirects to enroll page if not enrolled AND not previewable
- ✅ Full breadcrumb navigation
- ✅ Module context in breadcrumb
- ✅ Completion status badge
- ✅ Mark Complete/Incomplete button
- ✅ Flashcard section (if decks linked)
- ✅ "Back to Course" button
- ❌ Basic content rendering (NO MDX processing)
- ❌ NO video embedding
- ❌ NO Novel.sh rendering
- ❌ Completion button is UI-only (no backend)

**Code Location**: `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx`

---

## Issues Identified

### 1. **Duplicate Routes for Same Purpose**
**Problem**: Two different routes both handle lesson viewing with overlapping functionality

**Example**:
- Preview route: `/courses/preview/68e1715ac9556e999f9f6f01`
- Full route: `/courses/probability-entropy-and-monte-carlo-simulation/lesson/68e1715ac9556e999f9f6f01`

**Both** can be accessed by non-enrolled users if lesson is previewable!

### 2. **Inconsistent Feature Sets**

| Feature | Preview Route | Full Route |
|---------|--------------|------------|
| MDX Rendering | ✅ Advanced | ❌ Basic |
| Video Embedding | ✅ Yes | ❌ No |
| Novel.sh Rendering | ✅ Yes | ❌ No |
| Breadcrumbs | ❌ No | ✅ Yes |
| Completion Tracking | ❌ No | ✅ UI Only |
| Flashcard Integration | ❌ No | ✅ Yes |
| Navigation | ❌ Basic | ✅ Full |
| Preview Badge | ❌ No | ✅ Yes |

**Result**: Preview route has better content rendering, but full route has better UI/UX features!

### 3. **Course Page Links Inconsistently**

**For Enrolled Users**:
```tsx
<Link href={`/courses/${course.slug}/lesson/${String(l._id)}`}>
  Start
</Link>
```

**For Non-Enrolled Users (Blog)**:
```tsx
<Link href={`/blog/${l.blogSlug}`}>
  Preview
</Link>
```

**For Non-Enrolled Users (Other)**:
```tsx
<Link href={`/courses/preview/${String(l._id)}`}>
  Preview
</Link>
```

**Problem**: Blog lessons get special treatment, others go to different route

### 4. **Full Lesson Route Already Supports Preview**

The full lesson route at `/courses/[slug]/lesson/[lessonId]` ALREADY has this logic:

```typescript
// Check authorization
const isEnrolled = !!enrollment;
const isPreviewable = lesson.isPreviewable;

if (!isEnrolled && !isPreviewable) {
  redirect(`/courses/${slug}?message=enroll-required`);
}
```

**This means**:
- ✅ Non-enrolled users CAN access previewable lessons
- ✅ Shows "Preview Mode" badge
- ✅ Hides completion buttons for non-enrolled users

**So why have a separate preview route?**

### 5. **Content Rendering Disparity**

**Preview Route Has**:
- MDX processing with plugins (remarkGfm, rehypeSlug, rehypePrettyCode)
- Video iframe embedding (YouTube, Vimeo, Loom)
- Novel.sh JSON to HTML conversion
- Syntax highlighting

**Full Route Has**:
- Basic dangerouslySetInnerHTML for MDX
- Link to external video provider (no embedding)
- "Novel.sh content viewer coming soon"
- No syntax highlighting

**Result**: Preview looks better than enrolled view! 😱

---

## Recommendations

### Option 1: Consolidate to Single Route (RECOMMENDED) ✅

**Use only**: `/courses/[slug]/lesson/[lessonId]`

**Changes Needed**:
1. **Move all content rendering logic from preview route to full route**
   - Copy MDX processing with plugins
   - Copy video embedding logic
   - Copy Novel.sh rendering
   - Copy syntax highlighting

2. **Update course page links**
   ```tsx
   // Remove preview route links
   // ALL users (enrolled or not) use same route
   <Link href={`/courses/${course.slug}/lesson/${String(l._id)}`}>
     {enrollment ? 'Start' : 'Preview'}
   </Link>
   ```

3. **Keep authorization logic in full route**
   - Already works perfectly
   - Shows "Preview Mode" badge for non-enrolled
   - Hides completion features for non-enrolled

4. **Delete preview route**
   - `/src/app/courses/preview/[lessonId]/page.tsx` can be removed

**Benefits**:
- ✅ Single source of truth
- ✅ Consistent URL structure (includes course slug)
- ✅ Better SEO (course slug in URL)
- ✅ Easier maintenance (one file)
- ✅ All features available to all users (where appropriate)
- ✅ No duplicate code

### Option 2: Keep Separate Routes (NOT RECOMMENDED) ❌

**If** you want to keep separate routes for design reasons:

1. **Reverse the content rendering**
   - Move basic rendering TO preview route
   - Keep advanced rendering IN full route
   - This way enrolled users get better experience

2. **Make preview route explicit**
   - Add big "Preview Mode" banner
   - Add "Enroll to access full features" CTA
   - Limit content (e.g., only show first 50% of lesson)

3. **Update course page logic**
   - Keep using `/courses/preview/{id}` for non-enrolled
   - Keep using `/courses/{slug}/lesson/{id}` for enrolled
   - Make sure preview route looks "limited"

**Drawbacks**:
- ❌ Maintains duplicate code
- ❌ Two places to update when fixing bugs
- ❌ Inconsistent URLs (preview has no slug)
- ❌ More confusing for users

---

## Implementation Plan (Option 1)

### Step 1: Enhance Full Lesson Route Content Rendering

**File**: `/src/app/courses/[slug]/lesson/[lessonId]/page.tsx`

#### 1.1 Add MDX Dependencies
```typescript
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import { MDXComponents, mdxProseBase } from '@/components/mdx/MDXComponents';
import { remarkStripTitleH1 } from '@/lib/mdx/plugins/remarkStripTitleH1';
```

#### 1.2 Add Video Embed Logic
```typescript
function toEmbedUrl(provider?: string, url?: string) {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    switch (provider) {
      case 'youtube': {
        if (u.hostname.includes('youtu.be'))
          return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
        const id = u.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${id}` : url;
      }
      case 'vimeo': {
        const id = u.pathname.replace('/', '');
        return id ? `https://player.vimeo.com/video/${id}` : url;
      }
      case 'loom': {
        if (u.hostname.includes('loom.com')) {
          const parts = u.pathname.split('/');
          const id = parts[parts.length - 1];
          return `https://www.loom.com/embed/${id}`;
        }
        return url;
      }
      default:
        return url;
    }
  } catch {
    return url;
  }
}
```

#### 1.3 Add Novel.sh Rendering
```typescript
function renderNovelJsonToHtml(jsonStr: string): string {
  // Copy full function from preview route
  // ... (see preview route lines 85-225)
}
```

#### 1.4 Update Content Sections

**Replace**:
```tsx
{lesson.contentType === 'standalone' && (
  <div className="bg-card rounded-lg p-6 border">
    {lesson.standaloneFormat === 'mdx' ? (
      <div dangerouslySetInnerHTML={{ __html: lesson.standaloneContent || '' }} />
    ) : (
      <p className="text-muted-foreground">Novel.sh content viewer coming soon</p>
    )}
  </div>
)}
```

**With**:
```tsx
{lesson.contentType === 'standalone' && lesson.standaloneContent && (
  <article className={mdxProseBase}>
    {lesson.standaloneFormat === 'novelsh' ? (
      <div
        dangerouslySetInnerHTML={{
          __html: renderNovelJsonToHtml(lesson.standaloneContent as any),
        }}
      />
    ) : lesson.standaloneFormat === 'mdx' ? (
      <MDXRemote
        source={String(lesson.standaloneContent)}
        components={MDXComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              remarkStripTitleH1(String(lesson.title)),
            ],
            rehypePlugins: [
              rehypeSlug,
              [rehypeAutolinkHeadings, { behavior: 'wrap' }],
              [
                rehypePrettyCode,
                {
                  theme: 'github-dark-dimmed',
                  keepBackground: false,
                },
              ],
            ],
          },
        }}
      />
    ) : (
      <pre className='whitespace-pre-wrap break-words rounded-md bg-muted p-4'>
        {lesson.standaloneContent}
      </pre>
    )}
  </article>
)}
```

**Replace Video Section**:
```tsx
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
```

**With**:
```tsx
{lesson.contentType === 'video' && lesson.externalResource?.url && (
  <div className='relative aspect-video overflow-hidden rounded-lg border'>
    <iframe
      src={toEmbedUrl(
        lesson.externalResource?.provider as any,
        lesson.externalResource?.url as any
      )}
      title={lesson.title as any}
      className='h-full w-full'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowFullScreen
    />
  </div>
)}
```

### Step 2: Update Course Page Links

**File**: `/src/app/courses/[slug]/page.tsx`

**Find** (around line 489):
```tsx
{!enrollment && l.isPreviewable ? (
  l.contentType === 'blog' && l.blogSlug ? (
    <Link href={`/blog/${l.blogSlug}`}>Preview</Link>
  ) : (
    <Link href={`/courses/preview/${String(l._id)}`}>Preview</Link>
  )
) : ...}
```

**Replace with**:
```tsx
{!enrollment && l.isPreviewable ? (
  l.contentType === 'blog' && l.blogSlug ? (
    <Link 
      href={`/blog/${l.blogSlug}`}
      className='rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
    >
      Preview
    </Link>
  ) : (
    <Link 
      href={`/courses/${course.slug}/lesson/${String(l._id)}`}
      className='rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 transition-colors'
    >
      Preview
    </Link>
  )
) : !enrollment ? (
  <span className='rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-700 dark:text-gray-400'>
    Preview N/A
  </span>
) : null}
```

**Do the same for sub-lessons** (around line 563)

### Step 3: Delete Preview Route (Optional)

**After testing**, delete:
- `/src/app/courses/preview/[lessonId]/page.tsx`

**Or** add a redirect:
```typescript
// /src/app/courses/preview/[lessonId]/page.tsx
import { redirect } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import CourseLesson from '@/models/CourseLesson';
import Course from '@/models/Course';

export default async function PreviewRedirect({
  params,
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  await connectToDatabase();
  
  const lesson = await CourseLesson.findById(lessonId).select('courseId').lean();
  if (!lesson) return redirect('/courses');
  
  const course = await Course.findById(lesson.courseId).select('slug').lean();
  if (!course?.slug) return redirect('/courses');
  
  redirect(`/courses/${course.slug}/lesson/${lessonId}`);
}
```

---

## Testing Checklist

After implementing Option 1:

### For Enrolled Users
- [ ] Navigate to course page
- [ ] Click "Start" on any lesson
- [ ] Verify full content renders (MDX, video embed, etc.)
- [ ] Verify breadcrumbs show
- [ ] Verify completion status shows
- [ ] Verify "Mark Complete" button shows
- [ ] Verify flashcard section shows (if applicable)
- [ ] Verify NO "Preview Mode" badge shows

### For Non-Enrolled Users (Previewable Lesson)
- [ ] Navigate to course page (not enrolled)
- [ ] Click "Preview" on previewable lesson
- [ ] Verify full content renders (MDX, video embed, etc.)
- [ ] Verify breadcrumbs show
- [ ] Verify "Preview Mode" badge shows
- [ ] Verify NO completion button shows
- [ ] Verify "Enroll to Access Full Lesson" button shows
- [ ] Verify flashcard section shows (if applicable)

### For Non-Enrolled Users (Non-Previewable Lesson)
- [ ] Navigate to course page (not enrolled)
- [ ] Try to access non-previewable lesson directly via URL
- [ ] Verify redirect to `/courses/{slug}?message=enroll-required`
- [ ] Verify "Preview N/A" badge shows on course page

### Blog Lessons
- [ ] Verify blog lessons still link to `/blog/{slug}`
- [ ] Works for both enrolled and non-enrolled users

### Sub-Lessons
- [ ] Verify sub-lessons work same as parent lessons
- [ ] Preview works for non-enrolled
- [ ] Full access for enrolled

---

## Timeline Estimate

| Task | Time | Depends On |
|------|------|------------|
| 1. Copy helper functions | 30 min | - |
| 2. Update standalone content rendering | 30 min | Task 1 |
| 3. Update video rendering | 15 min | Task 1 |
| 4. Add MDX imports | 10 min | - |
| 5. Update course page links (parent lessons) | 15 min | - |
| 6. Update course page links (sub-lessons) | 15 min | Task 5 |
| 7. Testing (enrolled) | 20 min | Tasks 2-4 |
| 8. Testing (non-enrolled preview) | 20 min | Tasks 2-6 |
| 9. Add redirect from old preview route | 15 min | All above |
| 10. Documentation update | 15 min | - |

**Total**: ~3 hours

---

## Current Priority

**MEDIUM-HIGH** - This affects user experience significantly:

- Preview route has better rendering than enrolled route (bad!)
- Two routes doing same thing (confusing!)
- URLs inconsistent (preview has no course slug)
- Duplicate code to maintain

**Should fix before**: Launch to production

**Can wait until after**: Current feature development (Feature 014/015)

---

## Status

- ✅ Analysis complete
- ⏳ Implementation pending
- ⏳ Testing pending
- ⏳ Documentation pending

