import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SearchBar from "./SearchBar";
import { Suspense } from "react";
import SearchContentWrapper from "./SearchContentWrapper";

const getCachedGenres = unstable_cache(
    async () => prisma.genre.findMany({ orderBy: { name: 'asc' } }),
    ['global-genres'],
    { revalidate: 86400, tags: ['genres'] }
);

const SORT_OPTIONS = ['terbaru', 'rating', 'sedanghangat', 'banyakbab'];

const getCachedSearchResults = (q: string, filterStr: string, genreIds: string[], userId?: string) => unstable_cache(
    async () => {
        let orderBy: any = {};
        let where: any = { AND: [] };
        let authors: any[] = [];

        const activeFilters = filterStr.split(',').filter(Boolean);

        if (q) {
            const terms = q.trim().split(/\s+/).filter(t => t.length > 0);
            if (terms.length > 0) {
                where.AND.push({
                    AND: terms.map(term => ({
                        OR: [
                            { title: { contains: term, mode: 'insensitive' } },
                            { penulis_alias: { contains: term, mode: 'insensitive' } }
                        ]
                    }))
                });

                authors = await prisma.user.findMany({
                    where: {
                        OR: [
                            { username: { contains: q, mode: 'insensitive' } },
                            { display_name: { contains: q, mode: 'insensitive' } }
                        ],
                        role: { in: ['admin', 'author'] }
                    },
                    select: { id: true, username: true, display_name: true, avatar_url: true },
                    take: 10
                });
            }
        }

        if (genreIds && genreIds.length > 0) {
            genreIds.forEach(id => { where.AND.push({ genres: { some: { id } } }); });
        }

        if (activeFilters.includes('diikuti')) {
            if (userId) { where.AND.push({ bookmarks: { some: { user_id: userId } } }); }
            else { return { results: [], authors: [] }; }
        }
        if (activeFilters.includes('selesai')) { where.is_completed = true; }

        const activeSort = activeFilters.find(f => SORT_OPTIONS.includes(f)) || 'sedanghangat';
        if (activeSort === "terbaru") { orderBy = { id: 'desc' }; }
        else if (activeSort === "rating") { orderBy = { avg_rating: 'desc' }; }
        else if (activeSort === "banyakbab") { orderBy = { bab: { _count: 'desc' } }; }
        else { orderBy = { total_views: 'desc' }; }

        if (where.AND.length === 0) delete where.AND;

        const results = await prisma.karya.findMany({
            where, orderBy,
            select: {
                id: true,
                title: true,
                cover_url: true,
                penulis_alias: true,
                avg_rating: true,
                total_views: true,
                is_completed: true,
                deskripsi: true,
                genres: {
                    select: { id: true, name: true }
                },
                _count: { select: { bab: true, bookmarks: true, reviews: true, ratings: true } },
                bab: { orderBy: { created_at: 'desc' }, take: 1, select: { created_at: true } }
            },
            take: 50
        });

        return { results: results as any[], authors };
    },
    [`search-v5-multi-${q}-${filterStr}-${genreIds.sort().join(',') || 'all'}-${userId || 'anon'}`],
    { revalidate: 300, tags: ['karya-global'] }
)();

async function SearchStream({ q, filter, genreIds, userId }: { q: string, filter: string, genreIds: string[], userId?: string }) {
    const [allGenres, searchData] = await Promise.all([
        getCachedGenres(),
        getCachedSearchResults(q, filter, genreIds, userId)
    ]);

    return (
        <SearchContentWrapper 
            results={searchData.results} 
            authors={searchData.authors} 
            allGenres={allGenres} 
            q={q} 
            filter={filter} 
            genreIds={genreIds} 
        />
    );
}

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; filter?: string; genreId?: string } }) {
    const q = searchParams.q || "";
    const filter = searchParams.filter || "sedanghangat";
    const genreIds = searchParams.genreId ? searchParams.genreId.split(',').filter(Boolean) : [];

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark pb-24 transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pt-5 pb-5 sticky top-0 z-0 bg-bg-cream/90 dark:bg-brown-dark/90 shadow-sm border-b border-tan-primary/10 backdrop-blur-md">
                <SearchBar initialQ={q} filter={filter} genreId={genreIds.join(',')} />
            </header>

            <Suspense fallback={
                <main className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="w-16 h-16 bg-tan-light/20 dark:bg-brown-mid/30 rounded-full mb-4 flex items-center justify-center">
                            <SearchIcon className="w-8 h-8 text-tan-primary/40" />
                        </div>
                        <p className="text-xs font-black text-tan-primary uppercase tracking-[0.3em] animate-pulse">Mencari Mahakarya...</p>
                    </div>
                </main>
            }>
                <SearchStream q={q} filter={filter} genreIds={genreIds} userId={userId} />
            </Suspense>
        </div>
    );
}