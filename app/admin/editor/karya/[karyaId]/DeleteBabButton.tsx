/**
 * @file DeleteBabButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Administrator Dashboard architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import { deleteBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * DeleteBabButton: Destructive action component requiring confirmation to permanently remove a Chapter from the database.
 */
export default function DeleteBabButton({ babId }: { babId: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!window.confirm("Yakin ingin menghapus bab ini secara permanen?")) return;

        setIsPending(true);
        const result = await deleteBab(babId);

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success("Bab berhasil dihapus!");
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
