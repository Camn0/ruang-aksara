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
        <form className="relative group" onSubmit={handleSearch}>
            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul atau penulis..."
                className="w-full bg-tan-primary text-text-accent placeholder:text-text-accent/70 rounded-full py-4 pl-14 pr-12 text-lg focus:outline-none focus:ring-2 focus:ring-brown-mid transition-all shadow-md"
            />
            <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-text-accent transition-colors group-focus-within:text-white" />

            {q && (
                <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-brown-dark/20 text-text-accent transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
            <button type="submit" className="hidden">Cari</button>
        </form>
    );
}
