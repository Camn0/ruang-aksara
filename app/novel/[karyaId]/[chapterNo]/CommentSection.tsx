'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import { toggleCommentPin } from '@/app/actions/comment';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { usePathname } from 'next/navigation';

interface User {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
}
interface Comment {
    id: string;
    content: string;
    created_at: string | Date;
    user: User;
    score: number;
    userVote?: number;
    is_pinned?: boolean | null;
    replies?: Comment[];
}

interface CommentSectionProps {
    babId: string;
    initialComments: Comment[];
    currentUserId?: string;
    currentUserRole?: string;
    authorId?: string;
}

export default function CommentSection({
    babId,
    initialComments,
    currentUserId,
    currentUserRole,
    authorId
}: CommentSectionProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [sortBy, setSortBy] = useState<'newest' | 'score'>('score');
    const [isPinning, setIsPinning] = useState<string | null>(null);

    // Sort: Pinned first, then by selection
    const sortedComments = [...initialComments].sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        if (sortBy === 'score') {
            if (a.score !== b.score) return b.score - a.score;
        }

        // Default Newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    const handleTogglePin = async (id: string) => {
        setIsPinning(id);
        const res = await toggleCommentPin(id);
        setIsPinning(null);
        if (res.error) toast.error(res.error);
        else router.refresh();
    };

    return (
        <div className="space-y-8">
            {/* Main Form */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm transition-all">
                <h3 className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Diskusi Bab
                </h3>
                <CommentForm babId={babId} />
            </div>

            {/* Sort Filter */}
            {initialComments.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{initialComments.length} Komentar</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setSortBy('score')}
                            className={`text-[9px] uppercase font-black px-4 py-1.5 rounded-full transition-all tracking-widest ${sortBy === 'score' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600'}`}
                        >
                            Populer
                        </button>
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`text-[9px] uppercase font-black px-4 py-1.5 rounded-full transition-all tracking-widest ${sortBy === 'newest' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-gray-600'}`}
                        >
                            Terbaru
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-2">
                {sortedComments.length === 0 ? (
                    <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
                        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="w-8 h-8 text-gray-200 dark:text-gray-700" />
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-sm font-black uppercase tracking-widest">Belum Ada Suara</p>
                    </div>
                ) : (
                    sortedComments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            babId={babId}
                            currentUserId={currentUserId}
                            currentUserRole={currentUserRole}
                            authorId={authorId}
                            handleTogglePin={handleTogglePin}
                            isPinning={isPinning}
                            isInitiallyCollapsed={true}
                            path={pathname}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
