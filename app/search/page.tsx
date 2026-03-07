import Link from "next/link";
import { Search as SearchIcon, Star, TrendingUp } from "lucide-react";

import { prisma } from '@/lib/prisma';

export default async function SearchPage({
    searchParams
}: {
    searchParams: { q?: string; filter?: string; genreId?: string }
}) {
    const q = searchParams.q || "";
    const filter = searchParams.filter || "terpopuler";
    const genreId = searchParams.genreId || "";

    // Setup query untuk filter genre
    const genresPromise = prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    // Susun argumen query prisma
    let orderBy: any = {};
    let where: any = {
        AND: []
    };

    if (q) {
        // Pencarian "Fuzzy" ringan berbasis kata (Multi-term)
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
        }
    }

    if (genreId) {
        where.AND.push({
            genres: {
                some: { id: genreId }
            }
        });
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

    // Jika AND kosong, hapus property-nya agar tidak error di Prisma
    if (where.AND.length === 0) {
        delete where.AND;
    }

    const resultsRawPromise = prisma.karya.findMany({
        where,
        orderBy,
        include: {
            genres: true
        },
        take: 50
    });

    // Eksekusi semua query secara paralel
    const [allGenres, resultsRaw] = await Promise.all([genresPromise, resultsRawPromise]);

    // Cast to include all schema fields that may be missing from stale Prisma types
    const results = resultsRaw as (typeof resultsRaw[0] & {
        cover_url: string | null;
        is_completed: boolean;
        deskripsi: string | null;
    })[];

    const CoverPlaceholder = ({ title }: { title: string }) => (
        <div className="w-24 h-32 bg-gray-200 dark:bg-slate-800 rounded-lg flex items-center justify-center p-2 text-center text-[10px] text-gray-500 dark:text-gray-400 shadow-sm shrink-0">
            {title}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* Header / Search Bar */}
            <header className="px-6 pt-12 pb-4 bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <form className="relative" action="/search" method="GET">
                    <input type="hidden" name="filter" value={filter} />
                    <input type="hidden" name="genreId" value={genreId} />
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Cari judul atau penulis..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-slate-800 dark:text-gray-200 dark:placeholder-gray-500 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
                    <button type="submit" className="hidden">Cari</button>
                </form>

                {/* Main Filter Pills */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 snap-x hide-scrollbar border-b border-gray-50 dark:border-slate-800/50 mb-3">
                    {[
                        { id: 'terpopuler', label: 'Terpopuler' },
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

            {/* Results */}
            <div className="px-6 py-6 flex flex-col gap-4">
                <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                    {q ? `Hasil pencarian untuk "${q}"` : genreId ? `Genre: ${allGenres.find(g => g.id === genreId)?.name}` : 'Eksplorasi Mahakarya'}
                </h2>

                {results.length === 0 ? (
                    <div className="text-center py-20 px-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 transition-colors mt-6">
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
                            <Link key={item.id} href={`/novel/${item.id}`} className="group bg-white dark:bg-slate-900 overflow-hidden rounded-2xl border border-gray-100 dark:border-slate-800 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex gap-0 hover:shadow-md transition-all active:scale-[0.98]">
                                <div className="w-28 relative shrink-0 bg-gray-100 dark:bg-slate-800">
                                    {item.cover_url ? (
                                        <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-gray-500 dark:text-gray-400">
                                            {item.title}
                                        </div>
                                    )}
                                    {item.is_completed && (
                                        <span className="absolute top-2 left-2 bg-green-500 text-white text-[9px] uppercase font-black px-1.5 py-0.5 rounded shadow-sm">Tamat</span>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-[15px] leading-tight line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                                        <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium mb-1.5">{item.penulis_alias}</p>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mb-2 max-h-[22px] overflow-hidden">
                                            {(item as any).genres?.map((g: any) => (
                                                <span key={g.id} className="text-[9px] px-1.5 py-0.5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-sm font-semibold uppercase tracking-wider border border-gray-100 dark:border-slate-700">
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Sinopsis Singkat */}
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">
                                            {item.deskripsi || "Belum ada deskripsi untuk karya ini."}
                                        </p>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 items-center justify-end border-t border-gray-50 dark:border-slate-800/50 pt-2 shrink-0">
                                        <span className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 text-yellow-700 dark:text-yellow-500 px-1.5 py-0.5 rounded">
                                            <Star className="w-3.5 h-3.5 fill-current" /> {item.avg_rating.toFixed(1)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <TrendingUp className="w-3.5 h-3.5" /> {item.total_views} Views
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
