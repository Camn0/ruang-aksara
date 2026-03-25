# Developer Experience and Workflow (The Ultra-Definitive Reference)

This document provides a exhaustive technical record of the developer environment, local orchestration, and contribution workflows that sustain the Ruang Aksara platform. It is designed to minimize friction for new engineers and ensure a consistent standard of development quality.

## 1. The Local Sanctuary: Environment Orchestration

A developer's local environment should be a mirror of the production "Sanctuary." We achieve this through strict environment variable parity and containerized data services.

### 1.1 Environment Variable Hierarchy
Development depends on three distinct categories of configuration:
- **Connection Strings**: `DATABASE_URL` (for Prisma) and `DIRECT_URL` (for migrations).
- **Service Tokens**: `UPSTASH_REDIS_REST_URL` and `IMAGEKIT_PRIVATE_KEY`.
- **Encryption Secrets**: `NEXTAUTH_SECRET` (must be at least 32 characters for HS256 security).

### 1.2 The "Shadow" Database Strategy
To prevent accidental pollution of the production data, developers are mandated to use a "Shadow" or "Local" PostgreSQL instance. 
- **Migration Logic**: Always use `npx prisma migrate dev` during development. This generates a shadow database in the background to verify that migrations are non-destructive before they are committed to the schema ledger.

## 2. The Mental Model: Component Sovereignty

Ruang Aksara follows a strict "Component Sovereignty" architecture to manage the complexity of its server-first rendering.

### 2.1 Server vs. Client Boundaries
Developers must consciously decide the "Home" of every new component:
- **Server Components (Default)**: Use for data fetching, business logic, and heavy dependency execution.
- **Client Components (`'use client'`)**: Use **only** for interactive hooks (`useState`, `useEffect`), browser APIs (local storage), and animations (Framer Motion).
- **The "Client-at-the-Leaves" Pattern**: We keep client components as far down the DOM tree as possible. For example, a `ChapterContent` page is a Server Component, but the `FontSizeSlider` within it is a Client Component.

### 2.2 Revalidation-Driven UI
Unlike traditional SPAs that rely on global state managers (Redux/Zustand), Ruang Aksara relies on **Server-Side Revalidation**.
- **The Flow**:
    1. User submits a form.
    2. Server Action executes the DB mutation.
    3. Action calls `revalidateTag`.
    4. Next.js automatically re-fetches the affected Server Components.
- **Benefit**: The UI is always accurate to the database without the developer needing to manually update client-side caches.

## 3. Tooling and CLI Orchestration

We maintain a set of "Quality Gates" that run automatically within the development lifecycle.

### 3.1 Prisma Studio: The Visual Ledger
Developers are encouraged to use `npx prisma studio` to visualize the relational connections between Users, Novels, and Notifications. This is particularly useful for debugging recursive comment threads.

### 3.2 Linting and Type Integrity
- **TypeScript**: We use "Strict" mode. No `any` types are permitted in the social or financial modules.
- **ESLint**: Custom rules ensure that `alt` tags are present on all ImageKit assets to maintain the accessibility of the sanctuary.

## 4. Debugging Failure Modes

### 4.1 Database "Cold Starts"
If the local environment feels sluggish, it is often due to PgBouncer connection exhaustion.
- **Solution**: Restart the local connection pool or verify that no long-running transaction is hanging in the PostgreSQL background process.

### 4.2 Hydration Mismatches
Common in PWA development.
- **Diagnostic**: Check if the Server HTML matches the Client's initial render.
- **Prevention**: Avoid using `window` or `document` outside of `useEffect` blocks.

## 5. Contribution & Pull Request (PR) Standards

To maintain the "Masterpiece" standard of the codebase, every PR must adhere to:
1. **Model Updates**: Any change to `schema.prisma` must be accompanied by an updated `DATABASE_SCHEMA.md` entry.
2. **Action Hardening**: New Server Actions must include explicit ownership checks to prevent ID-guessing attacks.
3. **Documentation Parity**: If a feature is added to the "Reader Sanctuary," the `FEATURES.md` module must be expanded simultaneously.

Document Version: 1.0.0