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
            className="px-4 py-1.5 text-red-900/40 hover:text-red-900/70 font-black text-[10px] uppercase tracking-widest italic transition-colors disabled:opacity-50"
        >
            {isPending ? 'Mengapus...' : 'Hapus'}
        </button>
    );
}
