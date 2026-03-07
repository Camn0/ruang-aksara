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
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                name="name"
                type="text"
                placeholder="Nama Genre Baru (e.g. Romance)"
                required
                className="flex-1 border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-colors"
            />
            <button
                type="submit"
                disabled={isPending}
                className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:opacity-50 transition-colors"
            >
                {isPending ? 'Menyimpan...' : 'Tambah'}
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
            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm font-medium disabled:opacity-50 transition-colors"
        >
            {isPending ? '...' : 'Hapus'}
        </button>
    );
}
