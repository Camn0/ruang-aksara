'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, X } from 'lucide-react';

/**
 * SearchBar (Client Component)
 * 
 * Mengapa: Menggunakan standard <form> menyebabkan Hard Reload (Halaman putih sekelebat).
 * Dengan useRouter().push(), navigasi tetap berada dalam Single Page Application (SPA),
 * menjaga Progress Bar tetap aktif dan transisi halus.
 */
export default function SearchBar({ initialQ, filter, genreId }: { initialQ: string, filter: string, genreId: string }) {
    const [q, setQ] = useState(initialQ);
    const router = useRouter();
    const searchParams = useSearchParams();

    // Sync input with URL search params when they change
    useEffect(() => {
        setQ(searchParams.get('q') || '');
    }, [searchParams]);

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();

        // Membangun query string secara manual agar tetap SPA
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (filter) params.set('filter', filter);
        if (genreId) params.set('genreId', genreId);

        router.push(`/search?${params.toString()}`);
    };

    const clearSearch = () => {
        setQ('');
        const params = new URLSearchParams();
        if (filter) params.set('filter', filter);
        if (genreId) params.set('genreId', genreId);
        router.push(`/search?${params.toString()}`);
    }

    return (
        <form className="relative group rotate-[-0.5deg]" onSubmit={handleSearch}>
            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul atau penulis..."
                className="w-full pl-12 pr-12 py-4 bg-parchment-light dark:bg-parchment text-ink-deep placeholder-ink/40 wobbly-border paper-shadow text-base font-marker focus:outline-none focus:bg-white transition-all"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-ink/40 transition-colors group-focus-within:text-pine" strokeWidth={1.5} />

            {q && (
                <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-ink/5 rounded-full text-ink/40 hover:text-dried-red transition-all"
                >
                    <X className="w-5 h-5 wobbly-border-sm border-2 border-ink/10" />
                </button>
            )}
            <button type="submit" className="hidden">Cari</button>
        </form>
    );
}
