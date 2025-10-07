# data-model.md

This document extracts entities and fields from the feature spec and research decisions.

## Entities

### Deck
Purpose: Container for flashcards, supports nesting.

Fields:
- id: ObjectId
- slug: string (unique)
- title: string
- parentDeckId: ObjectId | null
- path: string (computed: e.g., root/parent/child)
- level: number (computed depth)
- cardCount: number
- dueCount: number
- metadata: { createdAt, updatedAt, version }
- visibility, status, tags, categories (reuse existing fields)

Indexes:
- slug (unique)
- parentDeckId
- path (text or prefix search for quick subtree queries)

Validation:
- title: min 3, max 200
- level: >=0 and <=6 (configurable)

### Card
Purpose: Individual flashcard.

Fields:
- id: ObjectId
- deckId: ObjectId (required)
- type: enum ['basic','cloze','qa','image']
- prompt: { text, richText, media }
- response: { text, richText, media }
- tags: string[]
- order: number
- scheduling: {
  intervalDays: number,
  easeFactor: number,
  repetitions: number,
  lastReviewedAt: Date | null,
  nextReviewAt: Date | null
 }
- createdAt, updatedAt

Indexes:
- deckId
- order
- nextReviewAt (for due queries)

Validation:
- deckId must exist
- order >= 0

### DeckMigrationRecord
- id, sourceDeckId, targetDeckId, performedBy, performedAt, status, notes

### RepoSyncConfig
- id, ownerId, repoUrl, branch, pathMapping (deckId -> path), syncDirection, lastSyncedAt, status, authType, webhookEnabled

### BulkOperationRecord
- id, initiatedBy, deckId, operationType, totalItems, succeeded, failed, startedAt, finishedAt, errorSummary

## Data migration notes
- Add `parentDeckId`, `path`, and `level` to Deck schema; defaults: parentDeckId=null, path=slug, level=0
- Update Card schema to include `scheduling` if missing; existing cards default to scheduling: { intervalDays: 0, easeFactor: 2.5, repetitions: 0 }
- Migration approach: two-step
  1. Schema migration: add fields nullable with defaults
  2. Data migration: batch compute path and level, migrate cards (preserve scheduling)

## API surface (high-level)
- GET /api/flashcards/decks -> returns deck tree or flat list with optional ?tree=true
- POST /api/admin/flashcards -> create deck (supports parentDeckId)
- PUT /api/admin/flashcards/:deckId -> update deck (including reparent)
- POST /api/admin/flashcards/:deckId/cards/bulk -> bulk create/import cards
- POST /api/admin/flashcards/:deckId/sync -> trigger GitHub sync (admin protected)
- GET /api/flashcards/:deckId/export -> export deck with format version

