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
    const session = (await getServerSession(authOptions))!;

    const karya = await prisma.karya.findUnique({
        where: { id: params.karyaId },
        include: {
            genres: true,
            bab: {
                orderBy: { chapter_no: 'asc' }
            }
        }
    });

    const allGenres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });

    if (!karya) {
        notFound();
    }

    if (karya.uploader_id !== session.user.id && session.user.role !== 'admin') {
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Unauthorized: Anda tidak memiliki akses ke karya ini.
            </div>
        );
    }

    return (
        <div className="pb-24">
            <div className="px-6 pt-6 sm:pt-10 mb-8 sm:mb-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                    <div>
                        <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-indigo-500 hover:text-indigo-600 transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
                            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Dashboard
                        </Link>
                        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none uppercase italic">{karya.title}</h1>
                        <p className="text-gray-400 font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em] mt-2">Manajemen Karya & Bab</p>
                    </div>
                    <DeleteKaryaButton karyaId={karya.id} />
                </div>
            </div>

            <div className="px-6 grid lg:grid-cols-12 gap-8 sm:gap-12">
                {/* Left: Meta Modification */}
                <div className="lg:col-span-7 space-y-8">
                    <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 shadow-xl shadow-gray-200/30 dark:shadow-none border border-gray-100 dark:border-slate-800 transition-all">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-600">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Detail Karya</h2>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Informasi Utama & Cover</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-8">
                            {karya.genres.map(g => (
                                <span key={g.id} className="bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-gray-500 text-[9px] uppercase font-black px-3 py-1.5 rounded-full border border-gray-100 dark:border-slate-700">{g.name}</span>
                            ))}
                            {karya.is_completed && <span className="bg-emerald-500 text-white text-[9px] uppercase font-black px-3 py-1.5 rounded-full shadow-lg shadow-emerald-200 dark:shadow-none">Selesai</span>}
                        </div>

                        <EditKaryaForm karya={karya} allGenres={allGenres} />
                    </section>
                </div>

                {/* Right: Chapter Management */}
                <div className="lg:col-span-5 space-y-8">
                    <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 shadow-xl shadow-gray-200/30 dark:shadow-none border border-gray-100 dark:border-slate-800 transition-all">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">Daftar Bab</h2>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{karya.bab.length} Dirilis</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-10">
                            <CreateBabForm karyaId={karya.id} />
                        </div>

                        {karya.bab.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50/50 dark:bg-slate-800/50 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-700">
                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Belum ada bab yang dirilis</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {karya.bab.map((chapter) => (
                                    <div key={chapter.id} className="group bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 p-4 rounded-3xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-indigo-600 text-white font-black rounded-xl w-10 h-10 flex items-center justify-center text-xs shadow-lg shadow-indigo-200 dark:shadow-none">
                                                    {chapter.chapter_no}
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-gray-900 dark:text-gray-100 uppercase text-xs tracking-tight">Bab {chapter.chapter_no}</h4>
                                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(chapter.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</p>
                                                </div>
                                            </div>
                                            <DeleteBabButton babId={chapter.id} />
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <EditBabForm babId={chapter.id} initialContent={chapter.content} />
                                            </div>
                                            <Link
                                                href={`/novel/${karya.id}/${chapter.chapter_no}`}
                                                className="px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-500 hover:text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm hover:shadow-md active:scale-95"
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
