# The Absolute Encyclopedia of Ruang Aksara

![Next JS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis&logoColor=white)

> "A sanctuary where every word breathes, and every story finds its digital home."

**Ruang Aksara** is an industrial-grade, ultra-premium digital literary publication platform. It is engineered to marry the warmth of a traditional magical journal with the uncompromising performance of modern server-side architecture. This document is the **Absolute Record**, detailing every micro-feature, architectural decision, and design token within the ecosystem.

![スクリーンショット 2026-03-15 110811](https://hackmd.io/_uploads/HybzIhQq-g.png)


## System Overview

The platform is built on a "Server-First" philosophy, leveraging modern caching and atomic data integrity to provide a sub-second user experience.

| Pillar | Technology / Execution |
| :--- | :--- |
| **Architectural Core** | Next.js 14 (App Router) using Server Components for zero-bundle-size rendering. |
| **Logic Layer** | TypeScript (100% Coverage) for end-to-end type safety between Database and UI. |
| **Persistence Hub** | PostgreSQL (managed by Supabase) utilizing the Prisma ORM for relational mapped data. |
| **Global State** | Next-Auth (JWT Strategy) with localized RBAC (Admin, Author, Reader). |
| **Engagement Caching**| Upstash Redis for real-time view counts, tracking analytics, and unstable_cache storage. |
| **Theming Engine** | Class-based dark mode using custom HSL design tokens for "Magical" aesthetics. |
| **Performance PWA** | Web App Manifest support for mobile "Save to Home Screen" native-like behavior. |
| **Mutative Actions** | Secure Server Actions with `revalidatePath` and `revalidateTag` for selective UI updates. |

---

## The Atlas: Comprehensive Page Directory

Ruang Aksara scales across 23+ unique view states, each optimized for specific user journeys.

### The Public Discovery Zone
1. **`/` (Landing Page)**:
   - High-impact hero section with value propositions for both authors and readers.
   - Dynamic redirections based on user session state.
2. **`/search` (The Grand Archive)**:
   - **Fuzzy Matching**: Real-time search across titles, synopses, and pen names.
   - **Genre Pill System**: Multi-select filtering for 12+ literary categories.
   - **Sorting Engine**: Toggle results by "Trending Today", "Top Rated", or "Latest Release".
   - **Contextual Redirection**: The `/novel` root intelligently redirects here to consolidate discovery.
3. **`/onboarding` (Gateway to the Journal)**:
   - **Interactive Animation**: Premium multi-step entry flow using Framer Motion.
   - **Role Selection**: Intent-based paths for "Writers" vs. "Readers".

### The Reader's Sanctuary
4. **`/user/dashboard` (The Reading Console)**:
   - **Hero Progress**: A massive "Continue Reading" card featuring the last accessed chapter.
   - **Gamification Hub**: Floating widgets for **Reading Streaks**, **XP Points**, and **Total Read Count**.
   - **Recommendation Sliders**: "Sedang Hangat" (Global Trending) vs "Update Terbaru" (Followed Authors).
5. **`/library` (The Personal Bookshelf)**:
   - **Categorization**: Auto-filtered stacks for "Sedang Dibaca" (Ongoing) and "Tamat" (Completed).
   - **History Tracking**: Visual progress bars (0-100%) for every work in the collection.
6. **`/novel/[karyaId]` (Details & Social)**:
   - **MetaData Hub**: Coverage of Title, Pen Name, Global Rating, and Synopsis.
   - **The Author Wall**: A mini-social feed for specific work updates.
   - **Threaded Reviews**: A formal review system with upvoting and pinned curation.
7. **`/novel/[karyaId]/[chapterNo]` (Reading Interface)**:
   - **Immersion Mode**: Floating navigation that hides during active reading.
   - **Digital Wellness**: Controls for Serif/Sans-serif fonts, line height, and margin padding.
   - **Engagement Pulse**: Emoji-based chapter reactions (Fire, Heart, Shock).

### The Author's Studio (HQ)
8. **`/admin/dashboard` (Studio Command)**:
   - **Aggregate Performance**: Total unique views, total bookmarks, and average rating overview.
   - **Work Portfolio**: A managed list for editing existing epics or spawning new ones.
9. **`/admin/stats` (The Data Nexus)**:
   - **Activity Map**: A GitHub-style bar chart tracking 30-day consistency.
   - **Save Velocity**: A real-time growth chart showing interest trends over the last 7 days.
   - **Sentiment Radar**: Visual breakdown of 5-star rating distributions.
10. **`/admin/community` (Moderation Hub)**:
    - **Unified Feed**: Manage every comment across all published works from one interface.
    - **Quick Reply**: Seamless communication loops between creators and their fanbase.

---

## Technical Blueprint

### 1. Database Relational Schema
Our schema (documented in `prisma/schema.prisma`) is architected for maximum social integrity.

- **`User`**: The central actor, linked to `UserStats` for gamification and `AuthorPost` for social.
- **`Karya`**: The vessel for literature, featuring **Denormalized Aggregates** (`avg_rating`, `total_views`) to ensure search performance without expensive joins.
- **`Bab` (Chapter)**: Atomic content units featuring strict `chapter_no` sequencing.
- **`Bookmark`**: Represents the "Save" link between users and works, tracking the `last_chapter` index.
- **`Social Components`**: Includes `Follow`, `Rating`, `Review`, `PostLike`, and `ChapterReaction`.

### 2. The Logic Engine: Server Actions
Mutations are handled in a protected server boundary to ensure data security.

| Action | Logic Path | Integrity Mechanic |
| :--- | :--- | :--- |
| `submitRating`| `user.ts` | Uses Prisma `$transaction` to update individual scores AND global averages atomically. |
| `updateReadingProgress` | `user.ts` | **Focus Engine**: Only awards points/streaks after a 30-second focus threshold. |
| `createAuthorPost` | `post.ts` | Dynamic revalidation ensures author walls update instantly for followers. |
| `toggleFollow`| `user.ts` | Uses composite keys to prevent duplicate social relationships. |

### 3. Caching & Persistence
- **Global Cache**: `unstable_cache` is used for discovery results, expiring every hour to balance freshness and speed.
- **Personal Cache**: `revalidateTag` handles user-specific data (Library/Stats), ensuring infinite snappiness for individual sessions.
- **Atomic Integrity**: All critical math (XP calculation, Average Ratings) is handled inside the Database via SQL aggregates to prevent drift.

---

## Design System: "The Magical Journal"

Ruang Aksara's visual identity is defined by high-end HSL design tokens located in `tailwind.config.ts`.

### Color Token Lexicon
| Token | Hex/HSL | Purpose |
| :--- | :--- | :--- |
| **`bg-cream`** | `#F2EAD7` | Primary Light background (Parchment). |
| **`brown-dark`** | `#3B2A22` | Primary Dark background (Espresso). |
| **`tan-primary`** | `#B08968` | Action brand color (Caramel Roast). |
| **`tan-light`** | `#D6BFA6` | Subtle shading and borders (Warm Cappuccino). |
| **`text-accent`** | `#F3E9D7` | High-contrast text on dark backgrounds. |

### Typography Hierarchy
- **Brand Flair**: **Lobster** (Cursive) for logos and emotional headers.
- **System Nav**: **Open Sans** (Sans-serif) for toolbars and structural data.
- **Story Body**: **Inter** (Variable) for high-legibility long-form reading.

---

## Operating Procedures

### 1. Developer Setup
```bash
# Clone and Initialize
git clone https://github.com/Camn0/ruang-aksara/
npm install

# Blueprint Synchronization
npx prisma generate
npx prisma db push

# Pulse Check
npm run dev
```

### 2. Environment Configuration
Requires a highly specific `.env` setup:
- **`DATABASE_URL`**: Transaction-pooled connection for Server Actions.
- **`DIRECT_URL`**: Non-pooled connection for system-level migrations.
- **`REDIS_URL`**: High-speed engagement ledger.
- **`NEXTAUTH_SECRET`**: 64-character encrypted secret for stateless JWTs.

---

*Ruang Aksara: Elevating Digital Literature through Precision Logic and Passionate Design.*
