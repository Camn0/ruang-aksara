'use client';

import { useState } from 'react';
import { createGenre, deleteGenre } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function GenreForm() {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);

        const formData = new FormData(event.currentTarget);
        const result = await createGenre(formData);

        if (result.error) toast.error(result.error);
        else {
            toast.success("Genre baru ditambahkan!");
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
                className="flex-1 bg-text-main/5 dark:bg-white/5 border-2 border-transparent focus:border-tan-primary/20 focus:bg-white dark:focus:bg-brown-mid focus:outline-none p-3 sm:p-4 rounded-2xl text-sm font-bold text-text-main dark:text-bg-cream transition-all placeholder:text-text-main/50 dark:placeholder:text-tan-light/50"
            />
            <button
                type="submit"
                disabled={isPending}
                className="bg-text-main dark:bg-brown-mid text-bg-cream px-6 sm:px-10 py-3 sm:py-4 rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-brown-dark dark:hover:bg-tan-primary transition-all shadow-lg active:scale-95 flex items-center justify-center min-w-[100px] border border-white/5"
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
        if (!window.confirm("Yakin hapus genre ini?")) return;
        setIsPending(true);
        const result = await deleteGenre(id);
        if (result.error) toast.error(result.error);
        else {
            toast.success("Genre dihapus!");
            router.refresh();
        }
        setIsPending(false);
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="text-text-main/60 dark:text-tan-light hover:text-red-500 dark:hover:text-red-400 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all p-2 hover:bg-red-500/5 dark:hover:bg-red-500/10 rounded-xl flex items-center gap-1 group/del"
        >
            <span className="opacity-0 group-hover/del:opacity-100 transition-opacity">{isPending ? '...' : 'Hapus'}</span>
            <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
        </button>
    );
}
