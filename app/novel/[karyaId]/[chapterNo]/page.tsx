import { notFound } from 'next/navigation';
import CommentForm from './CommentForm';
import DeleteCommentButton from './DeleteCommentButton';
import { redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import ReadingInterface from './ReadingInterface';

import { prisma } from '@/lib/prisma';

function parseMentions(text: string) {
    if (!text) return text;
    // Split text by @ symbols followed by word characters (alphanumeric & underscore)
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
        if (part.match(/^@\w+$/)) {
            const username = part.slice(1);
            return (
                <Link key={i} href={`/profile/${username}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                    {part}
                </Link>
            );
        }
        return part;
    });
}

/**
 * Halaman Baca Bab Novel (Server Component).
 * 
 * Logic Highlights:
 *   1. Data Fetching: Mengambil detail Bab beserta relasi Karya dan Komentar (threaded).
 *   2. Statistik: Increment views di Redis (Upstash) setiap kali halaman diakses.
 *   3. Bookmarking: Otomatis memperbarui 'last_chapter' di tabel Bookmark milik user.
 * 
 * DEBUG TIPS:
 *   - Jika halaman 404, pastikan URL parameter `chapterNo` valid (number).
 *   - Redis error ditangani secara senyap (silently) agar tidak mematikan pengalaman membaca.
 */

export default async function NovelChapterPage({
    params,
}: {
    params: { karyaId: string; chapterNo: string };
}) {
    // [A] Data Fetching - Load bab dan komentar
    // Mengapa findUnique: Kita menggunakan composite unique key [karya_id, chapter_no] dari skema Prisma.
    const bab = await prisma.bab.findUnique({
        where: {
            karya_id_chapter_no: {
                karya_id: params.karyaId,
                chapter_no: Number(params.chapterNo),
            },
        },
        include: {
            karya: true,
            comments: {
                where: { parent_id: null }, // Load hanya komentar utama (Root)
                include: {
                    user: true,
                    replies: {
                        include: { user: true },
                        orderBy: { created_at: 'asc' }
                    }
                },
                orderBy: { created_at: 'asc' },
            },
        },
    });

    // Validasi eksistensi data
    if (!bab) {
        notFound();
    }

    // [B] Analytics - Update Views
    // Menggunakan key format 'views:karya:[ID]' agar mudah di-trace.
    try {
        await redis.incr(`views:karya:${params.karyaId}`);
    } catch (e) {
        console.error("⚠️ [Redis] Gagal increment views:", e);
    }

    const currentNo = Number(params.chapterNo);

    // [C] Navigasi Relatif - Cari bab selanjutnya & sebelumnya
    const nextBab = await prisma.bab.findFirst({
        where: { karya_id: params.karyaId, chapter_no: { gt: currentNo } },
        orderBy: { chapter_no: 'asc' }
    });

    const prevBab = await prisma.bab.findFirst({
        where: { karya_id: params.karyaId, chapter_no: { lt: currentNo } },
        orderBy: { chapter_no: 'desc' }
    });

    // [D] Auto-Bookmark - Catat progres membaca user yang login
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        try {
            await prisma.bookmark.upsert({
                where: {
                    user_id_karya_id: {
                        user_id: session.user.id,
                        karya_id: params.karyaId
                    }
                },
                update: { last_chapter: currentNo },
                create: {
                    user_id: session.user.id,
                    karya_id: params.karyaId,
                    last_chapter: currentNo
                }
            });
        } catch (e) {
            console.error("⚠️ [Prisma] Gagal update bookmark:", e);
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 text-gray-900 dark:text-gray-100 pb-28">
            <ReadingInterface
                karyaId={params.karyaId}
                chapterNo={bab.chapter_no}
                title={bab.karya.title}
                content={bab.content}
            />

            {/* Navigasi Footer Tetap (Bottom Bar) */}
            <nav className="fixed bottom-0 inset-x-0 h-20 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:max-w-md md:left-1/2 md:-translate-x-1/2 md:rounded-t-3xl md:border-x transition-all duration-300">
                {prevBab ? (
                    <Link href={`/novel/${params.karyaId}/${prevBab.chapter_no}`} className="flex flex-col items-center gap-1 p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors active:scale-95">
                        <ChevronLeft className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Prev</span>
                    </Link>
                ) : (
                    <div className="flex flex-col items-center gap-1 p-2 text-gray-300 dark:text-gray-600">
                        <ChevronLeft className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Prev</span>
                    </div>
                )}

                <Link href={`/novel/${params.karyaId}`} className="flex flex-col items-center gap-1 p-4 bg-indigo-600 text-white rounded-full -mt-8 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 transition-all border-4 border-[#FDFBF7] dark:border-slate-950">
                    <List className="w-6 h-6" />
                </Link>

                {nextBab ? (
                    <Link href={`/novel/${params.karyaId}/${nextBab.chapter_no}`} className="flex flex-col items-center gap-1 p-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors active:scale-95">
                        <ChevronRight className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Next</span>
                    </Link>
                ) : (
                    <div className="flex flex-col items-center gap-1 p-2 text-gray-300 dark:text-gray-600">
                        <ChevronRight className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Next</span>
                    </div>
                )}
            </nav>

            {/* Bagian Komentar */}
            <section className="px-6 py-8 bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 md:max-w-2xl md:mx-auto md:rounded-t-3xl mt-8">
                <h3 className="font-bold text-lg mb-6 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-slate-800 pb-4">
                    Komentar Pembaca ({bab.comments.length})
                </h3>

                <div className="space-y-6">
                    {bab.comments.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 italic text-sm text-center py-8">
                            Jadilah yang pertama berkomentar di bab ini.
                        </p>
                    ) : (
                        bab.comments.map((rootComment) => (
                            <div key={rootComment.id} className="flex flex-col gap-3">
                                <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col gap-2 relative">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-50 dark:border-slate-700/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-[10px]">
                                                {rootComment.user.display_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <Link href={`/profile/${rootComment.user.username}`} className="text-gray-900 dark:text-gray-200 font-bold text-sm hover:underline">
                                                {rootComment.user.display_name}
                                            </Link>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <time className="text-[10px] text-gray-400 dark:text-gray-500">
                                                {new Date(rootComment.created_at).toLocaleDateString('id-ID')}
                                            </time>
                                            {(session?.user?.id === rootComment.user_id || session?.user?.role === 'admin') && (
                                                <DeleteCommentButton commentId={rootComment.id} />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                                        {parseMentions(rootComment.content)}
                                    </p>
                                    <div className="text-right">
                                        <CommentForm babId={bab.id} parentId={rootComment.id} isReply={true} />
                                    </div>
                                </div>

                                {rootComment.replies && rootComment.replies.length > 0 && (
                                    <details className="pl-6 border-l-2 border-indigo-100 dark:border-indigo-900/40 ml-2 group">
                                        <summary className="text-xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer list-none mb-3 hover:underline focus:outline-none select-none inline-flex items-center gap-1">
                                            <span className="group-open:hidden flex items-center gap-1">Lihat {rootComment.replies.length} balasan ▼</span>
                                            <span className="hidden group-open:flex items-center gap-1">Sembunyikan balasan ▲</span>
                                        </summary>
                                        <div className="space-y-3">
                                            {rootComment.replies.map((reply: any) => (
                                                <div key={reply.id} className="bg-gray-100/50 dark:bg-slate-800/50 p-3 rounded-xl border border-gray-100 dark:border-slate-700/50 flex flex-col gap-1.5 relative">
                                                    <div className="flex justify-between items-center pb-1">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-gray-400 text-xs">↳</span>
                                                            <Link href={`/profile/${reply.user.username}`} className="text-gray-600 dark:text-gray-400 font-bold text-xs hover:underline">
                                                                {reply.user.display_name}
                                                            </Link>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <time className="text-[10px] text-gray-400 dark:text-gray-500">
                                                                {new Date(reply.created_at).toLocaleDateString('id-ID')}
                                                            </time>
                                                            {(session?.user?.id === reply.user_id || session?.user?.role === 'admin') && (
                                                                <DeleteCommentButton commentId={reply.id} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap text-xs">
                                                        {parseMentions(reply.content)}
                                                    </p>
                                                    <div className="mt-1 text-right">
                                                        <CommentForm babId={bab.id} parentId={rootComment.id} isReply={true} replyToUsername={reply.user.username} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {session ? (
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
                        <h4 className="font-bold text-sm mb-4 text-gray-900 dark:text-gray-100">Tulis Komentar</h4>
                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                            <CommentForm babId={bab.id} />
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center text-sm text-indigo-700 dark:text-indigo-300">
                        <Link href="/onboarding" className="font-bold underline">Masuk</Link> untuk ikut berdiskusi.
                    </div>
                )}
            </section>
            {/* Epic 7: Auto-Bookmark Tracker (Client Side Sync for "Instancy") */}
            <script dangerouslySetInnerHTML={{
                __html: `
                try {
                    const bookmarks = JSON.parse(localStorage.getItem('ra-bookmarks') || '{}');
                    bookmarks['${params.karyaId}'] = ${params.chapterNo};
                    localStorage.setItem('ra-bookmarks', JSON.stringify(bookmarks));
                } catch(e) {}
            `}} />
        </div>
    );
}
