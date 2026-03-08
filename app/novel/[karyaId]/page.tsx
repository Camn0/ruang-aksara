import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "./ReviewForm";
import BookmarkButton from "./BookmarkButton";
import ReviewInteraction from "./ReviewInteraction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Star, TrendingUp, BookOpen, ArrowLeft, MessageSquareQuote } from "lucide-react";
import type { Metadata } from "next";

import { prisma } from '@/lib/prisma';
import { unstable_cache, revalidateTag } from 'next/cache';
import ContinueReadingButton from "./ContinueReadingButton";

/**
 * Halaman Detail Karya (Novel/Buku) (Server Component).
 * 
 * Logic Highlights:
 * 1. Search Engine Optimization(SEO): Metadata dinamis berdasarkan judul & penulis.
 * 2. Complex Fetching: Menarik data Karya, Bab, Review, serta Aggregated Counts dalam satu request.
 * 3. Type Casting: Mengatasi kendala model Prisma yang mungkin tertinggal(stale) dari schema sebenarnya.
 * 4. User Context: Mengambil status rating & bookmark user jika sedang login.
 */

/**
 * Cached function to fetch Karya details.
 * Mengapa: Mengurangi load ke database dengan menyimpan hasil query di memori server (Vercel Cache).
 * Data akan di-invalidate secara on-demand via tag 'karya-[id]'.
 */
const getCachedKarya = (karyaId: string) => {
    return unstable_cache(
        async () => {
            const karyaRaw = await (prisma as any).karya.findUnique({
                where: { id: karyaId },
                include: {
                    bab: {
                        orderBy: { chapter_no: 'asc' },
                        select: { id: true, chapter_no: true, created_at: true, content: true }
                    },
                    genres: true,
                    reviews: {
                        include: {
                            user: true,
                            _count: { select: { upvotes: true, comments: true } },
                            comments: {
                                include: { user: true },
                                orderBy: { created_at: 'asc' },
                                take: 5
                            }
                        },
                        orderBy: { created_at: 'desc' },
                        take: 5
                    }
                }
            });
            return karyaRaw;
        },
        [`karya-detail-${karyaId}`],
        {
            tags: [`karya-${karyaId}`, 'karya-global'],
            revalidate: 3600
        }
    )();
};

export async function generateMetadata({ params }: { params: { karyaId: string } }): Promise<Metadata> {
    const karya = await prisma.karya.findUnique({
        where: { id: params.karyaId },
        select: { title: true, penulis_alias: true, deskripsi: true }
    });
    if (!karya) return { title: 'Karya Tidak Ditemukan — Ruang Aksara' };
    const desc = karya.deskripsi ? karya.deskripsi.substring(0, 160) : `Baca ${karya.title} oleh ${karya.penulis_alias} di Ruang Aksara.`;
    return {
        title: `${karya.title} — Ruang Aksara`,
        description: desc,
    };
}

/**
 * Mencari mention '@username' dan mengubahnya menjadi link profil.
 */
function parseMentions(text: string) {
    if (!text) return text;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
        if (part.match(/^@\w+$/)) {
            const username = part.slice(1);
            return (
                <Link key={i} href={`/profile/${username}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline" target="_blank">
                    {part}
                </Link>
            );
        }
        return part;
    });
}

export default async function KaryaDetailsPage({ params }: { params: { karyaId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // [A] Data Fetching - Load Karya Details via Cache
    const karyaRaw = await getCachedKarya(params.karyaId);

    // [B] Type Guard & Assertions
    // Mengapa: Menjamin property seperti cover_url dan avg_rating tersedia bagi UI.
    const karya = karyaRaw as (typeof karyaRaw & {
        cover_url: string | null;
        is_completed: boolean;
        deskripsi: string | null;
        bab: any[];
        genres: any[];
        reviews: (any & {
            user: any;
            _count: { upvotes: number; comments: number };
            upvotes?: any[];
            comments?: any[];
        })[];
    }) | null;

    if (!karya) {
        notFound();
    }

    // [C] Load User Interaction State
    let userPreviousRating = 0;
    let userPreviousReview = null;
    let isBookmarked = false;

    // [D] Fetching User Interaksi - Upvoted status
    // Mengapa: Karena 'karya' di-cache secara global (shared), kita fetch status upvote user
    // secara terpisah agar cache tidak bocor antar user.
    let userUpvotedReviews: string[] = [];
    if (session?.user?.id && karya?.reviews) {
        const upvotes = await (prisma as any).reviewUpvote.findMany({
            where: {
                user_id: session.user.id,
                review_id: { in: karya.reviews.map((r: any) => r.id) }
            },
            select: { review_id: true }
        });
        userUpvotedReviews = upvotes.map((u: { review_id: string }) => u.review_id);
    }

    if (userId && karya) {
        // Parallel fetching untuk menghemat waktu (Request Waterfall Avoidance)
        const [ratingContext, prevReview, bookmarkContext] = await Promise.all([
            prisma.rating.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            }),
            prisma.review.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            }),
            prisma.bookmark.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            })
        ]);

        if (ratingContext) userPreviousRating = ratingContext.score;
        userPreviousReview = prevReview;
        if (bookmarkContext) isBookmarked = true;
    }

    const CoverPlaceholder = () => (
        <div className="w-32 h-48 sm:w-40 sm:h-56 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 flex items-center justify-center text-center p-4">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{karya.title}</span>
        </div>
    );

    const firstChapter = karya.bab.length > 0 ? karya.bab[0].chapter_no : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* Header / Navigasi Atas */}
            <header className="px-6 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
                <Link href="/" className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2 w-48 text-center truncate">
                    Detail Karya
                </h1>
                <div className="w-10"></div>
            </header>

            {/* Bagian Hero Profil Buku */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 pt-8 pb-8 px-6 transition-colors duration-300">
                <div className="flex gap-6 items-start">
                    {karya.cover_url ? (
                        <img src={karya.cover_url} alt={karya.title} className="w-32 h-48 sm:w-40 sm:h-56 object-cover rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800 shrink-0" />
                    ) : (
                        <CoverPlaceholder />
                    )}

                    <div className="flex-1 min-w-0 py-1">
                        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-2 line-clamp-3">
                            {karya.title}
                        </h1>
                        <div className="flex items-center gap-2 mb-3">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Oleh <Link href={`/profile/${karya.uploader_id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-bold transition-colors">{karya.penulis_alias}</Link></p>
                            {session && session.user.id !== karya.uploader_id && (
                                <Link href={`/profile/${karya.uploader_id}`} className="px-2 py-0.5 rounded text-indigo-600 bg-indigo-50 border border-indigo-100 text-[10px] font-bold uppercase tracking-wider">
                                    + Follow
                                </Link>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {karya.genres.map((g: any) => (
                                <span key={g.id} className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] uppercase font-bold px-2 py-1 rounded transition-colors">
                                    {g.name}
                                </span>
                            ))}
                            {karya.is_completed && (
                                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] uppercase font-black px-2 py-1 rounded transition-colors">
                                    Tamat
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-x-5 gap-y-3 mt-4 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            <span className="flex items-center gap-1.5 min-w-[30%]">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="text-gray-900 dark:text-gray-100 text-sm">{karya.avg_rating.toFixed(1)} <span className="text-gray-400 dark:text-gray-500 font-medium text-[10px]">/ 5</span></span>
                            </span>
                            <span className="flex items-center gap-1.5 min-w-[30%]">
                                <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                <span className="text-gray-900 dark:text-gray-100 text-sm">{karya.total_views.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center gap-1.5 min-w-[30%]">
                                <BookOpen className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <span className="text-gray-900 dark:text-gray-100 text-sm">{karya.bab.length} Bab</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tombol Aksi Utama Stack Horizontal */}
                <div className="mt-8 flex gap-2">
                    {firstChapter ? (
                        <Link href={`/novel/${karya.id}/${firstChapter}`} className="flex-1 text-center py-3.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-xl font-black text-sm shadow-xl shadow-indigo-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center">
                            Mulai Membaca
                        </Link>
                    ) : (
                        <button disabled className="flex-1 text-center py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed transition-colors">
                            Belum Ada Bab
                        </button>
                    )}

                    {session && (
                        <div className="flex gap-2 shrink-0">
                            <BookmarkButton karyaId={karya.id} isBookmarkedInitial={isBookmarked} />
                        </div>
                    )}
                </div>

                {/* EPIC 7: Quick Continue (Client-Side Instant UX) */}
                <ContinueReadingButton karyaId={karya.id} />
            </div>

            {/* Sinopsis */}
            {karya.deskripsi && (
                <div className="bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800 p-6 transition-colors duration-300">
                    <h2 className="text-base font-black text-gray-900 dark:text-gray-100 mb-3">Sinopsis</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {karya.deskripsi}
                    </p>
                </div>
            )}

            {/* Daftar Isi */}
            <div className="bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-base font-black text-gray-900 dark:text-gray-100">Daftar Isi</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{karya.bab.length} Bab Tersedia</p>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-slate-800">
                    {karya.bab.length === 0 ? (
                        <div className="p-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                            Belum ada bab yang dirilis.
                        </div>
                    ) : (
                        karya.bab.map((chapter: any) => (
                            <Link
                                key={chapter.id}
                                href={`/novel/${karya.id}/${chapter.chapter_no}`}
                                className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 active:bg-gray-100 dark:active:bg-slate-800 transition-colors"
                            >
                                <div className="flex flex-col pr-4">
                                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Bab {chapter.chapter_no}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                        {chapter.content.replace(/<[^>]*>?/gm, '').substring(0, 50)}...
                                    </span>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center shrink-0 transition-colors">
                                    <ArrowLeft className="w-4 h-4 text-gray-400 dark:text-gray-500 rotate-180" />
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* Interaksi: Rating & Review */}
            <div className="bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800 p-6 transition-colors duration-300">
                <h2 className="text-base font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-2">
                    <MessageSquareQuote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Tanggapan Pembaca
                </h2>

                {session ? (
                    <div className="space-y-6">
                        <ReviewForm karyaId={karya.id} existingReview={userPreviousReview} defaultScore={userPreviousRating} />
                    </div>
                ) : (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl text-center border border-indigo-100 dark:border-indigo-900/30 transition-colors">
                        <p className="text-sm font-bold text-indigo-900 dark:text-indigo-300 mb-2">Tertarik Berkomentar?</p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-4 px-4 leading-relaxed">Masuk ke akunmu untuk meninggalkan jejak dan mendukung penulis ini.</p>
                        <Link href="/onboarding" className="inline-block px-6 py-2.5 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-xs font-bold shadow-md shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105">
                            Mulai Masuk
                        </Link>
                    </div>
                )}
            </div>

            {/* List Review Terbaik */}
            {karya.reviews.length > 0 && (
                <div className="bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800 p-6 transition-colors duration-300">
                    <div className="space-y-4">
                        {karya.reviews.map((r: any) => (
                            <div key={r.id} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex gap-2 items-center">
                                        <Link href={`/profile/${r.user.username}`} className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold text-xs ring-2 ring-transparent hover:ring-indigo-300 transition-all shrink-0">
                                            {r.user.display_name.substring(0, 2).toUpperCase()}
                                        </Link>
                                        <div>
                                            <Link href={`/profile/${r.user.username}`} className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none hover:underline">{r.user.display_name}</Link>
                                            <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(r.created_at).toLocaleDateString('id-ID')}</p>
                                        </div>
                                    </div>
                                    {r.rating !== null && r.rating > 0 && (
                                        <div className="flex text-yellow-500 dark:text-yellow-400 fill-yellow-500 dark:fill-yellow-400">
                                            {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic whitespace-pre-wrap">"{parseMentions(r.content)}"</p>
                                <ReviewInteraction
                                    reviewId={r.id}
                                    initialUpvotes={r._count.upvotes}
                                    initialUpvoted={session ? r.upvotes && r.upvotes.length > 0 : false}
                                    replyCount={r._count.comments}
                                    currentPath={`/novel/${karya.id}`}
                                />

                                {/* Review Comments */}
                                {r.comments && r.comments.length > 0 && (
                                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 space-y-2">
                                        {r.comments.map((c: any) => (
                                            <div key={c.id} className="flex gap-2 items-start">
                                                <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-gray-500 shrink-0">
                                                    {c.user?.display_name?.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-xs"><Link href={`/profile/${c.user?.username}`} className="font-bold text-gray-900 dark:text-gray-100 hover:underline">{c.user?.display_name}</Link> <span className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{c.content}</span></p>
                                                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(c.created_at).toLocaleDateString('id-ID')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
