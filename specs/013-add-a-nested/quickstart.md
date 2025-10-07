# quickstart.md

Minimal quickstart to validate the feature end-to-end in a staging environment.

Pre-reqs
- Staging database snapshot (from production)
- Feature flagging enabled for a test org or user
- Backups available and tested

Steps
1. Enable feature flag for a canary user.
2. Create a root deck via Admin -> Flashcards -> Create Deck.
3. Create child decks by setting `parentDeckId` when creating/updating a deck.
4. Add 10-50 cards to various decks; use bulk import endpoint for larger sets.
5. Start a study session via the course/lesson page or deck viewer and exercise ease buttons (Again/Hard/Good/Easy).
6. Verify scheduling metadata is updated and persisted (check DB: `scheduling` fields).
7. Export a deck with `?format_version=2` and verify the `children` arrays exist.
8. Trigger a GitHub sync (if configured for test repo) and confirm pull-only updates are applied and conflicts (if any) are surfaced.
9. Run migration dry-run on production snapshot and assert counts match.

Validation checks
- No regression in study flow latencies (compare baseline)
- Card counts and due counts match pre/post migration snapshots
- Bulk import progress and errors visible in admin UI
- Exported format includes nested structure and `deck_format_version: 2`

Rollback
- Disable feature flag and, if needed, run rollback migration using saved backup snapshots.
