/**
 * @file DeleteCommentButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Administrator Dashboard architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import { deleteComment } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

/**
 * DeleteCommentButton: Encapsulates the explicit React DOM lifecycle and state-management for the delete comment button interactive workflow.
 */
export default function DeleteCommentButton({ commentId }: { commentId: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Hapus komentar ini secara permanen?")) return;
        
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
            className="text-red-400 hover:text-red-600 dark:text-red-400/40 dark:hover:text-red-400 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all disabled:opacity-50 group/btn"
            title="Hapus Komentar"
        >
            <Trash2 className={`w-3.5 h-3.5 ${isPending ? 'animate-pulse' : 'group-hover/btn:scale-110 transition-transform'}`} />
        </button>
    );
}
