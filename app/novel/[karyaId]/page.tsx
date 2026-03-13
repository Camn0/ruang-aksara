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
import CollapsibleReviewSection from "./CollapsibleReviewSection";
import DeleteReviewButton from "./DeleteReviewButton";
import ReviewCommentSection from "./ReviewCommentSection";

/**
 * Halaman Detail Karya (Novel/Buku) (Server Component).
 */

async function fetchKaryaDetail(karyaId: string, sort: string = 'new') {
    return await unstable_cache(
        async () => {
            return await prisma.karya.findUnique({
                where: { id: karyaId },
                include: {
                    uploader: { select: { id: true, username: true, display_name: true, avatar_url: true } },
                    bab: {
                        orderBy: { chapter_no: "asc" },
                        select: { id: true, chapter_no: true, title: true, created_at: true }
                    },
                    genres: true,
                    reviews: {
                        take: 20,
                        include: {
                            user: { select: { id: true, username: true, display_name: true, avatar_url: true } },
                            _count: { select: { upvotes: true, comments: true } },
                            comments: {
                                include: { user: { select: { id: true, username: true, display_name: true, avatar_url: true } } },
                                orderBy: { created_at: 'asc' },
                                take: 5
                            }
                        },
                        orderBy: [
                            { is_pinned: 'desc' },
                            sort === 'top'
                                ? { upvotes: { _count: 'desc' } }
                                : { created_at: 'desc' }
                        ]
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
                <Link key={i} href={`/profile/${username}`} className="text-tan-primary dark:text-tan-light font-bold hover:underline" target="_blank">
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
    let isFollowing = false;
    let userUpvotedReviews: string[] = [];

    if (userId) {
        const [ratingContext, prevReview, bookmarkContext, upvotes] = await Promise.all([
            prisma.rating.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            }),
            prisma.review.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            }),
            prisma.bookmark.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
            }),
            (prisma as any).reviewUpvote.findMany({
                where: {
                    user_id: userId,
                    review_id: { in: karya.reviews?.map((r: any) => r.id) || [] }
                },
                select: { review_id: true }
            }) as { review_id: string }[]
        ]);

        if (ratingContext) userPreviousRating = ratingContext.score;
        userPreviousReview = prevReview;
        if (bookmarkContext) isBookmarked = true;
        userUpvotedReviews = upvotes.map((u: any) => u.review_id);

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
        <div className="min-h-screen bg-bg-cream dark:bg-slate-950 pb-24 transition-colors duration-300 selection:bg-tan-primary/30">
            <header className="px-6 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-tan-primary/10 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300 shadow-sm shadow-brown-dark/5">
                <Link href="/" className="p-2 -ml-2 text-tan-primary hover:bg-tan-primary/10 rounded-full transition-all active:scale-95">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-lobster text-2xl text-brown-dark dark:text-gray-100 absolute left-1/2 -translate-x-1/2 italic">
                    Detail Karya
                </h1>
                <div className="w-10"></div>
            </header>            <div className="bg-white/40 dark:bg-slate-900/40 border-b border-tan-primary/5 pt-8 pb-10 px-6 transition-colors duration-300 relative overflow-hidden">
                {/* Background artistic pattern snippet */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5 pointer-events-none">
                    <TrendingUp className="w-full h-full text-tan-primary rotate-12" />
                </div>

                <div className="flex gap-6 items-start relative z-10">
                    {karya.cover_url ? (
                        <img src={karya.cover_url} alt={karya.title} className="w-32 h-48 sm:w-44 sm:h-64 object-cover rounded-3xl shadow-xl shadow-brown-dark/10 border border-white/50 dark:border-slate-800 shrink-0 transform -rotate-1 hover:rotate-0 transition-transform duration-500" />
                    ) : (
                        <CoverPlaceholder />
                    )}
 
                    <div className="flex-1 min-w-0 py-1">
                        <h1 className="text-2xl sm:text-4xl font-black text-brown-dark dark:text-gray-100 leading-tight mb-3 italic tracking-tight">
                            {karya.title}
                        </h1>
                        <div className="flex items-center gap-2 mb-4">
                            <p className="text-sm font-bold text-brown-dark/60 dark:text-gray-400">Tinta dari <Link href={`/profile/${karya.uploader?.username || karya.uploader_id}`} className="text-tan-primary hover:text-brown-mid hover:underline font-black transition-colors">{karya.penulis_alias}</Link></p>
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
                                    className="bg-tan-primary/10 dark:bg-slate-800 text-tan-primary text-[10px] uppercase font-black px-3 py-1.5 rounded-full hover:bg-tan-primary hover:text-text-accent transition-all tracking-wider shadow-sm shadow-tan-primary/5"
                                >
                                    {g.name}
                                </Link>
                            ))}
                            {karya.is_completed ? (
                                <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-[10px] uppercase font-black px-3 py-1.5 rounded-full transition-colors tracking-wider border border-emerald-200/50">
                                    Tamat
                                </span>
                            ) : (
                                <span className="bg-brown-dark/10 text-brown-dark dark:text-tan-primary text-[10px] uppercase font-black px-3 py-1.5 rounded-full transition-colors tracking-wider border border-brown-dark/5">
                                    Berjalan
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-x-8 gap-y-4 mt-6 pt-6 border-t border-tan-primary/10 text-[11px] font-black text-brown-dark/50 dark:text-gray-400 uppercase tracking-widest">
                            <span className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500 drop-shadow-sm" />
                                <span className="text-brown-dark dark:text-gray-100 text-base">{karya.avg_rating.toFixed(1)} <span className="text-brown-dark/30 font-bold text-xs">/ 5</span></span>
                            </span>
                            <span className="flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-tan-primary" />
                                <span className="text-brown-dark dark:text-gray-100 text-base">{karya.total_views.toLocaleString()} <span className="text-brown-dark/30 text-[10px]">Baca</span></span>
                            </span>
                            <span className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-brown-mid/40" />
                                <span className="text-brown-dark dark:text-gray-100 text-base">{karya.bab.length} <span className="text-brown-dark/30 text-[10px]">Pena</span></span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex gap-2">
                    {firstChapter ? (
                        <Link href={`/novel/${karya.id}/${firstChapter}`} className="flex-1 text-center py-4 bg-brown-dark text-text-accent rounded-[2rem] font-black text-[13px] uppercase tracking-[0.2em] shadow-2xl shadow-brown-dark/20 active:scale-[0.98] transition-all flex items-center justify-center hover:bg-brown-mid">
                            Mulai Perjalanan
                        </Link>
                    ) : (
                        <button disabled className="flex-1 text-center py-3.5 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 rounded-xl font-bold text-sm cursor-not-allowed transition-colors">
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

            <div className="bg-white/60 dark:bg-slate-900/60 mt-3 border-y border-tan-primary/5 shadow-sm transition-colors duration-300">
                <div className="p-6 border-b border-tan-primary/5">
                    <h2 className="text-base font-black text-brown-dark dark:text-gray-100 uppercase tracking-widest italic">Daftar Isi</h2>
                    <p className="text-[10px] font-bold text-tan-primary/60 uppercase tracking-widest mt-1.5">{karya.bab.length} Pena Terukir</p>
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
                                    <span className="font-bold text-gray-900 dark:text-gray-100 text-sm">Bab {chapter.chapter_no}{chapter.title ? `: ${chapter.title}` : ''}</span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 italic text-left">
                                        Klik untuk mulai membaca...
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

            {karya.deskripsi && (
                <div className="bg-white/60 dark:bg-slate-900/60 mt-3 border-y border-tan-primary/5 p-6 shadow-sm transition-colors duration-300">
                    <h2 className="text-base font-black text-brown-dark dark:text-gray-100 mb-4 uppercase tracking-widest italic">Sinopsis</h2>
                    <p className="text-sm text-brown-dark/70 dark:text-gray-400 leading-loose whitespace-pre-wrap font-medium">
                        {karya.deskripsi}
                    </p>
                </div>
            )}

            <div className="bg-white/60 dark:bg-slate-900/60 mt-3 border-y border-tan-primary/5 p-6 shadow-sm transition-colors duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-brown-dark dark:text-gray-100 flex items-center gap-3 italic uppercase tracking-tighter">
                        <MessageSquareQuote className="w-6 h-6 text-tan-primary non-italic" />
                        Goresan Ulasan
                    </h2>
                </div>

                {session ? (
                    <ReviewForm karyaId={karya.id} existingReview={userPreviousReview} defaultScore={userPreviousRating} />
                ) : (
                    <div className="bg-tan-primary/5 dark:bg-slate-800/50 p-10 rounded-[2.5rem] text-center border border-tan-primary/10 transition-colors shadow-inner">
                        <p className="text-[11px] font-black text-tan-primary mb-3 uppercase tracking-[0.25em]">Ingin Menulis Kesan?</p>
                        <p className="text-xs text-brown-dark/50 dark:text-gray-400 mb-8 px-6 leading-loose font-bold italic">Masuk ke Ruang Aksara untuk memberikan apresiasi pada sang penulis.</p>
                        <Link href="/auth/login" className="inline-block px-12 py-4 bg-brown-dark text-text-accent rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brown-dark/20 transition-all hover:scale-105 active:scale-95 hover:bg-brown-mid">
                            Mulai Perjalanan
                        </Link>
                    </div>
                )}
            </div>

            <CollapsibleReviewSection count={karya._count.reviews}>
                <div className="flex justify-end mb-8">
                    <ReviewSortToggle karyaId={karya.id} />
                </div>

                <div className="space-y-4">
                    {karya.reviews.map((review: any) => (
                        <div key={review.id} className="p-8 bg-white/80 dark:bg-slate-900/80 rounded-[2.5rem] border border-tan-primary/10 shadow-xl shadow-brown-dark/5 transition-all group backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-tan-primary/5 border border-tan-primary/10 shadow-inner p-0.5">
                                        {review.user.avatar_url ? (
                                            <img src={review.user.avatar_url} alt={review.user.display_name} className="w-full h-full object-cover rounded-[0.9rem]" />
                                        ) : (
                                            <UserCircle2 className="w-full h-full text-tan-primary/20" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-brown-dark dark:text-gray-100 tracking-tight">{review.user.display_name}</p>
                                        <p className="text-[10px] font-black text-tan-primary/60 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(session?.user?.role === 'admin' || session?.user?.id === karya.uploader_id) && (
                                        <PinReviewButton
                                            reviewId={review.id}
                                            karyaId={karya.id}
                                            initialIsPinned={(review as any).is_pinned}
                                        />
                                    )}
                                    {(session?.user?.role === 'admin' || session?.user?.id === review.user_id || session?.user?.id === karya.uploader_id) && (
                                        <DeleteReviewButton
                                            reviewId={review.id}
                                            path={`/novel/${karya.id}`}
                                        />
                                    )}
                                </div>
                            </div>

                            {review.is_pinned && (
                                <div className="flex items-center gap-1.5 mb-4 text-[9px] font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full w-fit uppercase tracking-[0.1em] border border-amber-100 dark:border-amber-900/40">
                                    <Pin className="w-3 h-3 fill-amber-500" />
                                    Review Pilihan Penulis
                                </div>
                            )}

                            {review.rating !== null && review.rating > 0 && (
                                <div className="flex text-amber-500 fill-amber-500 mb-4 drop-shadow-sm scale-110 origin-left">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                            )}
                            <p className="text-[15px] text-brown-dark/80 dark:text-gray-300 leading-loose font-medium mb-6 italic">"{parseMentions(review.content)}"</p>

                            <ReviewInteraction
                                reviewId={review.id}
                                initialUpvotes={review._count.upvotes}
                                initialUpvoted={userUpvotedReviews.includes(review.id)}
                                replyCount={review._count.comments}
                                currentPath={`/novel/${karya.id}`}
                            />

                            <ReviewCommentSection
                                comments={review.comments}
                                karyaUploaderId={karya.uploader_id}
                                currentUser={session?.user}
                                path={`/novel/${karya.id}`}
                                reviewId={review.id}
                            />
                        </div>
                    ))}
                </div>
            </CollapsibleReviewSection>
        </div>
    );
}
