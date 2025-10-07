# Nested Flashcard Decks - User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Creating Nested Decks](#creating-nested-decks)
4. [Spaced Repetition](#spaced-repetition)
5. [Bulk Import](#bulk-import)
6. [Export/Import](#exportimport)
7. [GitHub Sync](#github-sync)
8. [FAQ](#faq)

## Introduction

The nested decks feature allows you to organize flashcards in a hierarchical structure, similar to folders. Combined with SM-2 spaced repetition, you can efficiently learn and retain information.

### Key Features
- **Nested Organization**: Up to 6 levels of deck nesting
- **Spaced Repetition**: SM-2 algorithm for optimal learning
- **Bulk Import**: Import from Markdown, JSON, CSV, or YAML
- **Export/Import V2**: Preserve hierarchy and scheduling
- **GitHub Sync**: Collaborate via GitHub repositories (optional)

## Getting Started

### Prerequisites
- Account with editor or admin permissions
- Feature flag enabled: `FEATURE_NESTED_DECKS=true`

### Basic Concepts

**Deck**: A container for flashcards
- Can contain cards and/or child decks
- Has a title, description, tags
- Tracks due card count

**Card**: Individual flashcard
- Has prompt (question) and response (answer)
- Optional hint and explanation
- Tracks review schedule

**Path**: Auto-computed location in hierarchy
- Format: `parent/child/grandchild`
- Used for navigation and queries

## Creating Nested Decks

### Via UI

1. Navigate to Flashcards section
2. Click "Create Deck"
3. Fill in details:
   - Title (required)
   - Description (optional)
   - Parent Deck (optional - select to nest)
4. Click "Create"

### Via API

```bash
# Create root deck
curl -X POST /api/admin/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Programming",
    "description": "Programming concepts",
    "category": "education"
  }'

# Create child deck
curl -X POST /api/admin/flashcards \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "TypeScript",
    "description": "TypeScript topics",
    "category": "education",
    "parentDeckId": "parent-deck-id-here"
  }'
```

### Moving Decks

You can reorganize your hierarchy by moving decks:

```bash
curl -X PUT /api/admin/flashcards/deck-id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parentDeckId": "new-parent-id"
  }'

# Or move to root level
curl -X PUT /api/admin/flashcards/deck-id \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parentDeckId": null
  }'
```

**Constraints**:
- Maximum 6 levels of nesting
- Cannot create circular references
- Parent must exist before creating child

## Spaced Repetition

### How It Works

The system uses the SM-2 algorithm to schedule card reviews:

1. **New cards** start with 1-day interval
2. **Review** the card when due
3. **Rate** your recall:
   - **Again** (1): Didn't remember → 1 day
   - **Hard** (2): Struggled → shorter interval
   - **Good** (3): Remembered → standard interval
   - **Easy** (4): Easy recall → longer interval
4. System calculates next review date

### Review Session

```typescript
// Get due cards for a deck
const dueCards = await fetch('/api/flashcards/due?deckId=deck-id')
  .then(res => res.json());

// Record review
await fetch('/api/flashcards/review', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    cardId: 'card-id',
    easeLevel: 'good' // again | hard | good | easy
  })
});
```

### Keyboard Shortcuts

During review:
- **1**: Again
- **2**: Hard
- **3**: Good
- **4**: Easy

### Review Intervals

Example progression with "good" responses:
- Day 1: Review new card
- Day 2: Review again (1 → 3 days)
- Day 5: Review again (3 → 7 days)
- Day 12: Review again (7 → 18 days)
- And so on...

## Bulk Import

### Supported Formats

#### Markdown (.md)

```markdown
---
title: My Deck
description: Deck description
tags: [programming, typescript]
---

## Card 1
Q: What is TypeScript?
A: A typed superset of JavaScript
Hint: Think about types
Tags: typescript, basics

---

## Card 2
Q: What is Next.js?
A: A React framework
```

#### JSON (.json)

```json
{
  "cards": [
    {
      "prompt": { "text": "What is TypeScript?" },
      "response": { "text": "A typed superset of JavaScript" },
      "hint": "Think about types",
      "tags": ["typescript", "basics"]
    },
    {
      "prompt": { "text": "What is Next.js?" },
      "response": { "text": "A React framework" }
    }
  ]
}
```

#### CSV (.csv)

```csv
question,answer,hint,explanation,tags
What is TypeScript?,A typed superset of JavaScript,Think about types,,typescript;basics
What is Next.js?,A React framework,,,react;framework
```

#### YAML (.yaml)

```yaml
cards:
  - prompt:
      text: "What is TypeScript?"
    response:
      text: "A typed superset of JavaScript"
    hint: "Think about types"
    tags: ["typescript", "basics"]
  - prompt:
      text: "What is Next.js?"
    response:
      text: "A React framework"
```

### Import via API

```bash
curl -X POST /api/admin/flashcards/deck-id/cards/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@flashcards.md"
```

Response:
```json
{
  "operationId": "op-12345",
  "totalCards": 50,
  "succeeded": 48,
  "failed": 2,
  "errors": [
    "Card 15: Missing response field"
  ]
}
```

## Export/Import

### Export Format V2

Version 2 format preserves:
- Deck hierarchy (nested structure)
- Scheduling data (review intervals)
- All card metadata

### Export Decks

```bash
# Export all decks
curl -X POST /api/admin/flashcards/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' \
  > export.json

# Export specific deck with children
curl -X POST /api/admin/flashcards/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckId": "deck-id"}' \
  > export.json

# Export multiple decks
curl -X POST /api/admin/flashcards/export \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckIds": ["id1", "id2"]}' \
  > export.json
```

### Import Decks

```bash
curl -X POST /api/admin/flashcards/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@export.json" \
  -F 'options={"mergeStrategy":"skip","preserveScheduling":true}'
```

**Options**:
- `mergeStrategy`: 
  - `skip` (default): Skip existing decks
  - `overwrite`: Replace existing decks
  - `duplicate`: Create copies with new slugs
- `preserveScheduling`: 
  - `true`: Keep review schedules
  - `false` (default): Reset to new cards

## GitHub Sync

### Setup

1. Create a GitHub repository named "flashcards"
2. Add decks as Markdown files in `/decks/` folder
3. Configure sync in UI or via API

### Sync Configuration

```bash
curl -X POST /api/admin/flashcards/github/sync \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "repoUrl": "https://github.com/username/flashcards",
    "branch": "main",
    "token": "github-token",
    "syncDirection": "pull-only"
  }'
```

**Sync Directions**:
- `pull-only`: Only pull from GitHub (read-only)
- `push-pull`: Bi-directional sync

### Repository Structure

```
flashcards/
├── README.md
└── decks/
    ├── programming.md
    ├── typescript.md
    └── react.md
```

### Collaboration

1. Team members edit deck files in GitHub
2. Commit changes
3. Trigger sync (manual or webhook)
4. Changes pulled into application

## FAQ

### How many levels can I nest?

Maximum 6 levels. This prevents overly complex hierarchies and maintains performance.

### Can I move a deck with children?

Yes! When you move a deck, all its children move with it. The system automatically updates paths and levels.

### What happens if I move a deck that would exceed 6 levels?

The move will be rejected with an error message. You'll need to restructure the hierarchy first.

### Can I review cards from child decks?

Yes, you can review:
- Cards in the current deck only
- Cards in current deck + all descendant decks

### What if I accidentally delete a deck?

Currently, deletion is permanent. Consider exporting decks regularly as backups.

### How do I reset a card's schedule?

You can:
1. Mark it as "Again" during review (resets to 1 day)
2. Delete and re-import the card
3. Use the API to update scheduling directly

### Can I import cards without losing my review progress?

Yes! Use `preserveScheduling: true` when importing. The system will match cards by prompt text and preserve their schedules.

### What's the difference between V1 and V2 export format?

**V1** (old):
- Flat list of decks
- No hierarchy
- No scheduling data

**V2** (new):
- Nested structure
- Preserves parent-child relationships
- Includes scheduling data
- Recommended for all exports

### How does GitHub sync handle conflicts?

Uses "last-writer-wins" strategy:
- Pull sync: GitHub version always wins
- Push sync: Local version overwrites GitHub
- No automatic merging of card content

### Can I use nested decks without spaced repetition?

Yes! Features are independent:
- Enable only `FEATURE_NESTED_DECKS` for hierarchy
- Cards work without scheduling data (defaults applied on first review)

### How do I see all cards due across all decks?

```bash
# Get all due cards for user
curl /api/flashcards/due \
  -H "Authorization: Bearer $TOKEN"

# Get due cards for specific deck and descendants
curl '/api/flashcards/due?deckId=deck-id&includeChildren=true' \
  -H "Authorization: Bearer $TOKEN"
```

### Can I bulk edit existing cards?

Not directly via bulk import. To update existing cards:
1. Export deck
2. Edit export file
3. Import with `mergeStrategy: "overwrite"`

### Performance tips?

- Use tree view (`?tree=true`) sparingly for large hierarchies
- Bulk import instead of creating cards one-by-one
- Index fields are optimized for queries
- Lazy-load children in UI

### How do I disable the feature?

Set feature flags to `false` in `.env`:
```bash
FEATURE_NESTED_DECKS=false
FEATURE_BULK_OPERATIONS=false
FEATURE_GITHUB_SYNC=false
```

Existing data remains intact; UI features just hide.

### Getting Help

- **Documentation**: `/specs/013-add-a-nested/`
- **API Docs**: `/specs/013-add-a-nested/contracts/openapi.yaml`
- **Quick Reference**: `/specs/013-add-a-nested/QUICK_REF.md`
- **GitHub Issues**: Report bugs or request features

## Advanced Topics

### Custom Review Algorithm

The SM-2 algorithm is configurable in code:

```typescript
// src/lib/scheduler/sm2.ts
const CONFIG = {
  initialEaseFactor: 2.5,
  minEaseFactor: 1.3,
  easeBonus: 0.15,
  easePenalty: 0.2,
  againIntervalDays: 1,
  hardMultiplier: 1.2,
  easyBonus: 1.3,
  minInterval: 3, // Days for "good" on first success
};
```

### Webhook Integration

Set up webhooks for:
- New card reviews
- Deck hierarchy changes
- Bulk operation completions
- GitHub sync events

Contact admin to configure webhooks.

### API Rate Limits

- Standard users: 100 requests / 15 minutes
- Editors: 500 requests / 15 minutes
- Admins: 1000 requests / 15 minutes

Bulk operations count as single requests regardless of item count.
