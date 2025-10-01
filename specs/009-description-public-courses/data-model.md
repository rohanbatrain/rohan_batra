# Data Model: Public Courses pages

Date: 2025-10-01

## Entities

### Course (read-only for public pages)
- id
- slug (unique)
- title
- subtitle
- summary
- heroImage (url or asset reference)
- difficulty (beginner | intermediate | advanced)
- categories (string[])
- tags (string[])
- estimatedDurationMinutes (number)
- lessonCount (number)
- status (expected: published)
- visibility (expected: public)
- seo (optional: title, description, image)
- updatedAt

### Module (read-only)
- id
- title
- order (number)
- summary (optional)
- estimatedDurationMinutes (optional)
- lessons (Lesson[])

### Lesson (read-only)
- id
- title
- contentType (blog | standalone | video | quiz | flashcards | other)
- estimatedMinutes (optional)
- isPreviewable (boolean)
- blogSlug (optional; required for blog preview link)

## Relationships
- Course has many Modules
- Module has many Lessons

## Validation & Display Rules
- Only show courses where status === "published" AND visibility === "public".
- On index cards, trim long titles/subtitles and cap visible tags (2–4).
- On detail, mark previewable lessons with a badge; provide link for blog content; for others, show informational message.
- Fallback hero image when missing.
