# Ruang Aksara - Digital Literary Publication Platform

![Next JS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis&logoColor=white)

Ruang Aksara is a platform for publishing and reading digital literature. Built with **Next.js 14** and **Prisma**, it features an automated reading progress system, author publication tools, a personal library for readers, and a community interaction system including reviews and threaded discussions.

<img width="1365" height="644" alt="Home Screen" src="https://via.placeholder.com/1365x644?text=Ruang+Aksara+Main+Dashboard" />

## System Overview

The application utilizes the Next.js App Router for frontend and server-side logic, integrated with Supabase for the database and Redis for real-time tracking.

| Component | Technology / Description |
| :--- | :--- |
| **Framework** | Next.js 14 (App Router, Server Components). |
| **Language** | TypeScript for static typing and safety. |
| **Styling** | Tailwind CSS + Custom CSS for responsive layout. |
| **Database** | PostgreSQL (managed by Supabase) + Prisma ORM. |
| **Authentication** | NextAuth.js (Credentials Provider with RBAC). |
| **Security** | BCrypt.js for secure password hashing. |
| **Caching** | Redis (Upstash) for real-time view counts and analytics. |
| **PWA** | Progressive Web App support for mobile installation. |
| **Notifications** | Sonner for real-time toast feedback. |
| **Theming** | Next-themes for dynamic Dark/Light mode support. |

---

## Implementation Details

### 1. Project Structure

The project follows a modular structure separating mutations, UI components, and relational configuration.

```bash
ruang-aksara/
├── app/
│   ├── auth/                # Authentication (Login/Register)
│   ├── actions/               # Server actions (Mutations)
│   ├── admin/                 # Editor and Moderator dashboards
│   ├── library/               # Bookshelf (History, Favorites, Finished)
│   ├── novel/                 # Reader interface and Story details
│   ├── onboarding/            # User welcome and Role selection
│   ├── profile/               # User profiles, Follows, and Community posts
│   ├── search/                # Content discovery and Filtering
│   └── user/                  # User settings and personalized data
├── components/                # Reusable UI elements
├── lib/                       # API clients (Prisma, Redis, Auth)
└── prisma/                    # Schema and data modeling
```

### 2. Database Schema

The backend uses a relational schema to handle users, their creative works, and complex social interactions.

```sql
-- Core User and Content Tables
CREATE TABLE User (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  role TEXT, -- admin, author, user
  display_name TEXT
);

CREATE TABLE Karya (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  total_views INTEGER DEFAULT 0,
  avg_rating FLOAT DEFAULT 0,
  uploader_id TEXT REFERENCES User(id)
);

-- Social & Engagement
CREATE TABLE Follow (
  follower_id TEXT REFERENCES User(id),
  following_id TEXT REFERENCES User(id)
);

CREATE TABLE AuthorPost (
  id TEXT PRIMARY KEY,
  author_id TEXT REFERENCES User(id),
  content TEXT NOT NULL,
  image_url TEXT
);

CREATE TABLE ChapterReaction (
  user_id TEXT,
  bab_id TEXT,
  reaction_type TEXT -- LIKE, LOVE, FIRE, etc.
);
```

### 3. Server Actions

Data mutations are handled via Server Actions to manage state changes across the application securely.

```typescript
// app/actions/post.ts example
export async function createAuthorPost(formData: FormData) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }
  
  const content = formData.get('content') as string
  const image_url = formData.get('image_url') as string
  
  await prisma.authorPost.create({
    data: { 
      content, 
      author_id: session.user.id,
      image_url 
    }
  })
  revalidatePath('/profile/[id]')
}
```

---

## Visual Tour & Features

The interface focuses on content delivery and social engagement for literary enthusiasts.

### 1. Reader & Personalization

The reader interface includes an immersive layout with chapter pickers, font adjustments, and theme switching. It tracks reading progress in real-time.

<img width="1365" height="400" alt="Reader Interface" src="https://via.placeholder.com/1365x400?text=Reader+Interface+and+Controls" />

### 2. Library & Gamification

The Library manages a user's reading list, while the system rewards engagement with streaks and points.

| Feature | Description |
| --- | --- |
| **History** | Recently read books with progress tracking. |
| **Favorites** | Bookmarked works for easy access. |
| **Gamification** | Reading streaks and points to encourage daily reading. |

<img width="1365" height="500" alt="Library View" src="https://via.placeholder.com/1365x500?text=Library+and+User+Stats+Preview" />

### 3. Community Interaction

Engagement is high with threaded comments, author follows, and emoji reactions on specific chapters.

| Feature | Description |
| --- | --- |
| **Follow System** | Stay updated with your favorite authors. |
| **Reactions** | Quick emoji-based engagement on chapters. |
| **Author Posts** | Community board for author-to-reader announcements. |
| **Reviews** | Long-form formal reviews with upvoting and discussions. |

<img width="1365" height="300" alt="Engagement Preview" src="https://via.placeholder.com/1365x300?text=Community+Interactions+and+Social+Features" />

### 4. Color Palette

The platform uses a standardized Indigo-based theme with full dark mode support.

| Element | Hex Code | Usage |
| --- | --- | --- |
| **Primary** | `#4f46e5` | Active UI, buttons, and highlights |
| **Background** | `#f9fafb` | Primary light background |
| **Slate** | `#020617` | Premium dark mode background |
| **Amber** | `#fbbf24` | Review stars and achievements |

---

## Getting Started

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/Camn0/ruang-aksara/
cd ruang-aksara

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory and provide the following credentials:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..." # Required for Prisma migrations
NEXTAUTH_SECRET="..."
REDIS_URL="..."
```

### 3. Database Sync

Synchronize the database using Prisma:

```bash
npx prisma db push
# Or for migrations
# npx prisma migrate dev
```

### 4. Running the App

```bash
# Start development server
npm run dev
```

The application is accessible at [http://localhost:3000](http://localhost:3000).
