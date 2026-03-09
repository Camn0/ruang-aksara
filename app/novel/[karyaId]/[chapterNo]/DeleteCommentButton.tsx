'use client';

import { useState } from 'react';
import { deleteComment } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

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
            className={`${isSmall ? 'text-[10px]' : 'text-xs ml-3'} text-red-500 hover:text-red-700 font-bold hover:underline disabled:opacity-50 transition-colors flex items-center gap-1`}
        >
            {isPending ? '...' : 'Hapus'}
        </button>
    );
}
