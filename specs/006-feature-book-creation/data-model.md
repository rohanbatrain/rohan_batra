# Data Model: Book Creation System

## Entities

### Book
- id
- title (required)
- subtitle
- author (string | user_id)
- language (required)
- status: draft | in-progress | completed | published (required)
- visibility: private | public | unlisted (required)
- synopsis (text)
- coverImage, backCoverImage (url)
- seriesName, seriesOrder (int)
- edition (string)
- genres: [string]
- tags: [string]
- isbn (string)
- publisher (string)
- publicationDate (date)
- license (string)
- slug (unique among active)
- seoTitle, seoDescription
- translationKey (string)
- analyticsEnabled (boolean)
- deletedAt, deletedBy
- createdAt, updatedAt, publishedAt

Relationships:
- hasMany Chapters
- many-to-many Characters (via BookCharacter link with role)

### Chapter
- id
- bookId (required)
- title (required)
- slug (unique among active)
- order (int, default 0)
- status: draft | published | archived (required)
- visibility: private | public (required)
- content (rich html/text)
- storyDate (date, optional; date-only or ISO)
- wordCount (int, computed)
- seoTitle, seoDescription
- translationKey (string)
- referencedCharacters: [characterId]
- deletedAt, deletedBy
- createdAt, updatedAt, publishedAt

### BookCharacter (link)
- id
- bookId
- characterId
- role: protagonist | antagonist | supporting | cameo | other
- notes
- createdAt, updatedAt

## Validation Rules
- Unique slugs for non-deleted Books/Chapters
- Title min length 1
- Status and visibility enums enforced
- storyDate accepts YYYY-MM-DD or ISO datetime, normalized to UTC midnight for date-only

## State Transitions
- Book.status: draft → in-progress → completed → published; backward transitions allowed by admin
- Chapter.status: draft ↔ published ↔ archived
- Visibility toggles independent of status (public/private)

## Indexing
- Book: slug unique (partial on deletedAt), language, status, visibility, seriesName, genres, tags
- Chapter: bookId, order, status, visibility, publishedAt, storyDate

## Derived Fields
- Chapter.wordCount computed on save/update
- Book.publishedAt set when status becomes published (if unset)
