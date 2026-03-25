/**
 * @file SearchBar.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Home, Search, X } from 'lucide-react';
import Link from 'next/link';

/**
 * Redesigned SearchBar (Client Component)
 * Implementation matches the high-end "Library" aesthetic for consistency.
 */
/**
 * SearchBar: Globally available input component triggering debounce queries against the Novel database.
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
        <div className="flex items-center gap-3 w-full">
            {/* Home Link - Standardized with Library */}
            <Link 
                href="/" 
                prefetch={false}
                className="bg-tan-primary p-2.5 rounded-full text-text-accent hover:opacity-80 transition-all shadow-md shrink-0"
            >
                <Home className="w-5 h-5" />
            </Link>

            {/* Main Search Container - Exact copy of Library proportions */}
            <form 
                onSubmit={handleSearch}
                className="relative flex-1"
            >
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none z-10">
                    <Search className="w-4 h-4 text-text-accent" />
                </div>
                <input
                    type="text"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Cari judul karya atau nama author..."
                    className="w-full bg-tan-primary text-text-accent placeholder:text-text-accent/60 rounded-full py-3.5 pl-12 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brown-mid transition-all shadow-md font-black italic uppercase tracking-tighter"
                />
                
                {q && (
                    <button
                        type="button"
                        onClick={clearSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-text-accent hover:opacity-50 transition-all p-1"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <button type="submit" className="hidden">Cari</button>
            </form>
        </div>
    );
}
