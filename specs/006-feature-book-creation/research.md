# Research: Book Creation System

## Unknowns and Proposed Decisions

1. Keyboard Shortcuts
- Decision: Support Cmd/Ctrl+B/I/U, Cmd/Ctrl+K (link), Cmd/Ctrl+Shift+7 (ordered list), Cmd/Ctrl+Shift+8 (bullet list), Cmd/Ctrl+Alt+1..3 (H1..H3), Cmd/Ctrl+S (save)
- Rationale: Covers common editing; low learning curve
- Alternatives: Full VSCode-style set — rejected for complexity

2. Embeds and Sanitization
- Decision: Allow images, Lottie JSON (via existing LottieAsset), and YouTube/Vimeo oEmbed; sanitize HTML; block scripts/iframes except whitelisted providers
- Rationale: Safe, consistent with existing content patterns
- Alternatives: Arbitrary iframe embeds — rejected due to security

3. Analytics Scope
- Decision: Track pageviews (unique + total) per book/chapter per day; retention 180 days; optional via setting
- Rationale: Lightweight, privacy-conscious
- Alternatives: Read-time, scroll depth — defer pending consent requirements

4. Export/Import
- Decision: Export Book as Markdown bundle (chapters as separate files) and single HTML; Import Markdown for chapters with conversion
- Rationale: Simple, portable
- Alternatives: PDF generation — defer to future

5. Autosave and Limits
- Decision: Autosave after 2s idle debounce, minimum 5s between writes; hard limit ~200k chars per chapter; warn approaching limit
- Rationale: Reliability + performance
- Alternatives: No limits — risk of editor lag

6. Public Listing Filters
- Decision: Optional filters by genre and language on public books index (toggle in settings). Default off.
- Rationale: Keep initial UI simple; configurable
- Alternatives: Always-on filtering — not necessary for small catalogs

## Best Practices Notes
- Keep slugs immutable after publish; use redirects on changes
- Optimize images (cover) and use next/image
- Use server-side data access for public pages (SSR) for freshness and SEO
- Favor incremental publishing (per-chapter) with clear states

## Open for Approval
- Keyboard shortcut set
- Allowed providers list for embeds
- Analytics retention window and metrics
- Export/Import exact packaging format
