'use client';

import { useState } from 'react';
import { toggleReviewUpvote } from '@/app/actions/review';
import { ThumbsUp, MessageSquare } from 'lucide-react';

export default function ReviewInteraction({ reviewId, initialUpvotes, initialUpvoted, replyCount, currentPath }: { reviewId: string, initialUpvotes: number, initialUpvoted: boolean, replyCount: number, currentPath: string }) {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
    const [isPending, setIsPending] = useState(false);

    async function handleUpvote() {
        if (isPending) return;
        setIsPending(true);

        const newUpvoted = !isUpvoted;
        setIsUpvoted(newUpvoted);
        setUpvotes(prev => newUpvoted ? prev + 1 : prev - 1);

        try {
            const res = await toggleReviewUpvote(reviewId, currentPath);
            if (res.error) {
                setIsUpvoted(!newUpvoted);
                setUpvotes(prev => !newUpvoted ? prev + 1 : prev - 1);
                alert(res.error);
            }
        } catch (error) {
            setIsUpvoted(!newUpvoted);
            setUpvotes(prev => !newUpvoted ? prev + 1 : prev - 1);
            alert("Kesalahan jaringan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-slate-800/50">
            <button
                onClick={handleUpvote}
                className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isUpvoted ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                disabled={isPending}
            >
                <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} /> {upvotes} Membantu
            </button>
            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" /> Balas ({replyCount})
            </button>
        </div>
    );
}
