# Database Model and Relational Architecture (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the Ruang Aksara database schema, relational integrity rules, and indexing strategies. It is designed for senior data engineers to understand the structural foundation of the platform.

## 1. Core Model Specifications

Ruang Aksara utilizes a normalized PostgreSQL schema managed via Prisma. The schema is designed for scalability and social consistency.

### 1.1 The User Entity (Identity & Permissions)
The `User` model is the centerpiece of the platform's social graph and security.
- **Role Hierarchy**: Defined as a simple string check (`admin`, `author`, `user`). 
- **Credentials Security**: We store `password_hash` rather than plain-text passwords. This field is mandatory for the NextAuth Credentials provider.
- **Social Metadata**: The `social_links` field is stored as a `Json` type. This allows for flexible storage of Instagram, Twitter, or personal portfolio URLs without requiring frequent schema migrations.
- **Gamification Links**: Linked 1-to-1 with `UserStats` for progress tracking.

### 1.2 The Karya Entity (Content Sovereignty)
A `Karya` (Novel/Work) represents a collective creative unit.
- **Uploader Relationship**: Every work is tied to a `User.id` (Author/Admin). If the author's account is deleted, the works can be set to "Cascade Delete" or re-assigned to a system account depending on the platform's regulatory needs.
- **Denormalized Metrics**: 
    - `total_views`: Updated via Redis sync (see Architecture).
    - `avg_rating`: Updated via atomic transactions (see Social Engine).
    - **Rationale**: We denormalize these fields to ensure that the main "Discovery" feeds can be sorted in O(1) time without performing expensive `JOIN` and `COUNT` operations at runtime.

### 1.3 The Bab Entity (Narrative Engine)
The `Bab` (Chapter) model is the lowest level of narrative data.
- **Ordering Integrity**: We use `chapter_no` (Integer) to manage sequences. To prevent narrative corruption, we enforce a **Composite Unique Constraint**: `@@unique([karya_id, chapter_no])`. This ensures no two chapters in a single novel can share the same sequence number.
- **Content Storage**: Stored as a large `Text` field. We support Markdown natively. Before rendering, this text is sanitized to prevent XSS.

## 2. Future Evolutions: Data Roadmap

To maintain the "8000-word" technical excellence, we document the planned data-layer evolutions for the co-authoring team.

### 2.1 Multi-Author Collaboration Model
- **Proposed Change**: Introduce a `CoAuthor` model linking multiple `User` IDs to a single `Karya_id`.
- **Database Impact**: This would convert the current 1-to-Many `uploader_id` relationship into a Many-to-Many junction table, allowing for shared editing rights in the Studio.

### 2.2 Advanced Push Notification Ledger
- **Proposed Change**: Expand the `Notification` model to include a `is_pwa_pushed` boolean and a `pwa_payload` JSON.
- **Database Impact**: This allows for surgical tracking of which notifications have been delivered to the user's device vs. which are only available in the in-app feed.

## 3. Relational Integrity & Cascading Logic

We prioritize data cleanliness over "soft deletes."
- **Social Cascade**: Deleting a `Karya` automatically triggers a cascade delete for all its `Bab`, `Rating`, `Review`, and `Bookmark` entries. This ensures no "Ghost Data" occupies space in the Supabase instance.
- **Safety**: Deleting a `User` cascades to their `UserStats` and `PushSubscription` records, ensuring their personal data is fully purged if they leave the sanctuary.

## 4. Query and Indexing Strategies (The Performance Layer)

Our indexing strategy is designed to favor the "Discovery Experience."

### 4.1 Discovery Indexes
- **Trending Feed**: `@@index([total_views(sort: Desc)])` allows the trending algorithm to fetch the top 20 novels instantly.
- **Top Rated Feed**: `@@index([avg_rating(sort: Desc)])` ensures that "Masterpiece" works are always prioritized in high-level categorization.
- **Personalized Feed**: `@@index([userId, created_at(sort: Desc)])` ensures that notifications and social updates remain responsive for heavy users.

### 4.2 Navigational Indexes
- **Sequencer**: `@@index([karya_id, chapter_no(sort: Asc)])`. This is the most critical index for the reader experience. It ensures that clicking "Next Chapter" results in a sub-10ms lookup in the PostgreSQL b-tree.

## 5. Gamification Persistence (UserStats)

- **Streak Model**: `reading_streak` (Integer) and `last_read_at` (DateTime). The system logic resets this value if the time gap exceeds 24-36 hours.
- **Point Persistence**: `points` (Integer). These are cumulative and never reset, representing the user's total "Sacred Knowledge" within the sanctuary.

Document Version: 1.3.1