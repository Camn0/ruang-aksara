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
            <div className="bg-white/60 dark:bg-brown-dark/60 p-8 rounded-[3rem] border border-tan-primary/10 shadow-sm transition-all">
                <h3 className="text-[10px] font-black text-brown-dark dark:text-text-accent uppercase tracking-[0.3em] mb-6 flex items-center gap-3 italic">
                    <MessageCircle className="w-5 h-5 text-tan-primary" />
                    Diskusi Goresan
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
                            className={`text-[9px] uppercase font-black px-5 py-2 rounded-full transition-all tracking-[0.15em] ${sortBy === 'score' ? 'bg-brown-dark text-text-accent shadow-lg shadow-brown-dark/20' : 'bg-tan-primary/5 dark:bg-brown-mid text-tan-primary/40 hover:text-tan-primary'}`}
                        >
                            Populer
                        </button>
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`text-[9px] uppercase font-black px-5 py-2 rounded-full transition-all tracking-[0.15em] ${sortBy === 'newest' ? 'bg-brown-dark text-text-accent shadow-lg shadow-brown-dark/20' : 'bg-tan-primary/5 dark:bg-brown-mid text-tan-primary/40 hover:text-tan-primary'}`}
                        >
                            Terbaru
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-2">
                {sortedComments.length === 0 ? (
                    <div className="py-24 text-center bg-white/40 dark:bg-brown-dark rounded-[3rem] border border-dashed border-tan-primary/20">
                        <div className="w-20 h-20 bg-tan-primary/5 dark:bg-brown-mid rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageCircle className="w-8 h-8 text-tan-primary/20" />
                        </div>
                        <p className="text-tan-primary/30 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Belum Ada Suara Terukir</p>
                    </div>
                ) : (
                    sortedComments.map((comment, index) => (
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
                            isLast={index === sortedComments.length - 1}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
