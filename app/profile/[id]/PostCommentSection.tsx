'use client';

import { useState, useRef } from 'react';
import { submitPostComment, deletePostComment } from '@/app/actions/post';
import { Send, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    user: {
        username: string;
        display_name: string;
    };
}

export default function PostCommentSection({ postId, initialComments, commentCount, currentUserId, currentUserRole }: {
    postId: string;
    initialComments: Comment[];
    commentCount: number;
    currentUserId?: string;
    currentUserRole?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [success, setSuccess] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
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
                setTimeout(() => setSuccess(''), 2000);
            }
        } catch (error) {
            alert("Terjadi kesalahan.");
        } finally {
            setIsPending(false);
        }
    }

    async function handleDelete(commentId: string) {
        if (deletingId) return;
        if (!confirm('Hapus komentar ini?')) return;
        setDeletingId(commentId);
        try {
            const res = await deletePostComment(commentId);
            if (res.error) alert(res.error);
        } catch {
            alert("Gagal menghapus.");
        } finally {
            setDeletingId(null);
        }
    }

    return (
        <div className="mt-3 pt-3 border-t border-ink/5">
            {/* Toggle Comment Section */}
            {commentCount > 0 && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-1.5 font-marker text-[9px] text-ink/30 hover:text-pine transition-all uppercase tracking-[0.2em] mb-3"
                >
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isOpen ? 'Sembunyikan' : `Lihat ${commentCount} komentar`}
                </button>
            )}

            {/* Comments List */}
            {isOpen && initialComments.length > 0 && (
                <div className="space-y-2 mb-3">
                    {initialComments.map((c) => (
                        <div key={c.id} className="flex gap-2 items-start group">
                            <div className="w-5 h-5 rounded-full bg-ink/5 flex items-center justify-center text-[8px] font-bold text-ink/30 shrink-0">
                                {c.user?.display_name?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs">
                                    <Link href={`/profile/${c.user?.username}`} className="font-bold text-ink-deep hover:underline">{c.user?.display_name}</Link>{' '}
                                    <span className="text-ink/60 whitespace-pre-wrap">{c.content}</span>
                                </p>
                                <p className="text-[10px] text-ink/30">{new Date(c.created_at).toLocaleDateString('id-ID')}</p>
                            </div>
                            {/* Delete Button */}
                            {(currentUserId === c.user_id || currentUserRole === 'admin') && (
                                <button
                                    onClick={() => handleDelete(c.id)}
                                    disabled={deletingId === c.id}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition p-0.5 shrink-0"
                                    title="Hapus komentar"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Comment Form */}
            {currentUserId && (
                <form ref={formRef} action={handleSubmit} className="flex gap-2 items-start">
                    <textarea
                        name="content"
                        placeholder="Ukir komentar..."
                        required
                        disabled={isPending}
                        className="flex-1 font-journal-body text-base bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-paper focus:outline-none p-2 italic"
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
            )}
            {success && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mt-1 animate-pulse">{success}</p>
            )}
        </div>
    );
}
