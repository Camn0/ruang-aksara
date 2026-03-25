# Ruang Aksara

![Next JS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)                                        
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis&logoColor=white)

Next.js and Prisma digital reading PWA with a multi-role CMS. This project integrates a markdown author studio, analytical dashboards, gamified reading streaks, and high-performance layered caching.

<img width="1919" height="1079" alt="Ruang Aksara Preview" src="https://github.com/user-attachments/assets/07768cb7-f394-4fc6-8fd8-78d2bedb9a6f" />

## Status: Experimental
Ruang Aksara is in active development. Features are added frequently. Breaking changes to the database schema or internal APIs are common. Use at your own risk.

## Tech Stack
- Framework: Next.js 14 (App Router)
- Database: PostgreSQL (Supabase)
- ORM: Prisma
- Cache: Redis (Upstash)
- Media: ImageKit.io
- Auth: NextAuth.js

## Requirements
- Node.js 20+
- Supabase Project (PostgreSQL)
- Upstash Redis instance
- ImageKit Account

## Getting Started

1. Clone and Install
   ```bash
   git clone https://github.com/Camn0/ruang-aksara.git
   cd ruang-aksara
   npm install
   ```

2. Environment Setup
   Create a .env file in the root directory:
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

3. Database Setup
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Run Development Server
   ```bash
   npm run dev
   ```

## Key Features
- Multi-Role CMS: Separate interfaces for Readers, Authors, and Admins.
- Markdown Studio: Authoring suite with markdown to HTML conversion.
- Analytical Dashboards: Activity maps and growth tracking for works.
- Reading Interface: Distraction-free reader with customizable typography and themes.
- Engagement Tools: Notification system, comment voting, and chapter reactions.
- Gamification: Persistence tracking via reading streaks and XP logic.

## Deployment and Maintenance
This project is optimized for Vercel. 

### Cron Jobs
To avoid Supabase inactivity pauses and maintain cache currency, the following jobs are configured in vercel.json:
- /api/cron/keep-alive: Runs daily at 00:00 to keep Supabase and Redis active.
- /api/cron/sync-views: Runs daily at 01:00 to sync Redis view counters to the database.

Note: Requires CRON_SECRET environment variable.

## Docs
- [Absolute Encyclopedia](file:///d:/Codes/ruang-aksara/ABSOLUTE_ENCYCLOPEDIA.md): A comprehensive technical record and roadmap.
- [Architecture](file:///d:/Codes/ruang-aksara/docs/ARCHITECTURE.md): Deep-dive into Next.js rendering and caching.
- [Features](file:///d:/Codes/ruang-aksara/docs/FEATURES.md): Detailed breakdown of reader and author studio capabilities.
- [Database Schema](file:///d:/Codes/ruang-aksara/docs/DATABASE_SCHEMA.md): Summary of the Prisma data models and relationships.
- [API and Actions](file:///d:/Codes/ruang-aksara/docs/API_AND_ACTIONS.md): Overview of Server Action patterns and internal endpoints.
- [Social Engine](file:///d:/Codes/ruang-aksara/docs/SOCIAL_ENGINE.md): Technical logic for nested comments, reviews, and notifications.
- [Maintenance](file:///d:/Codes/ruang-aksara/docs/MAINTENANCE.md): Deployment, environment setup, and monitoring guide.

## License
MIT License.
