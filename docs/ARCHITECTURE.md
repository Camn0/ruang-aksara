# Technical Architecture and Infrastructure (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the Ruang Aksara infrastructure. It is designed to serve as the definitive source of truth for the platform's architectural reasoning, serverless execution model, and data flow orchestration.

## 1. Core Philosophical Constraints & Engineering Tenets

The architecture of Ruang Aksara is not merely a collection of tools but a manifestation of specific engineering philosophies:

- **Server-First Aesthetic (Hydration-Lite)**: We believe the "Sanctuary" feel of the platform is undermined by heavy client-side JavaScript. Therefore, 90%+ of the application is delivered as pure HTML via React Server Components (RSC). Client-side React is reserved strictly for ephemeral UI state (e.g., appearance toggles, scroll tracking).
- **Edge-Enforced Security Boundaries**: Security is moved as close to the user as possible. By using the Vercel Edge Runtime for role-based access control (RBAC), we ensure that unauthorized requests are terminated before they even reach the heavy application server, saving CPU cycles and reducing attack surfaces.
- **Relational Integrity Over Flexibility**: While NoSQL offers scaling ease, Ruang Aksara prioritizes the "Literature" and "Social" relationships. We treat every novel, chapter, and comment as a sacred relational entity, enforcing strict cascading rules and composite unique constraints to prevent data corruption.

## 2. Rendering and Data Flow: The Next.js 14 App Router

Ruang Aksara utilizes the Full-Stack capabilities of Next.js 14, specifically the App Router architecture.

### 2.1 The Server Component Paradigm (RSC)
By default, every page and component in the `/app` directory is a Server Component. This allows us to:
- **Direct Database Injection**: We perform Prisma queries directly inside the component function. This eliminates the need for REST/GraphQL API layers for read operations, reducing latency and eliminating the "Waterfall" problem of client-side `useEffect` fetches.
- **Zero Bundle Impact**: Heavy libraries like `Prisma Client`, `date-fns`, and `marked` (markdown parser) are executed exclusively on the server. The user never downloads these bytes, keeping the "Magical Journal" interface fast and responsive even on low-end mobile devices.

### 2.2 Performance Engineering: Parallel Orchestration
In high-traffic endpoints, specifically the `ChapterPage` (`/novel/[id]/[no]`), we bypass the linear execution of data fetching by using an **Orchestration Pattern**.

```typescript
/**
 * RATIONALE: Avoiding the "Data Waterfall".
 * Instead of waiting for the Novel data to return before fetching the Chapter, 
 * we fire all independent requests simultaneously.
 */
const [chapter, navigation, session, karyaMeta] = await Promise.all([
    getCachedChapter(karyaId, chapterNo),
    getCachedNavigation(karyaId, chapterNo),
    getServerSession(authOptions),
    getCachedKaryaMeta(karyaId)
]);
```
This reduces the total "Wait Time" for the reader to the duration of the single slowest query, rather than the sum of all queries.

### 2.3 Selective Streaming (Suspense)
Components that take longer to resolve, such as the `CommentSection` or `AuthorRecommendations`, are wrapped in `Suspense` boundaries. The main "Hero" content (the chapter text) is delivered immediately, while the secondary social modules stream in as "Chunks" as they complete. This maximizes the Perceived Performance (LCP) for the reader.

## 3. The Quaternary Caching Taxonomy

To balance the high-concurrency needs of a social reading platform with the resource constraints of serverless functions, Ruang Aksara implements a four-layered caching engine.

### Layer 1: Next.js Fetch Cache (unstable_cache)
This is the primary layer for "Read-Heavy" data. 
- **Target**: Novel metadata, Author bios, Chapter navigational lists.
- **Mechanism**: Data is cached in Vercel's global data cache.
- **Revocation**: Surgical invalidation using `revalidateTag`. For example, when an author updates a novel, we call `revalidateTag(`karya-${id}`)`, ensuring only that specific novel's data is purged globally.

### Layer 2: In-Memory Volatile Layer (Upstash Redis)
Used for data that changes too rapidly for the PostgreSQL database to handle efficiently.
- **Target**: Live view counts, real-time engagement streaks, and trending scoreboards.
- **Mechanism**: Redis `INCR` and `HINCRBY` operations. These take <2ms and can handle thousands of concurrent writes per second.
- **Sync Routine**: Data is periodically "Drained" into PostgreSQL via scheduled jobs (see Maintenance).

### Layer 3: Global Edge Cache (CDN)
Static assets and the initial HTML shell are cached at the "Edge" (physical locations closest to the user). This ensures that a reader in Japan and a reader in New York both experience sub-100m TTFB (Time to First Byte).

### Layer 4: Client-Side UI Persistence (LocalStorage)
Used for "Personalized Interface State" that should not be synced to the database.
- **Target**: Font size preferences, dark/light/parchment theme choices, and vertical scroll offsets.
- **Mechanism**: The `ReadingInterface` component hydrates these settings on mount, preventing layout shifts (FOUC) and providing a localized, tactile feel.

## 4. Vertical and Horizontal Scaling: A Case Study

Our architecture is built to withstand sudden spikes in traffic (e.g., if an author's work goes viral on social media).

### 4.1 Scaling the Data Layer (The Vertical Approach)
While PostgreSQL is a traditional monolithic database, Supabase allows us to scale vertically:
- **Connection Pooling (PgBouncer)**: By using port 6543, we allow thousands of serverless function instances to share a hundreds of database connections. This prevents the "Connection Limit Exceeded" error typical of serverless-to-RDS connections.
- **Denormalization for Speed**: Our use of `avg_rating` and `total_views` columns (see Social Engine) means the database doesn't have to scan 1,000,000 rows to find the "Top Works." It simply reads one indexed float.

### 4.2 Scaling the Delivery Layer (The Horizontal Approach)
- **Vercel Edge Distribution**: Since our `middleware.ts` runs at the edge, even a massive surge of login requests is distributed across AWS/GCP regions globally.
- **Redis Multiplexing**: Upstash Redis is inherently distributed. If traffic surges in Europe, Upstash replicates the read-counters to their European nodes, ensuring that our "Write-Behind" pattern (see Background Sync) doesn't bottle-neck at the memory layer.

## 5. Edge Security & Authentication Logic

Security is a first-class citizen in the Ruang Aksara architecture.

### 5.1 Zero-Database RBAC (Role-Based Access Control)
Authentication is managed via `NextAuth.js` with the `JWT Strategy`. 
- **The Claim Pattern**: During the login phase, the user's role (`admin`, `author`, `user`) and unique ID are encoded into a signed, encrypted JWT.
- **The Middleware Gate**: The `middleware.ts` runs on the Edge Runtime. It intercepts every request. If a user attempts to access `/admin`, the middleware checks the JWT claim. If the role is not `admin`, the request is terminated at the edge. 
- **The Benefit**: No database query is required to check permissions. This protects the Supabase database from "Permission Exhaustion" during a targeted attack on administrative routes.

## 6. Background Synchronization (The Write-Behind Pattern)

To ensure the primary database remains responsive, we use a "Write-Behind" pattern for high-traffic writes like view counts.

### 6.1 View Lifecycle
1. **User Request**: A reader opens a chapter.
2. **Redis Buffer**: The application calls `redis.incr('views:karya:[id]')`. This is an O(1) operation taking almost zero resources.
3. **Scheduled Sync**: Every hour, a Vercel Cron job (`/api/cron/sync-views`) is triggered. 
4. **Aggregate Write**: The job pulls the counts from Redis and performs a single, batched `updateMany` in PostgreSQL.
5. **Key Cleanup**: Once verified, the Redis keys are deleted to reset the buffer.

## 7. Media Pipeline: Dynamic Asset Optimization

A digital sanctuary must be visually stunning but lightweight. We externalize all image processing to **ImageKit.io**.

### 7.1 Transformation Engineering
Instead of serving raw images, we use ImageKit's real-time transformation API:
- **Format**: `tr=f-auto` (Serves WebP or AVIF based on browser priority).
- **Quality**: `tr=q-80` (Standardized compression).
- **Size**: `tr=w-800` (Resizing on the fly based on the component's needs).
- **Safe-Area Cropping**: `tr=fo-auto` (Ensures faces or critical subjects are centered in cover previews).

Document Version: 1.3.1 
