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
        <div className="pb-32 bg-parchment-light min-h-screen">
            {/* Header Settings */}
            <div className="px-8 pt-10 sm:pt-16 mb-10 sm:mb-16">
                <h1 className="font-journal-title text-3xl sm:text-5xl text-ink-deep italic leading-none">Lembar Administrasi</h1>
                <p className="font-marker text-pine text-sm uppercase tracking-[0.3em] mt-3">Kendali Genre & Keanggotaan</p>
            </div>

            <div className="px-6">
                <div className="max-w-4xl bg-paper wobbly-border paper-shadow p-8 sm:p-12 transition-all duration-300 -rotate-1">

                    {/* SECTION 1: MANAJEMEN PENULIS (AUTHOR) */}
                    <div className="mb-16">
                        <CreateAuthorForm />
                    </div>

                    {/* SECTION 2: MANAJEMEN GENRE (INPUT) */}
                    <div className="mb-12 pt-12 wobbly-border-t border-ink/5">
                        <h2 className="font-journal-title text-2xl sm:text-3xl text-ink-deep mb-8 flex items-center gap-4 italic leading-none">
                            <span className="w-1.5 h-10 bg-gold/50 rotate-12"></span>
                            Inkripsi Genre Baru
                        </h2>
                        <GenreForm />
                    </div>

                    {/* SECTION 3: LIST GENRE AKTIF (DISPLAY & DELETE) */}
                    <div className="mt-16">
                        <h2 className="font-marker text-xs text-ink/30 uppercase tracking-[0.3em] mb-8">Katalog Genre Terdaftar</h2>
                        {genres.length === 0 ? (
                            <p className="font-journal-body text-ink/40 italic text-lg">Belum ada genre yang tertulis di lembaran ini.</p>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {genres.map((g, i) => (
                                    <li key={g.id} className={`bg-parchment-light wobbly-border-sm p-5 flex justify-between items-center transition-all hover:bg-paper hover:shadow-xl hover:-translate-y-1 group ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                                        <span className="font-journal-title text-lg text-ink-deep italic leading-none">{g.name}</span>
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
