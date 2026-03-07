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

    // Ambil daftar genre untuk filter
    const allGenres = await prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    // Susun argumen query prisma
    let orderBy: any = {};
    let where: any = {
        AND: []
    };

    if (q) {
        where.AND.push({
            OR: [
                { title: { contains: q, mode: 'insensitive' } },
                { penulis_alias: { contains: q, mode: 'insensitive' } }
            ]
        });
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

    const resultsRaw = await prisma.karya.findMany({
        where,
        orderBy,
        include: {
            genres: true
        },
        take: 50
    });

    // Cast to include all schema fields that may be missing from stale Prisma types
    const results = resultsRaw as (typeof resultsRaw[0] & {
        cover_url: string | null;
        is_completed: boolean;
        deskripsi: string | null;
    })[];

    const CoverPlaceholder = ({ title }: { title: string }) => (
        <div className="w-24 h-32 bg-gray-200 rounded-lg flex items-center justify-center p-2 text-center text-[10px] text-gray-500 shadow-sm shrink-0">
            {title}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header / Search Bar */}
            <header className="px-6 pt-12 pb-4 bg-white sticky top-0 z-10 border-b border-gray-100">
                <form className="relative" action="/search" method="GET">
                    <input type="hidden" name="filter" value={filter} />
                    <input type="hidden" name="genreId" value={genreId} />
                    <input
                        type="text"
                        name="q"
                        defaultValue={q}
                        placeholder="Cari judul atau penulis..."
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-100 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all"
                    />
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <button type="submit" className="hidden">Cari</button>
                </form>

                {/* Main Filter Pills */}
                <div className="flex gap-2 mt-4 overflow-x-auto pb-2 snap-x hide-scrollbar border-b border-gray-50 mb-3">
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
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
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
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                    >
                        Semua Genre
                    </Link>
                    {allGenres.map(g => (
                        <Link
                            key={g.id}
                            href={`/search?q=${q}&filter=${filter}&genreId=${g.id}`}
                            className={`snap-start shrink-0 px-3 py-1 rounded text-[10px] uppercase font-black tracking-wider transition-all ${genreId === g.id
                                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                                : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            {g.name}
                        </Link>
                    ))}
                </div>
            </header>

            {/* Results */}
            <div className="px-6 py-6 flex flex-col gap-4">
                <h2 className="text-sm font-bold text-gray-500 mb-2">
                    {q ? `Hasil pencarian untuk "${q}"` : genreId ? `Genre: ${allGenres.find(g => g.id === genreId)?.name}` : 'Eksplorasi Mahakarya'}
                </h2>

                {results.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 text-sm">
                        Karya tidak ditemukan.
                    </div>
                ) : (
                    results.map((item) => (
                        <Link key={item.id} href={`/novel/${item.id}`} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-start hover:border-indigo-200 transition-colors active:scale-95">
                            {item.cover_url ? (
                                <img src={item.cover_url} alt={item.title} className="w-24 h-32 object-cover rounded-lg shrink-0" />
                            ) : (
                                <CoverPlaceholder title={item.title} />
                            )}

                            <div className="flex-1 min-w-0 py-1">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 pr-2">{item.title}</h3>
                                    {item.is_completed && (
                                        <span className="bg-green-100 text-green-700 text-[10px] uppercase font-black px-2 py-0.5 rounded shrink-0">Tamat</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mb-2">Oleh <span className="text-gray-700 font-medium">{item.penulis_alias}</span></p>

                                <div className="flex flex-wrap gap-1 mb-3">
                                    {(item as any).genres?.map((g: any) => (
                                        <span key={g.id} className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">#{g.name}</span>
                                    ))}
                                </div>

                                <div className="flex gap-4 text-[10px] items-center font-bold text-gray-400 mt-auto">
                                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" /> {item.avg_rating.toFixed(1)}</span>
                                    <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> {item.total_views} Views</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
