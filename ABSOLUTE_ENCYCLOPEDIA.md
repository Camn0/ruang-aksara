# Absolute Encyclopedia of Ruang Aksara

This document provides a technical record and guide for the Ruang Aksara ecosystem.

## Vision
Ruang Aksara is a digital publishing platform designed to provide a tactile and immersive reading experience. It balances traditional journal aesthetics with modern server-side architecture.

## Architecture

### Server-First Logic
Next.js 14 is used with React Server Components (RSC) to minimize client-side JavaScript. 
- Atomic Mutations: Data changes are handled via Server Actions for type safety and simplicity.
- Hydration: Only interactive elements use client-side logic to keep performance high.

### Authentication
Managed via Next-Auth with JWT strategy.
- RBAC: Roles include admin, author, and user.
- Middleware: Protects sensitive routes at the edge.

### Caching
A multi-layered strategy is used to balance interactivity and speed.
- L1: Next.js Fetch Cache (unstable_cache) for trending data and lists.
- L2: Selective Revalidation using tags and paths for instant UI updates.
- L3: Upstash Redis for high-concurrency data like view counts and reactions.
- Database: Supabase (PostgreSQL) with connection pooling for serverless environments.

## Page Directory

### Discovery
- Landing Page: Dynamic hero section that adapts to login state.
- Search: Discovery engine with fuzzy matching and genre filtering.
- Onboarding: Animated entry flow using Framer Motion.

### Reader
- Dashboard: Track reading streaks and progress.
- Library: Managed bookshelf for ongoing and completed works.
- Reader: Distraction-free interface with typography and theme customization.

### Author Studio
- Dashboard: Overview of portfolio metrics and aggregate stats.
- Editor: Publishing suite for chapter management and metadata.
- Analytics: Growth charts and activity maps.
- Community: Centralized feed for comment moderation.

## Social Engine

### Notifications
The system uses a delimited context format to provide rich metadata.
- Context: Notifications store work titles and snippets of interaction.
- Anchor Logic: Navigates users to exact comment positions.

### Comments
Multi-tiered conversation system.
- Threading: Recursive logic for nested discussions.
- Voting: Reddit-style upvotes and downvotes to curate top feedback.
- Pinning: Authors can pin high-quality comments.

### Reviews
Separates long-form critiques from chapter discussions. Star ratings contribute to the overall work score.

### Gamification
- Streaks: Tracks daily consistency.
- Focus Thresholds: Ensures users spend enough time on a page before awarding points.
- XP System: Progression based on chapters completed.

## Design System

### Visual Palette (HSL)
- bg-cream: 42, 45%, 90%
- brown-dark: 20, 26%, 18%
- tan-primary: 28, 35%, 55%

### Typography
- Lobster: Used for branding.
- Inter: Used for system interface.
- Serif Fallbacks: Optimized for long-form reading.

## DevOps

### Core Dependencies
- Prisma: Type-safe database access.
- Lucide React: Iconography.
- Marked: Markdown transformation.
- Sonner: Toast notifications.

### Deployment
PWA generation is handled by next-pwa. Metadata and manifest are configured for a native app feel. Push notifications are implemented via the Web Push API.

Document Version: 1.2.0 (Studio Edition).
