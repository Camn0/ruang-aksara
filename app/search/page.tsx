import Link from "next/link";
import Image from "next/image";
import { Star, TrendingUp, BookOpen, PlusCircle, ArrowUp, Flame, CheckCircle, Library, Search as SearchIcon, Eye, Users, MessageSquare } from "lucide-react";
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SearchBar from "./SearchBar";

const getCachedGenres = unstable_cache(
    async () => prisma.genre.findMany({ orderBy: { name: 'asc' } }),
    ['global-genres'],
    { revalidate: 86400, tags: ['genres'] }
);

const SORT_OPTIONS = ['terbaru', 'rating', 'sedanghangat', 'banyakbab'];
const FILTER_OPTIONS = ['diikuti', 'selesai'];

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

        return { results, authors };
    },
    [`search-v5-multi-${q}-${filterStr}-${genreIds.sort().join(',') || 'all'}-${userId || 'anon'}`],
    { revalidate: 300, tags: ['karya-global'] }
)();

export default async function SearchPage({ searchParams }: { searchParams: { q?: string; filter?: string; genreId?: string } }) {
    const q = searchParams.q || "";
    const filter = searchParams.filter || "sedanghangat";
    const genreIds = searchParams.genreId ? searchParams.genreId.split(',').filter(Boolean) : [];

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    const [allGenres, searchData] = await Promise.all([
        getCachedGenres(),
        getCachedSearchResults(q, filter, genreIds, userId)
    ]);

    const results = searchData.results as (any & {
        cover_url: string | null;
        is_completed: boolean;
        deskripsi: string | null;
        bab: { created_at: Date }[];
    })[];

    const authors = searchData.authors as any[];

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark pb-24 transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pt-5 pb-5 sticky top-0 z-0 bg-bg-cream/90 dark:bg-brown-dark/90 shadow-sm border-b border-tan-primary/10 backdrop-blur-md">
                <SearchBar initialQ={q} filter={filter} genreId={genreIds.join(',')} />
            </header>

            <main className="max-w-6xl mx-auto px-6">
                {/* Filter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {[
                        { id: 'diikuti', label: 'Diikuti Olehmu', icon: PlusCircle, desc: 'Lihat cerita yang sebelumnya telah kamu ikuti!' },
                        { id: 'terbaru', label: 'Unggahan Baru', icon: ArrowUp, desc: 'Cerita-cerita yang baru saja diunggah!' },
                        { id: 'sedanghangat', label: 'Sedang Hangat', icon: Flame, desc: 'Cerita yang sedang hangat saat ini!' },
                        { id: 'rating', label: 'Rating Tinggi', icon: Star, desc: 'Cerita yang diberikan rating tinggi oleh pengguna RuangAksara!' },
                        { id: 'banyakbab', label: 'Banyak Bab', icon: Library, desc: 'Cerita-cerita yang memiliki banyak bab!' },
                        { id: 'selesai', label: 'Cerita Selesai', icon: CheckCircle, desc: 'Lihat cerita yang sudah selesai ditulis!' },
                    ].map((f) => {
                        const Icon = f.icon;
                        const activeFilters = filter.split(',').filter(Boolean);
                        const isActive = activeFilters.includes(f.id);

                        let newFilters = [...activeFilters];
                        if (SORT_OPTIONS.includes(f.id)) {
                            newFilters = newFilters.filter(id => !SORT_OPTIONS.includes(id));
                            newFilters.push(f.id);
                        } else {
                            if (isActive) { newFilters = newFilters.filter(id => id !== f.id); }
                            else { newFilters.push(f.id); }
                        }

                        return (
                            <Link
                                key={f.id}
                                href={`/search?q=${q}&filter=${newFilters.join(',')}${genreIds.length > 0 ? `&genreId=${genreIds.join(',')}` : ''}`}
                                prefetch={false}
                                className={`group relative overflow-hidden rounded-[2rem] border-2 transition-all duration-500 hover:-translate-y-1 ${isActive
                                    ? 'border-brown-mid bg-brown-mid shadow-2xl'
                                    : 'border-tan-light/40 dark:border-tan-light/10 bg-tan-light/20 dark:bg-brown-dark/60 hover:border-tan-primary/30 hover:bg-tan-light/30 dark:hover:bg-brown-mid/20'
                                }`}
                            >
                                <div className="flex">
                                    <div className={`w-16 sm:w-20 flex items-center justify-center border-r transition-colors duration-500 ${isActive
                                        ? 'border-text-accent/20 text-text-accent'
                                        : 'border-tan-light/30 dark:border-tan-light/10 text-brown-mid dark:text-tan-light'
                                    }`}>
                                        <Icon className={`w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'fill-text-accent/20' : 'fill-brown-mid/5'}`} />
                                    </div>
                                    <div className="flex-1 p-4 sm:p-5">
                                        <h3 className={`font-black text-xs sm:text-base mb-0.5 uppercase tracking-tighter transition-colors duration-500 ${isActive
                                            ? 'text-text-accent'
                                            : 'text-text-main dark:text-text-accent'
                                        }`}>
                                            {f.label}
                                        </h3>
                                        <p className={`text-[10px] sm:text-xs leading-relaxed font-medium transition-colors duration-500 ${isActive
                                            ? 'text-text-accent/70'
                                            : 'text-brown-mid dark:text-tan-light/70'
                                        }`}>
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Genre Pills */}
                <div className="flex gap-2 overflow-x-auto pb-6 snap-x hide-scrollbar mb-8">
                    <Link
                        href={`/search?q=${q}&filter=${filter}`}
                        prefetch={false}
                        className={`snap-start shrink-0 px-5 py-2 rounded-full text-[10px] uppercase font-black tracking-widest transition-all shadow-sm ${genreIds.length === 0
                            ? 'bg-brown-mid text-text-accent'
                            : 'bg-tan-light/40 dark:bg-brown-mid/30 text-brown-mid dark:text-tan-light hover:bg-tan-light/60 dark:hover:bg-brown-mid/50'
                        }`}
                    >
                        Semua Genre
                    </Link>
                    {allGenres.map(g => {
                        const isSelected = genreIds.includes(g.id);
                        const newGenreIds = isSelected ? genreIds.filter(id => id !== g.id) : [...genreIds, g.id];

                        return (
                            <Link
                                key={g.id}
                                href={`/search?q=${q}&filter=${filter}${newGenreIds.length > 0 ? `&genreId=${newGenreIds.join(',')}` : ''}`}
                                prefetch={false}
                                className={`snap-start shrink-0 px-5 py-2 rounded-full text-[10px] uppercase font-black tracking-widest transition-all border shadow-sm ${isSelected
                                    ? 'bg-brown-mid text-text-accent border-brown-mid shadow-lg'
                                    : 'bg-tan-light/30 dark:bg-brown-dark/50 text-brown-mid dark:text-tan-light border-tan-light/40 dark:border-tan-light/10 hover:border-tan-primary/40'
                                }`}
                            >
                                {g.name}
                            </Link>
                        );
                    })}
                </div>

                {/* Authors */}
                {authors.length > 0 && (
                    <div className="px-6 mb-8">
                        <h3 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-brown-mid dark:text-tan-light/60 mb-4 ml-1">Penulis Ditemukan</h3>
                        <div className="flex gap-6 overflow-x-auto pb-4 snap-x hide-scrollbar">
                            {authors.map(author => (
                                <Link key={author.id} href={`/profile/${author.username}`} prefetch={false} className="snap-start shrink-0 flex flex-col items-center gap-3 group">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-tan-light/40 dark:bg-brown-mid border-2 border-tan-primary/20 group-hover:border-brown-mid transition-all shadow-md">
                                        {author.avatar_url ? (
                                            <Image src={author.avatar_url} width={80} height={80} sizes="80px" alt={author.display_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-tan-primary font-black text-2xl bg-tan-light/20 dark:bg-brown-dark/20">
                                                {author.display_name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] sm:text-xs font-black text-brown-mid dark:text-tan-light w-20 text-center truncate group-hover:text-text-main dark:group-hover:text-text-accent transition-colors">{author.display_name}</span>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Results */}
                <div className="px-6 py-4 flex flex-col gap-4">
                    <div className="flex justify-between items-center mb-6 px-1">
                        <h2 className="text-[11px] sm:text-xs font-black text-brown-mid dark:text-tan-light/60 uppercase tracking-widest italic">
                            {q ? `Hasil pencarian untuk "${q}"` : genreIds.length > 0 ? `Genre: ${genreIds.map(id => allGenres.find(g => g.id === id)?.name).join(', ')}` : 'Eksplorasi Mahakarya'}
                        </h2>
                        <span className="text-[10px] font-black text-brown-mid/50 dark:text-tan-light/40 uppercase tracking-tighter">{results.length} KARYA TERSEDIA</span>
                    </div>

                    {results.length === 0 ? (
                        <div className="text-center py-24 sm:py-32 px-8 border-2 border-dashed border-tan-light/40 dark:border-tan-light/10 rounded-[3rem] bg-tan-light/10 dark:bg-brown-dark/40 backdrop-blur-sm transition-colors mt-4">
                            <div className="w-20 h-20 bg-tan-light/30 dark:bg-brown-mid/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                                <SearchIcon className="w-10 h-10 text-tan-primary/40" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-black text-text-main dark:text-text-accent mb-3 uppercase tracking-tighter italic">Karya Tidak Ditemukan</h2>
                            <p className="text-xs sm:text-sm text-brown-mid dark:text-tan-light mb-8 leading-relaxed max-w-sm mx-auto font-medium">
                                Coba gunakan kata kunci lain, atau hapus filter tipe / genre yang sedang aktif untuk memperluas hasil pencarian.
                            </p>
                            <Link href="/search" prefetch={false} className="bg-brown-mid px-8 py-3 rounded-full text-text-accent font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 shadow-lg shadow-black/10 transition-all inline-block">
                                Reset Semua Filter
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {results.map((item) => (
                                <div key={item.id} className="group bg-tan-light/20 dark:bg-brown-dark/60 backdrop-blur-sm overflow-hidden rounded-[2.5rem] border-2 border-tan-light/30 dark:border-tan-light/5 shadow-sm flex gap-0 hover:border-tan-primary/30 dark:hover:border-tan-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                                    <Link href={`/novel/${item.id}`} prefetch={false} className="w-32 sm:w-40 relative shrink-0 bg-tan-light/20 dark:bg-brown-mid/20 overflow-hidden">
                                        {item.cover_url ? (
                                            <Image src={item.cover_url} width={160} height={220} sizes="(max-width: 640px) 128px, 160px" alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-4 text-center text-[10px] font-black text-tan-primary/50 uppercase italic tracking-tighter">
                                                {item.title}
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                            {item.is_completed ? (
                                                <span className="bg-brown-mid text-text-accent text-[8px] sm:text-[9px] uppercase font-black px-2 py-1 rounded-md shadow-lg backdrop-blur-md">SELESAI</span>
                                            ) : (
                                                <span className="bg-tan-primary text-text-accent text-[8px] sm:text-[9px] uppercase font-black px-2 py-1 rounded-md shadow-lg backdrop-blur-md">BERJALAN</span>
                                            )}
                                        </div>
                                    </Link>

                                    <div className="flex-1 min-w-0 p-4 sm:p-6 flex flex-col justify-between">
                                        <div>
                                            <Link href={`/novel/${item.id}`} prefetch={false}>
                                                <h3 className="font-black text-text-main dark:text-text-accent text-sm sm:text-base leading-tight line-clamp-1 mb-0.5 group-hover:text-tan-primary transition-colors uppercase tracking-tight italic">{item.title}</h3>
                                            </Link>
                                            <p className="text-[10px] sm:text-[11px] text-brown-mid dark:text-tan-light font-black uppercase tracking-widest mb-2">{item.penulis_alias}</p>

                                            {/* Genre Tags */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {(item as any).genres?.map((g: any) => {
                                                    const isSelected = genreIds.includes(g.id);
                                                    const newGenreIds = isSelected ? genreIds.filter(id => id !== g.id) : [...genreIds, g.id];
                                                    return (
                                                        <Link
                                                            key={g.id}
                                                            href={`/search?filter=${filter}${newGenreIds.length > 0 ? `&genreId=${newGenreIds.join(',')}` : ''}`}
                                                            prefetch={false}
                                                            className={`text-[9px] sm:text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wider border transition-all ${isSelected
                                                                ? 'bg-brown-mid text-text-accent border-brown-mid'
                                                                : 'bg-tan-light/30 dark:bg-brown-mid/20 text-brown-mid dark:text-tan-light border-tan-light/40 dark:border-tan-light/10 hover:bg-brown-mid hover:text-text-accent'
                                                            }`}
                                                        >
                                                            {g.name}
                                                        </Link>
                                                    );
                                                })}
                                            </div>

                                            <p className="text-[11px] sm:text-sm text-brown-mid/70 dark:text-tan-light line-clamp-3 leading-relaxed mb-4">
                                                {item.deskripsi || "Belum ada deskripsi untuk karya ini."}
                                            </p>
                                        </div>

                                        {/* Stats */}
                                        <div className="flex flex-wrap gap-4 text-[10px] sm:text-[11px] font-black text-brown-mid/50 dark:text-tan-light/50 items-center justify-between border-t border-tan-light/30 dark:border-tan-light/10 pt-4 shrink-0">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                                                    <Star className="w-3.5 h-3.5 fill-current" /> {item.avg_rating.toFixed(1)}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Eye className="w-3.5 h-3.5" /> {item.total_views.toLocaleString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" /> {(item as any)._count?.bookmarks || 0}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5" /> {(item as any)._count?.bab || 0} BAB
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MessageSquare className="w-3.5 h-3.5" /> {(item as any)._count?.reviews || 0}
                                                </span>
                                            </div>
                                            <div className="text-[9px] sm:text-[10px] font-black text-brown-mid/40 dark:text-tan-light/30 bg-tan-light/20 dark:bg-brown-mid/20 px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-widest border border-tan-light/20 dark:border-tan-light/5">
                                                {item.bab && item.bab[0] && (
                                                    <>
                                                        <TrendingUp className="w-3.5 h-3.5 text-brown-mid dark:text-tan-light" />
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
            </main>
        </div>
    );
}