# Ruang Aksara - Digital Literary Publication Platform

![Next JS](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.0+-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase&logoColor=white)

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
| **Caching** | Redis (Upstash) for real-time view counts. |
| **PWA** | Progressive Web App support for mobile installation. |
| **State** | Server Actions and LocalStorage for user preferences. |

---

## Implementation Details

### 1. Project Structure

The project follows a modular structure separating mutations, UI components, and relational configuration.

```bash
ruang-aksara/
├── app/
│   ├── actions/               # Server actions (Mutations)
│   ├── admin/                 # Editor and Moderator dashboards
│   ├── library/               # Bookshelf (History, Favorites, Finished)
│   ├── novel/                 # Reader interface and Story details
│   ├── profile/               # User profiles and Community posts
│   └── search/                # Content discovery and Filtering
├── components/                # Reusable UI elements
├── lib/                       # API clients (Prisma, Redis)
└── prisma/                    # Schema and data modeling

```

### 2. Database Schema

The backend uses a relational schema to handle users, their creative works, and community interactions.

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
  is_completed BOOLEAN DEFAULT FALSE,
  uploader_id TEXT REFERENCES User(id)
);

CREATE TABLE AuthorPost (
  id TEXT PRIMARY KEY,
  author_id TEXT REFERENCES User(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

```

### 3. Server Actions

Data mutations are handled via Server Actions to manage state changes across the application.

```typescript
// app/actions/post.ts example
export async function createAuthorPost(formData: FormData) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session) return { error: "Unauthorized" }
  
  const content = formData.get('content') as string
  await prisma.authorPost.create({
    data: { content, author_id: session.user.id }
  })
  revalidatePath('/profile/[id]')
}
```

---

## Visual Tour & Features

The interface focuses on content delivery and social engagement for literary enthusiasts.

### 1. Reader & Personalization

The reader interface includes controls for font size adjustment and theme switching. It uses an immersive layout that prioritizes text by hiding navigation elements during active reading.

<img width="1365" height="400" alt="Reader Interface" src="https://via.placeholder.com/1365x400?text=Reader+Interface+and+Controls" />

### 2. Library (Personal Bookshelf)

The Library is divided into functional tabs for managing a user's reading list.

| Tab | Description |
| --- | --- |
| **History** | Recently read books with progress bars and timestamps. |
| **Favorites** | Bookmarked works that the user follows. |
| **Finished** | Works completed by the user or marked as finished. |

<img width="1365" height="500" alt="Library View" src="https://via.placeholder.com/1365x500?text=Library+Tabs+Preview" />

### 3. Community Interaction

Engagement is facilitated through threaded comments on chapters, formal reviews on story pages, and author updates.

| Feature | Preview |
| --- | --- |
| **Threading** | <img width="441" height="150" alt="Comments" src="https://via.placeholder.com/441x150?text=Nested+Comments+Interface" /> |
| **Reviewing** | <img width="430" height="150" alt="Reviews" src="https://via.placeholder.com/430x150?text=Review+and+Upvote+System" /> |
| **Posting** | <img width="439" height="150" alt="Author Posts" src="https://via.placeholder.com/439x150?text=Author+Community+Board" /> |

### 4. Color Palette

The platform uses a standardized Indigo-based theme for consistent visual identification.

| Element | Hex Code | Usage |
| --- | --- | --- |
| **Primary** | `#4f46e5` | Active UI and buttons |
| **Background** | `#f9fafb` | Primary light background |
| **Slate** | `#020617` | Dark mode background |
| **Amber** | `#fbbf24` | Review stars and highlighting |

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
NEXTAUTH_SECRET="..."
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

### 3. Database Sync

Synchronize the database using Prisma:

```bash
npx prisma db push
```

### 4. Running the App

```bash
# Start development server
npm run dev
```

The application is accessible at [http://localhost:3000](http://localhost:3000).
