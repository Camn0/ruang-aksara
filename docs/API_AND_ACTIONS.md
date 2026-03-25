# API and Server Actions

Ruang Aksara uses Next.js Server Actions for all data mutations. This approach ensures type safety between the frontend and backend without the overhead of REST endpoints.

## Server Action Pattern
Actions are located in the app/actions/ directory and follow this structure:
- Input: Plain objects, often validated by Zod (in future iterations).
- Execution: prisma.model.operation().
- Output: Returns a standardized object { success: boolean, data?: T, error?: string }.

## Key Action Modules
- auth.ts: Handles user registration, role assignment, and session management.
- chapter.ts: Logic for creating, editing, and deleting novel chapters.
- comment.ts: Nested threading and voting logic.
- push.ts: Subscription management for Web Push notifications.

## Internal API Routes
While most logic is in Server Actions, some specific tasks use API routes:
- /api/cron/*: Scheduled maintenance tasks.
- /api/image-upload: Integration with ImageKit for media processing.
- /api/auth/*: Built-in NextAuth.js endpoints.
