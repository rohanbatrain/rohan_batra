# tasks.md — Nested decks & Anki-like features for Flqshcqrds

Feature: Nested decks, Anki-like study (SM-2), bulk operations, and optional GitHub `flashcards` repo sync
Branch: 013-add-a-nested
Spec: /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/spec.md

Notes:
- Follow TDD: create failing tests (unit/contract/integration) before implementing.
- Use feature flag `feature.nestedDecks` (boolean) to gate behavior.
- All paths below are absolute to the repo root.

Legend:
- [P] = Parallelizable with other [P] tasks (different files)
- Files to edit/inspect should be referenced in each task where applicable

---

T001 — Setup: CI/test and local environment verification
- Type: Setup
- Description: Ensure project tests run locally and CI configured to run unit/integration/contract tests. Add feature flag env var to dev/test configs.
- Files/commands:
  - Verify `pnpm -s test` runs (or `pnpm -s typecheck` exists). If not, update `package.json` scripts.
  - Add `FEATURE_NESTED_DECKS=true` to `.env.example` for local testing.
- Dependencies: none
- Output: Green CI and local test run with env var sample

T002 — Contract tests: API contract stubs from `/specs/013-add-a-nested/contracts/openapi.yaml` [P]
- Type: Test [P]
- Description: Create failing contract tests for endpoints described in `contracts/openapi.yaml`.
- Files to create:
  - /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/tests/contracts/test_decks_contract.test.ts
  - /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/tests/contracts/test_bulk_import_contract.test.ts
- Test cases:
  - GET /api/flashcards/decks?tree=true returns 200 and JSON schema
  - POST /api/admin/flashcards with DeckInput returns 201 for valid body
  - POST /api/admin/flashcards/{deckId}/cards/bulk accepts multipart file and returns 200
- Commands:
  - `pnpm -s test tests/contracts` should run and fail initially
- Dependencies: T001
- Output: Failing contract tests

T003 — Model tests & entity creation tasks (Deck, Card, RepoSyncConfig, BulkOperationRecord) [P]
- Type: Test/Model [P]
- Description: Add unit tests and types for new fields (`parentDeckId`, `path`, `level`, `scheduling`) and `RepoSyncConfig` model.
- Files to create/edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/models/FlashcardDeck.ts (extend schema)
  - /Users/rohan/Documents/repos/rohan_batra/src/models/FlashcardCard.ts (add `scheduling` subdocument)
  - /Users/rohan/Documents/repos/rohan_batra/src/models/RepoSyncConfig.ts (new model)
  - /Users/rohan/Documents/repos/rohan_batra/tests/unit/test_models_flashcards.test.ts
- Test cases:
  - Deck model validates `level` and `parentDeckId`
  - Card model accepts `scheduling` object and defaults
  - RepoSyncConfig persists repo_url, repo_name, default_branch, path_mapping
- Commands:
  - `pnpm -s test tests/unit` should run and fail for missing implementation
- Dependencies: T001
- Output: Failing unit tests

T004 — Implement Deck & Card model changes
- Type: Core (models)
- Description: Implement schema changes and ensure types/interfaces in `src/types/courses.ts` updated.
- Files to edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/models/FlashcardDeck.ts
  - /Users/rohan/Documents/repos/rohan_batra/src/models/FlashcardCard.ts
  - /Users/rohan/Documents/repos/rohan_batra/src/types/courses.ts
- Acceptance:
  - Unit tests from T003 pass
- Dependencies: T003

T005 — Migration skeleton and idempotent batch job
- Type: Migration
- Description: Create a migration script that adds `parentDeckId`, `path`, and `level` to decks and backfills `scheduling` for cards in batches with idempotency.
- Files to create:
  - /Users/rohan/Documents/repos/rohan_batra/migrations/2025-10-07-add-nested-decks.js
  - /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/migration-plan.md
- Requirements:
  - Dry-run mode that doesn't write
  - Batch size configurable via env var (default 1000)
  - Verification step that compares counts and sample cards
- Dependencies: T004
- Output: Migration script with dry-run

T006 — API: Deck endpoints (create/update/get tree) contract implementation
- Type: API
- Description: Implement endpoints from `data-model.md` and `contracts/openapi.yaml` for deck listing (tree), create, and update (including reparent).
- Files to edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/app/api/admin/flashcards/route.ts
  - /Users/rohan/Documents/repos/rohan_batra/src/app/api/admin/flashcards/[deckId]/route.ts
  - Add helper: /Users/rohan/Documents/repos/rohan_batra/src/lib/decks/tree.ts (compute path/level and tree view)
- Acceptance:
  - Contract tests from T002 pass for deck endpoints
- Dependencies: T004, T002

T007 — API: Bulk import endpoint
- Type: API
- Description: Implement bulk import handling multipart uploads, parsing Markdown/JSON/CSV/YAML, creating cards, producing `BulkOperationRecord`, and reporting progress.
- Files to edit/create:
  - /Users/rohan/Documents/repos/rohan_batra/src/app/api/admin/flashcards/[deckId]/cards/bulk/route.ts
  - /Users/rohan/Documents/repos/rohan_batra/src/models/BulkOperationRecord.ts
  - /Users/rohan/Documents/repos/rohan_batra/src/lib/parsers/flashcard-parsers.ts
- Acceptance:
  - Contract tests T002 pass for bulk import
  - Upload of sample-deck.md (from examples) creates cards
- Dependencies: T004, T002

T008 — Core: SM-2 scheduler service and card scheduling update logic
- Type: Service
- Description: Implement SM-2 scheduling logic and a service to update `scheduling` fields when users mark ease level.
- Files to edit/create:
  - /Users/rohan/Documents/repos/rohan_batra/src/lib/scheduler/sm2.ts
  - Integration point in study flow: /Users/rohan/Documents/repos/rohan_batra/src/components/courses/FlashcardReviewer.tsx (hook to call API)
  - API endpoint for recording review result: /Users/rohan/Documents/repos/rohan_batra/src/app/api/flashcards/review/route.ts
- Acceptance:
  - Unit tests for SM-2 algorithm
  - Integration test: marking a card updates `nextReviewAt` and `intervalDays`
- Dependencies: T004, T006

T009 — Feature flag + Canary rollout mechanism
- Type: Ops/Feature flag
- Description: Add server-side check for `FEATURE_NESTED_DECKS` and support per-user canary enabling (e.g., via `User` metadata).
- Files to edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/lib/featureFlags.ts
  - Middleware or auth helpers that check flags before enabling nested APIs/UI
- Acceptance:
  - When flag disabled, system behaves exactly as before
- Dependencies: T006, T008

T010 — GitHub sync: RepoSyncConfig model + basic pull-only importer
- Type: Integration
- Description: Implement `RepoSyncConfig` model, a service that pulls a configured repo (single `flashcards` repo), parses files, maps files to decks, and creates/updates decks/cards in pull-only mode.
- Files to create/edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/models/RepoSyncConfig.ts
  - /Users/rohan/Documents/repos/rohan_batra/src/services/repoSync/pullService.ts
  - Admin endpoints: /api/admin/flashcards/:deckId/sync-config (create/list) and POST /api/admin/flashcards/sync/trigger
- Requirements:
  - Use GitHub API with minimal scopes for public repos (read-only)
  - Store `pathMapping` and `repo_name` in DB
  - Dry-run mode before applying changes
- Acceptance:
  - Pulling `specs/013-add-a-nested/examples/flashcards-repo/decks/sample-deck.md` maps to deck creation in staging, when configured
- Dependencies: T004, T007, T003

T011 — UI: Deck hierarchy UI (expand/collapse, counts) and move/reparent UX
- Type: Frontend
- Description: Update `DeckManagerContent` and the deck listing components to show nested decks, support moving cards between decks, and show counts (total/due).
- Files to edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/components/admin/flashcards/DeckManagerContent.tsx
  - /Users/rohan/Documents/repos/rohan_batra/src/components/courses/DeckList.tsx (or create)
- Acceptance:
  - Manual test: create nested decks and move cards; UI shows hierarchy and counts update
- Dependencies: T006, T004

T012 — Study UI: Add ease buttons (Again/Hard/Good/Easy) and wire to scheduler
- Type: Frontend/API
- Description: Add Anki-like ease buttons to `FlashcardReviewer` and call review API to update scheduling.
- Files to edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/components/courses/FlashcardReviewer.tsx
  - /Users/rohan/Documents/repos/rohan_batra/src/app/api/flashcards/review/route.ts
- Acceptance:
  - Integration test: marking card updates scheduling in DB
- Dependencies: T008, T006

T013 — Export/Import update (deck_format_version=2)
- Type: API
- Description: Update export endpoint to include nested `children` arrays and `deck_format_version: 2`. Update import to accept format v2 files.
- Files to edit:
  - /Users/rohan/Documents/repos/rohan_batra/src/app/api/flashcards/[deckId]/export/route.ts
  - /Users/rohan/Documents/repos/rohan_batra/src/app/api/admin/flashcards/import/route.ts
- Acceptance:
  - Round-trip test: export a nested deck and import it back with structure preserved
- Dependencies: T006, T007

T014 — Monitoring & Alerts
- Type: Ops/Monitoring
- Description: Add metrics and alerts for migration failures, sync errors, study session errors, and deck/card count mismatches.
- Files/places to configure:
  - Instrument `/src/lib/decks/tree.ts`, migration scripts, repoSync service
  - Add dashboard notes in `specs/013-add-a-nested/monitoring.md`
- Acceptance:
  - Alerts defined for migration failure rate >1% and study session error spike
- Dependencies: T005, T010

T015 — QA/Regression tests and quickstart verification [P]
- Type: Test [P]
- Description: Automate quickstart scenarios from `quickstart.md` as integration tests.
- Files to create:
  - /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/tests/integration/test_quickstart_flow.test.ts
- Steps to cover:
  - Create decks, nested decks, import sample deck, run study session, verify scheduling and export/import round-trip
- Dependencies: T006, T007, T008, T011, T012

T016 — Documentation & examples (repo layout, README)
- Type: Docs
- Description: Add docs for the canonical `flashcards` repo layout, GitHub sync setup steps, and example deck format.
- Files to create/edit:
  - /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/README_REPO_PATTERN.md
  - /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/examples/flashcards-repo/README.md
- Dependencies: T010

T017 — Polish: Performance tests and tuning
- Type: Performance
- Description: Run load tests for deck listing and study flows; fix regressions to within proposed SLA (10% median).
- Files/tools:
  - Use locust/k6 or custom script in `/tools/load-tests/flashcards/`
- Dependencies: T006, T008

T018 — Rollout: Migration runbook & rollback plan
- Type: Ops
- Description: Finalize migration runbook with step-by-step commands, verification queries, and rollback instructions.
- Files to create:
  - /Users/rohan/Documents/repos/rohan_batra/specs/013-add-a-nested/migration-runbook.md
- Dependencies: T005, T014

---

Parallel groups examples:
- Group A [P]: T002 (contract tests) + T003 (model tests) + T015 (quickstart automation scaffolding)
- Group B [P]: T007 (bulk import) + T010 (repo sync pull service) + T011 (UI deck listing)

How to run a task locally (examples):
- Run unit tests: `pnpm -s test tests/unit`
- Run contract tests: `pnpm -s test tests/contracts`
- Run a single migration dry-run: `node migrations/2025-10-07-add-nested-decks.js --dry-run`

---

End of tasks.md
