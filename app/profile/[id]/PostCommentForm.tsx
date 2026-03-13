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
                className="text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
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
                    placeholder="Tulis komentar..."
                    required
                    disabled={isPending}
                    className="flex-1 text-xs border border-gray-200 dark:border-brown-mid dark:bg-brown-mid dark:text-text-accent p-2 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 min-h-[36px] resize-none"
                    rows={1}
                />
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 shrink-0"
                >
                    <Send className="w-3.5 h-3.5" />
                </button>
            </form>
            {success && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-1 animate-pulse">{success}</p>
            )}
        </div>
    );
}
