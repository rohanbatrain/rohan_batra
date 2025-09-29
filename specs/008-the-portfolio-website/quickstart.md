# Quickstart Guide: Courses Section & Certification

**Date**: 2025-09-25  
**Feature**: Courses Section Expansion  
**Phase**: 1 - Development Setup and Testing

---

## Prerequisites

### Required Software
- Node.js 18+ with pnpm 9+
- Git
- MongoDB Atlas project (or local MongoDB for development)
- Clerk account with configured application
- Cloud storage for generated certificates (existing Cloudinary/S3 pipeline works)
- Second Brain Database (SBD) API credentials for external certificate issuance

### Environment Setup
1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```
2. Copy `.env.example` to `.env.local` and populate the variables listed below.
3. Ensure MongoDB connection string and Clerk keys are valid.
4. Configure certificate storage bucket (Cloudinary folder or S3 bucket) and verify credentials.
5. Obtain SBD API URL + key and verification base URL from the SBD team.
6. Seed demo content (optional) using existing scripts, then create sample courses via admin dashboard or fixtures.

### Environment Variables
Add the following entries to `.env.local` (extend existing variables as needed):
```env
# Database
MONGODB_URI="mongodb+srv://<user>:<password>@cluster.mongodb.net/portfolio"

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Courses & Certificates
CERTIFICATE_STORAGE_PROVIDER=cloudinary
CERTIFICATE_STORAGE_FOLDER=courses/certificates
CERTIFICATE_PORTFOLIO_BRAND="Rohan Batra Portfolio"
CERTIFICATE_PORTFOLIO_SIGNATURE_URL=https://.../signature.png
CERTIFICATE_PORTFOLIO_QR_BASE_URL=https://portfolio.rohanbatra.com/certificates
SBD_API_URL=https://api.secondbraindb.com/v1/certificates
SBD_API_KEY=sb_live_...
SBD_WEBHOOK_SECRET=whsec_...
SBD_VERIFICATION_BASE_URL=https://verify.secondbraindb.com/certificates

# Optional integrations
COURSE_RECOMMENDER_FEATURE_FLAG=true
COURSE_ANALYTICS_BUCKET=redis://...
```

---

## Development Environment

### Core Commands
```bash
# Start Next.js dev server with hot reload
pnpm dev

# Run lint + typecheck gates
pnpm lint
pnpm typecheck

# Run unit tests (Vitest)
pnpm test

# Execute Playwright UI smoke tests (when ready)
pnpm exec playwright test --project=chromium --config=playwright.config.ts

# Build production bundle
pnpm build

# Start production server locally
pnpm start
```

### Mock Data Utilities
```bash
# Seed demo portfolio/blog content (existing script)
pnpm run admin:migrate-demo

# Create an admin user for course authoring
pnpm run admin:create-db-admin

# Generate sample course scaffolding (new script planned in Phase 2)
pnpm tsx scripts/add-sample-course.ts
```

---

## User Story Validation Tests

### Story 1: Discover Courses
**Scenario**: Visitor browses the Courses index and views a course overview.
1. Visit `/courses` while signed out.
2. Verify featured carousel and filters render using existing card styles.
3. Click a course card and confirm the overview page shows hero media, summary, sticky CTA, and accordion curriculum.
4. Ensure lessons referencing blog posts display "View blog lesson" links that open existing pages in a new tab.
5. Confirm previewable lessons render inline markdown/video content without authentication.

**Expected**: Consistent UI with Books/Blogs, responsive layout, and SEO metadata present.

### Story 2: Enroll and Resume Progress
**Scenario**: Authenticated user enrolls, progresses through lessons, and sees progress tracked.
1. Sign in via Clerk.
2. Click "Enroll" on a course. Confirm enrollment badge appears and CTA switches to "Resume".
3. Complete a blog-linked lesson; returning to the course should mark it complete automatically.
4. Watch a video lesson; progress should increment after playback (manual mock event acceptable during dev).
5. Refresh page to ensure progress state persists and sticky nav highlights the current lesson.

**Expected**: Enrollment record created, progress bars update in real time, resume CTA returns to the last incomplete lesson.

### Story 3: External Resource Fallbacks
**Scenario**: External YouTube lesson becomes temporarily unavailable.
1. Temporarily block the YouTube embed (e.g., via devtools or stubbed response).
2. Reload the lesson; verify fallback UI shows warning and "Try again" action.
3. Confirm progress does not advance until the resource is accessible again.
4. Check admin notifications/logging for recorded outage (mock log acceptable in dev).

**Expected**: Graceful degradation without breaking the rest of the course experience.

### Story 4: Dashboard Overview
**Scenario**: Learner dashboard aggregates enrolled courses, progress, recommendations, and certificates.
1. Navigate to `/dashboard` while signed in.
2. Confirm "In Progress" cards mirror course progress percentages and show continue buttons.
3. Verify streak counters and time-spent metrics update after completing lessons.
4. Ensure recommendations surface relevant blogs/books tied to active courses.
5. Check Certificates tab shows issued credentials with provider filtering and download buttons.

**Expected**: Single API payload powers all widgets, load time <1.5s on cold start, and UI reuses existing card/progress styles.

### Story 5: Certificate Issuance (Portfolio Provider)
**Scenario**: Completing a course issues a Rohan Batra–branded certificate.
1. Complete all lessons in a course configured with the internal provider.
2. Trigger `/courses/{slug}/complete` (via UI or API call).
3. Confirm certificate status transitions to `issued` and Dashboard displays download/share actions.
4. Download PDF/PNG and inspect branding (logo, signature, accent colors) with consistent design tokens.
5. Hit the public verification URL and confirm certificate metadata renders for anonymous visitors.

**Expected**: Transactional consistency (progress → certificate) and accessible downloads.

### Story 6: Certificate Issuance (SBD Provider)
**Scenario**: Course configured for SBD provider triggers external issuance.
1. Update course to use `providerKey: sbd`.
2. Complete the course and observe webhook call to SBD (inspect logs or stub).
3. Verify certificate record stores `sbdReferenceId` and `verificationUrl` pointing to SBD.
4. Confirm local PDF/PNG still generated for display while SBD handles verification.
5. Retry flow with SBD API offline; ensure certificate remains `pending` with retry policy.

**Expected**: Multi-provider flow functional with resiliency on external failures.

### Story 7: Admin Curriculum Management
**Scenario**: Admin edits modules and lessons using drag-and-drop interface.
1. Sign in as admin and visit `/admin/courses`.
2. Create a new course or open an existing draft.
3. Reorder modules and lessons; save should bump `structureVersion` and reflect changes instantly for learners.
4. Add a new standalone lesson using the Novel.sh editor and embed an existing Lottie animation.
5. Attempt to publish with a missing required lesson; validation should highlight the issue.

**Expected**: Curriculum API accepts full payload updates, publishes only when guard rails pass, and reuses existing editor components.

### Story 8: Accessibility & Performance
**Scenario**: Validate that course pages and dashboard meet accessibility and speed targets.
1. Run Lighthouse audit on `/courses/{slug}` and `/dashboard` (desktop & mobile).
2. Target Core Web Vitals: LCP < 2.5s, CLS < 0.1, TBT < 300ms.
3. Navigate with keyboard to ensure sticky navigation and accordion controls maintain focus states.
4. Use VoiceOver/NVDA to confirm semantically correct headings and aria attributes.
5. Confirm certificate download buttons announce file format and size to screen readers.

**Expected**: Meets accessibility standards and stays within performance budgets.

---

## API & Integration Smoke Tests

```bash
# Fetch paginated courses (public)
curl -s http://localhost:3000/api/courses | jq '.courses[0].title'

# Enroll in a course (authenticated)
curl -s -X POST http://localhost:3000/api/courses/fullstack-foundations/enroll \
  -H "Authorization: Bearer $CLERK_SESSION_JWT" | jq '.enrollment.status'

# Update progress
curl -s -X PUT http://localhost:3000/api/courses/fullstack-foundations/progress \
  -H "Authorization: Bearer $CLERK_SESSION_JWT" \
  -H "Content-Type: application/json" \
  -d '{"completedLessonIds": ["66fcf7..."], "currentLessonId": "66fcf8..."}'

# Retrieve dashboard summary
curl -s http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer $CLERK_SESSION_JWT" | jq '.metrics'

# Trigger certificate completion
curl -s -X POST http://localhost:3000/api/courses/fullstack-foundations/complete \
  -H "Authorization: Bearer $CLERK_SESSION_JWT" | jq '.certificate.status'
```

---

## Monitoring & Troubleshooting

- **Logs**: Verify course enrollment and lesson completion events flow into existing analytics pipeline (Redis/segment).
- **SBD Webhooks**: Configure webhook endpoint `/api/certificates/sbd/webhook`, ensure signature validation and retry strategy.
- **Background Jobs**: Use queue dashboard (e.g., BullMQ/Redis) to monitor certificate rendering and PNG conversion jobs.
- **Data Integrity**: Run auditing script (planned) to recalc progress after curriculum edits.

### Common Issues
- **Missing blog slug**: Lesson displays fallback. Admin dashboard surfaces alert; fix by re-linking the blog or converting to standalone content.
- **External video blocked**: Fallback warns learners; ensure provider domain is whitelisted and API key quotas are healthy.
- **Certificate rendering failures**: Inspect worker logs, validate template assets exist, retry via `/admin/certificates/{id}/reissue`.

---

## Success Criteria Checklist

- ✅ Courses catalog live with responsive UI and reuse-first visuals.
- ✅ Enrollment → progress → completion pipeline works for blog, standalone, and video lessons.
- ✅ Dashboard surfaces enrolled courses, recommendations, streaks, and certificates from single API payload.
- ✅ Certificates issued for both portfolio and SBD providers, downloadable as PDF/PNG, with verification URLs.
- ✅ Admin tooling handles curriculum editing, publishing guard rails, and provider configuration.
- ✅ Accessibility and performance targets met, leveraging existing design tokens and component system.

This quickstart ensures developers can stand up, exercise, and validate the Courses experience end-to-end while honoring reuse and multi-provider certification requirements.
