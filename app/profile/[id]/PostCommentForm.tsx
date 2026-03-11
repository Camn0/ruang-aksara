'use client';

import { useState, useRef } from 'react';
import { submitPostComment } from '@/app/actions/post';
import { Send } from 'lucide-react';

export default function PostCommentForm({ postId }: { postId: string }) {
    const [showForm, setShowForm] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState('');
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        if (isPending) return;
        setIsPending(true);
        setSuccess('');

        formData.append('post_id', postId);

        try {
            const res = await submitPostComment(formData);
            if (res.error) {
                alert(res.error);
            } else {
                setSuccess('Komentar dikirim!');
                formRef.current?.reset();
                setTimeout(() => {
                    setShowForm(false);
                    setSuccess('');
                }, 1500);
            }
        } catch (error) {
            alert("Terjadi kesalahan.");
        } finally {
            setIsPending(false);
        }
    }

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="font-marker text-[9px] text-ink/30 hover:text-pine transition-all uppercase tracking-[0.2em] mb-4 block"
            >
                Tulis komentar...
            </button>
        );
    }

    return (
        <div className="mt-2">
            <form ref={formRef} action={handleSubmit} className="flex gap-2 items-start">
                <textarea
                    name="content"
                    placeholder="Ukir komentar..."
                    required
                    disabled={isPending}
                    className="flex-1 font-journal-body text-base bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none p-2 italic"
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-pine text-parchment p-2 wobbly-border-sm hover:bg-pine-light transition disabled:opacity-50 shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
            {success && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-1 animate-pulse">{success}</p>
            )}
        </div>
    );
}
