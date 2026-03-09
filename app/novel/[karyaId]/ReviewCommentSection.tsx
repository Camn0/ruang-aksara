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
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors mb-4"
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
                                        <div className="flex items-center gap-2">
                                            <Link href={`/profile/${c.user?.username}`} className="text-xs font-black text-gray-900 dark:text-gray-100 hover:text-indigo-600 transition-colors uppercase tracking-tight">{c.user?.display_name}</Link>
                                            {c.user?.id === karyaUploaderId && (
                                                <span className="text-[7px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">Penulis</span>
                                            )}
                                            <span className="text-[9px] font-bold text-gray-400 truncate tracking-tighter">{new Date(c.created_at).toLocaleDateString('id-ID')}</span>
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
                                    <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed font-medium">{c.content}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
