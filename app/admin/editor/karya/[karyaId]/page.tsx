/**
 * ADMIN MANAGE KARYA PAGE (DETAILED EDITOR)
 * -----------------------------------------
 * Halaman utama untuk mengelola satu judul karya secara spesifik.
 * Fitur:
 * 1. Security (Owner Only): Memvalidasi bahwa hanya pemilik karya atau Admin yang boleh mengelola.
 * 2. Meta Editor: Mengubah judul, cover, sinopsis, dan genre melalui EditKaryaForm.
 * 3. Chapter Manager: Menambah, menghapus, atau mengedit bab-bab cerita.
 * 4. UI: Desain dua kolom (Desktop) untuk efisiensi ruang kerja.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Star, Users, Trash2 } from "lucide-react";
import CreateBabForm from "./CreateBabForm";
import DeleteKaryaButton from "./DeleteKaryaButton";
import DeleteBabButton from "./DeleteBabButton";
import EditBabForm from "./EditBabForm";
import EditKaryaForm from "./EditKaryaForm";

import { prisma } from '@/lib/prisma';

export default async function AdminManageKaryaPage({ params }: { params: { karyaId: string } }) {
    // [1] AUTHENTICATION
    // Pastikan session tersedia (assertion ! aman karena layout global).
    const session = (await getServerSession(authOptions))!;

    // [2] DATA FETCHING: Detail Karya & Daftar Bab
    // Mengambil data karya lengkap dengan genre dan seluruh bab terkait (diurutkan).
    const karya = await prisma.karya.findUnique({
        where: { id: params.karyaId },
        include: {
            genres: true,
            bab: {
                orderBy: { chapter_no: 'asc' }
            }
        }
    });

    // Ambil list genre global untuk keperluan form edit metadata.
    const allGenres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });

    // [3] SECURITY VALIDATION: Existency & Ownership
    // A. Check apakah karya ada di database.
    if (!karya) {
        notFound();
    }

    // B. Check kepemilikan (PENTING).
    // Mengapa: Mencegah Author A mengedit karya milik Author B hanya dengan menebak ID di URL.
    if (karya.uploader_id !== session.user.id && session.user.role !== 'admin') {
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Unauthorized: Anda tidak memiliki akses ke karya ini.
            </div>
        );
    }

    return (
        <div className="pb-32 bg-parchment-light min-h-screen transition-all">
            {/* --- PAGE HEADER: Back Link & Action Buttons --- */}
            <div className="px-8 pt-10 mb-12 relative">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 font-marker text-[10px] text-pine hover:text-pine-light transition-all uppercase tracking-[0.2em] mb-4">
                            <ArrowLeft className="w-4 h-4" /> Kembali ke Arsip Utama
                        </Link>
                        <h1 className="font-journal-title text-4xl text-ink-deep italic uppercase tracking-tight">{karya.title}</h1>
                        <p className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mt-2">Lembaran Pengaturan & Inventori Bab</p>
                    </div>
                    {/* Tombol Hapus Seluruh Karya */}
                    <DeleteKaryaButton karyaId={karya.id} />
                </div>
            </div>

            {/* --- TWO COLUMN GRID LAYOUT --- */}
            <div className="px-8 grid lg:grid-cols-12 gap-12">

                {/* KOLOM KIRI: Manajemen Metadata & Cover */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="bg-paper wobbly-border paper-shadow p-8 sm:p-12 -rotate-1 hover:rotate-0 transition-all">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-14 h-14 bg-pine wobbly-border-sm flex items-center justify-center text-parchment rotate-3">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="font-journal-title text-2xl text-ink-deep italic uppercase tracking-tight">Detail Hikayat</h2>
                                <p className="font-marker text-[10px] text-ink/30 uppercase tracking-widest">Informasi Utama & Sampul</p>
                            </div>
                        </div>

                        {/* Status Badges */}
                        <div className="flex flex-wrap gap-3 mb-10">
                            {karya.genres.map(g => (
                                <span key={g.id} className="bg-parchment-light text-ink/40 font-marker text-[8px] uppercase px-4 py-2 wobbly-border-sm">{g.name}</span>
                            ))}
                            {karya.is_completed && <span className="bg-pine text-parchment font-marker text-[8px] uppercase px-4 py-2 wobbly-border-sm shadow-md">Telah Tamat</span>}
                        </div>

                        {/* Client Form */}
                        <EditKaryaForm karya={karya} allGenres={allGenres} />
                    </section>
                </div>

                {/* KOLOM KANAN: Manajemen Bab/Isi --- */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="bg-paper wobbly-border paper-shadow p-8 sm:p-10 rotate-1 hover:rotate-0 transition-all">
                        <div className="flex items-center justify-between mb-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gold wobbly-border-sm flex items-center justify-center text-ink-deep -rotate-6">
                                    <Clock className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="font-journal-title text-2xl text-ink-deep italic uppercase tracking-tight">Daftar Bab</h2>
                                    <p className="font-marker text-[10px] text-ink/30 uppercase tracking-widest">{karya.bab.length} Lembaran Terukir</p>
                                </div>
                            </div>
                        </div>

                        {/* Tombol Tambah Bab Baru */}
                        <div className="mb-12">
                            <CreateBabForm karyaId={karya.id} />
                        </div>

                        {/* Scrollable Chapter List */}
                        {karya.bab.length === 0 ? (
                            <div className="text-center py-16 bg-parchment-light/30 wobbly-border-sm border-dashed border-ink/10">
                                <p className="font-journal-body text-base text-ink/20 italic">Belum ada bab yang terukir di lembaran ini...</p>
                            </div>
                        ) : (
                            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-3 custom-scrollbar">
                                {karya.bab.map((chapter) => (
                                    <div key={chapter.id} className="group bg-parchment-light/20 hover:bg-paper p-6 wobbly-border-sm border-transparent hover:border-pine/10 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-pine text-parchment font-journal-title text-xl italic wobbly-border-sm w-12 h-12 flex items-center justify-center shadow-lg transition-transform group-hover:rotate-12">
                                                    {chapter.chapter_no}
                                                </div>
                                                <div>
                                                    <h4 className="font-journal-title text-lg text-ink-deep italic uppercase tracking-tight">Bab {chapter.chapter_no}</h4>
                                                    <p className="font-special text-[9px] text-ink/30 uppercase tracking-widest">{new Date(chapter.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                                </div>
                                            </div>
                                            <DeleteBabButton babId={chapter.id} />
                                        </div>

                                        <div className="flex gap-3">
                                            <div className="flex-1">
                                                <EditBabForm babId={chapter.id} initialContent={chapter.content} />
                                            </div>
                                            <Link
                                                href={`/novel/${karya.id}/${chapter.chapter_no}`}
                                                className="px-5 py-3 bg-paper wobbly-border-sm text-ink/40 hover:text-pine font-marker text-[9px] uppercase tracking-[0.2em] transition-all hover:rotate-3 active:scale-95 shadow-sm"
                                            >
                                                Baca
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
