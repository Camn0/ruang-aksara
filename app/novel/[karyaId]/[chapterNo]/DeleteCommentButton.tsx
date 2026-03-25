/**
 * @file DeleteCommentButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import { deleteComment } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

/**
 * DeleteCommentButton: Encapsulates the explicit React DOM lifecycle and state-management for the delete comment button interactive workflow.
 */
export default function DeleteCommentButton({ commentId, isSmall = false }: { commentId: string, isSmall?: boolean }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Yakin ingin menghapus komentar ini secara permanen?")) return;

        setIsPending(true);
        const result = await deleteComment(commentId);

        if (result.error) {
            alert(result.error);
        } else {
            router.refresh();
        }
        setIsPending(false);
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className={`${isSmall ? 'text-[9px]' : 'text-xs ml-3'} text-red-900/40 hover:text-red-900/70 font-black uppercase tracking-widest disabled:opacity-50 transition-colors flex items-center gap-1 italic`}
        >
            {isPending ? '...' : 'Hapus'}
        </button>
    );
}
