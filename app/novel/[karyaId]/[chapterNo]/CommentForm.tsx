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
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition shadow-sm bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded"
            >
                {replyToUsername ? 'Balas ini' : 'Balas Komentar'}
            </button>
        );
    }

    return (
        <form
            ref={formRef}
            id={parentId ? `comment-form-${parentId}` : "comment-form"}
            onSubmit={handleSubmit}
            className={`${isReply ? 'mt-3 border-l-2 border-indigo-300 dark:border-indigo-700 pl-4 py-2' : ''}`}
        >
            {!isReply && <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-gray-200">Tinggalkan Komentar</h3>}

            <textarea
                ref={textAreaRef}
                name="content"
                defaultValue={replyToUsername ? `@${replyToUsername} ` : ""}
                className={`w-full border dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 ${isReply ? 'min-h-[60px] text-sm' : 'min-h-[100px]'}`}
                placeholder={isReply ? "Tulis balasan Anda..." : "Tuliskan analisis atau apresiasi Anda di sini..."}
                required
                disabled={isPending}
            />

            {successMessage && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-2 animate-pulse">{successMessage}</p>
            )}

            <div className="flex gap-2 mt-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className={`bg-indigo-600 dark:bg-indigo-500 text-white font-medium px-6 rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-600 transition disabled:opacity-50 disabled:cursor-not-allowed ${isReply ? 'py-1.5 text-xs' : 'py-2'}`}
                >
                    {isPending ? 'Mengirim...' : (isReply ? 'Kirim Balasan' : 'Kirim Komentar')}
                </button>

                {isReply && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 font-medium py-1.5 px-4 rounded-xl text-xs hover:bg-gray-300 dark:hover:bg-slate-600 transition"
                    >
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
}
