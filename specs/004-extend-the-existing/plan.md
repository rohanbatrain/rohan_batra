# Implementation Plan: Unified Admin Dashboard & Content Platform

**Feature Branch**: `004-extend-the-existing`  
**Status**: Ready for Implementation

This plan outlines the development strategy for building the Unified Admin Dashboard. It is broken down into logical phases, with each task building upon the previous ones.

## Phase 1: Foundation & Data Migration

This phase focuses on setting up the necessary infrastructure, updating the data models to match the new specification, and migrating all hardcoded data to the database.

1.  **[ ] Setup Environment & Dependencies**
    -   Install necessary packages: `ioredis` for Redis integration, `@cloudinary/url-gen` and `@cloudinary/react` for asset management, and an AI provider SDK (e.g., `openai`).
    -   Configure environment variables (`.env.local`) for Redis, Cloudinary, and the AI provider API keys.
    -   Establish a connection to Redis in a new `lib/redis.ts` utility file.

2.  **[ ] Update Data Models (Mongoose)**
    -   Create `src/models/Asset.ts` for the new unified asset collection.
    -   Create `src/models/SiteSetting.ts` for global site settings.
    -   Update `src/models/User.ts` to include `role`, `lastLoginAt`, and `activityMetrics`.
    -   Update `src/models/Comment.ts` to include `moderationStatus`.
    -   Refactor `src/models/BlogPost.ts` and `src/models/Project.ts` to replace embedded image/Lottie data with references (`ObjectId`) to the `Asset` collection.

3.  **[ ] Implement Data Migration Script**
    -   Create a script at `scripts/migrate-to-unified-models.ts`.
    -   The script will read all hardcoded data from the application source.
    -   It will create `Asset` documents for each unique image/Lottie file.
    -   It will then update `BlogPost` and `Project` documents to reference the newly created `Asset` documents.
    -   The script must be idempotent, using `findOneAndUpdate` with `upsert: true`.
    -   After successful migration, manually remove the old hardcoded data from the codebase.

## Phase 2: Core Admin Features

This phase involves building the core CRUD interfaces for the new management sections of the admin dashboard.

4.  **[ ] Implement Unified Asset Management**
    -   Create API routes in `src/app/api/admin/assets/` for CRUD operations on assets.
    -   Build the UI components in `src/components/admin/assets/` for uploading, viewing, and editing assets. The UI should support filtering by asset type.
    -   The upload handler will push files to Cloudinary and create the `Asset` document.

5.  **[ ] Implement User Management**
    -   Create API routes in `src/app/api/admin/users/` to list users and update their roles.
    -   Build the UI components in `src/components/admin/users/` to display a list of users and allow admins to change a user's role via a dropdown menu.

6.  **[ ] Implement Comment Moderation**
    -   Create API routes in `src/app/api/admin/comments/` to list comments by status and update a comment's status.
    -   Build the UI components in `src/components/admin/comments/` to display a moderation queue (defaulting to 'pending' comments) with buttons to approve, mark as spam, or reject.

7.  **[ ] Implement Site Settings Management**
    -   Create API routes in `src/app/api/admin/settings/` to get and update all site settings.
    -   Build the UI components in `src/components/admin/settings/` to display a form where admins can edit global site settings.

## Phase 3: Feature Enhancements & Caching

This phase focuses on integrating advanced features like Redis caching and AI assistance, and refactoring existing modules to use the new systems.

8.  **[ ] Integrate Redis Caching**
    -   Implement the cache-aside strategy for public site settings.
    -   Create a background job (Vercel Cron) to populate the analytics dashboard cache.
    -   Implement TTL-based caching for public-facing components like "popular posts".
    -   Implement cache invalidation logic in the API routes for `SiteSetting` and `BlogPost` updates.

9.  **[ ] Refactor Blog & Portfolio Management**
    -   Update the blog and portfolio creation/editing forms in `src/components/admin/blog/` and `src/components/admin/portfolio/` to use the new Asset Management UI for selecting cover images and gallery items.
    -   Remove the old direct image upload logic.

10. **[ ] Implement AI Content Assistance**
    -   Create API routes in `src/app/api/admin/ai/` for generating drafts and summaries.
    -   Integrate buttons into the blog post editor UI that call these API routes and populate the editor with the AI-generated content.

11. **[ ] Implement Analytics Dashboard**
    -   Create a new page at `src/app/admin/analytics/page.tsx`.
    -   Build UI components in `src/components/admin/analytics/` to display charts and stats.
    -   The page will fetch data from the `/api/admin/analytics/summary` endpoint, which reads directly from the Redis cache.

## Phase 4: Finalization & Deployment Readiness

This phase ensures the feature is robust, well-documented, and ready for production.

12. **[ ] End-to-End Testing**
    -   Write Playwright tests to cover the main admin workflows (user management, content creation with assets, comment moderation, settings updates).
    -   Verify that role-based access controls work as expected (e.g., an editor cannot access user management).
    -   Test cache invalidation logic.

13. **[ ] Documentation**
    -   Update `docs/admin-guide.md` (or create it) to reflect all new admin dashboard features.
    -   Update `quickstart.md` with instructions on setting up the new environment variables.

14. **[ ] Code Cleanup & Refinement**
    -   Review all new code for adherence to style guides and best practices.
    -   Ensure all new components have proper error handling and loading states.
    -   Remove any feature flags or temporary code used during development.
