import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { redis } from "@/lib/redis";

const prisma = new PrismaClient();

// Mengapa: Memaksa Next.js mengevaluasi halaman ini dinamis pada setiap request 
// agar parameter query (searchParams) dapat ditangkap dengan tepat.
export const dynamic = 'force-dynamic';

export default async function NovelIndexPage({
    searchParams
}: {
    searchParams: { q?: string; page?: string; genre?: string }
}) {
    // Parameter Pencarian & Paginasir
    const query = searchParams.q || "";
    const genreFilter = searchParams.genre || ""; // Epic 6: Genre Filter
    // Mengapa: Pagination dasar O(offset). Mengurangi payload JSON/DOM jika ada 10,000 karya
    const page = parseInt(searchParams.page || "1", 10);
    const limit = 9;
    const skip = (page - 1) * limit;

    // [A] Optimasi Redis: Caching (Trending/Top Rated)
    // Mengapa: Jika user hanya membuka halaman 1 tanpa mencari apapun atau menggunakan filter, 
    // ini adalah pola akses paling sering (Trending). Daripada hit Postgres terus, kita read Redis.
    const isFirstPageNoSearch = page === 1 && query === "" && genreFilter === "";
    const cacheKey = 'karya:trending:page_1';

    let semuaKarya: any[] = [];
    let fromCache = false;

    if (isFirstPageNoSearch) {
        try {
            const cachedData = await redis.get(cacheKey);
            if (cachedData) {
                semuaKarya = JSON.parse(cachedData);
                fromCache = true;
            }
        } catch (error) {
            console.error("Redis Cache Error:", error);
        }
    }

    // Fetch semua genre untuk dropdown filter
    const daftarGenre = await prisma.genre.findMany({ orderBy: { name: 'asc' } });

    // [B] Kueri Database Utama + Full-Text Search + Genre Filter
    if (!fromCache) {

        let prismaWhereClause: any = {};

        if (query) {
            prismaWhereClause.OR = [
                { title: { contains: query, mode: 'insensitive' } },
                { penulis_alias: { contains: query, mode: 'insensitive' } }
            ];
        }

        if (genreFilter) {
            prismaWhereClause.genres = { some: { id: genreFilter } };
        }

        semuaKarya = await prisma.karya.findMany({
            where: prismaWhereClause,
            orderBy: { avg_rating: 'desc' },
            skip: skip,
            take: limit,
            include: {
                _count: { select: { bab: true } },
                genres: true // Ambil sekalian nama genrenya untuk UI Card
            }
        });

        // Set Cache untuk kunjungan berikutnya
        if (isFirstPageNoSearch && semuaKarya.length > 0) {
            try {
                // Mengapa: TTL 1 jam (3600 detik)
                await redis.setex(cacheKey, 3600, JSON.stringify(semuaKarya));
            } catch (error) {
                console.error("Redis Set Error:", error);
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Eksplorasi Mahakarya</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        Jelajahi dunia imajinasi tanpa batas. Temukan cerita-cerita puitis dan narasi bermakna dari para penulis terbaik kami.
                    </p>

                    {/* Bar Pencarian Klien (Garis Bawah) */}
                    <form className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3" method="GET" action="/novel">
                        <select
                            name="genre"
                            defaultValue={genreFilter}
                            className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-700"
                        >
                            <option value="">Semua Genre</option>
                            {daftarGenre.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            placeholder="Cari judul novel atau nama pena..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <button type="submit" className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 shadow-sm transition whitespace-nowrap">
                            Cari
                        </button>
                    </form>
                </header>

                {/* Indikator Cache Aktif untuk Keperluan Debug (Opsional, tapi bagus untuk verifikasi) */}
                {fromCache && (
                    <div className="text-xs text-center text-green-600 mb-4 bg-green-50 py-1 w-max mx-auto px-3 rounded-full border border-green-200">
                        ⚡ Memuat {semuaKarya.length} karya super cepat dari memori Redis...
                    </div>
                )}

                {query && (
                    <p className="mb-6 text-gray-600">
                        Menampilkan hasil pencarian untuk: <span className="font-semibold italic text-gray-900">"{query}"</span>
                    </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {semuaKarya.map((item) => (
                        <Link key={item.id} href={`/novel/${item.id}`} className="group block">
                            <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 h-full flex flex-col relative overflow-hidden">

                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-0 opacity-50 group-hover:scale-110 transition-transform"></div>

                                <div className="z-10 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <h2 className="text-2xl font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {item.title}
                                        </h2>
                                        <span className="flex items-center text-sm font-bold bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                                            ⭐ {item.avg_rating.toFixed(1)}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 font-medium mb-3">Oleh {item.penulis_alias}</p>

                                    {/* Menampilkan Tag Genre di Card */}
                                    {item.genres && item.genres.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {item.genres.map((g: any) => (
                                                <span key={g.id} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-100 font-medium">
                                                    {g.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="z-10 mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        📄 {item._count?.bab || 0} Bab Tersedia
                                    </span>
                                    <span className="flex items-center gap-1 font-semibold text-indigo-500 group-hover:translate-x-1 transition-transform">
                                        Buka Detail ➔
                                    </span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Pesan Kosong */}
                {semuaKarya.length === 0 && (
                    <div className="mt-8 text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                        Tidak ada karya yang ditemukan.
                    </div>
                )}

                {/* Kontrol Pagination Sederhana */}
                <div className="mt-12 flex justify-center items-center gap-4">
                    {page > 1 && (
                        <Link
                            href={`/novel?page=${page - 1}${query ? `&q=${query}` : ''}`}
                            className="px-5 py-2 font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition"
                        >
                            ← Sebelumnya
                        </Link>
                    )}

                    <span className="text-gray-500 text-sm">Halaman {page}</span>

                    {semuaKarya.length === limit && (
                        <Link
                            href={`/novel?page=${page + 1}${query ? `&q=${query}` : ''}`}
                            className="px-5 py-2 font-medium bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 transition"
                        >
                            Berikutnya →
                        </Link>
                    )}
                </div>

            </div>
        </div>
    );
}
