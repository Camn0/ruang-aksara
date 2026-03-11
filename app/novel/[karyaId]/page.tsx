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
                <Link key={i} href={`/profile/${username}`} className="text-pine font-bold hover:underline" target="_blank">
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
        <div className="w-32 h-48 sm:w-40 sm:h-56 bg-parchment-light rounded-2xl shadow-lg border-2 border-paper/20 flex items-center justify-center text-center p-4">
            <span className="text-xs font-marker text-ink/20 uppercase tracking-widest">{karya.title}</span>
        </div>
    );

    const firstChapter = karya.bab.length > 0 ? karya.bab[0].chapter_no : null;

    return (
        <div className="min-h-screen bg-parchment-light pb-32 selection:bg-pine/20">
            {/* Vignette Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />

            {/* Header: Wobbly Tab */}
            <header className="px-6 h-16 bg-parchment border-b-4 border-ink/5 wobbly-border-b sticky top-0 z-30 flex items-center justify-between">
                <Link href="/" className="p-2 -ml-2 text-ink-deep hover:text-pine transition-all active:scale-90">
                    <ArrowLeft className="w-7 h-7" />
                </Link>
                <h1 className="font-journal-title text-2xl text-ink-deep absolute left-1/2 -translate-x-1/2 w-64 text-center truncate italic">
                    Dossier: {karya.title}
                </h1>
                <div className="w-10"></div>
            </header>

            {/* Top Section: The Dossier Entry */}
            <div className="pt-10 pb-12 px-6 relative">
                {/* Background Decoration: Ink Splatter placeholder or subtle texture */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-ink/5 rounded-full blur-3xl -z-10" />

                <div className="flex flex-col sm:flex-row gap-8 items-center sm:items-start max-w-4xl mx-auto">
                    {/* Cover: The Taped-on Sketch */}
                    <div className="relative group rotate-[-2deg] transition-transform hover:rotate-0">
                        {/* Tape effect */}
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-8 bg-gold/30 wobbly-border-sm rotate-12 z-10 mix-blend-multiply" />

                        {karya.cover_url ? (
                            <img src={karya.cover_url} alt={karya.title} className="w-44 h-64 sm:w-52 sm:h-72 object-cover wobbly-border border-4 border-paper shadow-xl bg-paper" />
                        ) : (
                            <div className="w-44 h-64 sm:w-52 sm:h-72 bg-paper wobbly-border border-4 flex items-center justify-center p-6 text-center shadow-xl">
                                <span className="font-marker text-xl text-ink/30 italic uppercase">{karya.title}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="font-journal-title text-4xl sm:text-5xl text-ink-deep leading-none mb-4 drop-shadow-sm italic">
                            {karya.title}
                        </h1>

                        <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                            <p className="font-journal-body text-xl text-ink/60 italic">
                                Dicatat oleh: <Link href={`/profile/${karya.uploader?.username || karya.uploader_id}`} className="text-pine font-marker text-2xl hover:text-ink-deep transition-colors underline decoration-dotted">{karya.penulis_alias}</Link>
                            </p>
                            {session && session.user.id !== karya.uploader_id && (
                                <div className="scale-90 sm:scale-100 rotate-1">
                                    <FollowButton
                                        targetUserId={karya.uploader_id}
                                        initialIsFollowing={isFollowing}
                                        karyaId={karya.id}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Genres: Ink Tags */}
                        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-6">
                            {(karya as any).genres?.map((g: any) => (
                                <Link
                                    key={g.id}
                                    href={`/search?q=&genreId=${g.id}`}
                                    className="font-marker text-xs uppercase tracking-widest text-ink/50 px-3 py-1.5 wobbly-border-sm bg-paper/40 hover:bg-gold hover:text-ink-deep hover:rotate-3 transition-all"
                                >
                                    {g.name}
                                </Link>
                            ))}
                            <span className={`font-special text-[10px] uppercase tracking-widest px-3 py-1.5 wobbly-border-sm rotate-[-2deg] ${karya.is_completed ? 'bg-pine/10 text-pine' : 'bg-gold/20 text-ink-deep'}`}>
                                {karya.is_completed ? 'DOKUMEN TAMAT' : 'DALAM PEMANTAUAN'}
                            </span>
                        </div>

                        {/* Metrics: The Sidebar Notes feel */}
                        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto sm:mx-0 pt-6 border-t border-ink/5">
                            <div className="flex flex-col items-center sm:items-start group">
                                <div className="flex items-center gap-2 text-gold">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-journal-title text-2xl text-ink-deep">{karya.avg_rating.toFixed(1)}</span>
                                </div>
                                <span className="font-special text-[9px] text-ink/30 uppercase tracking-widest">Penilaian</span>
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="flex items-center gap-2 text-pine">
                                    <TrendingUp className="w-5 h-5" />
                                    <span className="font-journal-title text-2xl text-ink-deep">{karya.total_views.toLocaleString()}</span>
                                </div>
                                <span className="font-special text-[9px] text-ink/30 uppercase tracking-widest">Laporan Baca</span>
                            </div>
                            <div className="flex flex-col items-center sm:items-start">
                                <div className="flex items-center gap-2 text-ink/30">
                                    <BookOpen className="w-5 h-5" />
                                    <span className="font-journal-title text-2xl text-ink-deep">{karya.bab.length}</span>
                                </div>
                                <span className="font-special text-[9px] text-ink/30 uppercase tracking-widest">Kumpulan Bab</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Action Buttons: Big Scrap style */}
                <div className="mt-12 flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                    {firstChapter ? (
                        <Link href={`/novel/${karya.id}/${firstChapter}`} className="flex-1 text-center py-5 bg-pine text-parchment wobbly-border paper-shadow font-journal-title text-2xl italic hover:bg-ink-deep transition-all active:scale-95 rotate-[-1deg]">
                            Buka Halaman Pertama
                        </Link>
                    ) : (
                        <button disabled className="flex-1 py-5 bg-ink/5 text-ink/20 wobbly-border border-dashed font-journal-body text-xl italic cursor-not-allowed">
                            "Halaman ini masih kosong..."
                        </button>
                    )}

                    <div className="flex gap-4 sm:shrink-0 justify-center">
                        {session && (
                            <div className="rotate-2 transition-transform hover:rotate-0">
                                <BookmarkButton karyaId={karya.id} isBookmarkedInitial={isBookmarked} />
                            </div>
                        )}
                        <div className="rotate-[-2deg] transition-transform hover:rotate-0">
                            <ShareButton title={karya.title} karyaId={karya.id} />
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto mt-6">
                    <ContinueReadingButton karyaId={karya.id} />
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 space-y-10">
                {/* Synopsis: A dedicated parchment entry */}
                {karya.deskripsi && (
                    <div className="bg-parchment p-8 wobbly-border paper-shadow rotate-[0.5deg]">
                        <h2 className="font-journal-title text-2xl text-ink-deep mb-4 italic flex items-center gap-3">
                            <MessageSquareQuote className="w-6 h-6 text-pine" />
                            Ringkasan Kejadian
                        </h2>
                        <div className="font-journal-body text-xl text-ink-deep leading-relaxed whitespace-pre-wrap italic">
                            {karya.deskripsi}
                        </div>
                    </div>
                )}

                {/* Chapter List: The Index Page */}
                <div className="bg-paper/40 wobbly-border p-8 rotate-[-0.5deg]">
                    <div className="flex items-center justify-between mb-8 border-b-2 border-ink/5 pb-4">
                        <div>
                            <h2 className="font-journal-title text-3xl text-ink-deep italic">Indeks Cerita</h2>
                            <p className="font-special text-[11px] text-ink/40 uppercase tracking-widest mt-1">{karya.bab.length} Bab Telah Dicatat</p>
                        </div>
                    </div>

                    <div className="grid gap-4">
                        {karya.bab.length === 0 ? (
                            <div className="py-12 text-center font-journal-body text-xl text-ink/20 italic">
                                Belum ada penemuan yang dicatat...
                            </div>
                        ) : (
                            karya.bab.map((chapter: any) => (
                                <Link
                                    key={chapter.id}
                                    href={`/novel/${karya.id}/${chapter.chapter_no}`}
                                    className="flex items-center justify-between p-5 bg-parchment-light hover:bg-paper wobbly-border-sm transition-all group hover:scale-[1.02]"
                                >
                                    <div className="flex flex-col">
                                        <span className="font-journal-title text-xl text-ink-deep group-hover:text-pine transition-colors italic">
                                            Bab {chapter.chapter_no}{chapter.title ? `: ${chapter.title}` : ''}
                                        </span>
                                        <span className="font-marker text-xs text-ink/30 uppercase tracking-[0.2em] mt-1">
                                            Masuk ke arsip...
                                        </span>
                                    </div>
                                    <div className="w-10 h-10 wobbly-border-sm bg-paper flex items-center justify-center transition-all group-hover:bg-gold group-hover:rotate-12">
                                        <ArrowLeft className="w-5 h-5 text-ink rotate-180" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>

                {/* Reviews Section: Field Observations */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="font-journal-title text-3xl text-ink-deep flex items-center gap-3 italic">
                            <UserCircle2 className="w-7 h-7 text-pine" />
                            Observasi Pembaca
                        </h2>
                    </div>

                    <div className="bg-parchment/60 p-8 wobbly-border paper-shadow rotate-[0.2deg]">
                        {session ? (
                            <ReviewForm karyaId={karya.id} existingReview={userPreviousReview} defaultScore={userPreviousRating} />
                        ) : (
                            <div className="p-8 text-center border-2 border-dashed border-ink/10 rotate-[-1deg]">
                                <p className="font-journal-title text-2xl text-ink/60 italic mb-4">Ingin berpartisipasi dalam observasi?</p>
                                <p className="font-journal-body text-lg text-ink/40 mb-8 max-w-sm mx-auto">Masuk untuk mencatat kesan Anda di jurnal ini dan dukung sang pencatat.</p>
                                <Link href="/onboarding" className="inline-block px-10 py-4 bg-pine text-parchment font-journal-title text-xl italic wobbly-border-sm hover:rotate-2 transition-all active:scale-95">
                                    Masuk Sekarang
                                </Link>
                            </div>
                        )}
                    </div>

                    <CollapsibleReviewSection count={karya._count.reviews}>
                        <div className="flex justify-end mb-8">
                            <div className="rotate-2">
                                <ReviewSortToggle karyaId={karya.id} />
                            </div>
                        </div>

                        <div className="space-y-8">
                            {karya.reviews.map((review: any) => (
                                <div key={review.id} className="p-8 bg-paper wobbly-border paper-shadow transition-all group relative hover:rotate-[0.5deg]">
                                    {/* Action Buttons: Sketch Style */}
                                    <div className="absolute top-6 right-8 flex items-center gap-2 opacity-10 sm:group-hover:opacity-100 transition-opacity">
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

                                    <div className="flex items-start gap-5 mb-6">
                                        <div className="w-14 h-14 wobbly-border overflow-hidden bg-parchment-light shrink-0 rotate-[-3deg] group-hover:rotate-6 transition-transform">
                                            {review.user.avatar_url ? (
                                                <img src={review.user.avatar_url} alt={review.user.display_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center font-journal-title text-2xl text-ink/20">
                                                    {review.user.display_name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-journal-title text-xl text-ink-deep leading-none mb-1">{review.user.display_name}</p>
                                            <p className="font-marker text-[11px] text-ink/30 uppercase tracking-[0.2em]">
                                                {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    {review.is_pinned && (
                                        <div className="flex items-center gap-2 mb-6 font-special text-[10px] text-gold bg-ink-deep px-4 py-1.5 wobbly-border-sm w-fit uppercase tracking-[0.2em] rotate-1">
                                            <Pin className="w-4 h-4 fill-current" />
                                            Observasi Pilihan
                                        </div>
                                    )}

                                    {review.rating !== null && review.rating > 0 && (
                                        <div className="flex text-gold mb-4 text-xl drop-shadow-sm rotate-[-2deg]">
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </div>
                                    )}

                                    <p className="font-journal-body text-[19px] text-ink-deep leading-relaxed mb-8 italic">
                                        "{parseMentions(review.content)}"
                                    </p>

                                    <div className="pt-6 border-t border-ink/5">
                                        <ReviewInteraction
                                            reviewId={review.id}
                                            initialUpvotes={review._count.upvotes}
                                            initialUpvoted={userUpvotedReviews.includes(review.id)}
                                            replyCount={review._count.comments}
                                            currentPath={`/novel/${karya.id}`}
                                        />
                                    </div>

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
            </div>
        </div>
    );
}
