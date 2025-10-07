# Nested Decks & Spaced Repetition - Implementation Complete

## Overview

This document summarizes the complete implementation of nested flashcard decks, SM-2 spaced repetition, bulk operations, and GitHub sync features for the flashcards system.

## ✅ Completed Tasks

### T001: Feature Flag Setup ✓
- Added `FEATURE_NESTED_DECKS`, `FEATURE_GITHUB_SYNC`, `FEATURE_BULK_OPERATIONS` to `.env.example`
- Integrated with existing feature flag service in `src/lib/env.ts` and `src/lib/feature-flags.ts`
- Added helper functions: `hasNestedDecks()`, `hasGithubSync()`, `hasBulkOperations()`

### T003-T004: Data Models ✓
**FlashcardDeck** (`src/models/FlashcardDeck.ts`):
- Added `parentDeckId` (ObjectId ref to self, nullable)
- Added `path` (string, indexed) - computed path like "parent/child/grandchild"
- Added `level` (number 0-6) - depth in hierarchy
- Added `dueCount` (number) - cards due for review
- Pre-save hook auto-computes `path` and `level` from `parentDeckId`

**FlashcardCard** (`src/models/FlashcardCard.ts`):
- Added `scheduling` subdocument:
  - `intervalDays` (number) - days until next review
  - `easeFactor` (number, default 2.5) - SM-2 ease factor
  - `repetitions` (number) - successful review count
  - `lastReviewedAt` (Date, nullable)
  - `nextReviewAt` (Date) - when card is due
- Index on `scheduling.nextReviewAt` for efficient queries

**New Models**:
- `RepoSyncConfig` - GitHub repository sync configuration
- `BulkOperationRecord` - Track bulk import/export operations

### T006: Deck API Endpoints ✓
**GET `/api/admin/flashcards`** (`src/app/api/admin/flashcards/route.ts`):
- Added `?tree=true` query parameter
- Returns hierarchical tree structure when tree mode enabled
- Uses `buildDeckTree()` utility from `src/lib/decks/tree.ts`

**POST `/api/admin/flashcards`**:
- Accepts optional `parentDeckId` in request body
- Validates parent exists and depth limit (max 6 levels)
- Pre-save hook auto-computes `path` and `level`

**PUT `/api/admin/flashcards/[deckId]`** (`src/app/api/admin/flashcards/[deckId]/route.ts`):
- Accepts `parentDeckId` changes to move decks
- Validates moves with `validateDeckMove()` to prevent cycles
- Checks depth limits before allowing moves
- Pre-save hook updates descendants when path changes

### T007: Bulk Import ✓
**POST `/api/admin/flashcards/[deckId]/cards/bulk`** (`src/app/api/admin/flashcards/[deckId]/cards/bulk/route.ts`):
- Accepts multipart file upload
- Supports formats: Markdown (.md), JSON (.json), CSV (.csv), YAML (.yaml/.yml)
- Parser utility: `src/lib/flashcards/bulk-import.ts`
- Creates `BulkOperationRecord` to track progress
- Returns operation stats: totalCards, succeeded, failed, errors

**Format Examples**:

Markdown:
```markdown
---
title: My Deck
---
## Card 1
Q: What is TypeScript?
A: A typed superset of JavaScript
Tags: typescript, programming
---
## Card 2
Q: What is Next.js?
A: A React framework
```

JSON:
```json
{
  "cards": [
    {
      "prompt": { "text": "Question?" },
      "response": { "text": "Answer" },
      "tags": ["tag1"]
    }
  ]
}
```

CSV:
```csv
question,answer,hint,explanation,tags
What is X?,X is Y,,,tag1;tag2
```

### T008: SM-2 Spaced Repetition ✓
**Scheduler** (`src/lib/scheduler/sm2.ts`):
- `calculateNextReview(currentSchedule, easeLevel)` - SM-2 algorithm
- `initializeScheduling()` - default scheduling for new cards
- `isCardDue(scheduling)` - check if card needs review
- Supports ease levels: 'again', 'hard', 'good', 'easy'
- Configurable parameters (ease factor 2.5, intervals)

**Review API** (`src/app/api/flashcards/review/route.ts`):
- POST endpoint accepts `cardId` and `easeLevel`
- Updates card scheduling using SM-2
- Recalculates deck `dueCount` after review
- Returns updated card with new scheduling

### T006 (partial): Tree Utilities ✓
**Deck Hierarchy** (`src/lib/decks/tree.ts`):
- `buildDeckTree(decks)` - convert flat list to hierarchical tree
- `getDescendantDeckIds(deckId)` - find all children recursively
- `validateDeckMove(deckId, newParentId)` - prevent cycles and depth violations
- `updateDeckHierarchy(deckId)` - recalculate paths for descendants
- `getDeckBreadcrumbs(deckId)` - build navigation trail

### T002: Contract Tests ✓
**Test Suite** (`specs/013-add-a-nested/tests/contracts/flashcards-api.test.ts`):
- Contract tests for all API endpoints
- Validates request/response schemas
- Tests nested deck operations
- Tests bulk import functionality
- Tests spaced repetition review flow
- Data model validation tests

### T005: Migration Script ✓
**Migration** (`migrations/2025-10-07-add-nested-decks.ts`):
- Adds nested fields to existing decks (parentDeckId=null, path=slug, level=0, dueCount=0)
- Adds scheduling to existing cards (uses initializeScheduling defaults)
- Batch processing (1000 records at a time)
- Supports `--dry-run` flag for safety
- Verification step to ensure migration success
- Rollback capability with `--rollback` flag

**Usage**:
```bash
# Dry run (no changes)
ts-node migrations/2025-10-07-add-nested-decks.ts --dry-run

# Execute migration
ts-node migrations/2025-10-07-add-nested-decks.ts

# Rollback (emergency only)
ts-node migrations/2025-10-07-add-nested-decks.ts --rollback
```

### T009: Feature Flag Service ✓
- Integrated with existing `src/lib/feature-flags.ts`
- Added to `src/lib/env.ts` advanced features
- Helper functions for nested decks, GitHub sync, bulk operations
- Environment variable based flags with rollout support

## 🎯 Key Features

### 1. Nested Deck Hierarchy
- **Max Depth**: 6 levels
- **Path Tracking**: Automatic path computation (e.g., "parent/child/grandchild")
- **Cycle Prevention**: Validates moves to prevent circular references
- **Breadcrumb Navigation**: `getDeckBreadcrumbs()` for UI navigation
- **Tree View**: API returns hierarchical structure with `?tree=true`

### 2. SM-2 Spaced Repetition
- **Algorithm**: Classic SM-2 with ease factor 2.5
- **Review Intervals**: 1 day → 3 days → 6 days → 13 days → ...
- **Ease Adjustments**: 
  - Again: EF -= 0.2, interval = 1 day
  - Hard: EF -= 0.15, interval *= 1.2
  - Good: EF unchanged, interval *= EF
  - Easy: EF += 0.15, interval *= EF * 1.3
- **Due Cards**: Indexed query on `scheduling.nextReviewAt`

### 3. Bulk Operations
- **Formats**: Markdown, JSON, CSV, YAML
- **Progress Tracking**: `BulkOperationRecord` model
- **Error Handling**: Continues on individual card failures
- **Status**: pending → running → completed/failed

### 4. GitHub Sync (Models Ready)
- **RepoSyncConfig** model created
- **Pattern**: Single canonical "flashcards" repo per org
- **Sync Direction**: Pull-only or push-pull
- **Path Mapping**: Deck ID to repo file path
- Service implementation pending (T010)

## 📁 File Structure

```
src/
├── models/
│   ├── FlashcardDeck.ts          # Extended with nested fields
│   ├── FlashcardCard.ts          # Extended with scheduling
│   ├── RepoSyncConfig.ts         # New: GitHub sync config
│   └── BulkOperationRecord.ts    # New: Bulk op tracking
├── lib/
│   ├── scheduler/
│   │   └── sm2.ts                # SM-2 algorithm
│   ├── decks/
│   │   └── tree.ts               # Hierarchy utilities
│   ├── flashcards/
│   │   └── bulk-import.ts        # Multi-format parser
│   ├── feature-flags.ts          # Feature flag service
│   └── env.ts                    # Environment config
└── app/api/
    ├── admin/flashcards/
    │   ├── route.ts              # GET (tree), POST (parentDeckId)
    │   ├── [deckId]/
    │   │   ├── route.ts          # PUT (move), DELETE
    │   │   └── cards/
    │   │       └── bulk/
    │   │           └── route.ts  # POST (bulk import)
    └── flashcards/
        └── review/
            └── route.ts          # POST (record review)

migrations/
└── 2025-10-07-add-nested-decks.ts  # Data migration

specs/013-add-a-nested/
├── spec.md                       # Feature specification
├── plan.md                       # Implementation plan
├── research.md                   # Design decisions
├── data-model.md                 # Entity definitions
├── quickstart.md                 # E2E validation steps
├── tasks.md                      # Task breakdown
└── tests/
    └── contracts/
        └── flashcards-api.test.ts  # Contract tests
```

## 🚀 API Usage Examples

### Create Nested Deck
```javascript
POST /api/admin/flashcards
{
  "title": "Advanced TypeScript",
  "description": "Advanced topics",
  "category": "programming",
  "parentDeckId": "parent-deck-id"  // Optional
}

Response:
{
  "deck": {
    "_id": "new-deck-id",
    "title": "Advanced TypeScript",
    "slug": "advanced-typescript",
    "parentDeckId": "parent-deck-id",
    "path": "typescript/advanced-typescript",  // Auto-computed
    "level": 1,                                 // Auto-computed
    "dueCount": 0,
    "cardCount": 0
  }
}
```

### Get Deck Tree
```javascript
GET /api/admin/flashcards?tree=true

Response:
{
  "decks": [
    {
      "_id": "root-deck",
      "title": "TypeScript",
      "path": "typescript",
      "level": 0,
      "children": [
        {
          "_id": "child-deck",
          "title": "Advanced TypeScript",
          "path": "typescript/advanced-typescript",
          "level": 1,
          "children": []
        }
      ]
    }
  ],
  "treeMode": true
}
```

### Move Deck
```javascript
PUT /api/admin/flashcards/deck-id
{
  "parentDeckId": "new-parent-id"  // Or null for root
}

// Validates: no cycles, depth <= 6
// Updates: path, level, and all descendants
```

### Bulk Import
```javascript
POST /api/admin/flashcards/deck-id/cards/bulk
Content-Type: multipart/form-data

file: [markdown/json/csv/yaml file]

Response:
{
  "operationId": "op-12345",
  "totalCards": 50,
  "succeeded": 48,
  "failed": 2,
  "errors": [
    "Card 15: Invalid format",
    "Card 32: Missing required field"
  ]
}
```

### Record Review
```javascript
POST /api/flashcards/review
{
  "cardId": "card-123",
  "easeLevel": "good"  // again | hard | good | easy
}

Response:
{
  "card": {
    "_id": "card-123",
    "scheduling": {
      "intervalDays": 3,
      "easeFactor": 2.5,
      "repetitions": 1,
      "lastReviewedAt": "2025-10-07T10:30:00Z",
      "nextReviewAt": "2025-10-10T10:30:00Z"
    }
  }
}
```

## 🔧 Environment Variables

```bash
# Feature Flags (default: false)
FEATURE_NESTED_DECKS=false
FEATURE_GITHUB_SYNC=false
FEATURE_BULK_OPERATIONS=false

# Progressive Rollout
ROLLOUT_PERCENTAGE=0              # 0-100
ROLLOUT_ADMIN_USERS=user1@example.com,user2@example.com
```

## ⚠️ Important Notes

### Backward Compatibility
- All features are backward compatible
- Existing decks work without nested fields (defaults: parentDeckId=null, level=0)
- Existing cards work without scheduling (default initialization on first access)
- Run migration script before enabling features in production

### Performance Considerations
- Indexed fields: `path`, `level`, `scheduling.nextReviewAt`
- Tree queries optimized with path-based filtering
- Batch processing for bulk operations (1000 records/batch)
- Lazy-load descendant decks in tree view

### Validation Rules
- **Max Depth**: 6 levels (configurable in tree utilities)
- **Path Format**: slug-based, computed automatically
- **Cycle Detection**: Validates before any move operation
- **Ease Factor Range**: 1.3 - 2.5 (SM-2 standard)

## 📋 Remaining Tasks

### T010: GitHub Sync Service
- Pull service to sync from "flashcards" repo
- OAuth/PAT authentication
- Conflict resolution (last-writer-wins)
- Webhook integration for auto-sync

### T011-T012: UI Components
- Deck hierarchy tree view component
- Drag-and-drop deck reorganization
- Ease buttons in FlashcardReviewer
- Review progress indicators

### T013: Export/Import V2
- Export format with nested structure
- Import with hierarchy preservation
- Scheduling data inclusion

### T014-T018: Production Readiness
- Monitoring & observability
- QA test suite expansion
- Documentation completion
- Performance benchmarks
- Rollout runbook

## 🎉 Summary

**Status**: Core implementation complete (Tasks T001-T009 done)

**Ready for**:
- ✅ Local testing with feature flags
- ✅ Running migration on staging
- ✅ Creating nested decks via API
- ✅ Bulk importing flashcards
- ✅ Recording reviews with SM-2 scheduling
- ✅ Moving decks in hierarchy

**Next Steps**:
1. Enable feature flags in staging environment
2. Run migration script (with --dry-run first)
3. Test nested deck creation and navigation
4. Test bulk import with sample files
5. Test review flow with scheduling updates
6. Begin UI component development (T011-T012)
7. Implement GitHub sync service (T010)

**Production Deployment Checklist**:
- [ ] Migration tested on staging
- [ ] Feature flags verified working
- [ ] Contract tests passing
- [ ] Performance benchmarks acceptable
- [ ] Monitoring/alerting configured
- [ ] Rollback procedure documented
- [ ] Gradual rollout plan (0% → 10% → 50% → 100%)
