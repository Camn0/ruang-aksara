# The Absolute Encyclopedia of Ruang Aksara

![Next JS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white) ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)                                        
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white) ![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis&logoColor=white)

> "A sanctuary where every word breathes, and every story finds its digital home."

**Ruang Aksara** is an industrial-grade, ultra-premium digital literary publication platform. It is engineered to marry the warmth of a traditional magical journal with the uncompromising performance of modern server-side architecture. This document is the **Absolute Record**, detailing every micro-feature, architectural decision, and design token within the ecosystem.

<img width="1919" height="1079" alt="image" src="https://github.com/user-attachments/assets/07768cb7-f394-4fc6-8fd8-78d2bedb9a6f" />

---

## Executive Summary & Vision

Ruang Aksara was born from a singular vision: to transform the digital reading experience from a sterile, plastic interface into a tactile, immersive journey. In an era of generic web design, Ruang Aksara stands as a "Digital Artifact"—a space that feels as heavy and important as a leather-bound grimoire, yet as fast and fluid as the most modern social media giants.

The platform is not merely a CMS (Content Management System) for novels; it is a **Social Literary Ecosystem**. It provides authors with professional-grade analytical tools (The Studio) while giving readers a gamified, immersive sanctuary (The Reader Interface).

---

## The Architectural Blueprint

### 1. The "Server-First" Philosophy
Ruang Aksara leverages **Next.js 14** (App Router) to its fullest extent. By utilizing **React Server Components (RSC)**, we achieve a near-zero JavaScript bundle for the discovery and reading pages. This ensures that even on low-end mobile devices or slow networks, the "Magical Journal" opens instantly.

- **Atomic Mutations**: All data changes—from upvoting a comment to publishing a 5,000-word chapter—are handled via **Server Actions**. This eliminates the need for separate API routes and provides a seamless developer experience with built-in type safety via TypeScript.
- **Hydration Strategy**: We use selective hydration. Only interactive elements (like the Reading Settings panel or the Comment Section) carry client-side logic, keeping the core content delivery purely server-rendered and SEO-optimized.

### 2. Global State & Authentication
Authentication is managed via **Next-Auth** using the JWT strategy.
- **RBAC (Role-Based Access Control)**: The system distinguishes between `admin` (super-user), `author` (authorized creators), and `user` (readers). 
- **Middleware Protection**: Routes like `/admin/*` and `/studio/*` are gated at the edge, preventing unauthorized access before the request even reaches the server.

### 3. Caching Architecture & Persistence
Performance is sustained through a multi-layered caching strategy that balances real-time interactivity with high-speed read operations:
- **L1: Next.js Fetch Cache (unstable_cache)**: Critical data—such as Trending Novels and Genre Lists—are wrapped in `unstable_cache`. This reduces the load on the database by serving pre-fetched results, with background revalidation occurring every 60 minutes.
- **L2: Selective Revalidation (Tags & Paths)**: We implement fine-grained invalidation using `revalidateTag` (e.g., `notifications-userId`, `library-userId`) and `revalidatePath`. This ensures that when a user bookmarks a work or receives a notification, the UI updates instantly without affecting the global site cache.
- **L3: Redis Ledger (Real-time Engagement)**: **Upstash Redis** is deployed as a high-concurrency ledger for "hot" data. It tracks **Live View Counts**, **Chapter Reactions**, and **Reading Streaks**, allowing for millisecond-latency writes that are later synchronized with the PostgreSQL main database.
- **Database Hybridity**: We utilize **Supabase** for its robust PostgreSQL features, including **Row Level Security (RLS)** and **Connection Pooling** (via PgBouncer on port 6543) to handle the surge of stateless connections typical of Serverless/Server Action environments.

---

## The Atlas: Comprehensive Page Directory

### 1. The Public Discovery Zone
- **`/` (Landing Page)**: The portal. Features a dynamic hero section that adapts to the user's login state. Newcomers see a call to adventure, while returning users see their most recent library progress.
- **`/search` (The Grand Archive)**: A heavy-duty discovery engine. It supports fuzzy matching across titles and pen names. The "Genre Pill" system allows for intuitive filtering, while the sorting engine handles complex logic like "Top Rated" (calculated via Bayesian averages in the database).
- **`/onboarding`**: A premium, animated entry flow that defines the user's intent. It utilizes **Framer Motion** to create a "liquid" transition between steps.

### 2. The Reader's Sanctuary
- **`/user/dashboard`**: The "Command Center" for the reader. It displays the **Reading Streak** (gamified consistency tracking) and "Continue Reading" cards that remember the exact chapter and scroll position.
- **`/library`**: A curated bookshelf. Works are automatically categorized into "Ongoing" and "Completed". Progress bars provide immediate visual feedback on reading status.
- **`/novel/[karyaId]`**: The "Work Profile". Features a majestic header with cover art and a social wall where authors can post updates directly to their readers.
- **`/novel/[karyaId]/[chapterNo]`**: The crown jewel of the platform. A distraction-free reading interface with:
    - **Floating HUD**: Navigation that fades out during active reading.
    - **Custom Options**: Real-time adjustment of font-family (Serif for classics, Sans for modern epics), line-height, and parchment-theming.
    - **Reaction Pulse**: A quick-reaction system (Emoji-based) that lets readers leave feedback without breaking their flow.

### 3. The Author's Studio (HQ)
- **`/admin/dashboard`**: A high-level overview of an author's entire portfolio. Includes aggregate metrics like "Total Books", "Global Rating", and "Follower Velocity".
- **`/admin/editor/karya/[id]`**: A professional publishing suite. Authors can manage bab sequencing, update metadata, and curate the genre tags of their works.
- **`/admin/stats`**: Deep analytics. Features GitHub-style activity maps and 7-day growth charts to help authors understand their audience's "Peak Interest" times.
- **`/admin/community`**: A centralized moderation hub. Authors can reply to every comment across all their books from a single, unified feed.

---

## Data Physics: The Social Engine

### 1. The Notification Nexus (The Bloodstream)
The notification system in Ruang Aksara is a masterpiece of contextual engineering. Unlike generic platforms that simply say "You have a new like," our system provides **Rich Metadata**.
- **Delimited Context**: Notifications are stored with a unique `Title|Snippet` format (e.g., `Magic Chronicles - Bab 5 (Komentar Anda: "Luar biasa...")|Terima kasih sudah baca!`).
- **Contextual Parsing**: The UI intelligently deconstructs this metadata to show the reader exactly *what* was liked or *where* they were mentioned, including specific work titles and snippets of original text.
- **Anchor Logic**: Clicking a notification doesn't just open a page; it carries a CSS anchor (e.g., `#comment-uuid`) that navigates the user to the exact pixel of the interaction and highlights it.

### 2. The Comment Threading Engine (Deep-Dive)
Ruang Aksara features a multi-tiered conversation system designed for community engagement and high-quality moderation.
- **Recursive Logic**: The `Comment` model supports a self-referential `parent_id` relationship. This enables infinite nesting (threads), allowing sub-communities to form within a single chapter.
- **Community Curation (Reddit-style Voting)**: Every comment can be upvoted or downvoted (`CommentVote`). A weighted algorithm automatically bubbles up "Top Comments" based on a combination of score and recency.
- **Author Sovereignty**: Authors can **Pin** exceptional feedback to the top of the thread, ensuring that valuable critiques or high-effort theories are the first things other readers see.
- **Engagement UX**: Real-time optimistic UI updates (via `useOptimistic`) ensure that the "Post" button feels instantaneous, even on high-latency networks.

### 3. Formal Reviews vs. Discussion
Unlike generic comment sections, we distinguish between **Formal Reviews** and **Chapter Discussion**:
- **Work Reviews**: Located on the Novel details page, these require a star rating and a long-form text. They are treated as "Reviews of Record" and contribute to the work's `avg_rating`.
- **Review Upvotes**: Other users can upvote reviews, helping the community identify the most helpful critiques.
- **Threaded Review Comments**: Every review can become its own discussion hub, allowing for "Peer Review" of initial opinions.

### 4. Gamification & Reader Persistence
To drive user retention, we've implemented a robust "Reader RPG" engine:
- **The Streak Engine**: Tracks consecutive days of reading. Missing a day resets the streak, encouraging a daily ritual of returning to the "Journal."
- **Focus Thresholds**: XP and Reading Points are not awarded immediately. The system uses a **Focus Threshold** (30+ seconds on a page) to ensure that users are actually reading, not just clicking through chapters to farm points.
- **XP Progression**: Users earn experience points for every chapter completed, which are displayed on the `/user/dashboard` as a badge of honor.

### 5. Author Social Hub
Authors are more than just content creators; they are community leaders.
- **Author Posts**: A social feed dedicated to author announcements. These posts support markdown and external resource links.
- **The Global Follow System**: A many-to-many relationship (`Follow`) that powers the personalized "Update Terbaru" feed for readers. When an author posts, all followers receive a high-priority "SOCIAL" notification.
- **Unified Moderation**: The `/admin/community` feed allows authors to monitor comments from all their books in one place, effectively acting as a "Social Inbox."

---

## Design System: "The Magical Journal"

The visual language of Ruang Aksara is defined by **Parchment, Espresso, and Caramel**. We avoid the sterile "Standard Web Blue" in favor of HSL tokens that evoke the feeling of a physical journal.

### Design Tokens (HSL Based)
| Token | HSL Value | Atmosphere |
| :--- | :--- | :--- |
| **`bg-cream`** | `42, 45%, 90%` | Warm, non-fatiguing reading surface. |
| **`brown-dark`** | `20, 26%, 18%` | Deep, serious background for focus. |
| **`tan-primary`**| `28, 35%, 55%` | The "Signature Color" — used for buttons and calls to action. |
| **`tan-light`** | `30, 31%, 74%` | Subtle border and UI division logic. |

### Typography Hierarchy
1. **Logo & Emotion**: *Lobster* (Cursive) — Used sparingly to add "Soul" to the project.
2. **System Interface**: *Inter* — A variable font used for maximum clarity in stats and buttons.
3. **The Written Word**: *Serif Fallbacks* — Carefully tuned line-heights (1.6x - 1.8x) optimized for long-form Indonesian and English literature.

---

## Operating Procedures & Dev-Ops

### Prerequisites
- Node.js 18+
- PostgreSQL (Direct + Transaction Pooled)
- Redis (Upstash)
- ImageKit.io (For high-speed asset delivery)

### 2. Core Dependencies (The Engine Room)
- **`Prisma Client`**: Used for type-safe database access and complex aggregations.
- **`Lucide React`**: Powers the "Magical Journal" iconography with high-performance SVG rendering.
- **`Marked` / `DOMPurify`**: Handles secure transformation of author-provided markdown into HTML for chapter content and posts.
- **`Sonner`**: Provides non-intrusive, aesthetically pleasing toast notifications for success/error feedback.
- **`Date-fns`**: Manages all localized "Time Ago" formatting to keep the UI feeling fresh and alive.

### 3. Deployment & CI/CD
The project is built for **Vercel Deployment**.
1. **Build Step**: Next.js optimizes all images via the internal loader and minifies CSS/JS.
2. **Middleware**: Global route protection and JWT verification happen at the edge before the main server thread is even invoked.
3. **PWA Generation**: `next-pwa` (Workbox) generates a sophisticated service worker on every build.
    - **Offline Fallbacks**: Users can access their previously read chapters even without an internet connection.
    - **Manifest Configuration**: Includes customized icons and theme colors to ensure the app looks premium when installed as a "Native Web App."
4. **Push Integration**: Utilizes the **Web Push API** and VAPID keys to send real-time alerts to users' desktops and mobile devices (via `PushSubscription`).
5. **Maintenance & Keep-Alive**:
    - **Endpoint**: `/api/cron/keep-alive`
    - **Purpose**: Prevents Supabase pausing (7-day rule) and keeps Redis/Vercel functions warm.
    - **Security**: Requires a `CRON_SECRET` environment variable.
    - **Configuration**: Scheduled daily via `vercel.json`.

---

*Ruang Aksara: Not just a reading spot, but a home for the soul of every word. Engineered with precision, designed with heart.*
