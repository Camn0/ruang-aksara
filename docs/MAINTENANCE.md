# Maintenance and Deployment

This document guide the technical setup and upkeep of the Ruang Aksara platform.

## Requirements
- Node.js 20+
- Supabase Project (PostgreSQL)
- Upstash Redis instance
- ImageKit Account

## Getting Started

### 1. Clone and Install
```bash
git clone https://github.com/Camn0/ruang-aksara.git
cd ruang-aksara
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="your-supabase-url"
DIRECT_URL="your-direct-url"
NEXTAUTH_SECRET="your-secret"
UPSTASH_REDIS_REST_URL="your-redist-rest-url"
UPSTASH_REDIS_REST_TOKEN="your-token"
IMAGEKIT_PUBLIC_KEY="..."
IMAGEKIT_PRIVATE_KEY="..."
IMAGEKIT_URL_ENDPOINT="..."
CRON_SECRET="..."
```

### 3. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

## Deployment
Ruang Aksara is optimized for Vercel. 
- Middleware: Handles global edge routing and authentication gates.
- PWA: next-pwa generates a service worker on build for offline caching.

## Environment Variables
Crucial variables required for operation:
- **DATABASE_URL**: PostgreSQL connection string for Supabase.
- **UPSTASH_REDIS_REST_URL**: REST access to Redis for caching view counts.
- **IMAGEKIT_PRIVATE_KEY**: Credentials for media processing and chapter covers.
- **CRON_SECRET**: Security token for protecting Vercel Cron jobs.

## Cron Jobs
To avoid Supabase inactivity pauses and maintain cache currency, the following jobs are configured in `vercel.json`:
- `/api/cron/keep-alive`: Runs daily at 00:00 to keep Supabase and Redis active.
- `/api/cron/sync-views`: Runs daily at 01:00 to sync Redis view counters to the database.

*Note: Requires CRON_SECRET environment variable.*

## Monitoring and Maintenance
- **Vercel Cron Jobs**: Used for database keep-alive and Redis synchronization.
- **Logs**: Vercel runtime logs should be monitored for build or execution errors.
- **Database**: Supabase dashboard provides insight into storage usage and database health.
- **Redis**: Upstash dashboard tracks cache hits and latency.
