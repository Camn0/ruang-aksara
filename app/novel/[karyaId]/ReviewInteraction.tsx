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
import { useRouter } from 'next/navigation';
import { toggleReviewUpvote, submitReviewComment } from '@/app/actions/review';
import { ThumbsUp, MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ReviewInteraction({ reviewId, initialUpvotes, initialUpvoted, replyCount, currentPath }: { reviewId: string, initialUpvotes: number, initialUpvoted: boolean, replyCount: number, currentPath: string }) {
    // [STATE MANAGEMENT]
    const [upvotes, setUpvotes] = useState(initialUpvotes);
    const [isUpvoted, setIsUpvoted] = useState(initialUpvoted);
    const [isPending, setIsPending] = useState(false); // Mencegah spam klik (throttling)
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyPending, setReplyPending] = useState(false);
    const [localReplyCount, setLocalReplyCount] = useState(replyCount);
    const [replySuccess, setReplySuccess] = useState('');
    const router = useRouter();

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
                toast.error(res.error);
            }
        } catch (error) {
            setIsUpvoted(!newUpvoted);
            setUpvotes(prev => !newUpvoted ? prev + 1 : prev - 1);
            toast.error("Kesalahan jaringan.");
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
                toast.error(res.error);
            } else {
                // Sukses: Update UI lokal
                setReplySuccess('Balasan dikirim!');
                setLocalReplyCount(prev => prev + 1);
                formRef.current?.reset(); // Kosongkan input
                router.refresh(); // Refresh server data agar komentar baru muncul di list

                // Tutup form secara otomatis setelah jeda singkat
                setTimeout(() => {
                    setShowReplyForm(false);
                    setReplySuccess('');
                }, 1500);
            }
        } catch (error) {
            toast.error("Kesalahan jaringan.");
        } finally {
            setReplyPending(false);
        }
    }

    return (
        <div className="mt-6 pt-6 border-t border-tan-primary/5">
            <div className="flex items-center gap-4">
                {/* Tombol Upvote */}
                <button
                    onClick={handleUpvote}
                    className={`flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest transition-colors ${isUpvoted ? 'text-tan-primary' : 'text-brown-dark/40 hover:text-tan-primary dark:hover:text-tan-light'}`}
                    disabled={isPending}
                >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isUpvoted ? 'stroke-[2.5]' : ''}`} /> {upvotes} <span className="opacity-60">Membantu</span>
                </button>

                {/* Tombol Toggle Form Balas */}
                <button
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-brown-dark/40 hover:text-tan-primary dark:hover:text-tan-light transition-colors"
                >
                    <MessageSquare className="w-3.5 h-3.5" /> Balas ({localReplyCount})
                </button>
            </div>

            {/* Render Form Balas (Conditional Rendering) */}
            {showReplyForm && (
                <form ref={formRef} action={handleReplySubmit} className="mt-4 flex gap-3 items-start p-2 bg-tan-primary/5 rounded-2xl border border-tan-primary/5">
                    <textarea
                        name="content"
                        placeholder="Ukir balasanmu..."
                        required
                        disabled={replyPending}
                        className="flex-1 text-xs bg-transparent dark:bg-brown-mid dark:text-text-accent p-2 rounded-xl outline-none min-h-[44px] resize-none font-medium italic placeholder:text-tan-primary/20"
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={replyPending}
                        className="bg-brown-dark text-text-accent p-2.5 rounded-xl hover:bg-brown-mid transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-brown-dark/10"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}

            {/* Toast Sederhana */}
            {replySuccess && (
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 mt-3 animate-pulse uppercase tracking-[0.2em] italic">Goresan terkirim!</p>
            )}
        </div>
    );
}
