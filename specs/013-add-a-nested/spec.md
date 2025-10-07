# Feature Specification: Nested decks & Anki-like features for Flqshcqrds
**Feature Branch**: `013-add-a-nested`  
**Created**: 2025-10-07  
**Status**: Draft  
**Input**: User description: "add a nested deck and anki like features for flqshcqrds but one thing that strictly needs to be followed is that everything should work as is or better and prod ready"

## Execution Flow (main)
```
1. Parse user description from Input
   → If empty: ERROR "No feature description provided"
2. Extract key concepts from description
   → Identify: actors, actions, data, constraints
3. For each unclear aspect:
   → Mark with [NEEDS CLARIFICATION: specific question]
4. Fill User Scenarios & Testing section
   → If no clear user flow: ERROR "Cannot determine user scenarios"
5. Generate Functional Requirements
   → Each requirement must be testable
   → Mark ambiguous requirements
6. Identify Key Entities (if data involved)
7. Run Review Checklist
   → If any [NEEDS CLARIFICATION]: WARN "Spec has uncertainties"
   → If implementation details found: ERROR "Remove tech details"
8. Return: SUCCESS (spec ready for planning)
```

---

## ⚡ Quick Guidelines
- ✅ Focus on WHAT users need and WHY
- ❌ Avoid HOW to implement (no tech stack, APIs, code structure)
- 👥 Written for business stakeholders, not developers

### Section Requirements
- **Mandatory sections**: Must be completed for every feature
- **Optional sections**: Include only when relevant to the feature
- When a section doesn't apply, remove it entirely (don't leave as "N/A")

### For AI Generation
When creating this spec from a user prompt:
1. **Mark all ambiguities**: Use [NEEDS CLARIFICATION: specific question] for any assumption you'd need to make
2. **Don't guess**: If the prompt doesn't specify something (e.g., "login system" without auth method), mark it
3. **Think like a tester**: Every vague requirement should fail the "testable and unambiguous" checklist item
4. **Common underspecified areas**:
   - User types and permissions
   - Data retention/deletion policies  
   - Performance targets and scale
   - Error handling behaviors
   - Integration requirements
   - Security/compliance needs

---

## User Scenarios & Testing *(mandatory)*

### Primary User Story
As a Flashcards user I want to organize my flashcards into nested decks and use Anki-like study features (spaced repetition, card scheduling, ease-based review) so I can learn more effectively while keeping the current product behavior intact or improved.

### Acceptance Scenarios
1. **Given** an existing flat deck of flashcards, **When** the user creates a nested deck and moves cards into it, **Then** the UI shows the hierarchy, counts are updated, and existing study sessions continue to work with moved cards.
2. **Given** a user studying cards, **When** spaced repetition settings are enabled and the user marks cards using ease options (Again/Hard/Good/Easy), **Then** the card scheduling updates according to configurable intervals and next-review dates are persisted.
3. **Given** a user exports or shares a deck, **When** nested decks are included, **Then** the export contains deck structure and scheduling metadata in a format compatible with existing export/import functionality.

### Edge Cases
- Moving a large number of cards between decks: ensure counts and schedules update atomically or with clear progress/error feedback.
- Conflicting schedules when merging decks: define deterministic resolution (e.g., newer review date wins) [NEEDS CLARIFICATION].
- Offline usage / sync conflicts (if app supports sync): how to resolve deck hierarchy and schedule conflicts [NEEDS CLARIFICATION].
- Backwards compatibility: older clients should still be able to use decks they previously created; nested metadata must be optional or backward-compatible.

## Requirements *(mandatory)*

### Functional Requirements
- **FR-001**: The system MUST allow users to create decks that can contain child decks to an arbitrary (reasonable) depth (configurable or documented limit).
- **FR-002**: The system MUST allow users to move cards between decks (including into/out of nested decks) while preserving each card's review schedule and metadata.
- **FR-003**: The UI MUST display deck hierarchy with expand/collapse controls and deck-level counts (total cards, due cards).
- **FR-004**: The study flow MUST include Anki-like ease buttons (e.g., Again/Hard/Good/Easy) and use those to update card scheduling according to a configurable SR algorithm.
- **FR-005**: The system MUST persist scheduling metadata (last reviewed, interval, ease factor, next review date) for each card and surface it to exports.
- **FR-006**: Existing study sessions and features MUST continue to work without regressions; if behavior changes, it must be opt-in behind a migration or feature flag.
- **FR-007**: The system MUST support exporting and importing decks with nested structure and scheduling metadata in the existing export format or an explicitly versioned extension.
- **FR-008**: The system MUST provide migration logic to convert existing flat decks into a nested structure without data loss and with minimal downtime.
- **FR-009**: The system MUST surface clear UX affordances for creating, renaming, deleting, and reparenting decks and for undoing accidental moves.

- **FR-010**: The system MUST allow bulk flashcard operations on a deck (bulk import, export, move, delete, edit) with progress reporting and error handling.
- **FR-011**: The system MUST provide an optional GitHub-sync integration that allows a single repository per user/org to be linked for collaboration and backup (sync is optional and off by default).
- **FR-012**: The GitHub sync MUST support common file formats for flashcards (Markdown with frontmatter, JSON, CSV, YAML) and provide a mapping configuration to link files/folders to decks.
- **FR-013**: The GitHub sync MUST be pull-first by default (app pulls changes from the repo); push/write-back to the repo is optional and gated behind explicit opt-in and auth.
- **FR-014**: The system MUST provide safe conflict resolution semantics when syncing with GitHub: by default use a last-writer-wins strategy with visible merge conflicts surfaced to an admin UI; allow repo-level policy overrides.
- **FR-015**: The system MUST expose an open-source repository pattern (a recommended repo layout and example files) so communities can publish shared flashcard sets and allow users to link/import them.

Repository pattern: single canonical "flashcards" repo

- **FR-016 (repo-pattern)**: The system SHOULD support a canonical repository pattern where an organization/user links a single GitHub repository named `flashcards` containing all decks on a single default branch (e.g., `main`). This repo acts as the canonical source-of-truth for decks when sync is enabled.

Rationale and behavior:
- One repo named `flashcards` keeps collaboration simple for content creators and communities: all decks live in a single place and are discoverable.
- Default behavior: the app performs pull-only syncs from the repository's configured default branch (`main` by default). Write-back (pushing changes) is optional and requires explicit opt-in with elevated auth (OAuth app or PAT) and an audit trail.
- Branching model: default single-branch workflow (all decks on `main`) is supported; optionally support branch-per-contributor via an advanced workflow (PR-based sync) for projects that require it.
- File mapping: decks are represented as files under `decks/` (e.g., `decks/<slug>.md`) or `collections/<collection>/<slug>.md`. The `RepoSyncConfig.pathMapping` maps deck slug ↔ file path.
- Conflict handling: repo pulls apply last-writer-wins by default, but when a diff cannot be auto-resolved, surface a conflict in the admin UI with the file diff and provide actions: accept remote, keep local, or open a PR (if write-back enabled).

Example repo layout (recommended)
```
flashcards/                      # canonical repo root
├── decks/                       # individual decks as files
│   ├── biology-basics.md
│   ├── javascript-fundamentals.md
│   └── spaced-repetition-guide.md
├── collections/                  # optional grouped folders
│   └── exam-prep/
│       ├── math.md
│       └── physics.md
├── examples/                     # usage examples, import scripts
└── README.md                     # repo purpose and layout
```

File formats (examples):
- `decks/<slug>.md` — Markdown with YAML frontmatter including `title`, `slug`, `tags`, `deck_format_version: 2`, and optional `scheduling` defaults.
- `decks/<slug>.json` — JSON object with `cards: []`, `metadata` and `deck_format_version`.

Security & privacy notes:
- Only link public repos if decks are intended to be public. For private repos, require OAuth or PAT with minimal scopes (repo read-only for pull; repo full or workflows for write-back) and store credentials encrypted.
- Provide an audit log for sync operations and require admin consent to enable write-back.

Ambiguities / decisions to confirm:
- **FR-016**: Depth limit for nested decks (e.g., unlimited vs bounded). [NEEDS CLARIFICATION]
- **FR-017**: Exact SR algorithm (SM-2, Anki's algorithm, or a simplified variant) and parameter defaults. [NEEDS CLARIFICATION]
- **FR-018**: Export/import format versioning and compatibility guarantees. [NEEDS CLARIFICATION]

### Key Entities *(include if feature involves data)*
- **Deck**: Represents a container for cards. Attributes: id, title, parent_deck_id (nullable), path (for quick lookup), counts (total, due), metadata (created_at, updated_at, version).
- **Card**: Represents a flashcard. Attributes: id, deck_id, front, back, scheduling: {interval_days, ease_factor, repetitions, last_reviewed_at, next_review_at}, tags.
- **DeckMigrationRecord**: Tracks migration operations when migrating flat decks to nested decks. Attributes: id, source_deck_id, target_deck_id, performed_by, performed_at, status, notes.

- **RepoSyncConfig**: Tracks GitHub sync configuration. Attributes: id, owner_id, repo_url, branch, path_mapping (deck -> path), sync_direction (pull-only/push-pull), last_synced_at, status, auth_type (PAT/app), webhook_enabled.
# **RepoSyncConfig**: Tracks GitHub sync configuration. Attributes: id, owner_id, repo_url, repo_name (e.g., 'flashcards'), default_branch (e.g., 'main'), path_mapping (deck -> path), sync_direction (pull-only/push-pull), last_synced_at, status, auth_type (PAT/app), webhook_enabled.
- **BulkOperationRecord**: Tracks bulk operations on decks. Attributes: id, initiated_by, deck_id, operation_type (import/export/move/delete), total_items, succeeded, failed, started_at, finished_at, error_summary.

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain
- [ ] Requirements are testable and unambiguous  
- [ ] Success criteria are measurable
- [ ] Scope is clearly bounded
- [ ] Dependencies and assumptions identified

---

## Execution Status
*Updated by main() during processing*

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [ ] Review checklist passed

---


## Non-Functional Requirements (must-haves for "prod ready")
- **NFR-001 (Backward compatibility)**: No user should see regression in any existing workflow (study sessions, export/import, card creation, or deck listing) after rollout. Any behavior changes must be opt-in until migration is validated.
- **NFR-002 (Data integrity)**: All card scheduling metadata and deck membership must be preserved during moves and migrations. Migration must be idempotent and verifiable.
- **NFR-003 (Availability)**: Core study flow must remain available during migration; any maintenance windows must be announced and minimized.
- **NFR-004 (Performance)**: Deck listing and study operations should not regress by more than 10% in median response time under typical load. (Propose 10% — can be tuned) [NEEDS CLARIFICATION: acceptable performance SLA]
- **NFR-005 (Observability)**: Track metrics and errors related to deck operations, migrations, and scheduling updates (counts, failures, migration progress, scheduling mismatches).

## Migration & Rollout Plan (high level)
Goal: introduce nested decks while guaranteeing existing behavior "as is or better".

1. Discovery & Backup
   - Snapshot relevant data (decks, cards, scheduling metadata) before any migration. Keep immutable backups for rollback.

2. Feature flagging
   - Implement nested decks behind a feature flag (can be per-user, per-org, or global) to allow progressive rollout and easy rollback.

3. Migration strategy
   - Dry-run mode: run migration logic in read-only mode against production sandbox data and compare results with expected mapping.
   - Plan A (automatic mapping): Create a default root-level parent for migrated decks or map 1:1 to existing deck ids. Document mapping.
   - Plan B (manual mapping): Provide a UI/admin tool to group decks into nested structures for complex cases.
   - Chunked migration: migrate data in batches (e.g., 1k decks/cards per job) and verify counts after each batch.
   - Idempotency: design migration so it can be run multiple times without double-moving or corrupting state.

4. Verification
   - After each migration batch verify: total card counts per deck, due-card counts, scheduling fields (interval, next_review_at), and a sample of cards' review flows.
   - End-to-end QA run against a staging environment with a production-sized snapshot.

5. Canary / Gradual rollout
   - Enable feature flag for small % of users or internal users first.
   - Monitor metrics and error rates, then gradually increase.

6. Full rollout & cleanup
   - After successful canary and migration, flip default behavior and run final sweep migrations.
   - Provide a fallback migration rollback if verification fails.

7. Post-migration monitoring & support
   - Maintain a monitoring dashboard and runbook for common issues (schedule mismatches, count discrepancies, sync conflicts).

## QA & Test Plan (minimal required tests to consider this prod-ready)

Automated tests (required)
- Unit tests for deck operations: create, rename, delete, reparent, counts update, card moves (happy path + failure modes).
- Integration tests: simulate moving cards into nested decks and running study sessions to ensure scheduling persists.
- Migration tests: idempotency tests, dry-run assertions comparing pre/post counts, and a sample of scheduling fields.
- Export/import tests: export a nested deck and import it back (round-trip) and assert structural parity and scheduling parity.

Manual/regression tests (required)
- User story regressions: run through the primary user story end-to-end with both flat and nested decks.
- Large-batch move test: move 10k cards across decks in staging and verify progress, success rate, and eventual consistency.
- Backup & rollback drill: restore from backup and run rollback procedure in a staging environment.

Acceptance Test Checklist (concrete steps)
1. Create nested decks and move cards; assert UI shows hierarchy and counts update immediately.
2. Start a study session that includes cards that were moved; mark them with ease options and assert next-review dates are updated and persisted.
3. Export a nested deck, import it into a fresh account, and verify deck structure and scheduling metadata are preserved.
4. Run the migration dry-run and assert 100% of cards are accounted for and no scheduling metadata lost.
5. Enable feature flag for a canary group; after 48 hours verify error rates remain at baseline and study flow behaves identically for canary users.

## Monitoring, Metrics & Alerts
- Key metrics to track:
  - Deck operation success/failure rate (create/move/delete/reparent)
  - Card move throughput and failures during migration
  - Scheduling-update failures (when processing SR decisions)
  - Study session error rate and average latency
  - Export/import round-trip failures
- Suggested alerts:
  - Migration failure rate > 1% for two consecutive minutes
  - Study session errors spike above baseline by 2x
  - Significant delta in deck/card counts post-migration (>0.1% mismatch)

## Security, Permissions & Data Governance
- Ensure only authorized users can create/delete/reparent decks.
- Record audit logs for deck operations and migrations (who performed, when, what changed).
- Exported files including scheduling metadata must respect existing privacy settings; do not expose private metadata unless export permissions allow it.

## Risk Assessment & Mitigations
- Risk: Data loss or scheduling corruption during migration.
  - Mitigation: immutable backups, dry-run, idempotent migration, small batch size and verification after each batch.
- Risk: Performance regressions during mass reparent operations.
  - Mitigation: chunked/queued migration, rate-limiting, monitor latency and fallback to maintenance window if needed.
- Risk: Unexpected client compatibility issues with nested metadata.
  - Mitigation: make nested metadata optional in exports, maintain backwards compatibility fields, and support older clients by falling back to flat deck representation when necessary.

## Decisions to confirm (open items)
- Nesting depth limit (proposed: 6 levels) [NEEDS CLARIFICATION]
- Spaced repetition algorithm choice (proposed: SM-2 with tunable defaults) [NEEDS CLARIFICATION]
- Export format versioning scheme (proposed: add `deck_format_version` to exports) [NEEDS CLARIFICATION]
- Sync/offline conflict resolution policy (last-writer-wins vs. merge rules) [NEEDS CLARIFICATION]

## Updated Next Steps
- Resolve the open decision points above (depth, SR algorithm, export version, sync policy).
- Translate the spec into concrete implementation tasks and a migration ticket with a timeline and rollback steps.
- Prepare a staging run with a production-sized snapshot and execute the migration dry-run and QA checklist.

---

``` 

``` 

## Existing code references (for implementers)
Below are concise, focused excerpts from the current codebase to make integration easier. These examples show the current data shapes, APIs, and the reviewer UI behavior to reuse and extend rather than reimplement from scratch.

- src/models/FlashcardDeck.ts (deck schema highlights)
```ts
const FlashcardDeckSchema = new Schema<IFlashcardDeck>({
   slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
   title: { type: String, required: true, trim: true, minlength: 3, maxlength: 200 },
   description: { type: String, trim: true },
   cardCount: { type: Number, default: 0, min: 0 },
   linkTargets: { type: [linkTargetSchema], default: [] },
   analytics: { type: analyticsSchema },
});
```

- src/models/FlashcardCard.ts (card schema highlights)
```ts
const FlashcardCardSchema = new Schema<IFlashcardCard>({
   deckId: { type: Schema.Types.ObjectId, ref: 'FlashcardDeck', required: true, index: true },
   type: { type: String, enum: ['basic','cloze','qa','image'], required: true },
   prompt: { type: faceSchema, required: true },
   response: { type: faceSchema, required: true },
   tags: { type: [String], default: [] },
   order: { type: Number, required: true, min: 0, index: true },
}, { timestamps: true });
```

- src/types/courses.ts (relevant interfaces)
```ts
export interface FlashcardDeck {
   _id?: string; slug: string; title: string; cardCount: number; cards?: FlashcardCard[]; createdBy: string;
}

export interface FlashcardCardProgress {
   cardId: string; dueAt: Date; intervalMinutes: number; easeFactor: number; lastReviewedAt?: Date | null;
}
```

- src/app/api/admin/flashcards/route.ts (deck create auth + input parsing)
```ts
const { userId } = await auth();
if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
await connectToDatabase();
const parsed = FlashcardDeckInputSchema.parse(body);
const slug = await uniqueSlug(parsed.title, async candidate => {
   const existing = await FlashcardDeckModel.exists({ slug: candidate });
   return Boolean(existing);
});
```

- src/app/api/admin/flashcards/[deckId]/cards/route.ts (card create flow highlights)
```ts
await assertEditorOrAdmin(userId);
const deck = await FlashcardDeckModel.findById(params.deckId);
const parsed = FlashcardCardInputSchema.parse(body);
// build prompt/response media defaults, compute order and persist new FlashcardCardModel
await FlashcardDeckModel.updateOne({ _id: deck._id }, { $inc: { cardCount: 1 } });
```

- src/app/api/admin/flashcards/schemas.ts (input validation snippet)
```ts
export const FlashcardDeckInputSchema = z.object({
   title: z.string().min(3).max(200),
   subtitle: z.string().max(200).optional().or(z.literal('')),
   description: z.string().optional().or(z.literal('')),
   coverImage: z.string().url().optional().or(z.literal('')),
});
```

- src/components/courses/FlashcardReviewer.tsx (UI & interaction hooks)
```tsx
interface FlashcardData { id: string; type: 'basic'|'cloze'|'qa'|'image'; prompt: any; response: any; }
export default function FlashcardReviewer({ deckId, deckTitle, cards }: FlashcardReviewerProps) {
   const handleFlip = () => { setIsFlipped(!isFlipped); if (!isFlipped) setReviewedCards(prev => new Set(prev).add(currentCardIndex)); };
   const handleDifficulty = (level: 'easy'|'medium'|'hard') => { setDifficulty(prev => ({ ...prev, [currentCardIndex]: level })); if (autoAdvance) setTimeout(handleNext, 300); };
}
```

- src/components/admin/flashcards/DeckManagerContent.tsx (card save payload)
```tsx
const payload: Record<string, unknown> = {
   type: cardForm.type,
   prompt: { text: cardForm.prompt.trim() },
   response: { text: cardForm.response.trim() },
   hint: cardForm.hint.trim() || undefined,
   tags: parseCommaSeparated(cardForm.tags),
};
const endpoint = editingCard ? `/api/admin/flashcards/${deckId}/cards/${editingCard.id}` : `/api/admin/flashcards/${deckId}/cards`;
```

Notes for implementers
- Reuse existing models/schemas for backward compatibility and to avoid data-model drift.
- The codebase already provides card review UI and basic CRUD; extend these where possible (add schedule fields, repo sync config, bulk endpoints) rather than replacing.
- For GitHub sync, add a new API surface (e.g., `/api/admin/flashcards/:deckId/sync`) and store `RepoSyncConfig` in the same DB to keep operations traceable.

