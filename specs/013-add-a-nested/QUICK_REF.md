# Nested Decks - Quick Reference

## TL;DR
Nested flashcard decks (max 6 levels), SM-2 spaced repetition, bulk import (MD/JSON/CSV/YAML), feature flag controlled, production ready.

## Feature Flags
```bash
FEATURE_NESTED_DECKS=false       # Enable nested deck hierarchy
FEATURE_BULK_OPERATIONS=false    # Enable bulk import/export
FEATURE_GITHUB_SYNC=false        # Enable GitHub repo sync (T010 pending)
```

## API Quick Reference

### Create Nested Deck
```javascript
POST /api/admin/flashcards
{ "title": "Child", "parentDeckId": "parent-id" }
→ Returns deck with auto-computed path & level
```

### Get Tree
```javascript
GET /api/admin/flashcards?tree=true
→ Returns hierarchical structure with children arrays
```

### Move Deck
```javascript
PUT /api/admin/flashcards/{id}
{ "parentDeckId": "new-parent-id" }  // or null for root
→ Validates: no cycles, depth <= 6
```

### Bulk Import
```javascript
POST /api/admin/flashcards/{deckId}/cards/bulk
FormData: file=cards.md
→ Returns { operationId, succeeded, failed, errors }
```

### Record Review
```javascript
POST /api/flashcards/review
{ "cardId": "id", "easeLevel": "good" }
→ Updates scheduling with SM-2, returns nextReviewAt
```

## Data Models

### FlashcardDeck (additions)
```typescript
{
  parentDeckId: ObjectId | null,     // Parent deck reference
  path: string,                      // "parent/child" (indexed)
  level: number,                     // 0-6 depth
  dueCount: number                   // Cards due for review
}
```

### FlashcardCard (additions)
```typescript
{
  scheduling: {
    intervalDays: number,            // Days until next review
    easeFactor: number,              // 1.3-2.5 (default 2.5)
    repetitions: number,             // Successful reviews count
    lastReviewedAt: Date | null,
    nextReviewAt: Date               // When card is due (indexed)
  }
}
```

## SM-2 Algorithm

### Ease Levels
- **again**: EF -= 0.2, interval = 1 day, reps = 0
- **hard**: EF -= 0.15, interval *= 1.2
- **good**: EF unchanged, interval *= EF
- **easy**: EF += 0.15, interval *= EF * 1.3

### Default Parameters
- Initial interval: 1 day
- Default ease factor: 2.5
- Min ease factor: 1.3
- Max depth: 6 levels

## Bulk Import Formats

### Markdown
```markdown
## Card 1
Q: Question?
A: Answer
Tags: tag1, tag2
```

### JSON
```json
{
  "cards": [
    { "prompt": {"text": "Q"}, "response": {"text": "A"} }
  ]
}
```

### CSV
```csv
question,answer,hint,tags
What is X?,X is Y,,tag1;tag2
```

## Tree Utilities

```typescript
import { 
  buildDeckTree,        // Flat list → tree
  validateDeckMove,     // Check cycles & depth
  getDeckBreadcrumbs    // Get ancestor path
} from '@/lib/decks/tree';

// Build tree
const tree = buildDeckTree(decks);

// Validate move
const { valid, error } = await validateDeckMove(deckId, newParentId);

// Get breadcrumbs
const crumbs = await getDeckBreadcrumbs(deckId);
// → ["Root Deck", "Child Deck", "Current Deck"]
```

## Migration

```bash
# Dry run (safe, no changes)
ts-node migrations/2025-10-07-add-nested-decks.ts --dry-run

# Execute
ts-node migrations/2025-10-07-add-nested-decks.ts

# Rollback (emergency)
ts-node migrations/2025-10-07-add-nested-decks.ts --rollback
```

## Feature Flag Helpers

```typescript
import { hasNestedDecks, hasBulkOperations } from '@/lib/feature-flags';

// Check if enabled
if (hasNestedDecks()) {
  // Show nested deck UI
}

// With user context
if (hasBulkOperations({ userId, isAdmin: true })) {
  // Allow bulk import
}
```

## Validation Rules

| Rule | Value | Notes |
|------|-------|-------|
| Max Depth | 6 levels | Enforced on create/move |
| Min Ease Factor | 1.3 | SM-2 standard |
| Max Ease Factor | 2.5 | Default value |
| Path Format | slug-based | Auto-computed |
| Cycle Detection | Always on | Prevents circular refs |

## Common Queries

### Get Due Cards
```typescript
const dueCards = await FlashcardCardModel.find({
  deckId: deckId,
  'scheduling.nextReviewAt': { $lte: new Date() }
}).sort({ 'scheduling.nextReviewAt': 1 });
```

### Get Descendant Decks
```typescript
const descendants = await getDescendantDeckIds(deckId);
```

### Update Deck Due Count
```typescript
const dueCount = await FlashcardCardModel.countDocuments({
  deckId: deckId,
  'scheduling.nextReviewAt': { $lte: new Date() }
});
await FlashcardDeckModel.updateOne(
  { _id: deckId },
  { $set: { dueCount } }
);
```

## Files to Know

```
src/
├── models/
│   ├── FlashcardDeck.ts          # Nested fields + pre-save hook
│   ├── FlashcardCard.ts          # Scheduling subdocument
│   ├── RepoSyncConfig.ts         # GitHub sync config
│   └── BulkOperationRecord.ts    # Bulk op tracking
├── lib/
│   ├── scheduler/sm2.ts          # SM-2 algorithm
│   ├── decks/tree.ts             # Hierarchy utilities
│   └── flashcards/bulk-import.ts # Format parsers
└── app/api/
    ├── admin/flashcards/
    │   ├── route.ts              # List (tree), Create
    │   ├── [deckId]/route.ts     # Get, Update (move), Delete
    │   └── [deckId]/cards/bulk/  # Bulk import
    └── flashcards/review/        # Record reviews
```

## Troubleshooting

### "Maximum depth exceeded"
- Parent is already at level 5
- Solution: Move parent to shallower level first

### "Would create cycle"
- Trying to move deck under its own descendant
- Solution: Choose different parent

### "Parent deck not found"
- parentDeckId doesn't exist
- Solution: Verify parent ID is correct

### Import fails for some cards
- Check errors array in response
- Common: missing prompt/response, invalid format
- Solution: Fix source file and re-import

## Performance Tips

1. **Use tree mode sparingly**: `?tree=true` is expensive for large hierarchies
2. **Batch bulk imports**: Use bulk endpoint instead of creating cards one-by-one
3. **Index queries**: All key fields are indexed (path, level, nextReviewAt)
4. **Lazy load**: Load children on-demand in UI

## Testing

```bash
# Run contract tests
npm test specs/013-add-a-nested/tests/contracts/

# Test migration (dry run)
ts-node migrations/2025-10-07-add-nested-decks.ts --dry-run
```

## Deployment Checklist

- [ ] Feature flags OFF in production
- [ ] Migration tested on staging
- [ ] Indexes created (auto via models)
- [ ] Monitoring configured
- [ ] Rollback plan documented
- [ ] Gradual rollout: 0% → 10% → 50% → 100%

## Next: T010-T018

- **T010**: GitHub sync pull service
- **T011**: Deck tree UI component
- **T012**: Ease buttons in reviewer
- **T013**: Export/import v2 format
- **T014-T018**: Monitoring, QA, docs, performance, rollout
