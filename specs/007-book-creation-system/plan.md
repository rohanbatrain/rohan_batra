
# Implementation Plan: Book Creation System

**Branch**: `[007-book-creation-system]` | **Date**: 2025-09-20 | **Spec**: `/Users/rohan/Documents/repos/rohan_batra/specs/007-book-creation-system/spec.md`
**Input**: Feature specification from `/Users/rohan/Documents/repos/rohan_batra/specs/007-book-creation-system/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, or `GEMINI.md` for Gemini CLI).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
Enable admins/editors to author and publish Book entities with ordered Chapters, rich writing workflow (autosave, markdown paste → rich text, version history/diff), character linking, story timelines (date + timezone aware), SEO/public pages, multilingual linking, analytics, and admin list/search/bulk operations. Approach: leverage existing patterns in this repo (Next.js App Router, Clerk auth, MongoDB/Mongoose models, SSR services) and reuse journal/volume patterns for ordering, publish/visibility, and slugs.

## Technical Context
**Language/Version**: TypeScript, React 18/19, Next.js App Router (per repo)
**Primary Dependencies**: Clerk (auth), Mongoose/MongoDB, shadcn/ui, Zod, SWR, Tailwind; existing libs for tooltips/dialogs, timezones
**Storage**: MongoDB via Mongoose models (existing Book/Chapter models present in repo)
**Testing**: Vitest + React Testing Library; Playwright for E2E (per repo standards)
**Target Platform**: Vercel-hosted Next.js; Docker optional
**Project Type**: Web application (frontend + backend in one Next.js repo)
**Performance Goals**: Responsive editor with autosave (<1s perceived save), public pages TTFB consistent with SSR + ISR patterns
**Constraints**: Role-based access (admin/editor), SEO-friendly slugs, draft/private visibility rules; keep UI minimal and metadata-driven
**Scale/Scope**: Single-tenant personal portfolio/blog with admin dashboard; content volume moderate (hundreds of chapters)

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

The constitution document is a template and does not define concrete mandatory gates beyond general quality, testing-first, and simplicity principles. We will:
- Prefer simple, existing patterns in this repo (SSR services, Mongoose models, Zod in routes).
- Plan contract tests first (Phase 1 will outline) aligning with Test-First principle.
- Keep design within existing single-project structure to avoid unnecessary complexity.

Initial Constitution Check: PASS (no explicit violations identified).

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure]
```

**Structure Decision**: Option 1 (Single project) — matches current Next.js repo structure

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

Unknowns from spec:
- Keyboard shortcuts set for editor [NEEDS CLARIFICATION]
- Allowed embed types, sanitization policy [NEEDS CLARIFICATION]
- Analytics scope and retention [NEEDS CLARIFICATION]
- Export/import formats and scope [NEEDS CLARIFICATION]
- Max chapter size and autosave frequency [NEEDS CLARIFICATION]
- Public books list filtering (genre, language, status) [NEEDS CLARIFICATION]

Research plan:
- Evaluate minimal shortcut set (bold/italic/underline, headings, lists, code, link, save)
- Define safe embed whitelist (images, Lottie JSON via existing LottieAsset, YouTube/Vimeo oEmbed)
- Propose baseline analytics (pageviews, unique views by day) stored aggregated; retention 180 days
- Offer export as Markdown and HTML; import Markdown with conversion
- Recommend autosave every 5s idle/debounce; hard limit 200k characters per chapter for perf
- Books listing filters: genre and language; default off with setting to enable

We will capture decisions and alternatives in `research.md`.

**Output**: research.md with proposed decisions and marked items requiring stakeholder approval

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh copilot` for your AI assistant
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

Artifacts to produce:
- data-model.md: Book, Chapter, relationships, validation, visibility/publish state machine
- contracts/: Admin API routes for books and chapters; public routes for book list/detail and chapter detail; slug existence checks; trash/restore endpoints
- quickstart.md: How to create a book, add chapters, publish; public navigation
- Note: Contract tests will be outlined to follow repo’s contract test style (to be implemented during /tasks).

**Output**: data-model.md, /contracts/*, quickstart.md (tests will be created during /tasks phase)

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [ ] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [ ] All NEEDS CLARIFICATION resolved
- [ ] Complexity deviations documented

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
