# Research: Unified Admin Dashboard & Content Platform

## Technology Decisions

### Database Layer
**Decision**: Extend existing Mongoose models and formalize new ones (`Asset`, `User`, `Comment`, `SiteSetting`).
**Rationale**: This approach aligns with the existing data structure, ensures data integrity through schemas, and minimizes risk by making additive changes. It leverages the team's existing expertise with Mongoose.
**Implementation**: Update `BlogPost` and `Project` to reference a new, unified `Asset` collection. Formalize `User` and `Comment` models based on existing files. Create a new `SiteSetting` model for global configuration.

### Caching Layer
**Decision**: Implement Redis for server-side caching.
**Rationale**: Redis is an industry-standard, in-memory data store that provides extremely fast read/write operations. It's ideal for caching frequently accessed data that doesn't change often, significantly reducing database load and improving API response times for public-facing content.
**Implementation**: Use a managed Redis instance (e.g., Vercel KV, Upstash). Implement a cache-aside strategy for data like site settings and a time-to-live (TTL) strategy for component data like popular posts.
**Alternatives**: In-memory application cache (rejected: not persistent, doesn't scale across multiple server instances), Database-level caching (rejected: less performant than a dedicated in-memory store).

### Unified Asset Management
**Decision**: Use a dedicated external service (e.g., Cloudinary) for all asset uploads, optimization, and delivery.
**Rationale**: A specialized service offloads complex tasks like image/video optimization, format conversion, and global delivery via CDN. This provides superior performance, reliability, and a better user experience than self-hosting, while simplifying the application architecture.
**Implementation**: Create a unified `Asset` model in MongoDB to store metadata and the provider's asset URL/ID. All uploads from the admin dashboard will go through a server-side handler that pushes the file to Cloudinary and creates the corresponding `Asset` document.
**Alternatives**: Self-hosting on Vercel (rejected: limitations on storage and execution time for optimization), Storing assets in MongoDB (rejected: inefficient, costly, and not designed for file streaming).

### AI Content Assistance
**Decision**: Integrate with a large language model provider (e.g., OpenAI).
**Rationale**: Leveraging a state-of-the-art LLM provides powerful and flexible content generation capabilities (drafting, summarizing, SEO suggestions) that would be impossible to build in-house.
**Implementation**: Use the provider's official Node.js SDK. Secure API keys using environment variables. Create a dedicated API route (`/api/admin/ai/*`) to proxy requests to the AI service, allowing for server-side control and error handling.

### Scheduling System
**Decision**: Continue using database-driven cron jobs.
**Rationale**: This is a reliable and simple pattern that is already in place. A background job (e.g., a Vercel Cron Job) queries the database for posts scheduled to be published and updates their status.
**Implementation**: A cron job runs every minute, querying for `BlogPost` documents where `status: 'scheduled'` and `scheduledAt <= new Date()`.

## Implementation Patterns

### Caching Strategy (Redis)
1.  **Cache-Aside for Critical Data**: For data like site settings, the application logic is: try to fetch from Redis first. If it's a cache miss, fetch from MongoDB, populate the Redis cache, and then return the data.
2.  **Scheduled Cache Population**: For analytics data, a background job will periodically compute the metrics and write them to a well-known Redis key (e.g., `analytics:dashboard`). The frontend reads directly from this cache.
3.  **Time-to-Live (TTL) for Semi-Dynamic Data**: For components like "popular posts," the data will be cached with a short TTL (e.g., 15 minutes). This ensures the data is mostly fresh without hitting the database on every request.
4.  **Targeted Invalidation**: When an admin updates a `SiteSetting` or a blog post's details change, specific cache keys will be explicitly deleted (invalidated) to force a refresh on the next request.

### Data Migration Strategy
1.  **One-Time, Idempotent Script**: Create a `tsx` script in the `/scripts` directory (e.g., `migrate-hardcoded-data.ts`).
2.  **Execution**: The script will be run manually from the command line. It will read all hardcoded data from the application source.
3.  **Transformation**: It will transform this data to fit the new, unified data models (e.g., creating `Asset` documents for images).
4.  **Upsert Logic**: Use `findOneAndUpdate` with `upsert: true` based on a unique key (like a slug) to ensure that running the script multiple times does not create duplicate documents.
5.  **Post-Migration**: After the script is successfully run and verified in production, the hardcoded data will be removed from the codebase.

### Security Considerations
1.  **Securing Keys**: All external service API keys (Clerk, MongoDB, Redis, Cloudinary, OpenAI) MUST be stored as environment variables and never be exposed client-side.
2.  **Role-Based Access Control (RBAC)**: All admin API endpoints MUST be protected by Clerk middleware that verifies a valid session and checks for the required role (`admin` or `editor`).
3.  **Input Sanitization**: All user-generated content (especially rich text for comments or posts) MUST be sanitized on the server to prevent XSS attacks.
4.  **Rate Limiting**: Apply rate limiting to sensitive or expensive endpoints, such as AI generation, asset uploads, and authentication.
5.  **Redis Security**: The Redis instance should be accessible only from application servers, not the public internet. Use strong credentials.

## Performance Optimizations
1.  **Primary: Redis Caching**: The most significant performance gain will come from serving public data (settings, popular posts) from Redis, avoiding database queries entirely for most public page loads.
2.  **Secondary: Database Indexing**: Maintain strategic indexes on MongoDB collections for all common query patterns used by the admin dashboard (filtering by status, sorting by date, etc.).
3.  **Tertiary: Asset Optimization**: Cloudinary will automatically handle image and Lottie optimization, resizing, and serving them in modern formats (like WebP) from a global CDN.
4.  **Code Splitting**: Continue to leverage Next.js features like dynamic imports (`next/dynamic`) to lazy-load heavy admin components or libraries.

## Testing Strategy

### Unit & Integration Testing
- **Models**: Test all Mongoose schema validations, especially for the new `Asset` and `SiteSetting` models.
- **API Endpoints**: Write contract tests for every new admin API endpoint, covering success cases, validation errors, and authentication/authorization failures.
- **Services**: Test the logic for interacting with external services (Cloudinary, Redis, OpenAI), using mocks to isolate the tests.
- **Data Migration**: Write a dry-run mode for the migration script to verify its logic without writing to the database.

### End-to-End (E2E) Testing
- **Admin Workflows**: Use Playwright to simulate an admin logging in and performing key tasks: uploading an asset, creating a post using that asset, changing a site setting, and moderating a comment.
- **Cache Behavior**: Write tests to verify that updating a setting correctly invalidates the cache and the change is reflected on the public site.
- **Role Permissions**: Write tests to ensure an 'editor' cannot access 'admin-only' pages like User Management.
