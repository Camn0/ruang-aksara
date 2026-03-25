# Server Actions and Interface Protocol (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the Server Action patterns, internal API protocols, and cache revalidation strategies that power the Ruang Aksara interface. This is the primary reference for developers building new features or modifying the data mutation layer.

## 1. The Server Action Engineering Pattern

Ruang Aksara uses Next.js Server Actions as its primary mutation layer. This replaces traditional REST APIs, offering end-to-end type safety and reducing the overall complexity of the codebase.

### 1.1 Anatomy of an Action
All actions are located in the `app/actions/` directory and follow a strict, standardized execution lifecycle:

1. **Authentication Interception**:
   Every action begins by resolving the server-side session. 
   ```typescript
   const session = await getServerSession(authOptions);
   if (!session) return { error: "Unauthorized" };
   ```
2. **Standardized Input Parsing**:
   Data is extracted from `FormData` or plain objects. We prioritize type-safe property extraction to prevent `undefined` runtime errors.
3. **Execution & Logic**:
   Queries are performed using the Prisma `Client`. 
4. **Resiliency Response**:
   Instead of throwing unhandled exceptions, actions return a standardized object:
   - `{ success: true, data: T }`
   - `{ error: string }`

## 2. Quantitative Cache Revalidation Map

Ruang Aksara uses a "Precision Invalidation" strategy (`revalidateTag`) to maintain data freshness without sacrificing the performance of the Global Data Cache.

| Namespace | Tag Format | Triggering Action | Rationale |
| --- | --- | --- | --- |
| **Novel Meta** | `karya-${id}` | `updateNovel`, `submitRating` | Clears the main landing page and chapter list when metadata or rating aggregate changes. |
| **Reader Stats** | `stats-${userId}` | `updateReadingProgress` | Re-triggers the Dashboard to update the Streak counter and Level after a valid read. |
| **User Profile** | `profile-${userId}`| `updateUserProfile` | Syncs new avatars and bios across all social contexts (comments, reviews). |
| **Library** | `library-${userId}`| `toggleBookmark` | Refreshing the user's shelf without a full page reload. |
| **Social** | `community-posts` | `createPost` | Purges the global Author Post feed when new content is published. |

## 3. Failure Mode Recovery (Action Resiliency)

Engineering for the "Optimistic Path" is insufficient. We document the failure modes for our primary mutation vectors.

### 3.1 Media Pipeline Timeout (ImageKit)
- **Scenario**: The author uploads a 10MB cover on a 3G connection. The serverless function times out before ImageKit returns the `fileId`.
- **Mitigation**: Our `uploadToImageKit` action uses a 30-second timeout. If exceeded, we return a "Partial Failure" code. The UI then prompts the user to "Retry Asset" without clearing their typed novel metadata, preserving author effort.

### 3.2 Redis Buffer Saturation
- **Scenario**: A massive traffic burst causes the Upstash Redis rate limit to be hit.
- **Mitigation**: The `redis.incr` call is wrapped in a `try/catch` block. If Redis is unavailable, the application falls back to "Graceful Degradation"—the view count is not incremented, but the user is **NOT** prevented from reading the chapter. Literature access is prioritized over analytics integrity.

### 3.3 Database Transaction Deadlocks
- **Scenario**: Two users submit a rating for the same novel at the exact same millisecond.
- **Mitigation**: We use Prisma's optimistic concurrency control. If a deadlock is detected during the `$transaction` (see Social Engine), the action retries the logic up to 3 times before returning a user-facing "System Busy" error.

## 4. Internal API & Scheduled Infrastructure

Beyond Server Actions, specific protocols require standard HTTP endpoints.

### 4.1 The Vercel Cron Pipeline (`/api/cron/*`)
These endpoints are secured via the `CRON_SECRET` header and are orchestrated by the `vercel.json` schedule.
- **Heartbeat (`/api/cron/keep-alive`)**: 
    - **Logic**: Performs a simple `SELECT 1` on Supabase.
    - **Why**: Prevents Supabase hibernation logic on free-tier instances, ensuring the database is always "Warm" for the first morning users.
- **Data Sync (`/api/cron/sync-views`)**:
    - **Logic**: Reads transient values from Redis (`views:karya:*`) and aggregate-persists them to PostgreSQL.
    - **Why**: Offloads thousands of high-frequency DB writes to a single batched process, preserving database IOPS.

## 5. Key Action Module Deep-Dive

### 5.1 `user.ts` (Social & Analytics Engine)
- **`updateReadingProgress`**: Implements the 30-second anti-cheat threshold. It atomically updates the `Bookmark` and `UserStats` models using a Prisma transaction.
- **`submitRating`**: Aggregates star ratings in real-time. It ensures that the `avg_rating` in the `Karya` model is always mathematically accurate to the constituent `Rating` records.

Document Version: 1.3.1 