# research.md

Decisions required (from spec):
- Nesting depth limit
- Spaced repetition (SR) algorithm choice and defaults
- Export/import format versioning and compatibility
- Sync/offline conflict resolution policy
- Performance SLA clarification


## Decision: Nesting depth limit
- Decision: Default to a documented limit of 6 levels. Rationale: Most users don't need deep hierarchies; limits protect UI complexity and query performance. Can be increased with a config flag.
- Alternatives considered:
  - Unlimited depth: flexible but risks deep recursive queries and UI complexity.
  - Shallow fixed depth (2-3): too restrictive for power users.

## Decision: Spaced Repetition algorithm
- Decision: Implement SM-2 (Anki's approximate algorithm) with tunable defaults: initial interval 1 day, ease factors default 2.5, minimum interval 1 day, max interval configurable (default 36500 days).
- Rationale: SM-2 is well-understood, simple to implement, and compatible with user expectations for "Anki-like" behavior. Tunable parameters allow later experimentation.
- Alternatives considered: Full Anki algorithm (more complexity), SuperMemo variants (increased complexity). Choose SM-2 for MVP.

## Decision: Export/import format versioning
- Decision: Use current export format with `deck_format_version` metadata. For nested decks, add `children` array per deck object. Version: start at 2.
- Rationale: Keeps backward compatibility; older clients ignore unknown fields.
- Alternatives: Create a separate file format—more disruptive.

## Decision: GitHub sync conflict resolution
- Decision: Default to pull-first and last-writer-wins; surface conflicts in UI with actionable diff and allow manual resolution. For write-back, require explicit opt-in with OAuth or PAT and create PR-based workflow option.
- Rationale: Simple to implement and predictable; manual resolution handles edge cases.

## Canonical "flashcards" repository pattern
- Decision: Encourage a single canonical repository named `flashcards` per organization/user for public shared decks. Provide a recommended layout under `decks/` and `collections/` and an examples folder in the spec directory.
- Example file: `/specs/013-add-a-nested/examples/flashcards-repo/decks/sample-deck.md` demonstrates the Markdown frontmatter format with `deck_format_version: 2`.

## Performance SLA
- Proposal: Deck listing and study ops should not regress more than 10% median latency under typical load. Recommend monitoring and adjust after load testing.

## Resolved ambiguities summary
- Nesting depth: 6 (configurable)
- SR algorithm: SM-2 with tunable params
- Export format: `deck_format_version: 2` with children arrays
- Sync policy: pull-first, last-writer-wins, manual conflict UI


## Notes for implementers
- Feature must be opt-in behind a feature flag during rollout.
- Migration must be idempotent and run in batches with verification.
- Reuse existing models and endpoints where possible; extend schemas to include parentDeckId, scheduling fields, and repo sync config.
