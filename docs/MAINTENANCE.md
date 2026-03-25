# Maintenance and Deployment Guide (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the deployment lifecycle, operational maintenance, and disaster recovery strategies for the Ruang Aksara platform. It is designed for DevSecOps engineers and technical maintainers.

## 1. System Requirements & The Infrastructure Stack

Ruang Aksara is a 100% serverless application, optimized for execution on Vercel with a multi-layered persistence backend.

### 1.1 Core Matrix
- **Runtime**: Node.js 20.x (LTS).
- **Primary Database**: Supabase (PostgreSQL 15+).
- **Connection Management**: PgBouncer (Port 6543) for serverless pooling.
- **Cache Layer**: Upstash Redis (Global Serverless HTTP/RESP).
- **Media Delivery**: ImageKit.io (Real-time CDN).
- **Authentication**: NextAuth.js (JWT-based).

## 2. Deployment Lifecycle: Git-to-Edge

The platform utilizes a modern CI/CD flow provided by Vercel integration.

### 2.1 The Build Pipeline
1. **Source Control**: Development occurs on feature branches. Merge to `main` triggers the production build.
2. **Environment Variable Injection**: Vercel injects production-only secrets (e.g., `IMAGEKIT_PRIVATE_KEY`, `DATABASE_URL`).
3. **PWA Generation**: During the `next build` phase, `next-pwa` generates the Service Worker (`sw.js`). This logic relies on the existence of a valid `manifest.json` in the `/public` directory.
4. **Edge Deployment**: The Edge Middleware is deployed to 20+ global regions simultaneously, ensuring that RBAC checks happen at the network edge.

### 2.2 Post-Deployment Validation
Every deployment is automatically audited for:
- **Build Integrity**: Ensure all `revalidateTag` calls match defined namespaces.
- **Middleware Velocity**: Verification that authorization latency remains <15ms.

## 3. Quantitative Maintenance: Scheduled Operations

To overcome the challenges of a serverless/free-tier mix, we implement active system heartbeats.

### 3.1 Vercel Cron Scheduling (`vercel.json`)
We maintain two critical maintenance pipelines:
- **Pipeline A: The Heartbeat (`/api/cron/keep-alive`)**
    - **Frequency**: Daily (00:00 UTC).
    - **Logic**: Executes a `SELECT 1` on PostgreSQL and a `PING` on Redis.
    - **Rationale**: Supabase and Upstash free tiers may hibernate or pause after 7 days of inactivity. This job ensures the "Sanctuary" is always ready for visitors.
- **Pipeline B: The Data Drain (`/api/cron/sync-views`)**
    - **Frequency**: Daily (01:00 UTC).
    - **Logic**: Aggregates view counts from the transient Redis buffer into the persistent PostgreSQL database.
    - **Rationale**: Protects the main database from write-volume exhaustion while ensuring long-term historical view data is never lost.

## 4. Security Auditing & Production Health

### 4.1 Monitoring Checklist
Technical maintainers should perform a weekly audit of the following metrics:
- **Vercel Runtime Logs**: Check for `504 Gateway Timeout` errors, which may indicate a slow external service (e.g., ImageKit or Supabase).
- **Supabase Dashboard**: Monitor "Database Connections" vs. "Pool Size." The `DIRECT_URL` should only be used for migrations; application traffic must use the pooled `DATABASE_URL`.
- **ImageKit Usage**: Monitor the bandwidth and storage limits to prevent delivery interruption of novel covers.

### 4.2 Environment Variable Security Matrix
- **Critical Leak Risks**: `DATABASE_URL`, `NEXTAUTH_SECRET`, `UPSTASH_REDIS_REST_TOKEN`, `IMAGEKIT_PRIVATE_KEY`.
- **Mitigation**: These keys are never included in the source code or client-side bundles. They are stored exclusively in the Vercel Dashboard and encrypted at rest.

## 5. Disaster Recovery & Continuity

### 5.1 Database Longevity
- **Snapshots**: Supabase provides automatic nightly snapshots of the PostgreSQL database.
- **Point-in-Time Recovery (PITR)**: (Requires Pro tier) For critical data loss, PITR allows the team to roll back the database to a specific millisecond before an incident.

### 5.2 Version Control Resiliency
- **Instant Rollbacks**: In the event of a catastrophic production bug (e.g., a broken PWA manifest), Vercel allows for a single-click rollback to the previous stable deployment hash, restoring the sanctuary in seconds.

Document Version: 1.3.0 