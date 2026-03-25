# Maintenance and Deployment

This document guide the upkeep of the Ruang Aksara platform.

## Deployment
Ruang Aksara is optimized for Vercel. 
- Middleware: Handles global edge routing and authentication gates.
- PWA: next-pwa generates a service worker on build for offline caching.

## Environment Variables
Crucial variables required for operation:
- DATABASE_URL: PostgreSQL connection string.
- UPSTASH_REDIS_REST_URL: REST access to Redis.
- IMAGEKIT_PRIVATE_KEY: Credentials for media processing.
- CRON_SECRET: Security token for Vercel Cron jobs.

## Monitoring and Maintenance
- Vercel Cron Jobs: Used for database keep-alive and Redis synchronization.
- Logs: Vercel runtime logs should be monitored for build or execution errors.
- Database: Supabase dashboard provides insight into storage usage and database health.
- Redis: Upstash dashboard tracks cache hits and latency.
