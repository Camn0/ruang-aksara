/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

import { redirect } from "next/navigation";

// Mengapa: Halaman /novel sudah tidak digunakan secara langsung.
// Semua fungsi discovery (search, filter, genre) sudah terpusat di /search yang mobile-first.
// Redirect ini memastikan link lama tetap bekerja.
/**
 * NovelIndexPage: Primary Next.js Server Component route entry point orchestrating asynchronous data-fetching lifecycles.
 */
export default function NovelIndexPage() {
    redirect('/search');
}
