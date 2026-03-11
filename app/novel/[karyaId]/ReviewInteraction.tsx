'use client';

/**
 * Komponen Interaksi Ulasan (Client-side).
 * 
 * Fitur:
 *   - Optimistic UI: Menampilkan perubahan upvote secara instan sebelum server merespons.
 *   - Local State: Mengelola status pending dan jumlah balasan tanpa perlu re-fetch full page.
 *   - Error Recovery: Mengembalikan state UI jika request server gagal.
 * 
 * @param reviewId - ID review yang diinteraksi.
 * @param initialUpvotes - Jumlah upvote awal dari server.
 * @param initialUpvoted - Status apakah user saat ini sudah upvote (awal).
 * @param replyCount - Jumlah balasan ulasan.
 * @param currentPath - Path saat ini (untuk invalidasi cache Next.js).
 */

import { useState, useRef } from 'react';
import { toggleReviewUpvote, submitReviewComment } from '@/app/actions/review';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';

export default function ReviewInteraction({ reviewId, initialUpvotes, initialUpvoted, replyCount, currentPath }: { reviewId: string, initialUpvotes: number, initialUpvoted: boolean, replyCount: number, currentPath: string }) {
    // [STATE MANAGEMENT]
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
    const [isPending, setIsPending] = useState(false); // Mencegah spam klik (throttling)
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyPending, setReplyPending] = useState(false);
    const [localReplyCount, setLocalReplyCount] = useState(replyCount);
    const [replySuccess, setReplySuccess] = useState('');

    // Ref digunakan untuk mereset form HTML secara imperatif setelah sukses
    const formRef = useRef<HTMLFormElement>(null);

    /**
     * Handler Upvote dengan Logika Optimis.
     */
    async function handleUpvote() {
        if (isPending) return; // Throttling
        setIsPending(true);

        // 1. Update UI secara instan (Optimistic)
        const newUpvoted = !isUpvoted;
        setIsUpvoted(newUpvoted);
        setUpvotes(prev => newUpvoted ? prev + 1 : prev - 1);

        try {
            // 2. Kirim request ke Server Action
            const res = await toggleReviewUpvote(reviewId, currentPath);

            if (res.error) {
                // 3. Rollback jika server mengembalikan error (misal: session expired)
                setIsUpvoted(!newUpvoted);
                setUpvotes(prev => !newUpvoted ? prev + 1 : prev - 1);
                alert(res.error);
            }
        } catch (error) {
            // Rollback jika terjadi kesalahan jaringan
            setIsUpvoted(!newUpvoted);
            setUpvotes(prev => !newUpvoted ? prev + 1 : prev - 1);
            alert("Kesalahan jaringan.");
        } finally {
            setIsPending(false);
        }
    }

    /**
     * Handler Submit Balasan Ulasan.
     */
    async function handleReplySubmit(formData: FormData) {
        if (replyPending) return;
        setReplyPending(true);
        setReplySuccess('');

        // Injeksi review_id manual karena tidak ada di field form tampak
        formData.append('review_id', reviewId);

        try {
            const res = await submitReviewComment(formData);
            if (res.error) {
                alert(res.error);
            } else {
                // Sukses: Update UI lokal
                setReplySuccess('Balasan dikirim!');
                setLocalReplyCount(prev => prev + 1);
                formRef.current?.reset(); // Kosongkan input

                // Tutup form secara otomatis setelah jeda singkat
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
                {/* Tombol Upvote */}
                <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${isUpvoted ? 'text-pine' : 'text-ink/40 hover:text-pine'}`}
                    disabled={isPending}
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'fill-current' : ''}`} /> {upvotes} Sangat Membantu
                </button>

                {/* Tombol Toggle Form Balas */}
                <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-xs font-bold text-ink/40 hover:text-pine transition-colors"
                >
                    <MessageSquare className="w-3.5 h-3.5" /> Balas ({localReplyCount})
                </button>
            </div>

            {/* Render Form Balas (Conditional Rendering) */}
            {showReplyForm && (
                <form ref={formRef} action={handleReplySubmit} className="mt-3 flex gap-2 items-start">
                    <textarea
                        name="content"
                        placeholder="Tulis balasan untuk ulasan ini..."
                        required
                        disabled={replyPending}
                        className="flex-1 text-xs bg-parchment-light border-2 border-ink/5 wobbly-border-sm p-3 outline-none focus:border-pine/30 min-h-[50px] italic"
                        rows={2}
                    />
                    <button
                        type="submit"
                        disabled={replyPending}
                        className="bg-pine text-parchment p-3 wobbly-border-sm hover:bg-pine-light transition active:scale-95 disabled:opacity-50 shrink-0"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}

            {/* Toast Sederhana */}
            {replySuccess && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-2 animate-pulse">{replySuccess}</p>
            )}
        </div>
    );
}
