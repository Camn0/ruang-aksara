'use client';

import { useState } from 'react';
import { deleteComment } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export default function DeleteCommentButton({ commentId }: { commentId: string }) {
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
            className="text-xs text-red-500 hover:text-red-700 font-medium ml-3 hover:underline disabled:opacity-50"
        >
            {isPending ? 'Mengahapus...' : 'Hapus'}
        </button>
    );
}
