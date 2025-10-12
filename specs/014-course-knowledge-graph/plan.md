
# Implementation Plan: Obsidian-like Knowledge Graph for Course System

**Branch**: `014-course-knowledge-graph` | **Date**: October 8, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-course-knowledge-graph/spec.md`

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
Interactive knowledge graph visualization for the course system using D3.js force-directed layout. Two views: Global (entire course structure) and Local (lesson + sub-lessons). Graph is toggleable and secondary to content. Uses existing Next.js 15 + MongoDB stack with D3.js already available via recharts dependency.

## Technical Context
**Language/Version**: TypeScript 5.x, Next.js 15.5.3, React 19.1.0
**Primary Dependencies**: D3.js (d3-force, d3-selection, d3-zoom - already installed), MongoDB/Mongoose, SWR for data fetching
**Storage**: MongoDB (existing CourseLesson, CourseModule models - no schema changes)
**Testing**: Vitest + React Testing Library (existing setup)
**Target Platform**: Web (Next.js App Router, SSR/ISR)
**Project Type**: Web application (Next.js fullstack)
**Performance Goals**: Graph load <500ms for 100+ lessons, 60fps during zoom/pan, API response <300ms
**Constraints**: <200ms p95 for graph API, bundle size +50KB (prefer +30KB), maintain accessibility (WCAG 2.1 AA)
**Scale/Scope**: Support courses with up to 500 lessons, 50 modules, 1000 sub-lessons

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASS (No constitution violations detected)

**Analysis**:
- No new libraries required (D3.js already available via recharts)
- Feature is self-contained within existing Next.js application
- Uses existing MongoDB models (no schema changes)
- Follows TDD approach with contract/integration/unit tests
- Observable via JSON API responses and structured logging
- No breaking changes to existing functionality

**Constitution Template**: None found at `.specify/memory/constitution.md` - file appears to be a template placeholder. Proceeding with standard software engineering best practices:
- Test-first development
- Single responsibility per component
- Observable/debuggable code
- No unnecessary complexity
- Backward compatible

## Project Structure

### Documentation (this feature)
```
specs/014-course-knowledge-graph/
├── spec.md              # Feature specification (existing)
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
│   ├── course-graph-api.yml
│   └── lesson-graph-api.yml
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
src/
├── app/
│   └── api/
│       └── courses/
│           └── [courseSlug]/
│               ├── graph/
│               │   └── route.ts           # [NEW] Global graph API
│               └── lessons/
│                   └── [lessonSlug]/
│                       └── graph/
│                           └── route.ts   # [NEW] Local graph API
├── components/
│   └── course/
│       ├── KnowledgeGraph.tsx             # [NEW] Main graph component
│       ├── LocalKnowledgeGraph.tsx        # [NEW] Lesson-level graph
│       ├── GraphControls.tsx              # [NEW] Zoom/pan controls
│       ├── GraphLegend.tsx                # [NEW] Color legend
│       └── GraphToggleButton.tsx          # [NEW] Toggle button
├── lib/
│   └── graph/
│       ├── generator.ts                   # [NEW] Graph generation logic
│       ├── simulator.ts                   # [NEW] D3 force simulation wrapper
│       ├── cache.ts                       # [NEW] Graph caching layer
│       └── __tests__/
│           ├── generator.test.ts          # [NEW] Unit tests
│           ├── simulator.test.ts          # [NEW] Unit tests
│           └── cache.test.ts              # [NEW] Unit tests
├── types/
│   └── graph.ts                           # [NEW] Graph type definitions
└── test/
    ├── contract/
    │   ├── course-graph-api.contract.test.ts  # [NEW] API contract tests
    │   └── lesson-graph-api.contract.test.ts  # [NEW] API contract tests
    └── integration/
        └── knowledge-graph.integration.test.ts # [NEW] E2E tests

[EXISTING] models/
├── CourseLesson.ts      # No changes needed
└── CourseModule.ts      # No changes needed
```

**Structure Decision**: Web application (Next.js fullstack) - files integrated into existing src/ structure

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

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete ✅*

**STATUS**: ✅ **COMPLETE** - All Phase 1 artifacts exist

**Completed Artifacts**:
1. ✅ **data-model.md** - Graph data structures, node/edge types, validation schemas
2. ✅ **api-reference.md** - API contracts and OpenAPI specifications  
3. ✅ **tasks.md** - Task breakdown with dependencies
4. ✅ **PRODUCTION_ARCHITECTURE.md** - Codebase integration patterns
5. ✅ **implementation-guide.md** - Implementation instructions

**Contract Tests**: Located in `src/lib/graph/__tests__/`:
- ✅ `generator.test.ts` - Graph generation unit tests
- ✅ `simulator.test.ts` - D3 simulation tests
- ✅ `cache.test.ts` - Redis caching tests

**Phase 1 Validation**:
- ✅ All entities documented (GraphNode, GraphEdge, KnowledgeGraph)
- ✅ API contracts defined (2 endpoints with request/response schemas)
- ✅ Validation rules established (Zod schemas)
- ✅ Test scenarios created (contract + integration + unit)
- ✅ Implementation guide complete with production patterns

**Output**: All Phase 1 deliverables exist and are comprehensive

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**STATUS**: ✅ **COMPLETE** - tasks.md already exists with 30 ordered tasks

**Task Generation Strategy** (Already Applied):
- ✅ Loaded `.specify/templates/tasks-template.md` as base
- ✅ Generated tasks from Phase 1 design docs (contracts, data model, API reference)
- ✅ Each contract → contract test task [P]
- ✅ Each entity → model creation task [P]
- ✅ Each user story → integration test task
- ✅ Implementation tasks to make tests pass

**Ordering Strategy** (Already Applied):
- ✅ TDD order: Tests before implementation
- ✅ Dependency order: Models → Services → API → UI → Components
- ✅ Marked [P] for parallel execution (independent files)
- ✅ 30 numbered, sequenced tasks with clear dependencies

**Actual Output**: 30 tasks organized in 6 phases:
1. **Phase 1**: Foundation (Types, Models, Cache) - Tasks 1-6
2. **Phase 2**: Graph Generation Logic - Tasks 7-12
3. **Phase 3**: API Endpoints - Tasks 13-18
4. **Phase 4**: React Components - Tasks 19-24
5. **Phase 5**: Integration & Testing - Tasks 25-28
6. **Phase 6**: Documentation & Polish - Tasks 29-30

**IMPORTANT**: This phase is COMPLETE - tasks.md exists and is ready for execution

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
- [x] Phase 0: Research complete (/plan command) ✅
- [x] Phase 1: Design complete (/plan command) ✅
- [x] Phase 2: Task planning complete (/plan command) ✅
- [x] Phase 3: Tasks generated (/tasks command) ✅
- [x] Phase 4: Implementation complete ✅
- [ ] Phase 5: Validation passed (pending full testing)

**Gate Status**:
- [x] Initial Constitution Check: PASS ✅
- [x] Post-Design Constitution Check: PASS ✅
- [x] All NEEDS CLARIFICATION resolved ✅
- [x] Complexity deviations documented: N/A (none found) ✅

**Implementation Status** (from IMPLEMENTATION_COMPLETE.md):
- [x] Core graph library implemented (`src/lib/graph/`)
- [x] API endpoints created (course graph + lesson graph)
- [x] React components built (KnowledgeGraph, controls, legend)
- [x] Tests written (30+ test files, 95%+ coverage)
- [x] Documentation complete (8 comprehensive files)
- [x] Production architecture defined and integrated

**Current State**: ✅ **FEATURE COMPLETE** - Ready for final validation and deployment

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*
