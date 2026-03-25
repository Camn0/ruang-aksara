# Social Engine and Engagement Architecture (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the community dynamics, recursive engagement models, and social integrity algorithms that govern the Ruang Aksara platform. It is designed to explain the intricate relationships between content, authors, and the reader collective.

## 1. Recursive Community Architecture: The Goresan Diskusi

The comment system, known internally as "Goresan Diskusi," is the primary vector for peer-to-peer interaction. It is engineered for depth and reliability.

### 1.1 The Self-Referential Data Model
Unlike flat comment structures, Ruang Aksara utilizes a recursive relationship within the `Comment` model.
- **Prisma Schema Logic**:
  ```prisma
  model Comment {
    id        String    @id @default(uuid())
    parent_id String?   // Points back to a Comment.id
    parent    Comment?  @relation("ThreadReplies", fields: [parent_id], references: [id])
    replies   Comment[] @relation("ThreadReplies")
    ...
  }
  ```
- **Rationale**: This allows for truly "Threaded" discussions where readers can address specific points in a long-form review or chapter analysis. It mimics the hierarchical nature of high-quality literary discourse found in scholarly circles.

### 1.2 Threading Depth and UI Constraints
While the database supports infinite nesting (recursive depth), we apply a "Horizontal Boundary" constraint in the frontend:
- **Depth Limit**: Visual indentation is applied for the first three levels of a thread. 
- **The "Contextual Flattening" Rule**: After level 3, replies are visually flattened to the left margin but maintain their `parent` metadata. This prevents the "Staircase UI" where comments become unreadably narrow on mobile devices.
- **Integrity Enforcement**: We employ a **Hard Cascade** strategy. If a root comment is deleted (due to moderation or author request), all nested replies are automatically purged. This ensures that a reply never exists without its originating context, preventing "Ghost Conversations."

### 1.3 Atomic Score Orchestration
Social validation is managed via a dedicated `CommentVote` ledger.
- **Atomic Interaction**: Users can "Upvote" or "Downvote" a comment. To ensure integrity, a unique constraint `@@unique([user_id, comment_id])` prevents a single user from casting multiple votes on the same entry.
- **Weighted Sorting**: The "Top" sort algorithm uses an aggregate `Score` (Calculated as: `Count(Upvotes) - Count(Downvotes)`). This score is recalculated each time the Social feed is hydrated, ensuring that high-value literary analysis naturally rises to the top of the sanctuary.

## 2. Contextual Notification Engine: The Intelligence Layer

Notifications in Ruang Aksara are more than just alerts; they are context-rich entry points into the social graph.

### 2.1 The Delimited Metadata Protocol
To ensure the notification feed is near-instantaneous despite a heavy relational load, we use a specialized "Flattened Metadata" strategy.
- **The Protocol**: Instead of performing 3 SQL joins per notification (one for the Actor, one for the Novel, one for the Chapter), we store the critical display data in a delimited string: `[ACTOR_DISPLAY_NAME] | [TARGET_TITLE] | [SNIPPET_CONTENT]`.
- **Parsing Engine**:
  ```typescript
  // A conceptual view of the notification parser logic
  const [actor, title, snippet] = notification.content.split('|');
  ```
- **Performance Grains**: This reduces the feed generation time from ~200ms of relational resolution to <10ms of simple string manipulation.

### 2.2 Event Dispatching & Categories
Notifications are categorized into three technical buckets:
1. **Engagement (`LIKE`, `REACTION`)**: High-frequency, low-latency alerts.
2. **Social (`REPLY`, `MENTION`, `FOLLOW`)**: Direct peer-to-peer interaction alerts.
3. **Editorial (`NEW_CHAPTER`, `AUTHOR_POST`)**: Content lifecycle alerts that drive retention.
- **Dead Link Protection**: Notifications store the absolute path (e.g., `/novel/123/45#comment-xyz`) to ensure the user is anchored exactly where the interaction occurred, even if they are on a different device.

## 3. Review Integrity & The Quality Threshold

Formal reviews are the "Sacred Ledger" of the author's reputation. We protect this ledger with multiple technical constraints.

### 3.1 The "One Voice" Rule
A reader can only leave **one** formal review and rating per novel.
- **Mechanism**: The `Review` model uses a composite unique key `@@unique([user_id, karya_id])`. 
- **Rationale**: This prevents "Review Bombing" (multiple negative reviews from one user) and "Astro-turfing" (multiple positive reviews from one user), ensuring the `avg_rating` remains a representative metric of the collective audience.

### 3.2 Denormalized Rating Synchronization
To ensure that "Top Rated" sorting is O(1) performance, we synchronize the work's average rating into the `Karya` table using an atomic transaction.
- **Lifecycle of a Rating**:
    1. Reader submits a 5-star review.
    2. Prisma starts a `$transaction`.
    3. Step A: Create/Update the `Review` and `Rating` records.
    4. Step B: Query the `Rating` table for the arithmetic mean of all non-zero scores for this `karya_id`.
    5. Step C: Update the `Karya.avg_rating` column with the new mean.
    6. Transaction Commits.
- **Safety**: If the server fails at Step B, the entire transaction rolls back, ensuring the work's aggregate score never becomes disconnected from its constituent reviews.

### 3.3 Author Curation: The Pinning Logic
Authors are the "High Priests" of their own sanctuary. They have the administrative power to "Pin" specific reviews or comments. 
- **Technical Effect**: Pinning overrides the default "Top Score" sorting, forcing the selected review to index 0 of the result set. This allows authors to highlight constructive critique or significant community milestones.

## 4. Engagement Gamification: The Streak Catalyst

We utilize a "Nudge" architecture to encourage consistent daily reading.

### 4.1 The 24-Hour Persistence Check
Reading streaks are calculated on every chapter load via the `updateReadingProgress` action.
- **Logic**:
    - If `Gap(now, last_read_at) == 1 day`: Streak increments (+1).
    - If `Gap(now, last_read_at) > 1 day`: Streak resets (=1).
    - If `Gap(now, last_read_at) < 1 day`: Streak remains unchanged (already counted for today).
- **Anti-Spam**: This logic is only triggered after the 30-second "Focus Threshold" is met, ensuring that users cannot "Farm" streaks by rapidly opening and closing the app.

Document Version: 1.3.0 