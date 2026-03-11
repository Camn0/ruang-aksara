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
                className="text-[10px] font-marker uppercase tracking-widest text-ink hover:text-pine transition-all wobbly-border-sm bg-white/40 px-4 py-2 rotate-[-2deg] active:scale-95"
            >
                {replyToUsername ? `Balas @${replyToUsername}` : 'Goreskan Komentar'}
            </button>
        );
    }

    return (
        <form
            ref={formRef}
            id={parentId ? `comment-form-${parentId}` : "comment-form"}
            onSubmit={handleSubmit}
            className={`${isReply ? 'mt-6 border-l-4 border-pine/20 pl-6 py-2 rotate-[0.5deg]' : ''} selection:bg-pine/20`}
        >
            {!isReply && <h3 className="font-journal-title text-2xl mb-6 text-ink-deep italic">Apa yang merasuki pikiran Anda?</h3>}

            <textarea
                ref={textAreaRef}
                name="content"
                defaultValue={replyToUsername ? `@${replyToUsername} ` : ""}
                className={`w-full bg-parchment-light border-2 border-ink/5 wobbly-border-sm p-4 outline-none focus:bg-white focus:border-pine/30 transition-all font-journal-body text-ink-deep leading-relaxed placeholder-ink/30 ${isReply ? 'min-h-[80px] text-sm' : 'min-h-[120px] text-base'}`}
                placeholder={isReply ? "Bisikkan balasan Anda..." : "Arsipkan analisis atau sekadar salam di sini..."}
                required
                disabled={isPending}
            />

            {successMessage && (
                <p className="text-[11px] font-special text-pine mt-3 animate-bounce uppercase tracking-widest drop-shadow-sm">✓ {successMessage}</p>
            )}

            <div className="flex gap-4 mt-5">
                <button
                    type="submit"
                    disabled={isPending}
                    className={`bg-pine text-parchment font-journal-title text-lg px-8 wobbly-border-sm hover:bg-ink-deep transition-all active:scale-95 disabled:opacity-30 ${isReply ? 'py-1.5 text-base' : 'py-2.5'}`}
                >
                    {isPending ? 'Mengirim...' : (isReply ? 'BALAS' : 'SIMPAN GORESAN')}
                </button>

                {isReply && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="bg-white/40 text-ink/40 font-special py-1.5 px-6 wobbly-border-sm text-[10px] uppercase tracking-widest hover:text-dried-red hover:bg-white transition-all"
                    >
                        BATAL
                    </button>
                )}
            </div>
        </form>
    );
}
