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
                <Link key={i} href={`/profile/${username}`} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline" target="_blank">
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
        <div className="w-32 h-48 sm:w-40 sm:h-56 bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 flex items-center justify-center text-center p-4">
            <span className="text-xs font-bold text-indigo-300 uppercase tracking-widest">{karya.title}</span>
        </div>
    );

    const firstChapter = karya.bab.length > 0 ? karya.bab[0].chapter_no : null;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            <header className="px-6 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
                <Link href="/" className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2 w-48 text-center truncate">
                    Detail Karya
                </h1>
                <div className="w-10"></div>
            </header>

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
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Oleh <Link href={`/profile/${karya.uploader?.username || karya.uploader_id}`} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline font-bold transition-colors">{karya.penulis_alias}</Link></p>
                            {session && session.user.id !== karya.uploader_id && (
                                <FollowButton
                                    targetUserId={karya.uploader_id}
                                    initialIsFollowing={isFollowing}
                                    karyaId={karya.id}
                                />
                            )}
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {(karya as any).genres?.map((g: any) => (
                                <Link
                                    key={g.id}
                                    href={`/search?q=&genreId=${g.id}`}
                                    className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-[10px] uppercase font-bold px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all"
                                >
                                    {g.name}
                                </Link>
                            ))}
                            {karya.is_completed ? (
                                <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] uppercase font-black px-2 py-1 rounded transition-colors">
                                    Tamat
                                </span>
                            ) : (
                                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-[10px] uppercase font-black px-2 py-1 rounded transition-colors">
                                    Ongoing
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

                    <div className="flex gap-2 shrink-0">
                        {session && <BookmarkButton karyaId={karya.id} isBookmarkedInitial={isBookmarked} />}
                        <ShareButton title={karya.title} karyaId={karya.id} />
                    </div>
                </div>

                <ContinueReadingButton karyaId={karya.id} />
            </div>

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
                <div className="bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800 p-6 transition-colors duration-300">
                    <h2 className="text-base font-black text-gray-900 dark:text-gray-100 mb-3">Sinopsis</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                        {karya.deskripsi}
                    </p>
                </div>
            )}

            <div className="bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800 p-6 transition-colors duration-300">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 italic">
                        <MessageSquareQuote className="w-5 h-5 text-indigo-600 dark:text-indigo-400 non-italic" />
                        Tulis Ulasan
                    </h2>
                </div>

                {session ? (
                    <ReviewForm karyaId={karya.id} existingReview={userPreviousReview} defaultScore={userPreviousRating} />
                ) : (
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-3xl text-center border border-indigo-100 dark:border-indigo-900/30 transition-colors">
                        <p className="text-sm font-black text-indigo-900 dark:text-indigo-300 mb-2 uppercase tracking-widest">Tertarik Memberi Rating?</p>
                        <p className="text-xs text-indigo-700 dark:text-indigo-400 mb-6 px-4 leading-relaxed font-bold">Masuk ke akunmu untuk meninggalkan jejak dan mendukung penulis ini.</p>
                        <Link href="/onboarding" className="inline-block px-8 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-200 dark:shadow-none transition-transform active:scale-95">
                            Mulai Masuk
                        </Link>
                    </div>
                )}
            </div>

            <CollapsibleReviewSection count={karya._count.reviews}>
                <div className="flex justify-end mb-6">
                    <ReviewSortToggle karyaId={karya.id} />
                </div>

                <div className="space-y-4">
                    {karya.reviews.map((review: any) => (
                        <div key={review.id} className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-colors group">
                            <div className="flex items-start justify-between gap-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-950 shadow-sm">
                                        {review.user.avatar_url ? (
                                            <img src={review.user.avatar_url} alt={review.user.display_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle2 className="w-full h-full text-gray-300" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-gray-900 dark:text-gray-100">{review.user.display_name}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
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
                                <div className="flex text-amber-400 fill-amber-400 mb-3 drop-shadow-sm">
                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                </div>
                            )}
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-medium mb-4">"{parseMentions(review.content)}"</p>

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
