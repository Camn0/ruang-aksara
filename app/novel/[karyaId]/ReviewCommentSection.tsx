/**
 * @file ReviewCommentSection.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import { UserCircle2, MessageSquare, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { deleteReviewComment, getMoreReviewComments } from '@/app/actions/review';
import { toast } from 'sonner';
import Link from 'next/link';
import Image from 'next/image';

interface ReviewCommentSectionProps {
    initialComments: any[];
    karyaUploaderId: string;
    currentUser: any;
    path: string;
    reviewId: string;
}

/**
 * ReviewCommentSection: Specialized commenting interface handling replies specifically attached to user Reviews.
 */
export default function ReviewCommentSection({
    initialComments,
    karyaUploaderId,
    currentUser,
    path,
    reviewId
}: ReviewCommentSectionProps) {
    const [comments, setComments] = useState<any[]>(initialComments);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialComments.length === 5); // Initial take is 5

    const handleDelete = async (commentId: string) => {
        if (!confirm('Hapus komentar ini?')) return;

        setIsDeleting(commentId);
        const res = await deleteReviewComment(commentId, path);
        setIsDeleting(null);

        if (res.error) {
            toast.error(res.error);
        } else {
            setComments(prev => prev.filter(c => c.id !== commentId));
            toast.success('Komentar dihapus');
        }
    };

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        
        const res = await getMoreReviewComments(reviewId, comments.length, 10);
        
        if (res.error) {
            toast.error(res.error);
        } else if (res.data) {
            if (res.data.length < 10) setHasMore(false);
            setComments(prev => [...prev, ...res.data]);
        }
        
        setIsLoadingMore(false);
    };

    if (comments.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-brown-mid/50">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-tan-primary/40 hover:text-tan-primary transition-all mb-6 hover:translate-x-1"
            >
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {isExpanded ? 'Tutup Balasan' : `Lihat ${comments.length}${hasMore ? '+' : ''} Goresan`}
            </button>

            {isExpanded && (
                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300 px-2">
                    <div className="space-y-6">
                        {comments.map((c: any) => {
                            const canDelete = currentUser && (
                                currentUser.role === 'admin' ||
                                currentUser.id === c.user_id ||
                                currentUser.id === karyaUploaderId
                            );

                            return (
                                <div key={c.id} className="flex gap-4 items-start pl-5 border-l border-tan-primary/10 group/comment relative">
                                    {/* Visual indicator dot for the line */}
                                    <div className="absolute left-[-4.5px] top-4 w-2 h-2 rounded-full bg-tan-primary/20 group-hover/comment:bg-tan-primary transition-colors" />
                                    <div className="w-9 h-9 rounded-xl overflow-hidden bg-tan-primary/5 shrink-0 border border-tan-primary/5 shadow-inner">
                                        {c.user?.avatar_url ? (
                                            <Image src={c.user.avatar_url} width={36} height={36} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <UserCircle2 className="w-full h-full text-tan-primary/10" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Link href={`/profile/${c.user?.username}`} prefetch={false} className="text-xs font-black text-brown-dark dark:text-text-accent hover:text-tan-primary transition-colors uppercase tracking-tight">{c.user?.display_name}</Link>
                                                {c.user?.id === karyaUploaderId && (
                                                    <span className="text-[7px] font-black bg-brown-dark text-text-accent px-2 py-0.5 rounded-sm uppercase tracking-widest italic">Penulis</span>
                                                )}
                                                <span className="text-[9px] font-black text-tan-primary/30 uppercase tracking-[0.1em]">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                            </div>

                                            {canDelete && (
                                                <button
                                                    onClick={() => handleDelete(c.id)}
                                                    disabled={isDeleting === c.id}
                                                    className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 text-gray-300 hover:text-red-500 disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-[13px] text-brown-mid dark:text-tan-light whitespace-pre-wrap leading-relaxed font-bold italic">"{c.content}"</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {hasMore && (
                        <div className="pt-2 pl-5">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-tan-primary hover:text-brown-dark transition-all disabled:opacity-50"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Memuat...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3 h-3" />
                                        Muat Lebih Banyak
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
