/**
 * ADMIN SETTINGS PAGE (GENRE & AUTHOR)
 * ------------------------------------
 * Pusat pengaturan platform khusus Administrator.
 * Fungsi:
 * 1. RBAC Check: Memastikan hanya user dengan role 'admin' yang bisa masuk.
 * 2. Kelola Penulis: Form khusus untuk registrasi/pembuatan akun Author baru.
 * 3. Kelola Genre: Tambah/Hapus kategori cerita (genre) yang tersedia di platform.
 * 4. UI: Layout terpusat (max-width-4xl) untuk fokus pada tugas administratif.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GenreForm, DeleteGenreButton } from "./GenreClient";
import CreateAuthorForm from "../dashboard/CreateAuthorForm";
import { prisma } from '@/lib/prisma';

export default async function AdminGenrePage() {
    // [1] SECURITY & ROLE VALIDATION
    // Halaman ini sangat sensitif. Hanya 'admin' yang boleh akses.
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        // Jika Author biasa mencoba akses, tendang balik ke Dashboard mereka.
        redirect('/admin/dashboard');
    }

    // [2] DATA FETCHING: Daftar Genre Platform
    // Mengambil semua genre untuk ditampilkan di list bawah.
    const genres = await prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="pb-24">
            {/* Header Settings */}
            <div className="px-6 pt-6 sm:pt-10 mb-6 sm:mb-10">
                <h1 className="text-2xl sm:text-4xl font-black text-brown-dark dark:text-text-accent tracking-tight leading-none uppercase italic">Pengaturan Admin</h1>
                <p className="text-tan-primary font-extrabold text-[10px] sm:text-xs uppercase tracking-widest mt-2 leading-none">Kelola Genre & Penulis</p>
            </div>

            <div className="px-6">
                <div className="max-w-4xl bg-white/80 dark:bg-brown-dark backdrop-blur-sm rounded-3xl shadow-xl shadow-brown-dark/5 dark:shadow-none p-6 sm:p-10 border border-tan-primary/10 dark:border-brown-mid transition-colors duration-300">

                    {/* SECTION 1: MANAJEMEN PENULIS (AUTHOR) */}
                    <div className="mb-12">
                        <CreateAuthorForm />
                    </div>

                    {/* SECTION 2: MANAJEMEN GENRE (INPUT) */}
                    <div className="mb-8 border-t border-tan-primary/10 dark:border-brown-mid pt-10">
                        <h2 className="text-xl sm:text-2xl font-black text-brown-dark dark:text-text-accent mb-6 flex items-center gap-3">
                            <span className="w-2 h-8 bg-brown-mid rounded-full"></span>
                            Penambahan Genre
                        </h2>
                        <GenreForm />
                    </div>

                    {/* SECTION 3: LIST GENRE AKTIF (DISPLAY & DELETE) */}
                    <div className="mt-12">
                        <h2 className="text-sm font-black text-brown-dark/40 uppercase tracking-widest mb-6">Daftar Genre Aktif</h2>
                        {genres.length === 0 ? (
                            <p className="text-brown-dark/50 dark:text-tan-light italic font-bold">Belum ada genre yang ditambahkan.</p>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {genres.map(g => (
                                    <li key={g.id} className="bg-brown-dark/5 dark:bg-brown-mid/50 border border-transparent dark:border-brown-mid rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg hover:border-tan-primary/30 group">
                                        <span className="font-bold text-brown-dark/80 dark:text-gray-300 uppercase tracking-tight text-sm">{g.name}</span>
                                        <DeleteGenreButton id={g.id} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
