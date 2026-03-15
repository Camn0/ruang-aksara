import { notFound } from "next/navigation";
import Link from "next/link";
import ReviewForm from "./ReviewForm";
import BookmarkButton from "./BookmarkButton";
import ReviewInteraction from "./ReviewInteraction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Star, TrendingUp, BookOpen, ArrowLeft, MessageSquareQuote, UserCircle2, Pin } from "lucide-react";
import type { Metadata } from "next";

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import ContinueReadingButton from "./ContinueReadingButton";
import ShareButton from "./ShareButton";
import FollowButton from "./FollowButton";
import ReviewSortToggle from "./ReviewSortToggle";
import PinReviewButton from "./PinReviewButton";
import DeleteReviewButton from "./DeleteReviewButton";
import Image from "next/image";
import { Suspense } from "react";
import ReviewSectionWrapper from "./ReviewSectionWrapper";
import ChapterListWrapper from "./ChapterListWrapper";

/**
 * Halaman Detail Karya (Novel/Buku) (Server Component).
 */

async function fetchKaryaDetail(karyaId: string, sort: string = 'new') {
    return await unstable_cache(
        async () => {
            return await prisma.karya.findUnique({
                where: { id: karyaId },
                select: {
                    id: true,
                    title: true,
                    penulis_alias: true,
                    uploader_id: true,
                    cover_url: true,
                    deskripsi: true,
                    is_completed: true,
                    avg_rating: true,
                    total_views: true,
                    uploader: { select: { id: true, username: true, display_name: true, avatar_url: true } },
                    bab: {
                        orderBy: { chapter_no: "asc" },
                        take: 1, // [Optimization] Fetch only the first chapter for initial link
                        select: { chapter_no: true }
                    },
                    genres: {
                        select: { id: true, name: true }
                    },
                    _count: {
                        select: { bab: true, bookmarks: true, ratings: true, reviews: true }
                    }
                }
            });
        },
        [`karya-${karyaId}`, `sort-${sort}`],
        { revalidate: 3600, tags: [`karya-${karyaId}`] }
    )();
}

export async function generateMetadata({ params }: { params: { karyaId: string } }): Promise<Metadata> {
    const karya = await fetchKaryaDetail(params.karyaId);
    if (!karya) return { title: 'Karya Tidak Ditemukan — Ruang Aksara' };

    const desc = karya.deskripsi ? karya.deskripsi.substring(0, 160) : `Baca ${karya.title} oleh ${karya.penulis_alias} di Ruang Aksara.`;
    return {
        title: `${karya.title} — Ruang Aksara`,
        description: desc,
    };
}

function parseMentions(text: string) {
    if (!text) return text;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
        if (part.match(/^@\w+$/)) {
            const username = part.slice(1);
            return (
                <Link key={i} href={`/profile/${username}`} prefetch={false} className="text-tan-primary dark:text-tan-light font-bold hover:underline" target="_blank">
                    {part}
                </Link>
            );
        }
        return part;
    });
}

export default async function KaryaDetailsPage({ params, searchParams }: { params: { karyaId: string }, searchParams: { sort?: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const sort = searchParams.sort || 'new';

    const karya = await fetchKaryaDetail(params.karyaId, sort) as any;
    if (!karya) notFound();

    let userPreviousRating = 0;
    let userPreviousReview = null;
    let isBookmarked = false;
    let bookmarkContext: any = null;
    let isFollowing = false;
    let userUpvotedReviews: string[] = [];

    if (userId) {
        const [ratingContext, bContext] = await Promise.all([
            prisma.rating.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            }),
            prisma.bookmark.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            })
        ]);

        if (ratingContext) userPreviousRating = ratingContext.score;
        bookmarkContext = bContext;
        if (bookmarkContext) isBookmarked = true;

        if (karya.uploader_id && userId !== karya.uploader_id) {
            const followRecord = await (prisma as any).follow.findUnique({
                where: {
                    follower_id_following_id: {
                        follower_id: userId,
                        following_id: karya.uploader_id
                    }
                }
            });
            isFollowing = !!followRecord;
        }
    }

    const typedKarya = karya as any; // Temporary cast for relation access

    const CoverPlaceholder = () => (
        <div className="w-32 h-48 sm:w-40 sm:h-56 bg-tan-light/10 rounded-2xl shadow-lg border border-tan-light/30 flex items-center justify-center text-center p-4">
            <span className="text-[10px] font-bold text-tan-primary uppercase tracking-widest">{karya.title}</span>
        </div>
    );

    const firstChapter = karya.bab.length > 0 ? karya.bab[0].chapter_no : null;

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark pb-24 transition-colors duration-300 selection:bg-tan-primary/30">
            <header className="px-6 h-16 bg-white/80 dark:bg-brown-dark/80 backdrop-blur-md border-b border-tan-primary/10 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300 shadow-sm shadow-brown-dark/5">
                <Link href="/" prefetch={false} className="p-2 -ml-2 text-tan-primary hover:bg-tan-primary/10 rounded-full transition-all active:scale-95">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-lobster text-2xl text-brown-dark dark:text-text-accent absolute left-1/2 -translate-x-1/2 italic">
                    Detail Karya
                </h1>
                <div className="w-10"></div>
            </header>            <div className="bg-white/40 dark:bg-brown-dark/40 border-b border-tan-primary/5 pt-8 pb-10 px-6 transition-colors duration-300 relative overflow-hidden">
                {/* Background artistic pattern snippet */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                    <TrendingUp className="w-full h-full text-tan-primary rotate-12" />
                </div>

                <div className="flex gap-6 items-start relative z-10">
                    {karya.cover_url ? (
                        <div className="w-32 h-48 sm:w-44 sm:h-64 relative shrink-0 transform -rotate-1 hover:rotate-0 transition-transform duration-500 overflow-hidden rounded-3xl shadow-xl shadow-brown-dark/10 border border-white/50 dark:border-brown-mid">
                            <Image 
                                src={karya.cover_url} 
                                alt={karya.title} 
                                fill
                                sizes="(max-width: 640px) 128px, 176px"
                                className="object-cover"
                                priority
                            />
                        </div>
                    ) : (
                        <CoverPlaceholder />
                    )}
 
                    <div className="flex-1 min-w-0 py-1">
                        <h1 className="text-2xl sm:text-4xl font-black text-brown-dark dark:text-text-accent leading-tight mb-3 italic tracking-tight">
                            {karya.title}
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                            <p className="text-sm font-bold text-brown-dark/60 dark:text-tan-light">Tinta dari <Link href={`/profile/${karya.uploader?.username || karya.uploader_id}`} prefetch={false} className="text-tan-primary hover:text-brown-mid hover:underline font-black transition-colors">{karya.penulis_alias}</Link></p>
                            {session && session.user.id !== karya.uploader_id && (
                                <FollowButton
                                    targetUserId={karya.uploader_id}
                                    initialIsFollowing={isFollowing}
                                    karyaId={karya.id}
                                />
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {(karya as any).genres?.map((g: any) => (
                                <Link
                                    key={g.id}
                                    href={`/search?q=&genreId=${g.id}`}
                                    prefetch={false}
                                    className="bg-tan-primary/20 dark:bg-brown-mid/60 text-tan-primary dark:text-tan-light text-[10px] uppercase font-black px-3 py-1.5 rounded-full hover:bg-tan-primary hover:text-white transition-all tracking-wider border border-tan-primary/20"
                                >
                                    {g.name}
                                </Link>
                            ))}
                            {karya.is_completed ? (
                                <span className="bg-green-500/10 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] uppercase font-black px-3 py-1.5 rounded-full transition-colors tracking-wider border border-green-500/20">
                                    Tamat
                                </span>
                            ) : (
                                <span className="bg-brown-dark/10 dark:bg-brown-mid/40 text-brown-dark dark:text-tan-primary text-[10px] uppercase font-black px-3 py-1.5 rounded-full transition-colors tracking-wider border border-brown-dark/10">
                                    Berjalan
                                </span>
                            )}
                        </div>

                        {/* [NEW] Top Synopsis - Relocated for better visibility */}
                        {karya.deskripsi && (
                            <div className="mb-6 relative">
                                <p className="text-[13px] text-brown-dark/80 dark:text-tan-light/80 leading-relaxed font-medium italic line-clamp-3">
                                    "{karya.deskripsi}"
                                </p>
                                <div className="absolute -bottom-1 left-0 w-8 h-[2px] bg-tan-primary/30"></div>
                            </div>
                        )}

                        {/* [NEW] Personalized Progress Bar */}
                        {isBookmarked && session && karya.bab.length > 0 && bookmarkContext && (
                            <div className="mb-6 bg-tan-primary/5 dark:bg-brown-mid/20 p-5 rounded-[2rem] border border-tan-primary/10 shadow-inner group">
                                <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-4 h-4 text-tan-primary" />
                                        <span className="text-[10px] font-black text-tan-primary uppercase tracking-[0.2em]">Progress Membaca</span>
                                    </div>
                                    <span className="text-[10px] font-black text-brown-dark/40 dark:text-tan-light/40 uppercase tracking-widest">
                                        {bookmarkContext.last_chapter} / {karya._count.bab} Bab
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-tan-primary/10 rounded-full overflow-hidden border border-tan-primary/5">
                                    <div 
                                        className="h-full bg-tan-primary transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(var(--tan-primary-rgb),0.3)]" 
                                        style={{ width: `${Math.min(100, (bookmarkContext.last_chapter / karya._count.bab) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6 pt-6 border-t border-tan-primary/10 text-[11px] font-black text-brown-dark/50 dark:text-tan-light uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.2)]" />
                                <span className="text-brown-dark dark:text-text-accent text-base tracking-tighter">{karya.avg_rating.toFixed(1)} <span className="text-brown-dark/20 dark:text-tan-light/20 font-bold text-[10px]">/ 5.0</span></span>
                            </span>
                            <span className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-tan-primary opacity-60" />
                                <span className="text-brown-dark dark:text-text-accent text-base tracking-tighter">{karya.total_views.toLocaleString()} <span className="text-brown-dark/20 dark:text-tan-light/20 text-[10px]">Wujud</span></span>
                            </span>
                            <span className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-brown-mid/30" />
                                <span className="text-brown-dark dark:text-text-accent text-base tracking-tighter">{karya._count.bab} <span className="text-brown-dark/20 dark:text-tan-light/20 text-[10px]">Pena</span></span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-2">
                    {firstChapter ? (
                        <Link href={`/novel/${karya.id}/${firstChapter}`} prefetch={false} className="flex-1 text-center py-4 bg-brown-dark text-text-accent rounded-[2rem] font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-brown-dark/20 active:scale-[0.98] transition-all flex items-center justify-center hover:bg-brown-mid">
                            Mulai Perjalanan
                        </Link>
                    ) : (
                        <button disabled className="flex-1 text-center py-3.5 bg-gray-100 dark:bg-brown-mid text-gray-400 dark:text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed transition-colors">
                            Belum Ada Bab
                        </button>
                    )}

                    <div className="flex gap-2 shrink-0">
                        {session && <BookmarkButton karyaId={karya.id} isBookmarkedInitial={isBookmarked} />}
                        <ShareButton title={karya.title} karyaId={karya.id} />
                    </div>
                </div>

                <ContinueReadingButton karyaId={karya.id} />
            </div>

            <div className="bg-white/60 dark:bg-brown-dark/60 mt-3 border-y border-tan-primary/5 shadow-sm transition-colors duration-300 overflow-hidden">
                <div className="p-6 border-b border-tan-primary/10 bg-tan-primary/[0.02]">
                    <h2 className="text-base font-black text-brown-dark dark:text-text-accent uppercase tracking-[0.2em] italic">Daftar Isi</h2>
                    <p className="text-[10px] font-bold text-tan-primary/40 uppercase tracking-widest mt-1.5">{karya._count.bab} Pena Terukir</p>
                </div>

                <Suspense fallback={
                    <div className="p-10 text-center animate-pulse">
                        <p className="text-[10px] font-black text-tan-primary uppercase tracking-[0.3em] italic">Membuka Gulungan Daftar Isi...</p>
                    </div>
                }>
                    <ChapterListWrapper karyaId={karya.id} />
                </Suspense>
            </div>

            <Suspense fallback={
                <div className="bg-white/40 dark:bg-brown-dark/40 mt-6 border-y border-tan-primary/5 p-12 text-center animate-pulse">
                    <p className="text-[10px] font-black text-tan-primary uppercase tracking-[0.3em] italic">Membuka Gulungan Review...</p>
                </div>
            }>
                <ReviewSectionWrapper karyaId={karya.id} sort={sort} />
            </Suspense>
        </div>
    );
}
