# Data Model: Courses Section for Portfolio Website

**Date**: 2025-09-25  
**Feature**: Courses Section Expansion  
**Phase**: 1 - Data Design

---

## Entity Definitions

### Course
**Purpose**: Describes a reusable learning experience published on the portfolio website.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `slug`: string (required, unique, indexed) – URL-safe identifier
- `title`: string (required) – Course name
- `subtitle`: string – Short marketing tagline
- `summary`: string (required) – Rich description used on listing cards
- `heroImage`: string? – Reuses existing image pipeline URL
- `heroLottieId`: ObjectId? – Reference to `LottieAsset` for animated hero
- `difficulty`: enum ['beginner', 'intermediate', 'advanced'] (default: 'beginner')
- `categories`: string[] – Thematic buckets reused from Books/Blogs
- `tags`: string[] – Free-form tags for filtering/search
- `estimatedDurationMinutes`: number – Total expected completion time
- `lessonCount`: number – Derived, but stored for quick filters
- `prerequisiteCourseIds`: ObjectId[] – Optional course-to-course prerequisites
- `prerequisiteBlogSlugs`: string[] – Required blog posts to read beforehand
- `recommendedBlogSlugs`: string[] – Additional related blog content
- `recommendedBookIds`: ObjectId[] – Optional linkage to existing Books library
- `flashcardDeckIds`: ObjectId[] – Supplemental flashcard decks highlighted at the course level
- `status`: enum ['draft', 'published', 'archived'] (default: 'draft')
- `visibility`: enum ['public', 'unlisted'] (default: 'public')
- `isFeatured`: boolean (default: false)
- `seo`: object – Meta title/description/open graph overrides
- `releaseSchedule`: object? – Optional scheduled publish date/time
- `structureVersion`: number (default: 1) – Helps invalidate cached syllabi when curriculum changes
- `createdBy`: ObjectId – Reference to authoring user
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)
- `publishedAt`: Date? – When status first became `published`

**Validation Rules**:
- `title` 3-150 chars
- `summary` 50-400 chars
- `lessonCount` must match aggregate of published lessons
- `heroImage` must use approved CDN origin when present

**Relationships**:
- One-to-many with `CourseModule`
- One-to-many with `CourseEnrollment`
- One-to-many with `Certificate`
- Optional references to `BlogPost`, `Book`, `LottieAsset`

---

### CourseModule
**Purpose**: Logical grouping of lessons inside a course, powering curriculum accordions and sticky navigation.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `courseId`: ObjectId (required, indexed) – Parent course
- `title`: string (required) – Module heading
- `summary`: string? – Short description shown under accordion title
- `order`: number (required, indexed) – 0-based sequence within course
- `estimatedDurationMinutes`: number? – For progress weighting
- `lessonIds`: ObjectId[] – Ordered list of associated `CourseLesson` IDs (denormalized cache)
- `flashcardDeckIds`: ObjectId[] – Optional supplemental decks surfaced alongside module content
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `order` must be sequential (used to enforce no gaps)
- `lessonIds.length` must equal count of associated lessons

**Relationships**:
- Many-to-one with `Course`
- One-to-many with `CourseLesson`
- Optional many-to-many with `FlashcardDeck` through `flashcardDeckIds`

---

### CourseLesson
**Purpose**: Individual learning unit within a module, capable of referencing existing content or new material.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `courseId`: ObjectId (required, indexed)
- `moduleId`: ObjectId (required, indexed)
- `title`: string (required)
- `slug`: string? – Optional friendly identifier for deep linking
- `contentType`: enum ['blog', 'standalone', 'video', 'quiz', 'flashcards'] (required)
- `blogSlug`: string? – When `contentType='blog'`, references `BlogPost.slug`
- `standaloneContent`: string? – MDX/markdown stored similar to Books pipeline
- `standaloneFormat`: enum ['mdx', 'novelsh']? (default: 'mdx') – For reuse of Novel.sh editor output
- `externalResource`: object?
  - `provider`: enum ['youtube', 'vimeo', 'loom', 'custom']
  - `url`: string (required when external)
  - `durationSeconds`: number?
  - `thumbnailUrl`: string?
- `quizId`: ObjectId? – Reference to `CourseQuiz`
- `assets`: object – Reused media references
  - `lottieIds`: ObjectId[] – `LottieAsset` references
  - `imageUrls`: string[] – Reuses existing asset handling
- `flashcardDeckIds`: ObjectId[] – Decks embedded within the lesson or available as study companion
- `estimatedDurationMinutes`: number (required)
- `isPreviewable`: boolean (default: false) – Allows marketing preview
- `progressWeight`: number (default: 1) – Weighted contribution to completion
- `prerequisiteLessonIds`: ObjectId[] – Optional gating dependency
- `releaseAt`: Date? – Supports scheduled drip content
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- Exactly one of `blogSlug`, `standaloneContent`, `externalResource`, or `quizId` must be provided based on `contentType`
- `externalResource.url` must be HTTPS and match allowed domains
- `progressWeight` ≥ 0 (used to normalize completion percentage)

**Relationships**:
- Many-to-one with `CourseModule` and `Course`
- Optional references to `BlogPost`, `CourseQuiz`, `LottieAsset`
- Optional many-to-many with `FlashcardDeck`

---

### CourseQuiz
**Purpose**: Optional assessment tied to a lesson, enabling structured evaluation.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `courseId`: ObjectId (required)
- `moduleId`: ObjectId (required)
- `lessonId`: ObjectId (required, unique) – Each quiz belongs to one lesson
- `title`: string (required)
- `passingScore`: number (0-100, default 70)
- `timeLimitSeconds`: number? – Optional timed quizzes
- `attemptLimit`: number? – Maximum attempts per learner (default: unlimited)
- `questions`: array of objects
  - `questionId`: string (unique within quiz)
  - `type`: enum ['single_choice', 'multiple_choice', 'free_text']
  - `prompt`: string
  - `options`: array (for choice questions)
  - `correctAnswers`: array (for grading)
  - `explanation`: string?
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `passingScore` between 0 and 100
- `questions` array cannot be empty
- `correctAnswers` must align with `type`

**Relationships**:
- Many-to-one with `CourseLesson`
- Used by `CourseProgress.attempts`

---

### CourseEnrollment
**Purpose**: Tracks a learner's association with a course.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `courseId`: ObjectId (required, indexed)
- `userId`: ObjectId (required, indexed)
- `status`: enum ['enrolled', 'in_progress', 'completed', 'withdrawn'] (default: 'enrolled')
- `origin`: enum ['self_enroll', 'admin_grant', 'auto_bundle'] (default: 'self_enroll')
- `enrolledAt`: Date (default: now)
- `lastAccessedAt`: Date? – Updated from progress events
- `completedAt`: Date?
- `certificateId`: ObjectId? – Reference once issued
- `notes`: string? – Admin notes (e.g., manual overrides)
- `settings`: object – Learner preferences (e.g., reminder opt-in)

**Validation Rules**:
- Unique compound index `(courseId, userId)` (only one enrollment per learner)
- `completedAt` requires `status='completed'`

**Relationships**:
- Many-to-one with `Course`
- Many-to-one with `User`
- One-to-one with `CourseProgress`
- One-to-one with `Certificate`

---

### CourseProgress
**Purpose**: Stores the learner's detailed progress state for dashboards and certificate eligibility.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `enrollmentId`: ObjectId (required, unique)
- `courseId`: ObjectId (required, indexed)
- `userId`: ObjectId (required, indexed)
- `completedLessonIds`: ObjectId[] – Lessons fully completed
- `incompleteLessonIds`: ObjectId[] – Snapshots for quick recalculation
- `currentLessonId`: ObjectId? – Last active lesson for resume
- `moduleProgress`: array of objects
  - `moduleId`: ObjectId
  - `completedWeight`: number
  - `totalWeight`: number
  - `percentage`: number (0-100)
- `percentageComplete`: number (0-100)
- `timeSpentSeconds`: number – Aggregated watch/reading time
- `streak`: object? – Rolling streak and last streak update
  - `currentCount`: number
  - `longestCount`: number
  - `lastUpdatedAt`: Date
- `quizAttempts`: array – Tracks quiz attempt history per lesson
  - `lessonId`: ObjectId
  - `attempts`: array of { `score`, `passed`, `attemptedAt` }
- `checkpoints`: array? – Progress snapshots for resume across devices
  - `lessonId`: ObjectId
  - `cursor`: string – e.g., timestamp or scroll position
- `lastUpdatedAt`: Date (default: now)

**Validation Rules**:
- `percentageComplete` must equal normalized weights from modules
- `completedLessonIds` subset of all lessons under the course
- `moduleProgress.percentage` between 0 and 100

**Relationships**:
- One-to-one with `CourseEnrollment`
- Many-to-one with `Course`
- Many-to-one with `User`

---

### CertificateProvider
**Purpose**: Configures certificate issuance strategies (Portfolio vs SBD).

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `key`: string (required, unique) – Identifier (e.g., `portfolio`, `sbd`)
- `displayName`: string (required)
- `type`: enum ['internal', 'sbd', 'external']
- `isActive`: boolean (default: true)
- `branding`: object – Logo URL, signature image, accent colors (reuses existing asset pipeline)
- `contact`: object – Support email/URL for verification
- `template`: object – Default layout metadata
  - `version`: number (default: 1)
  - `format`: enum ['landscape', 'portrait']
  - `primaryFont`: string
  - `backgroundAssetId`: ObjectId? (Lottie/image reference)
- `delivery`: object – Provider-specific configuration
  - `issueEndpoint`: string?
  - `apiKey`: string?
  - `webhookSecret`: string?
  - `verificationBaseUrl`: string?
- `metadata`: object – Additional provider notes (e.g., SBD credential mapping)
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `key` must be kebab-case
- SBD provider requires `issueEndpoint` and `apiKey`
- Internal provider cannot store plaintext secrets (will rely on env vars)

**Relationships**:
- One-to-many with `Certificate`

---

### Certificate
**Purpose**: Represents a credential granted upon course completion.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `courseId`: ObjectId (required, indexed)
- `userId`: ObjectId (required, indexed)
- `enrollmentId`: ObjectId (required, unique)
- `providerKey`: string (required) – References `CertificateProvider.key`
- `status`: enum ['pending', 'issued', 'failed', 'revoked'] (default: 'pending')
- `issuedAt`: Date?
- `certificateNumber`: string (unique, indexed) – Human-friendly identifier/QR payload
- `qrCodeUrl`: string? – Points to verification endpoint (reuses asset pipeline)
- `pdfUrl`: string? – Stored in existing asset storage (e.g., Cloudinary/S3)
- `pngUrl`: string? – Thumbnail/preview asset
- `sbdReferenceId`: string? – External ID if issued via SBD
- `verificationUrl`: string – Public verification endpoint
- `shareable`: object – Prebuilt social share metadata (title, description, ogImage)
- `downloadCount`: number (default: 0)
- `metadata`: object – Additional details (scoring, honors)
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `certificateNumber` generated via deterministic prefix (e.g., `RB-COURSE-YYYY-XXXX`)
- `status='issued'` requires both `pdfUrl` and `pngUrl`
- `revoked` certificates retain verification metadata but mark `shareable` as inactive

**Relationships**:
- Many-to-one with `Course`
- Many-to-one with `User`
- One-to-one with `CourseEnrollment`
- Many-to-one with `CertificateProvider`

---

### DashboardRecommendation (Derived Collection)
**Purpose**: Optional cached mapping for dashboard suggestions that combine blogs/books/courses.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `userId`: ObjectId? – Null for generic recommendations, set for personalized ones
- `context`: enum ['course', 'blog', 'book'] – Source of recommendation
- `sourceId`: string/ObjectId – Identifier of the triggering content
- `recommendations`: array of objects
  - `type`: enum ['course', 'blog', 'book']
  - `id`: string/ObjectId
  - `title`: string
  - `reason`: string – Display copy ("Continue learning", "Deep dive")
- `expiresAt`: Date – TTL for personalization cache
- `createdAt`: Date (default: now)

**Validation Rules**:
- TTL index on `expiresAt`
- Max 5 recommendations per entry

**Relationships**:
- Optional references to existing content libraries

---

### FlashcardDeck
**Purpose**: Curated flashcard experiences that can stand alone or attach to courses, modules, or lessons.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `slug`: string (required, unique, indexed)
- `title`: string (required)
- `subtitle`: string? – Optional marketing tagline
- `description`: string? – Rich description rendered on deck detail views
- `coverImage`: string? – Optional hero image leveraging existing asset pipeline
- `tags`: string[] – Reusable taxonomy shared with courses/books
- `categories`: string[] – Optional grouping for catalog filters
- `status`: enum ['draft', 'published', 'archived'] (default: 'draft')
- `visibility`: enum ['public', 'unlisted', 'private'] (default: 'public')
- `isFeatured`: boolean (default: false)
- `estimatedReviewMinutes`: number? – Rough study duration for catalog hints
- `cardCount`: number (derived) – Cached count of active cards
- `linkTargets`: array – Associations to learning content
  - `scope`: enum ['standalone', 'course', 'module', 'lesson']
  - `courseId`: ObjectId?
  - `moduleId`: ObjectId?
  - `lessonId`: ObjectId?
- `analytics`: object?
  - `reviewCount`: number
  - `uniqueLearners`: number
  - `averageRating`: number?
  - `lastReviewedAt`: Date?
- `createdBy`: ObjectId – Deck author/editor
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)
- `publishedAt`: Date?

**Validation Rules**:
- `slug` must be lowercase kebab-case
- `linkTargets` entries must include appropriate foreign keys for their scope (e.g., `moduleId` requires `courseId`)
- `cardCount` synchronized with active `FlashcardCard` documents via triggers/jobs

**Relationships**:
- One-to-many with `FlashcardCard`
- Optional many-to-many with `Course`, `CourseModule`, `CourseLesson`
- One-to-many with `FlashcardProgress` and `FlashcardStudySession`

---

### FlashcardCard
**Purpose**: Individual prompt/response unit within a deck.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `deckId`: ObjectId (required, indexed)
- `type`: enum ['basic', 'cloze', 'qa', 'image'] (default: 'basic')
- `prompt`: object – Front-of-card payload
  - `text`: string?
  - `richText`: string?
  - `media`: object? – { `lottieIds`: ObjectId[], `imageUrls`: string[], `audioUrl`: string? }
- `response`: object – Back-of-card payload (mirrors `prompt` shape)
- `hint`: string?
- `explanation`: string?
- `tags`: string[]
- `order`: number (required, indexed)
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- `deckId` must exist
- `order` must be sequential within the deck (enforced application-side)
- At least one of `prompt.text` or `prompt.richText` populated; same for response

**Relationships**:
- Many-to-one with `FlashcardDeck`

---

### FlashcardProgress
**Purpose**: Persistent spaced-repetition state per user/deck for adaptive scheduling and dashboard metrics.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `deckId`: ObjectId (required, indexed)
- `userId`: ObjectId (required, indexed)
- `courseId`: ObjectId?
- `moduleId`: ObjectId?
- `lessonId`: ObjectId?
- `stats`: object – Aggregated counters for quick dashboard reads
  - `totalCards`: number
  - `reviewedCards`: number
  - `matureCards`: number
  - `newCards`: number
  - `lapses`: number
  - `currentStreak`: number
  - `longestStreak`: number
- `cardStates`: array – SRS metadata per card
  - `cardId`: ObjectId
  - `dueAt`: Date
  - `intervalMinutes`: number
  - `easeFactor`: number
  - `lastReviewedAt`: Date?
  - `consecutiveCorrect`: number
  - `totalReviews`: number
- `createdAt`: Date (default: now)
- `updatedAt`: Date (default: now)

**Validation Rules**:
- Unique compound index `(deckId, userId)`
- `intervalMinutes` ≥ 0, `easeFactor` ≥ 1.0

**Relationships**:
- Many-to-one with `FlashcardDeck`
- Many-to-one with `User`
- Optional linkage to `Course`/`CourseModule`/`CourseLesson`

---

### FlashcardStudySession (Derived Collection)
**Purpose**: Time-bound review sessions for analytics, streaks, and coaching assistants.

**Fields**:
- `_id`: ObjectId (MongoDB primary key)
- `deckId`: ObjectId (required)
- `userId`: ObjectId (required)
- `courseId`: ObjectId?
- `moduleId`: ObjectId?
- `lessonId`: ObjectId?
- `startedAt`: Date (required)
- `completedAt`: Date?
- `entries`: array
  - `cardId`: ObjectId
  - `rating`: enum ['again', 'hard', 'good', 'easy']
  - `reviewedAt`: Date
  - `elapsedSeconds`: number?
  - `nextDueAt`: Date?

**Validation Rules**:
- Sessions require at least one entry when marked completed
- `nextDueAt` must be ≥ `reviewedAt`

**Relationships**:
- Many-to-one with `FlashcardDeck`
- Many-to-one with `User`
- Optional references to course/module/lesson for contextual analytics

---

## Data Relationships Diagram

```
Course
├── CourseModule (1:many)
│   └── CourseLesson (1:many)
│        └── CourseQuiz (optional 1:1)
│        └── FlashcardDeck (optional many:many)
├── CourseEnrollment (1:many)
│   └── CourseProgress (1:1)
│        └── Certificate (1:1 when issued)
└── Certificate (1:many)

FlashcardDeck
├── FlashcardCard (1:many)
├── FlashcardProgress (1:many)
└── FlashcardStudySession (1:many)

CourseLesson
├── BlogPost (many:1 via blogSlug, optional)
├── LottieAsset (many:many via assets.lottieIds)
└── CourseQuiz (optional 1:1)

Certificate
└── CertificateProvider (many:1)

CourseEnrollment
└── User (many:1)

Course
├── Recommended BlogPost (many:many via slugs)
└── Recommended Book (many:many via IDs)
```

---

## Index Strategy

- `Course.slug` – unique index for routing
- `Course.status` + `Course.categories` – compound index for catalog filters
- `CourseModule.courseId` + `CourseModule.order` – compound index for curriculum ordering
- `CourseLesson.courseId` + `CourseLesson.moduleId` + `CourseLesson.order` (virtual) – ensure deterministic ordering
- `CourseEnrollment.courseId`, `CourseEnrollment.userId` – compound unique index
- `CourseProgress.courseId` + `CourseProgress.userId` – supports dashboard queries
- `Certificate.certificateNumber` – unique index for verification
- TTL index on `DashboardRecommendation.expiresAt`
- `FlashcardDeck.slug` – unique index for routing and admin lookups
- `FlashcardDeck.status` + `FlashcardDeck.visibility` – compound index powering catalog filters
- `FlashcardCard.deckId` + `FlashcardCard.order` – compound index enforcing deterministic ordering
- `FlashcardProgress.deckId` + `FlashcardProgress.userId` – unique compound index per learner/deck
- Optional TTL index on `FlashcardStudySession.completedAt` for pruning raw session logs after analytics backfill

---

## State Transitions

### Course Lifecycle
```
draft → published → archived
   ↓         ↓
 published ← draft (downgrade if curriculum invalid)
```

### Enrollment Lifecycle
```
enrolled → in_progress → completed
    ↓            ↓
 withdrawn ← in_progress
```

### Certificate Lifecycle
```
pending → issued
   ↓        ↓
 failed ← issued → revoked
```

---

## Data Validation & Integrity

- Curriculum updates increment `structureVersion` and trigger recalculation of derived fields (`lessonCount`, module ordering caches).
- Publishing guard rails:
  - Course must have ≥1 module and ≥1 lesson.
  - ≤20% of lessons may be temporarily unavailable (fallback mode) before publication is blocked.
  - All quizzes linked in the curriculum must have at least one question when the lesson is marked required.
- Progress recalculation is idempotent: background jobs audit `CourseProgress` whenever lessons are added/removed.
- Certificates are issued inside a transaction: complete progress → create certificate (pending) → render assets → mark issued → update enrollment → enqueue notifications.
- Dashboard aggregates rely on server-side projections; stale personalized recommendations are trimmed via TTL.

---

The data model supports reuse of existing content pipelines while adding the necessary structures for curriculum management, learner progress, and multi-provider certificate issuance.
