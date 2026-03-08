# Ruang Aksara - Digital Literary Publication Platform

![Next JS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white)

**Ruang Aksara** is a sophisticated digital literary platform built with **Next.js 14** and **Prisma**. It empowers authors to publish their stories and readers to engage in a rich, community-driven ecosystem featuring threaded comments, author announcements, reading progress tracking, and full PWA support.

<img width="1365" height="644" alt="Home Screen Placeholder" src="https://via.placeholder.com/1365x644?text=Ruang+Aksara+Home+Screen+Preview" />

## System Overview

The application utilizes the Next.js App Router with Server Components for optimal performance and SEO, coupled with Prisma ORM for seamless database interactions.

| Component | Technology / Description |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components). |
| **Language** | TypeScript for robust static typing and maintainability. |
| **Styling** | Tailwind CSS for a modern, responsive, and dark-mode ready UI. |
| **Database** | PostgreSQL (hosted on Supabase) with Prisma ORM. |
| **Authentication** | NextAuth.js (Credentials Provider). |
| **Caching/Views** | Redis (Upstash) for high-performance real-time view counts. |
| **PWA** | `next-pwa` integration for an installed mobile experience. |

---

## Implementation Details

### 1. Project Structure

The project follows a clean, modular structure, separating business logic, UI components, and configuration.

```bash
ruang-aksara/
├── app/
│   ├── actions/               # Server actions (Mutations & Logic)
│   ├── admin/                 # Admin & Editor dashboards
│   ├── novel/                 # Reader interface & Story details
│   ├── profile/               # User profiles & Author community boards
│   ├── library/               # Personal bookshelf (History & Favorites)
│   └── layout.tsx             # Global layout & PWA setup
├── components/                # Reusable UI elements (Navbar, Modals, etc.)
├── lib/                       # Shared utilities (Prisma, Auth, Redis)
└── prisma/                    # Database schema and migration tracking
```

### 2. Database Schema (Prisma)

The backend is built around a relational schema that manages users, literary works, and complex social interactions.

```prisma
// Core Models Overview
model User {
  id            String     @id @default(uuid())
  username      String     @unique
  role          String     // admin, author, user
  karya_upload  Karya[]
  reviews       Review[]
  author_posts  AuthorPost[]
}

model Karya {
  id            String     @id @default(uuid())
  title         String
  penulis_alias String
  total_views   Int        @default(0)
  bab           Bab[]
  reviews       Review[]
}

model AuthorPost {
  id         String   @id @default(uuid())
  author_id  String
  content    String   @db.Text
  likes      PostLike[]
  comments   PostComment[]
}
```

### 3. Server Actions

Data mutations are handled exclusively through Next.js Server Actions to ensure security, high performance, and progressive enhancement.

```typescript
// app/actions/post.ts example
export async function createAuthorPost(formData: FormData) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }

  const content = formData.get('content') as string;
  // ... validation and database insertion via Prisma
  await (prisma as any).authorPost.create({ data: { content, author_id: session.user.id } })
  revalidatePath('/profile/[id]')
}
```

---

## Visual Tour & Features

Ruang Aksara provides a premium reading and social experience for literary enthusiasts.

### 1. Library & Reading Progress

Keep track of every story you read. The library features interactive tabs for History and Favorites, complete with visual progress bars.

<img width="500" height="300" alt="Library Placeholder" src="https://via.placeholder.com/500x300?text=Library+Tabs+%26+Progress+Bars" />

### 2. Author Community (Announcement Board)

Authors can share updates, schedules, or personal thoughts directly on their profile. Fans can interact by liking these posts.

<img width="1365" height="600" alt="Author Post Placeholder" src="https://via.placeholder.com/1365x600?text=Author+Community+Tab+Preview" />

### 3. Advanced Interactions (Reviews & Comments)

The platform supports nested replies in comments, upvoting helpful reviews, and submitting reviews without a star rating for pure discussion.

| Feature | Preview |
| --- | --- |
| **Threaded Comments** | <img width="400" height="150" alt="Comments Placeholder" src="https://via.placeholder.com/400x150?text=Nested+Comments+UI" /> |
| **Review Upvoting** | <img width="400" height="150" alt="Upvote Placeholder" src="https://via.placeholder.com/400x150?text=Review+Interface+Update" /> |
| **Detailed Profiles** | <img width="400" height="150" alt="Profile Placeholder" src="https://via.placeholder.com/400x150?text=Author+Profile+Works+List" /> |

---

## Getting Started

Follow these steps to set up the project locally.

### 1. Installation

```bash
# 1. Clone the repository
git clone https://github.com/Camn0/ruang-aksara/
cd ruang-aksara

# 2. Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and add your credentials.

```env
DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="https://your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"
```

### 3. Database Sync

Synchronize your database with the Prisma schema using:

```bash
npx prisma db push
```

### 4. Running the App

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
