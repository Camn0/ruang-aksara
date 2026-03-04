'use client';

import { useState } from 'react';
import { deleteBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function DeleteBabButton({ babId }: { babId: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Yakin ingin menghapus bab ini secara permanen?")) return;

        setIsPending(true);
        const result = await deleteBab(babId);

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
            className="px-4 py-2 border border-red-200 text-red-600 rounded bg-red-50 hover:bg-red-100 font-medium transition disabled:opacity-50"
        >
            {isPending ? 'Mengahapus...' : 'Hapus'}
        </button>
    );
}
