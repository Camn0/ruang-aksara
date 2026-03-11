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
        <div className="w-24 h-32 bg-paper/30 rounded-lg flex items-center justify-center p-2 text-center text-[10px] text-ink/20 shadow-sm shrink-0">
            {title}
        </div>
    );

    return (
        <div className="min-h-screen bg-parchment-light dark:bg-parchment-dark pb-24 transition-colors duration-500 selection:bg-pine/20">
            {/* Header / Search Bar */}
            <header className="px-6 pt-10 pb-4 bg-parchment/80 dark:bg-parchment-dark/80 backdrop-blur-md sticky top-0 z-10 border-b-4 border-ink-deep/10">
                <SearchBar initialQ={q} filter={filter} genreId={genreId} />

                <div className="flex gap-2 mt-6 overflow-x-auto pb-4 snap-x hide-scrollbar mb-2">
                    {[
                        { id: 'sedanghangat', label: 'Terpopuler' },
                        { id: 'terbaru', label: 'Terbaru' },
                        { id: 'rating', label: 'Bintang 5' },
                        { id: 'selesai', label: 'Kisah Tamat' },
                    ].map(f => (
                        <Link
                            key={f.id}
                            href={`/search?q=${q}&filter=${f.id}${genreId ? `&genreId=${genreId}` : ''}`}
                            className={`snap-start shrink-0 px-4 py-2 wobbly-border-sm text-[11px] font-marker uppercase tracking-widest transition-all ${filter === f.id
                                ? 'bg-gold text-ink-deep shadow-md rotate-[-2deg]'
                                : 'bg-paper text-ink/60 hover:text-pine rotate-[1deg]'
                                }`}
                        >
                            {f.label}
                        </Link>
                    ))}
                </div>

                {/* Genre Filter Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 snap-x hide-scrollbar">
                    <Link
                        href={`/search?q=${q}&filter=${filter}`}
                        className={`snap-start shrink-0 px-3 py-1.5 wobbly-border-sm text-[10px] font-special uppercase tracking-widest transition-all ${!genreId
                            ? 'bg-ink-deep text-parchment'
                            : 'bg-ink/5 text-ink/40 hover:text-pine'
                            }`}
                    >
                        Tampilkan Semua
                    </Link>
                    {allGenres.map(g => (
                        <Link
                            key={g.id}
                            href={`/search?q=${q}&filter=${filter}&genreId=${g.id}`}
                            className={`snap-start shrink-0 px-3 py-1.5 wobbly-border-sm text-[10px] font-special uppercase tracking-widest transition-all ${genreId === g.id
                                ? 'bg-pine/20 text-pine border-pine/40 border-2'
                                : 'bg-paper/40 text-ink/50 border-ink/10 border-2 hover:bg-paper hover:text-pine'
                                }`}
                        >
                            {g.name}
                        </Link>
                    ))}
                </div>
            </header>

            {/* Dual Search: Authors section */}
            {authors.length > 0 && (
                <div className="px-6 mb-8 mt-6">
                    <h3 className="text-[10px] font-special uppercase tracking-widest text-pine mb-4 ml-1">Para Penjaga Tinta</h3>
                    <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {authors.map(author => (
                            <Link key={author.id} href={`/profile/${author.username}`} className="snap-start shrink-0 flex flex-col items-center gap-3 group">
                                <div className="w-16 h-16 wobbly-border p-1 bg-paper paper-shadow group-hover:rotate-12 transition-all">
                                    <div className="w-full h-full wobbly-border-sm overflow-hidden bg-ink/5">
                                        {author.avatar_url ? (
                                            <img src={author.avatar_url} alt={author.display_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-ink/20 font-journal-title text-2xl">
                                                {author.display_name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <span className="font-marker text-[11px] text-ink-deep w-20 text-center truncate leading-none">{author.display_name}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Results */}
            <div className="px-6 py-6 flex flex-col gap-6 max-w-2xl mx-auto">
                <div className="flex justify-between items-center mb-2 border-b-2 border-dotted border-ink/10 pb-4">
                    <h2 className="font-journal-title text-xl text-ink-deep">
                        {q ? `Mencari: "${q}"` : genreId ? `Aliran: ${allGenres.find(g => g.id === genreId)?.name}` : 'Arsip Mahakarya'}
                    </h2>
                    <span className="font-special text-[11px] text-pine uppercase tracking-tighter">{results.length} Catatan</span>
                </div>

                {results.length === 0 ? (
                    <div className="text-center py-20 px-8 wobbly-border border-dashed border-ink/20 bg-paper/20 rotate-[-1deg] mt-4">
                        <div className="w-20 h-20 bg-ink/5 wobbly-border-sm flex items-center justify-center mb-6 mx-auto rotate-12">
                            <SearchIcon className="w-10 h-10 text-ink/20" />
                        </div>
                        <h2 className="font-journal-title text-2xl text-ink-deep mb-3">Halaman ini Kosong</h2>
                        <p className="font-journal-body text-lg text-ink/50 mb-8 leading-relaxed max-w-xs mx-auto">
                            "Mungkin angin telah meniup lembaran yang Anda cari. Cobalah kata lain..."
                        </p>
                        <Link href="/search" className="bg-gold px-8 py-3 wobbly-border-sm text-ink-deep font-journal-title text-xl hover:scale-105 active:scale-95 inline-block shadow-sm">
                            Kembali ke Awal
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {results.map((item) => (
                            <div key={item.id} className="group bg-paper p-5 wobbly-border paper-shadow flex gap-6 items-start hover:rotate-1 transition-all group-active:scale-[0.98] relative">
                                <Link href={`/novel/${item.id}`} className="w-24 aspect-[3/4.5] relative shrink-0 wobbly-border overflow-hidden shadow-lg group-hover:rotate-[-2deg] transition-transform">
                                    {item.cover_url ? (
                                        <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-paper flex items-center justify-center p-2 text-center text-[10px] text-ink/40 font-marker uppercase">
                                            {item.title}
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 p-1 flex flex-col gap-1">
                                        {item.is_completed ? (
                                            <span className="bg-pine text-parchment text-[8px] uppercase font-special px-2 py-0.5 wobbly-border-sm rotate-12">TAMAT</span>
                                        ) : (
                                            <span className="bg-ink-deep text-parchment text-[8px] uppercase font-special px-2 py-0.5 wobbly-border-sm -rotate-12">ONGOING</span>
                                        )}
                                    </div>
                                </Link>

                                <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                                    <div>
                                        <Link href={`/novel/${item.id}`}>
                                            <h3 className="font-journal-title text-2xl text-ink-deep leading-tight line-clamp-2 mb-1 group-hover:text-pine transition-colors uppercase decoration-pine/20 group-hover:underline underline-offset-4">{item.title}</h3>
                                        </Link>
                                        <p className="font-special text-[11px] text-pine uppercase tracking-widest mb-3">{item.penulis_alias}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(item as any).genres?.map((g: any) => (
                                                <Link
                                                    key={g.id}
                                                    href={`/search?genreId=${g.id}&filter=${filter}`}
                                                    className="text-[9px] px-2 py-0.5 bg-ink/5 text-ink/60 wobbly-border-sm font-special uppercase tracking-widest hover:bg-gold hover:text-ink-deep transition-all"
                                                >
                                                    {g.name}
                                                </Link>
                                            ))}
                                        </div>

                                        <p className="font-journal-body text-[13px] text-ink/70 line-clamp-2 leading-relaxed italic border-l-2 border-ink/10 pl-3 mb-4">
                                            "{item.deskripsi || "Setiap buku punya misteri tersendiri. Yang satu ini belum terjamah tinta sinopsis."}"
                                        </p>
                                    </div>

                                    {/* Stats Card Footer */}
                                    <div className="flex gap-4 text-[10px] font-marker text-ink/40 items-center justify-between border-t-2 border-dashed border-ink/5 pt-4 mt-auto">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1 text-gold drop-shadow-sm">
                                                <Star className="w-4 h-4 fill-gold text-gold" strokeWidth={1.5} /> {item.avg_rating.toFixed(1)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <BookOpen className="w-4 h-4" /> {(item as any)._count?.bab || 0} Bab
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-special text-pine/60 flex items-center gap-1.5 uppercase tracking-tighter">
                                            {item.bab && item.bab[0] && (
                                                <>
                                                    <TrendingUp className="w-3.5 h-3.5" />
                                                    <span>Update {new Date(item.bab[0].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -right-2 -top-2 w-8 h-8 bg-parchment wobbly-border flex items-center justify-center text-ink/10 group-hover:text-gold rotate-12 transition-all">
                                    <Star className="w-4 h-4" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
