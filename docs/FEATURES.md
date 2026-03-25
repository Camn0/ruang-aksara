# Features and Functional Mechanics (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the core features and underlying logic that power the Ruang Aksara platform. It is designed for developers, authors, and stakeholders to understand the "How" and "Why" behind every user-facing interaction.

## 1. The Reader Sanctuary: Engineering Immersion

The "Reader Sanctuary" is the centerpiece of the platform. Unlike generic novel sites, we prioritize "Focus" as a technical requirement.

### 1.1 Tactile Interface & Appearance Logic
The reading interface is governed by a complex state machine that balances permanence (storage) with performance (localized hydration).
- **Typography Engine**: We provide three curated font families: `IBM Plex Serif` (the "Literary" default), `Inter` (the "Clean" modern choice), and a monospace font for technical or experimental works.
- **Fluid Sizing**: The font size slider (`12px` to `32px`) utilizes CSS variables injected into the root of the reading container, ensuring that every element—from paragraph text to dialogue—scales proportionally.
- **HSL-Based Themes**: The platform uses three specific themes:
    - `Light`: A crisp, paper-white experience.
    - `Dark`: A high-contrast charcoal mode for night reading.
    - `Parchment (Cream)`: A specialized HSL(34, 45%, 90%) mode that reduces blue light strain, designed for long-form consumption.
- **Persistence Strategy**: Every preference is stored in `localStorage` under the `ruangaksara_settings` key. On page load, the `ReadingInterface` client component reads these values and applies them before the user can interact, preventing jarring layout shifts (FOUC).

### 1.2 Immersive Navigation & Scroll Tracking
The interface is designed to "Get out of the way."
- **Directional UI Toggle**: A scroll-spy listener monitors vertical velocity. Upward scrolling (indicating a desire to navigate) reveals the UI headers and footers. Downward scrolling (indicating focus on reading) hides them with a 300ms ease-in-out transition.
- **Micro-Position Persistence**: The system tracks the exact scroll position of the reader.
    - **Logic**: We debounce scroll events every 1500ms. The current offset is saved both in `localStorage` and occasionally synced to the `Bookmark` model in PostgreSQL if the user moves a significant percentage of the page depth.
    - **Resumption**: When a user returns to a chapter, a specialized observer scrolls them back to their exact vertical coordinate, creating a "Physical Book" sense of permanence.

## 2. Author Studio: The Creative Command Center

The "Studio" is a restricted namespace (RBAC: `author`, `admin`) designed for high-density content management.

### 2.1 The Publishing Pipeline
Authors follow a structured workflow to ensure content social consistency.
- **Drafting Component**: A custom Markdown editor that leverages `marked` for real-time rendering. This allows authors to see their "Magical Journal" layout as they write.
- **Chapter Sequencing**: To prevent race conditions where two authors might publish the "same" chapter number simultaneously, we use a database-level composite unique index `[karya_id, chapter_no]`. If a collision occurs, the Server Action catches the Prisma error and prompts the author for a correction.
- **Work-In-Progress (WIP) States**: Novels can be marked as `Completed` or `Ongoing`. This metadata is indexed to allow readers to filter their library based on commitment level.

### 2.2 Growth Analytics & Visualization
The Studio provides authors with a "Flight Dashboard" to monitor their creative impact.
- **The Global Engagement Hex**: An aggregate of views, reactions, and reviews.
- **Activity Heatmap**: A GitHub-style contribution graph (`UserStats.updated_at` mapping) that rewards consistency.
- **Bayesian Rating Visualization**: (Planned) Authors see their raw mean rating alongside their "Weighted Reliability Score" to understand how their audience perception is evolving over time.

## 3. The Social Engine: Constructive Engagement

Social features in Ruang Aksara are designed to foster quality discussion rather than chaotic noise.

### 3.1 Recursive Threading Logic
The comment engine ("Goresan Diskusi") utilizes a self-referential model.
- **Functional Depth**: The data model supports infinite nested replies (child -> parent -> root).
- **UI Constraint**: To prevent the "Staircase Effect" on mobile devices, the interface visually flattens threads after a depth of 3, using "In-Reply-To" labels to maintain context.
- **Atomicity**: Votes are treated as atomic records. Every `CommentVote` is a single row in the database. The total "Score" is recalulated on the fly using Prisma's `aggregate` features to ensure it is always accurate to the millisecond.

### 3.2 Metadata-Delimited Notifications
To keep the notification feed lightning fast, we avoid complex SQL joins at render time.
- **The Delimiter Pattern**: We store notification content as a structured string: `ACTOR_NAME | WORK_TITLE | PAYLOAD`.
- **Latency Advantage**: Rendering the notification list requires 0 extra database lookups for the work titles or author names. The client component simply splits the string on the `|` character and renders the rich UI elements.

## 4. Gamification & Behavioral Engineering

We believe reading is a habit worth rewarding. Our gamification engine is designed with "Pro-Reading" constraints.

### 4.1 Focused Reading Streaks
- **Day-by-Day Logic**: A "Streak" increments only when the user reads at least one chapter every 24 hours. The logic (`app/actions/user.ts`) verifies the gap between `last_read_at` and `now`.
- **Resiliency Gap**: (Implemented) We allow a small "Grace Period" to account for timezone shifts, but a gap greater than 36 hours results in a total streak reset, maintaining the value of the achievement.

### 4.2 Anti-Cheat & Focus Thresholds
- **The 30s Guard**: Points are NOT awarded for clicks. Every chapter has a mandatory 30-second `MIN_READ_TIME` threshold. If a user "Reads" (clicks through) 10 chapters in 60 seconds, they will only receive points for the first two valid chapters.
- **XP Scaling**: points accumulate into a global "Level."
    - **Formula**: `Level = floor(square_root(points / 10)) + 1`
    - **Psychology**: Leveling up is easy at first (to build habit) but becomes exponentially harder as the reader progresses, signifying veteran status in the Ruang Aksara sanctuary.

## 5. Security and Content Integrity

- **Role-Based Guards**: Every "Mutation" (save, delete, update) is protected by a session check. Even if a user "Guesses" an API endpoint, the Server Action verifies that the `id` of the user matches the `owner_id` of the content before any DB write occurs.
- **Sanitization Pipeline**: All literature content is passed through a sanitization filter before being rendered as HTML. This protects readers from malicious XSS injections while still allowing the expressive power of Markdown.

Document Version: 1.3.0 