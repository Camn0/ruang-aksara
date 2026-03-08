import { redirect } from "next/navigation";

// Mengapa: Halaman /novel sudah tidak digunakan secara langsung.
// Semua fungsi discovery (search, filter, genre) sudah terpusat di /search yang mobile-first.
// Redirect ini memastikan link lama tetap bekerja.
export default function NovelIndexPage() {
    redirect('/search');
}
