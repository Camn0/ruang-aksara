'use client';

import { useState } from 'react';
import { MessageCircle, History as HistoryIcon } from 'lucide-react';
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
        <div className="space-y-12">
            {/* Main Form: Parchment Style */}
            <div className="bg-parchment/60 dark:bg-parchment-dark/60 p-8 wobbly-border paper-shadow transition-all rotate-[0.5deg]">
                <h3 className="text-[11px] font-special text-pine uppercase tracking-widest mb-6 flex items-center gap-3">
                    <HistoryIcon className="w-5 h-5 text-ink/20" />
                    Bagi Goresan Pikiran
                </h3>
                <CommentForm babId={babId} />
            </div>

            {/* Sort Filter: Scrap Style */}
            {initialComments.length > 0 && (
                <div className="flex justify-between items-center mb-6 border-b border-ink/5 pb-4">
                    <span className="font-special text-[11px] text-ink/40 uppercase tracking-[0.2em]">{initialComments.length} Goresan Pembaca</span>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setSortBy('score')}
                            className={`text-[10px] font-marker uppercase px-4 py-2 wobbly-border-sm transition-all tracking-widest ${sortBy === 'score' ? 'bg-gold text-ink-deep shadow-md rotate-[-2deg]' : 'bg-white/40 text-ink/40 hover:text-pine'}`}
                        >
                            Terpopuler
                        </button>
                        <button
                            onClick={() => setSortBy('newest')}
                            className={`text-[10px] font-marker uppercase px-4 py-2 wobbly-border-sm transition-all tracking-widest ${sortBy === 'newest' ? 'bg-gold text-ink-deep shadow-md rotate-2' : 'bg-white/40 text-ink/40 hover:text-pine'}`}
                        >
                            Teranyar
                        </button>
                    </div>
                </div>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {sortedComments.length === 0 ? (
                    <div className="py-24 text-center wobbly-border border-dashed border-ink/10 bg-white/10 rotate-[-1deg]">
                        <div className="w-20 h-20 bg-ink/5 wobbly-border-sm flex items-center justify-center mx-auto mb-6 rotate-12">
                            <MessageCircle className="w-10 h-10 text-ink/10" />
                        </div>
                        <p className="font-journal-body text-xl text-ink/30 italic">"Goresan tinta pembaca belum menyentuh halaman ini."</p>
                    </div>
                ) : (
                    sortedComments.map((comment, index) => (
                        <div key={comment.id} className="relative">
                            <CommentItem
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
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
