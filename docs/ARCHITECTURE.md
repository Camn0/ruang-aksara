# Architecture and Data Flow

This document details the technical infrastructure and data management of Ruang Aksara.

## Rendering Strategy
Next.js 14 (App Router) is used primarily with React Server Components (RSC). 
- Server Components handle data fetching, reducing client-side JavaScript.
- Server Actions are used for mutations (POST, PUT, DELETE), providing built-in type safety and removing the need for traditional API endpoints.

## Database and ORM
- PostgreSQL (Supabase): Stores all persistent data, including users, works, and social interactions.
- Prisma: Used as the Object-Relational Mapper (ORM) for schema management and type-safe queries.
- Connection Pooling: Managed via PgBouncer on port 6543 to handle surge connections from serverless functions.

## Caching Strategy
A multi-layered approach ensures low latency.
- Fetch Cache (unstable_cache): Next.js internal caching for frequently read data like trending lists and public profiles.
- Tag-based Revalidation: used to invalidate specific cache entries (e.g., library-userId) when data changes.
- Redis (Upstash): Used for high-speed ledger operations like view counts and real-time streaks.

## Background Synchronization
Redis data is synced to the main PostgreSQL database via a Vercel Cron job (/api/cron/sync-views). This balance allows for high-concurrency writes without overloading the primary database.
