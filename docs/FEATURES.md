# Features and Mechanics

This document describes the core functionalities for readers and authors.

## Reader Sanctuary
The reading interface is designed for focus and customization.
- Custom Settings: Readers can adjust font size, font family (serif/sans), and background parchment theme.
- Settings Persistence: User preferences are saved to the database to ensure a consistent experience across devices.
- Focus Thresholds: Points and streaks are only awarded after a user has spent a set amount of time on a chapter.

## Author Studio
A management suite for content creators.
- Publishing: Authors can manage chapters, update metadata, and set genre tags.
- Analytics: Aggregate stats for views, ratings, and follower growth.
- Activity Map: GitHub-style heatmap showing publishing consistency.
- Community Hub: Centralized feed to respond to comments across all works.

## Social Mechanics
- Threaded Comments: Self-referential database model for nested discussions.
- Sorting Logic: Comments are weighted based on a combination of upvotes/downvotes and recency.
- Notifications: Metadata-rich system that anchors users directly to the point of interaction.
- Following: Social feed that alerts readers when authors publish new content or posts.

## Gamification
- Reading Streaks: Tracks consecutive days of active reading.
- XP System: User progression based on reading activity and engagement.
