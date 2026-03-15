import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ReviewForm from "./ReviewForm";
import ReviewInteraction from "./ReviewInteraction";
import ReviewSortToggle from "./ReviewSortToggle";
import ReviewCommentSection from "./ReviewCommentSection";
import PinReviewButton from "./PinReviewButton";
import DeleteReviewButton from "./DeleteReviewButton";
import { MessageSquareQuote, UserCircle2, Pin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ReviewSectionWrapperProps {
    karyaId: string;
    sort: string;
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

export default async function ReviewSectionWrapper({ karyaId, sort }: ReviewSectionWrapperProps) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const karya = await prisma.karya.findUnique({
        where: { id: karyaId },
        select: {
            uploader_id: true,
            reviews: {
                take: 20,
                select: {
                    id: true,
                    content: true,
                    content_html: true,
                    rating: true,
                    is_pinned: true,
                    created_at: true,
                    user_id: true,
                    user: { select: { id: true, username: true, display_name: true, avatar_url: true } },
                    _count: { select: { upvotes: true, comments: true } },
                    comments: {
                        select: {
                            id: true,
                            content: true,
                            created_at: true,
                            user: { select: { id: true, username: true, display_name: true, avatar_url: true } }
                        },
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
                select: { reviews: true }
            }
        }
    });

    if (!karya) return null;

    let userPreviousRating = 0;
    let userPreviousReview = null;
    let userUpvotedReviews: string[] = [];

    if (userId) {
        const [ratingContext, prevReview, upvotes] = await Promise.all([
            prisma.rating.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karyaId } }
            }),
            prisma.review.findUnique({
                where: { user_id_karya_id: { user_id: userId, karya_id: karyaId } }
            }),
            (prisma as any).reviewUpvote.findMany({
                where: {
                    user_id: userId,
                    review_id: { in: (karya as any).reviews?.map((r: any) => r.id) || [] }
                },
                select: { review_id: true }
            }) as Promise<{ review_id: string }[]>
        ]);

        if (ratingContext) userPreviousRating = ratingContext.score;
        userPreviousReview = prevReview;
        userUpvotedReviews = upvotes.map((u: any) => u.review_id);
    }

    return (
        <div className="bg-white/40 dark:bg-brown-dark/40 mt-6 border-y border-tan-primary/5 p-8 shadow-sm transition-colors duration-300">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-brown-dark dark:text-text-accent flex items-center gap-3 italic uppercase tracking-tighter">
                    <MessageSquareQuote className="w-6 h-6 text-tan-primary non-italic" />
                    Tanggapan Pembaca
                </h2>
                <div className="px-3 py-1 bg-tan-primary/5 dark:bg-tan-primary/10 rounded-full border border-tan-primary/10">
                    <span className="text-[10px] font-black text-tan-primary uppercase tracking-widest">{karya._count.reviews} Ulasan</span>
                </div>
            </div>

            {session ? (
                <ReviewForm karyaId={karyaId} existingReview={userPreviousReview} defaultScore={userPreviousRating} />
            ) : (
                <div className="bg-tan-primary/5 dark:bg-brown-mid/50 p-10 rounded-[2.5rem] text-center border border-tan-primary/10 transition-colors shadow-inner mb-8">
                    <p className="text-[11px] font-black text-tan-primary mb-3 uppercase tracking-[0.25em]">Ingin Menulis Kesan?</p>
                    <p className="text-xs text-brown-dark/50 dark:text-tan-light mb-8 px-6 leading-loose font-bold italic">Masuk ke Ruang Aksara untuk memberikan apresiasi pada sang penulis.</p>
                    <Link href="/auth/login" prefetch={false} className="inline-block px-12 py-4 bg-brown-dark text-text-accent rounded-full text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brown-dark/20 transition-all hover:scale-105 active:scale-95 hover:bg-brown-mid">
                        Mulai Perjalanan
                    </Link>
                </div>
            )}

            <div className="mt-12">
                <div className="flex justify-end mb-8">
                    <ReviewSortToggle karyaId={karyaId} />
                </div>

                <div className="space-y-4">
                    {karya.reviews.map((review: any) => (
                        <div key={review.id} className="p-8 bg-white/80 dark:bg-brown-dark/80 rounded-[2.5rem] border border-tan-primary/10 shadow-xl shadow-brown-dark/5 transition-all group backdrop-blur-sm">
                            <div className="flex items-start justify-between gap-4 mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-tan-primary/5 border border-tan-primary/10 shadow-inner p-0.5 relative">
                                        {review.user.avatar_url ? (
                                            <Image src={review.user.avatar_url} width={48} height={48} alt={review.user.display_name} className="w-full h-full object-cover rounded-[0.9rem]" />
                                        ) : (
                                            <UserCircle2 className="w-full h-full text-tan-primary/20" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-brown-dark dark:text-text-accent tracking-tight">{review.user.display_name}</p>
                                        <p className="text-[10px] font-black text-tan-primary/60 uppercase tracking-widest">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {(session?.user?.role === 'admin' || session?.user?.id === karya.uploader_id) && (
                                        <PinReviewButton
                                            reviewId={review.id}
                                            karyaId={karyaId}
                                            initialIsPinned={(review as any).is_pinned}
                                        />
                                    )}
                                    {(session?.user?.role === 'admin' || session?.user?.id === review.user_id || session?.user?.id === karya.uploader_id) && (
                                        <DeleteReviewButton
                                            reviewId={review.id}
                                            path={`/novel/${karyaId}`}
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
                            {review.content_html ? (
                                <div 
                                    className="text-[15px] text-brown-dark/80 dark:text-gray-300 leading-loose font-medium mb-6 italic prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: review.content_html }}
                                />
                            ) : (
                                <p className="text-[15px] text-brown-dark/80 dark:text-gray-300 leading-loose font-medium mb-6 italic">"{parseMentions(review.content)}"</p>
                            )}

                            <ReviewInteraction
                                reviewId={review.id}
                                initialUpvotes={review._count.upvotes}
                                initialUpvoted={userUpvotedReviews.includes(review.id)}
                                replyCount={review._count.comments}
                                currentPath={`/novel/${karyaId}`}
                            />

                            <ReviewCommentSection
                                comments={review.comments}
                                karyaUploaderId={karya.uploader_id}
                                currentUser={session?.user}
                                path={`/novel/${karyaId}`}
                                reviewId={review.id}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
