/**
 * @file DeleteKaryaButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Administrator Dashboard architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import { deleteKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * DeleteKaryaButton: Destructive action component requiring confirmation to permanently remove an entire Novel.
 */
export default function DeleteKaryaButton({ karyaId }: { karyaId: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!window.confirm("Peringatan: Menghapus karya akan menghapus SEMUA bab, komentar, dan rating yang terkait secara permanen. Lanjutkan?")) return;

        setIsPending(true);
        const result = await deleteKarya(karyaId);

        if (result.error) {
            toast.error(result.error);
            setIsPending(false);
        } else {
            toast.success("Karya berhasil dihapus!");
            router.push('/admin/dashboard');
            router.refresh();
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-6 py-2 bg-red-900/10 text-red-900/60 hover:bg-red-900/20 hover:text-red-900/80 font-black text-xs uppercase tracking-[0.2em] italic rounded-xl transition-all disabled:opacity-50"
        >
            {isPending ? 'Menghapus...' : 'Hapus Karya Utama'}
        </button>
    );
}
