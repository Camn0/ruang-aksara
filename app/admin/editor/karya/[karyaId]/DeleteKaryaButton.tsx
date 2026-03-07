'use client';

import { useState } from 'react';
import { deleteKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function DeleteKaryaButton({ karyaId }: { karyaId: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Peringatan: Menghapus karya akan menghapus SEMUA bab, komentar, dan rating yang terkait secara permanen. Lanjutkan?")) return;

        setIsPending(true);
        const result = await deleteKarya(karyaId);

        if (result.error) {
            alert(result.error);
            setIsPending(false);
        } else {
            router.push('/admin/dashboard');
            router.refresh();
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="px-4 py-2 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 rounded bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium transition disabled:opacity-50"
        >
            {isPending ? 'Menghapus...' : 'Hapus Karya'}
        </button>
    );
}
