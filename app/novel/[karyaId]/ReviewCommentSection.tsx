'use client';

import { useState } from 'react';
import { UserCircle2, MessageSquare, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { deleteReviewComment } from '@/app/actions/review';
import { toast } from 'sonner';
import Link from 'next/link';

interface ReviewCommentSectionProps {
    comments: any[];
    karyaUploaderId: string;
    currentUser: any;
    path: string;
    reviewId: string;
}

export default function ReviewCommentSection({
    comments,
    karyaUploaderId,
    currentUser,
    path,
    reviewId
}: ReviewCommentSectionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const handleDelete = async (commentId: string) => {
        if (!confirm('Hapus komentar ini?')) return;

        setIsDeleting(commentId);
        const res = await deleteReviewComment(commentId, path);
        setIsDeleting(null);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Komentar dihapus');
        }
    };

    if (comments.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-800/50">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-2 font-marker text-[9px] uppercase tracking-[0.2em] text-ink/30 hover:text-pine transition-colors mb-4"
            >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                {isExpanded ? 'Sembunyikan' : `Lihat ${comments.length} Balasan`}
            </button>

            {isExpanded && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {comments.map((c: any) => {
                        const canDelete = currentUser && (
                            currentUser.role === 'admin' ||
                            currentUser.id === c.user_id ||
                            currentUser.id === karyaUploaderId
                        );

                        return (
                            <div key={c.id} className="flex gap-3 items-start pl-4 border-l-2 border-gray-100 dark:border-slate-800 group/comment">
                                <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0 border border-white dark:border-slate-950">
                                    {c.user?.avatar_url ? (
                                        <img src={c.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle2 className="w-full h-full text-gray-300" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <div className="flex items-center gap-1.5">
                                            <Link href={`/profile/${c.user?.username}`} className="font-journal-title text-base text-ink-deep hover:text-pine transition-all italic">{c.user?.display_name}</Link>
                                            {c.user?.id === karyaUploaderId && (
                                                <span className="font-marker text-[7px] bg-pine text-parchment px-2 py-0.5 wobbly-border-sm uppercase tracking-tighter shadow-sm">Penulis Cerita</span>
                                            )}
                                            <span className="font-special text-[8px] text-ink/30 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString('id-ID')}</span>
                                        </div>

                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(c.id)}
                                                disabled={isDeleting === c.id}
                                                className="opacity-0 group-hover/comment:opacity-100 transition-opacity p-1 text-ink/20 hover:text-dried-red disabled:opacity-50"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <p className="font-journal-body text-base text-ink-deep/80 whitespace-pre-wrap leading-relaxed italic pr-4">{c.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
