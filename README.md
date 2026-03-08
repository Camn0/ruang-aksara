# Ruang Aksara - Digital Literary Publication Platform

![Next JS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis&logoColor=white)

This project is a premium digital literary platform built with **Next.js 14** and **Prisma**. Designed for seamless storytelling and community engagement, it features a mobile-first UI, immersive reading modes, real-time analytics, and a full author-reader ecosystem.

<img width="1365" height="644" alt="Home Screen" src="https://via.placeholder.com/1365x644?text=Ruang+Aksara+Home+Screen+Preview" />

## System Overview

The application utilizes the Next.js App Router with Server Components for optimal performance and SEO, coupled with Prisma ORM for database management.

| Component | Technology / Description |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components). |
| **Language** | TypeScript for strict typing and code safety. |
| **Styling** | Tailwind CSS + Custom Animations for a premium feel. |
| **Database** | PostgreSQL (managed by Supabase) with Prisma. |
| **Authentication** | NextAuth.js (Credentials & RBAC system). |
| **Caching** | Redis (Upstash) for real-time view counting. |
| **PWA** | `next-pwa` for an installable mobile experience. |
| **State** | React Context & Server Actions for light-weight state. |

---

## Implementation Details

### 1. Project Structure

The project follows a modular structure, separating business logic, UI components, and backend utilities.

```bash
ruang-aksara/
├── app/
│   ├── actions/               # Server actions (Mutations & Logic)
│   ├── admin/                 # Editor & Admin management hub
│   ├── novel/                 # Reader interface & Story details
│   ├── profile/               # User profiles & Community boards
│   ├── library/               # Bookshelf (History & Favorites)
│   └── layout.tsx             # Root layout & PWA configuration
├── components/                # Reusable UI (Navbar, BottomNav, etc.)
├── lib/                       # Third-party clients (Prisma, Redis)
├── prisma/                    # Database schema and migrations
└── types/                     # Shared TypeScript interfaces
```

### 2. Database Schema

The backend relies on a sophisticated relational schema to handle literary works and social interactions.

```prisma
-- Prisma Schema Overview
-- Profiles Table
model User {
  id            String     @id @default(uuid())
  username      String     @unique
  role          String     @default("user") // admin, author, user
  display_name  String
  avatar_url    String?
  karya_upload  Karya[]
  reviews       Review[]
  author_posts  AuthorPost[]
}

-- Posts Table (Author Announcements)
model AuthorPost {
  id         String   @id @default(uuid())
  author_id  String
  author     User     @relation(fields: [author_id], references: [id])
  content    String   @db.Text
  created_at TIMESTAMP @default(now())
}

-- Interactions (Likes)
model PostLike {
  id         String     @id @default(uuid())
  user_id    String
  post_id    String
  UNIQUE(user_id, post_id)
}
```

### 3. Server Actions

Data mutations are handled exclusively through Next.js Server Actions to ensure security and progressive enhancement.

```typescript
// app/actions/post.ts example
export async function createAuthorPost(formData: FormData) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }
  
  // validation and database insertion via Prisma
  await (prisma as any).authorPost.create({
      data: { content, author_id: session.user.id }
  })
  revalidatePath('/profile/[id]')
}
```

---

## Visual Tour & Features

The interface is designed to evoke a modern literary feel with high responsiveness.

### 1. Library & Reading History
Users can track their progress through interactive tabs. Profiles include display names, reading history, and bookmarks.

<img width="500" height="300" alt="Library View" src="https://via.placeholder.com/500x300?text=Library+Progress+Bars+Preview" />
<img width="500" height="300" alt="Reading History" src="https://via.placeholder.com/500x300?text=Reading+History+Tab+Preview" />

### 2. Author Community & Posts
Authors can start announcements and engage with fans. The system handles likes and comments on author postings.

<img width="1365" height="634" alt="Author Board" src="https://via.placeholder.com/1365x634?text=Author+Community+Board+Preview" />

### 3. Interaction (Reviews, Replies, Upvotes)
The platform supports nested replies, a helpfulness upvote system for reviews, and pure discussion ulasans.

| Feature | Preview |
| --- | --- |
| **Reviewing** | <img width="441" height="150" alt="Review Interface" src="https://via.placeholder.com/441x150?text=Advanced+Review+UI" /> |
| **Upvoting** | <img width="430" height="150" alt="Upvote Button" src="https://via.placeholder.com/430x150?text=Review+Voting+System" /> |
| **Nested Comments** | <img width="439" height="150" alt="Nested Comments" src="https://via.placeholder.com/439x150?text=Threaded+Comment+Section" /> |

### 4. Smart Palette & Dark Mode
The theme is achieved using a harmonious palette for both light and dark modes.

| Color | Hex | Usage |
| --- | --- | --- |
| **Primary** | `#4f46e5` | Indigo branding and buttons |
| **Background** | `#f9fafb` | Main page background (Light) |
| **Dark BG** | `#020617` | Slate background (Dark Mode) |
| **Accent** | `#fbbf24` | Amber for star ratings |

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

Create a `.env` file in the root directory. Get these credentials from your Supabase and Redis project settings.

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 3. Database Sync

To sync your database with the Prisma schema, execute the following:

```bash
npx prisma db push
```

### 4. Running the App

```bash
# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
