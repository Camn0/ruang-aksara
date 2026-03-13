'use client';

import { useState, useRef, useEffect } from 'react';
import { submitComment } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export default function CommentForm({
    babId,
    parentId,
    isReply = false,
    replyToUsername,
    onSuccess,
    autoFocus = false
}: {
    babId: string,
    parentId?: string,
    isReply?: boolean,
    replyToUsername?: string,
    onSuccess?: () => void,
    autoFocus?: boolean
}) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(!isReply || autoFocus);
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [successMessage, setSuccessMessage] = useState('');
    const router = useRouter();
    const formRef = useRef<HTMLFormElement>(null);
    const textAreaRef = useRef<HTMLTextAreaElement>(null);

    // Auto focus logic
    useEffect(() => {
        if (autoFocus && isOpen && textAreaRef.current) {
            textAreaRef.current.focus();
            // Move cursor to end if there's mention
            if (replyToUsername) {
                const len = textAreaRef.current.value.length;
                textAreaRef.current.setSelectionRange(len, len);
            }
        }
    }, [autoFocus, isOpen, replyToUsername]);

    async function handleCommentSubmit(formData: FormData) {
        if (isPending) return; // Prevent double-click
        setIsPending(true);
        setSuccessMessage('');

        formData.append('bab_id', babId);
        if (parentId) {
            formData.append('parent_id', parentId);
        }
        if (rating > 0) {
            formData.append('rating', rating.toString());
        }

        try {
            const result = await submitComment(formData);

            if (result.error) {
                alert(result.error);
            } else {
                // Show instant feedback
                setSuccessMessage('Komentar berhasil dikirim!');
                formRef.current?.reset();

                // Tutup form jika ini adalah balasan
                if (isReply) {
                    setTimeout(() => setIsOpen(false), 800);
                }

                // Background refresh for fresh data
                router.refresh();

                // Call onSuccess callback
                if (onSuccess) onSuccess();

                // Clear success message after a delay
                setTimeout(() => setSuccessMessage(''), 2000);
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsPending(false);
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await handleCommentSubmit(formData);
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] font-black text-brown-dark dark:text-tan-primary hover:text-tan-primary transition-all shadow-sm bg-tan-primary/10 dark:bg-tan-900/10 border border-tan-primary/10 px-4 py-2 rounded-xl uppercase tracking-widest italic"
            >
                {replyToUsername ? 'Gores Balasan' : 'Gores Komentar'}
            </button>
        );
    }

    return (
        <form
            ref={formRef}
            id={parentId ? `comment-form-${parentId}` : "comment-form"}
            onSubmit={handleSubmit}
            className={`${isReply ? 'mt-4 border-l border-tan-primary/20 pl-6 py-2' : ''}`}
        >
            {!isReply && <h3 className="font-black text-lg mb-6 text-brown-dark dark:text-text-accent italic uppercase tracking-tighter">Terakan Jejakmu</h3>}

            <textarea
                ref={textAreaRef}
                name="content"
                defaultValue={replyToUsername ? `@${replyToUsername} ` : ""}
                className={`w-full bg-tan-primary/5 border border-tan-primary/10 dark:border-brown-mid dark:bg-brown-dark dark:text-text-accent p-5 rounded-[1.5rem] outline-none focus:ring-2 focus:ring-tan-primary/20 transition-all font-bold italic ${isReply ? 'min-h-[80px] text-xs' : 'min-h-[120px] text-sm'}`}
                placeholder={isReply ? "Tulis balasan Anda..." : "Tuliskan analisis atau apresiasi Anda di sini..."}
                required
                disabled={isPending}
            />

            {successMessage && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-2 animate-pulse">{successMessage}</p>
            )}

            <div className="flex gap-3 mt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className={`bg-brown-dark text-text-accent font-black rounded-full px-8 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest italic shadow-lg shadow-brown-dark/10 ${isReply ? 'py-2 text-[10px]' : 'py-3 text-xs'}`}
                >
                    {isPending ? 'Mengirim...' : (isReply ? 'Kirim Goresan' : 'Kirim Goresan')}
                </button>

                {isReply && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="bg-tan-primary/10 dark:bg-brown-mid text-tan-primary/60 font-black py-2 px-6 rounded-full text-[10px] uppercase tracking-widest transition-all hover:bg-tan-primary/20"
                    >
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
}
