'use client';

import { useState, useRef } from 'react';
import { submitPostComment, deletePostComment, getMorePostComments } from '@/app/actions/post';
import { Send, ChevronDown, ChevronUp, Trash2, UserCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';
import Link from 'next/link';

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    user: {
        username: string;
        display_name: string;
        avatar_url: string | null;
    };
}

export default function PostCommentSection({ postId, initialComments, commentCount, currentUserId, currentUserRole }: {
    postId: string;
    initialComments: Comment[];
    commentCount: number;
    currentUserId?: string;
    currentUserRole?: string;
}) {
    const [comments, setComments] = useState<Comment[]>(initialComments);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(initialComments.length < commentCount && initialComments.length >= 5);
    const [success, setSuccess] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const formRef = useRef<HTMLFormElement>(null);

    async function handleSubmit(formData: FormData) {
        if (isPending) return;
        setIsPending(true);

        formData.append('post_id', postId);

        try {
            const res = await submitPostComment(formData);
            if (res.error) {
                toast.error(res.error);
            } else if (res.data) {
                toast.success('Komentar dikirim!');
                setComments(prev => [res.data as any, ...prev]);
                formRef.current?.reset();
                setIsOpen(true);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan.");
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
            if (res.error) toast.error(res.error);
            else {
                toast.success("Komentar dihapus!");
                setComments(prev => prev.filter(c => c.id !== commentId));
            }
        } catch {
            toast.error("Gagal menghapus.");
        } finally {
            setDeletingId(null);
        }
    }

    async function handleLoadMore() {
        if (isLoadingMore) return;
        setIsLoadingMore(true);

        const res = await getMorePostComments(postId, comments.length, 10);

        if (res.error) {
            toast.error(res.error);
        } else if (res.data) {
            if (res.data.length < 10) setHasMore(false);
            setComments(prev => [...prev, ...res.data]);
        }
        setIsLoadingMore(false);
    }

    return (
        <div className="mt-4 pt-4 border-t border-tan-primary/10 dark:border-brown-mid/30">
            {/* Toggle Comment Section */}
            {commentCount > 0 && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 text-[10px] font-black text-tan-primary uppercase tracking-widest hover:text-brown-dark transition-all mb-4 px-1"
                >
                    {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {isOpen ? 'Sembunyikan' : `Lihat ${commentCount} komentar`}
                </button>
            )}

            {/* Comments List */}
            {isOpen && (
                <div className="space-y-2 mb-3">
                    {comments.map((c) => (
                        <div key={c.id} className="flex gap-4 items-start group bg-brown-dark/[0.02] dark:bg-brown-dark/20 p-3 rounded-2xl border border-tan-primary/10 dark:border-brown-mid/20">
                            <div className="w-8 h-8 rounded-xl overflow-hidden bg-tan-light/10 dark:bg-brown-mid/30 flex items-center justify-center shrink-0 border border-tan-primary/10 shadow-sm relative">
                                {c.user?.avatar_url ? (
                                    <Image src={c.user.avatar_url} width={32} height={32} className="w-full h-full object-cover" alt="" />
                                ) : (
                                    <UserCircle2 className="w-4 h-4 text-tan-primary" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] leading-relaxed">
                                    <Link href={`/profile/${c.user?.username}`} prefetch={false} className="font-black text-text-main dark:text-text-accent uppercase tracking-tight text-[11px] block mb-1 hover:text-tan-primary transition-colors">{c.user?.display_name}</Link>{' '}
                                    <span className="text-text-main/70 dark:text-tan-light font-medium italic">&quot;{c.content}&quot;</span>
                                </p>
                                <p className="text-[8px] text-tan-primary/40 font-black uppercase tracking-widest mt-2">{new Date(c.created_at).toLocaleDateString('id-ID')}</p>
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

                    {/* Load More Button */}
                    {hasMore && (
                        <div className="pt-2">
                            <button
                                onClick={handleLoadMore}
                                disabled={isLoadingMore}
                                className="flex items-center gap-2 text-[9px] font-black text-tan-primary uppercase tracking-[0.2em] hover:text-brown-dark transition-all py-2 px-1 disabled:opacity-50"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Memuat...
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-3 h-3" />
                                        Muat Lebih Banyak
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Comment Form - Themed & Relaxed */}
            {currentUserId && (
                <form ref={formRef} action={handleSubmit} className="flex gap-3 items-center bg-brown-dark/[0.04] dark:bg-brown-dark/30 border border-tan-primary/10 dark:border-brown-mid/30 p-2 rounded-[1.5rem] transition-all focus-within:bg-brown-dark/[0.06] dark:focus-within:bg-brown-dark/50 focus-within:border-tan-primary/20">
                    <textarea
                        name="content"
                        placeholder="Tulis sebuah surat..."
                        required
                        disabled={isPending}
                        className="flex-1 text-sm bg-transparent dark:text-text-accent p-3 outline-none min-h-[44px] max-h-[120px] resize-none font-medium italic"
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-brown-dark text-text-accent p-3 rounded-2xl hover:bg-brown-mid transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-brown-dark/20 active:scale-95"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            )}
            {success && (
                <p className="text-[10px] font-black text-tan-primary uppercase tracking-[0.2em] mt-3 animate-pulse text-center">{success}</p>
            )}
        </div>
    );
}
