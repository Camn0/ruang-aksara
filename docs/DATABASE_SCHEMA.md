# Database Schema and Models

This document outlines the core models defined in the Prisma schema.

## User and Authentication
- User: Core user profile with roles (admin, author, user).
- Account/Session: NextAuth.js related storage for JWT and provider tokens.
- Follow: Many-to-many relationship linking readers to authors.

## Content (The Novel)
- Karya (Work): The main novel entity. Contains title, description, cover image, and aggregate rating.
- Bab (Chapter): Belongs to a Karya. Stores markdown content and sequence numbers.
- Genre: Categorization labels for works.

## Social and Engagement
- Comment: Self-referential model for threaded discussions.
- CommentVote: Tracks upvotes and downvotes per user per comment.
- Review: Formal work-level critiques with star ratings.
- Notification: System alerts with delimited metadata for context.

## Analytics and Persistence
- ViewCount: Tracks chapter visits.
- ReadingStreak: Logs daily user activity for gamification.
- UserActivity: General event logging for analytics dashboards.
