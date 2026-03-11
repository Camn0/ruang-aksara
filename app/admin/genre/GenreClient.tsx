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
        <form onSubmit={handleSubmit} className="flex gap-4">
            <input
                name="name"
                type="text"
                placeholder="Nama Genre Baru (e.g. Noir)"
                required
                className="flex-1 bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-paper focus:outline-none p-4 sm:p-5 text-lg font-journal-body text-ink-deep transition-all placeholder:text-ink/20"
            />
            <button
                type="submit"
                disabled={isPending}
                className="bg-pine text-parchment px-8 sm:px-12 py-4 sm:py-5 wobbly-border-sm font-journal-title text-xl italic hover:rotate-1 disabled:opacity-50 transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[120px]"
            >
                {isPending ? '...' : 'Torehkan'}
            </button>
        </form>
    );
}

export function DeleteGenreButton({ id }: { id: string }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleDelete() {
        if (!confirm("Hapus genre ini dari catatan?")) return;
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
            className="text-dried-red font-marker text-[10px] uppercase tracking-widest disabled:opacity-50 transition-all p-3 hover:bg-dried-red/5 wobbly-border-sm rotate-3 hover:rotate-0"
        >
            {isPending ? '...' : 'Hapus'}
        </button>
    );
}
