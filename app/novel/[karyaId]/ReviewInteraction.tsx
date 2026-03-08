'use client';

import { useState, useRef } from 'react';
import { toggleReviewUpvote, submitReviewComment } from '@/app/actions/review';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';

export default function ReviewInteraction({ reviewId, initialUpvotes, initialUpvoted, replyCount, currentPath }: { reviewId: string, initialUpvotes: number, initialUpvoted: boolean, replyCount: number, currentPath: string }) {
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
    const [isPending, setIsPending] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyPending, setReplyPending] = useState(false);
    const [localReplyCount, setLocalReplyCount] = useState(replyCount);
    const [replySuccess, setReplySuccess] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

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

    async function handleReplySubmit(formData: FormData) {
        if (replyPending) return;
        setReplyPending(true);
        setReplySuccess('');

        formData.append('review_id', reviewId);

        try {
            const res = await submitReviewComment(formData);
            if (res.error) {
                alert(res.error);
            } else {
                setReplySuccess('Balasan dikirim!');
                setLocalReplyCount(prev => prev + 1);
                formRef.current?.reset();
                setTimeout(() => {
                    setShowReplyForm(false);
                    setReplySuccess('');
                }, 1500);
            }
        } catch (error) {
            alert("Kesalahan jaringan.");
        } finally {
            setReplyPending(false);
        }
    }

    return (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800/50">
            <div className="flex items-center gap-4">
                <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isUpvoted ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    disabled={isPending}
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} /> {upvotes} Membantu
                </button>
                <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                    <MessageSquare className="w-3.5 h-3.5" /> Balas ({localReplyCount})
                </button>
            </div>

            {showReplyForm && (
                <form ref={formRef} action={handleReplySubmit} className="mt-3 flex gap-2 items-start">
                    <textarea
                        name="content"
                        placeholder="Tulis balasan untuk ulasan ini..."
                        required
                        disabled={replyPending}
                        className="flex-1 text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 p-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 min-h-[40px] resize-none"
                        rows={2}
                    />
                    <button
                        type="submit"
                        disabled={replyPending}
                        className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </form>
            )}
            {replySuccess && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-2 animate-pulse">{replySuccess}</p>
            )}
        </div>
    );
}
