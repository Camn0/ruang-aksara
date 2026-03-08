'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Search as SearchIcon } from 'lucide-react';

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

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();

        // Membangun query string secara manual agar tetap SPA
        const params = new URLSearchParams();
        if (q) params.set('q', q);
        if (filter) params.set('filter', filter);
        if (genreId) params.set('genreId', genreId);

        router.push(`/search?${params.toString()}`);
    };

    return (
        <form className="relative" onSubmit={handleSearch}>
            <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul atau penulis..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-slate-800 dark:text-gray-200 dark:placeholder-gray-500 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <button type="submit" className="hidden">Cari</button>
        </form>
    );
}
