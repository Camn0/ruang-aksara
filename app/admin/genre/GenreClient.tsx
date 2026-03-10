'use client';

import { useState } from 'react';
import { createGenre, deleteGenre } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export function GenreForm() {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);

        const formData = new FormData(event.currentTarget);
        const result = await createGenre(formData);

        if (result.error) alert(result.error);
        else {
            (event.target as HTMLFormElement).reset();
            router.refresh();
        }
        setIsPending(false);
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-3">
            <input
                name="name"
                type="text"
                placeholder="Nama Genre Baru (e.g. Romance)"
                required
                className="flex-1 bg-gray-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-500/20 focus:bg-white dark:focus:bg-slate-800 focus:outline-none p-3 sm:p-4 rounded-2xl text-sm font-bold text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
            <button
                type="submit"
                disabled={isPending}
                className="bg-indigo-600 text-white px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[100px]"
            >
                {isPending ? '...' : 'Tambah'}
            </button>
        </form>
    );
}

export function DeleteGenreButton({ id }: { id: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Yakin hapus genre ini?")) return;
        setIsPending(true);
        const result = await deleteGenre(id);
        if (result.error) alert(result.error);
        else router.refresh();
        setIsPending(false);
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
        >
            {isPending ? '...' : 'Hapus'}
        </button>
    );
}
