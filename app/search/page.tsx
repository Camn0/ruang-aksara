import Link from "next/link";
import { Search as SearchIcon, Star, TrendingUp, BookOpen } from "lucide-react";
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import SearchBar from "./SearchBar";

/**
 * Caching Genres (Global)
 */
const getCachedGenres = unstable_cache(
    async () => prisma.genre.findMany({ orderBy: { name: 'asc' } }),
    ['global-genres'],
    { revalidate: 86400, tags: ['genres'] }
);

/**
 * Caching Search Results
 */
const getCachedSearchResults = (q: string, filter: string, genreId: string) => unstable_cache(
    async () => {
        let orderBy: any = {};
        let where: any = { AND: [] };
        let authors: any[] = [];

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

                // Dual-Search: Find authors matching terms
                authors = await prisma.user.findMany({
                    where: {
                        OR: [
                            { username: { contains: q, mode: 'insensitive' } },
                            { display_name: { contains: q, mode: 'insensitive' } }
                        ],
                        role: { in: ['admin', 'author'] }
                    },
                    select: {
                        id: true,
                        username: true,
                        display_name: true,
                        avatar_url: true
                    },
                    take: 10
                });
            }
        }

        if (genreId) {
            where.AND.push({ genres: { some: { id: genreId } } });
        }

        if (filter === "terbaru") {
            orderBy = { id: 'desc' };
        } else if (filter === "rating") {
            orderBy = { avg_rating: 'desc' };
        } else if (filter === "selesai") {
            where.is_completed = true;
            orderBy = { total_views: 'desc' };
        } else {
            orderBy = { total_views: 'desc' };
        }

        if (where.AND.length === 0) delete where.AND;

        const results = await prisma.karya.findMany({
            where,
            orderBy,
            include: {
                genres: true,
                _count: { select: { bab: true } },
                bab: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                    select: { created_at: true }
                }
            },
            take: 50
        });

        return { results, authors };
    },
    [`search-v3-${q}-${filter}-${genreId || 'all'}`],
    { revalidate: 300, tags: ['karya-global'] }
)();

export default async function SearchPage({
    searchParams
}: {
    searchParams: { q?: string; filter?: string; genreId?: string }
}) {
    const q = searchParams.q || "";
    const filter = searchParams.filter || "sedanghangat";
    const genreId = searchParams.genreId || "";

    // Eksekusi query secara paralel via Cache
    const [allGenres, searchData] = await Promise.all([
        getCachedGenres(),
        getCachedSearchResults(q, filter, genreId)
    ]);

    const results = searchData.results as (any & {
        cover_url: string | null;
        is_completed: boolean;
        deskripsi: string | null;
        bab: { created_at: Date }[];
    })[];

    const authors = searchData.authors as any[];

    const CoverPlaceholder = ({ title }: { title: string }) => (
        <div className="w-24 h-32 bg-gray-200 dark:bg-slate-800 rounded-lg flex items-center justify-center p-2 text-center text-[10px] text-gray-500 dark:text-gray-400 shadow-sm shrink-0">
            {title}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* Header / Search Bar */}
            <header className="px-6 pt-12 pb-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <SearchBar initialQ={q} filter={filter} genreId={genreId} />

                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 snap-x hide-scrollbar border-b border-gray-50 dark:border-slate-800/50 mb-3">
                    {[
                        { id: 'sedanghangat', label: 'Sedang Hangat' },
                        { id: 'terbaru', label: 'Terbaru' },
                        { id: 'rating', label: 'Rating Tertinggi' },
                        { id: 'selesai', label: 'Tamat' },
                    ].map(f => (
                        <Link
                            key={f.id}
                            href={`/search?q=${q}&filter=${f.id}${genreId ? `&genreId=${genreId}` : ''}`}
                            className={`snap-start shrink-0 px-4 py-1.5 rounded-full text-[11px] font-bold transition-all border ${filter === f.id
                                ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500 shadow-md shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {/* Genre Filter Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 snap-x hide-scrollbar">
                    <Link
                        href={`/search?q=${q}&filter=${filter}`}
                        className={`snap-start shrink-0 px-3 py-1 rounded text-[10px] uppercase font-black tracking-wider transition-all ${!genreId
                            ? 'bg-gray-900 dark:bg-indigo-500 text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                    >
                        Semua Genre
                    </Link>
                    {allGenres.map(g => (
                        <Link
                            key={g.id}
                            href={`/search?q=${q}&filter=${filter}&genreId=${g.id}`}
                            className={`snap-start shrink-0 px-3 py-1 rounded text-[10px] uppercase font-black tracking-wider transition-all ${genreId === g.id
                                ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {g.name}
                        </Link>
                    ))}
                </div>
            </header>

            {/* Dual Search: Authors section */}
            {authors.length > 0 && (
                <div className="px-6 mb-2">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3 ml-1">Penulis Ditemukan</h3>
                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {authors.map(author => (
                            <Link key={author.id} href={`/profile/${author.username}`} className="snap-start shrink-0 flex flex-col items-center gap-2 group">
                                <div className="w-14 h-14 rounded-full overflow-hidden bg-white dark:bg-slate-800 border-2 border-indigo-100 dark:border-slate-800 group-hover:border-indigo-500 transition-all shadow-sm">
                                    {author.avatar_url ? (
                                        <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-indigo-300 font-bold text-xl">
                                            {author.display_name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 w-16 text-center truncate">{author.display_name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="px-6 py-4 flex flex-col gap-4">
                <div className="flex justify-between items-center mb-1">
                    <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500">
                        {q ? `Hasil pencarian untuk "${q}"` : genreId ? `Genre: ${allGenres.find(g => g.id === genreId)?.name}` : 'Eksplorasi Mahakarya'}
                    </h2>
                    <span className="text-[10px] font-bold text-gray-400">{results.length} Karya</span>
                </div>

                {results.length === 0 ? (
                    <div className="text-center py-20 px-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 transition-colors mt-2">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <SearchIcon className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                        </div>
                        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Karya Tidak Ditemukan</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            Coba gunakan kata kunci lain, atau hapus filter tipe / genre yang sedang aktif untuk memperluas hasil pencarian.
                        </p>
                        <Link href="/search" className="bg-indigo-600 px-6 py-2.5 rounded-full text-white font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none inline-block transition-transform hover:scale-105 active:scale-95">
                            Reset Semua Filter
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {results.map((item) => (
                            <div key={item.id} className="group bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex gap-0 hover:shadow-md transition-all active:scale-[0.98]">
                                <Link href={`/novel/${item.id}`} className="w-28 relative shrink-0 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                                    {item.cover_url ? (
                                        <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-gray-500 dark:text-gray-400">
                                            {item.title}
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                                        {item.is_completed ? (
                                            <span className="bg-green-500/90 backdrop-blur-sm text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm">Tamat</span>
                                        ) : (
                                            <span className="bg-blue-500/90 backdrop-blur-sm text-white text-[8px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm">Ongoing</span>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex-1 min-w-0 p-4 flex flex-col justify-between">
                                    <div>
                                        <Link href={`/novel/${item.id}`}>
                                            <h3 className="font-black text-gray-900 dark:text-gray-100 text-[16px] leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{item.title}</h3>
                                        </Link>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-widest mb-2">{item.penulis_alias}</p>

                                        {/* Tags - Interactive - FIXED Nested Link */}
                                        <div className="flex flex-wrap gap-1 mb-3">
                                            {(item as any).genres?.map((g: any) => (
                                                <Link
                                                    key={g.id}
                                                    href={`/search?genreId=${g.id}&filter=${filter}`}
                                                    className="text-[9px] px-2 py-0.5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded font-black uppercase tracking-wider border border-gray-100 dark:border-slate-800 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 dark:hover:bg-indigo-500 transition-all"
                                                >
                                                    {g.name}
                                                </Link>
                                            ))}
                                        </div>

                                        {/* Sinopsis Singkat */}
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
                                            {item.deskripsi || "Belum ada deskripsi untuk karya ini."}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 items-baseline justify-between border-t border-gray-50 dark:border-slate-800/50 pt-3 shrink-0">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400">
                                                <Star className="w-3.5 h-3.5 fill-current" /> {item.avg_rating.toFixed(1)}
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-400">
                                                <BookOpen className="w-3 h-3" /> {(item as any)._count?.bab || 0} Bab
                                            </span>
                                        </div>
                                        <div className="text-[9px] font-bold text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded flex items-center gap-1.5 uppercase tracking-tighter">
                                            {item.bab && item.bab[0] && (
                                                <>
                                                    <TrendingUp className="w-3 h-3 text-indigo-500" />
                                                    <span>Update {new Date(item.bab[0].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
