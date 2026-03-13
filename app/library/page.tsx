import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookMarked, Settings, History as HistoryIcon, Star, Clock, Search, Home } from "lucide-react";
import RemoveBookmarkButton from './RemoveBookmarkButton';

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Cached Bookmarks for Library
 */
const getCachedLibrary = (userId: string) => unstable_cache(
    async () => {
        return prisma.bookmark.findMany({
            where: { user_id: userId },
            include: {
                karya: {
                    select: {
                        title: true, penulis_alias: true, id: true, cover_url: true,
                        is_completed: true, deskripsi: true, avg_rating: true,
                        _count: { select: { bab: true } },
                        bab: {
                            orderBy: { chapter_no: 'asc' },
                            select: { title: true, chapter_no: true }
                        }
                    }
                }
            },
            orderBy: { updated_at: 'desc' }
        });
    },
    [`library-${userId}`],
    { revalidate: 60, tags: [`library-${userId}`] }
)();

export default async function LibraryPage({ searchParams }: { searchParams: { tab?: string } }) {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/onboarding');
    }

    // Ambil riwayat bookmark via Cache
    const bookmarksRaw = await getCachedLibrary(session.user.id);

    // Cast as per other pages to avoid stale type issues
    const bookmarks = bookmarksRaw as (typeof bookmarksRaw[0] & {
        last_chapter: number;
        karya: {
            title: string;
            penulis_alias: string;
            id: string;
            cover_url: string | null;
            is_completed: boolean;
            deskripsi: string | null;
            avg_rating: number;
            _count: { bab: number };
        }
    })[];

    const CoverPlaceholder = ({ title }: { title: string }) => (
        <div className="w-20 h-28 bg-indigo-50 dark:bg-slate-800 rounded-lg flex items-center justify-center p-2 text-center text-[10px] text-indigo-700 dark:text-indigo-300 shadow-sm shrink-0 border border-indigo-100 dark:border-slate-700">
            {title}
        </div>
    );

    const activeTab = searchParams.tab || 'riwayat';
    
    // Logic for tabs:
    // Riwayat: The core list (all bookmarks/history)
    // Tamat: Filter for is_completed === true
    const filteredBookmarks = bookmarks.filter(b => {
        if (activeTab === 'tamat') return b.karya.is_completed;
        return true; 
    });

    const renderEmptyState = (message: string, subMessage: string) => (
        <div className="text-center py-24 px-8 border border-dashed border-gray-200 dark:border-slate-700 rounded-3xl bg-white dark:bg-slate-900 transition-colors duration-300">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                <BookMarked className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{message}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">{subMessage}</p>
            <Link href="/search" className="bg-indigo-600 px-6 py-3 rounded-full text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:scale-105 inline-block">
                Cari Cerita
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-slate-950 pb-32 md:pb-12 px-6 pt-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Search Bar & Home Icon (Desktop Design 1 style) */}
                <div className="flex items-center gap-4 mb-10">
                    <Link href="/" className="bg-tan-primary p-3 rounded-full text-text-accent hover:opacity-80 transition-all shadow-md">
                        <Home className="w-6 h-6" />
                    </Link>
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                            <Search className="w-5 h-5 text-text-accent" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari judul atau penulis..."
                            className="w-full bg-tan-primary text-text-accent placeholder:text-text-accent/70 rounded-full py-4 pl-14 pr-6 text-lg focus:outline-none focus:ring-2 focus:ring-brown-mid transition-all shadow-md"
                        />
                    </div>
                </div>

                <h1 className="font-open-sans font-extrabold text-2xl mb-8 text-text-main">Perpustakaan</h1>

                {/* Tabs Navigation (Consolidated) */}
                <div className="flex gap-3 mb-10 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                    {['riwayat', 'tamat'].map((tab) => (
                        <Link
                            key={tab}
                            href={`/library?tab=${tab}`}
                            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brown-dark text-text-accent shadow-lg scale-105' : 'bg-tan-primary text-text-accent hover:opacity-80'}`}
                        >
                            {tab === 'riwayat' ? 'Riwayat' : 'Tamat'}
                        </Link>
                    ))}
                </div>

                {/* Content Grid */}
                {filteredBookmarks.length === 0 ? renderEmptyState(
                    activeTab === 'riwayat' ? "Perpustakaan kosong" : "Belum ada cerita yang tamat",
                    "Mulai jelajahi karya-karya hebat lainnya di Ruang Aksara."
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
                        {filteredBookmarks.map((b, index) => {
                            const isOdd = index % 2 !== 0; 
                            const hasNewChapters = b.karya._count.bab > b.last_chapter;
                            const progressPercent = b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0;

                            return (
                                <div key={b.id} className="group relative flex flex-col gap-3">
                                    <Link href={activeTab === 'riwayat' ? `/novel/${b.karya.id}/${b.last_chapter}` : `/novel/${b.karya.id}`} className="group/card flex flex-col gap-2">
                                        <div className={`aspect-[3/4.2] relative rounded-[2.5rem] overflow-hidden shadow-lg transition-all duration-500 group-hover/card:shadow-2xl group-hover/card:-translate-y-1.5 ${isOdd ? 'bg-brown-dark' : 'bg-brown-mid'}`}>
                                            {b.karya.cover_url ? (
                                                <img src={b.karya.cover_url} alt={b.karya.title} className={`w-full h-full object-cover transition-all duration-700 ${b.karya.is_completed ? 'grayscale-[0.4] brightness-50' : 'group-hover/card:scale-110'}`} />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center p-4 text-center text-[10px] text-text-accent font-bold leading-relaxed ${b.karya.is_completed ? 'bg-black/40' : ''}`}>{b.karya.title}</div>
                                            )}

                                            {/* Hover Overlay: Synopsis & Action */}
                                            <div className="absolute inset-0 bg-brown-dark/80 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex flex-col p-4 justify-center items-center text-center">
                                                <p className="text-[10px] text-text-accent font-medium line-clamp-4 leading-relaxed italic mb-3">
                                                    {b.karya.deskripsi || "Tidak ada deskripsi tersedia."}
                                                </p>
                                                <div className="flex items-center gap-1.5 bg-tan-primary/30 px-3 py-1 rounded-full border border-text-accent/10">
                                                    <Star className="w-2.5 h-2.5 fill-tan-primary text-tan-primary" />
                                                    <span className="text-[10px] font-black text-text-accent">{b.karya.avg_rating.toFixed(1)}</span>
                                                </div>
                                            </div>

                                            {/* Completed Badge & Darkening */}
                                            {b.karya.is_completed && !hasNewChapters && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover/card:opacity-0 transition-opacity">
                                                    <div className="bg-brown-dark/80 text-text-accent px-3 py-1 rounded-full text-[8px] font-black tracking-[0.1em] border border-text-accent/20 backdrop-blur-sm">
                                                        TAMAT
                                                    </div>
                                                </div>
                                            )}

                                            {/* Status Badges Container */}
                                            <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none group-hover/card:opacity-0 transition-opacity">
                                                {/* New Chapters Alert */}
                                                {hasNewChapters && (
                                                    <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[7px] font-black animate-pulse shadow-lg">
                                                        {b.karya._count.bab - b.last_chapter} BAB BARU
                                                    </div>
                                                )}
                                                
                                                {/* User Finished Reading Badge */}
                                                {b.last_chapter === b.karya._count.bab && b.karya._count.bab > 0 && (
                                                    <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[7px] font-black shadow-lg border border-white/20">
                                                        SELESAI BACA
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Last Read Progress (Premium Bar) */}
                                            {activeTab === 'riwayat' && (
                                                <div className="absolute bottom-3 left-3 right-3 h-1 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/5 group-hover/card:opacity-0 transition-opacity">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-tan-light to-text-accent transition-all duration-1000 ease-out" 
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            )}

                                            {/* Aesthetic Corner Bookmark for History */}
                                            {activeTab === 'riwayat' && (
                                                <div className="absolute top-0 right-4 w-4 h-6 bg-tan-primary shadow-md flex items-start justify-center pt-1 animate-in slide-in-from-top-4 duration-700 group-hover/card:opacity-0 transition-opacity">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white/40" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col text-center px-1">
                                            <h3 className="font-open-sans font-bold text-[11px] text-text-main line-clamp-1 leading-tight mb-0.5 group-hover/card:text-brown-mid transition-colors">{b.karya.title}</h3>
                                            <div className="flex items-center justify-center gap-2 mb-1.5">
                                                <p className="text-[9px] font-bold text-tan-primary/70 truncate">{b.karya.penulis_alias || 'Anonim'}</p>
                                                {b.karya.avg_rating > 0 && (
                                                    <div className="flex items-center gap-0.5 opacity-60">
                                                        <Star className="w-2 h-2 fill-tan-primary text-tan-primary" />
                                                        <span className="text-[8px] font-bold text-tan-primary">{b.karya.avg_rating.toFixed(1)}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-auto pt-2 border-t border-tan-primary/10">
                                                <div className="flex flex-col gap-1.5">
                                                    {/* Progress Detail */}
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-[7.5px] font-black text-brown-mid/60 uppercase tracking-tighter">
                                                            Progress: {b.last_chapter}/{b.karya._count.bab}
                                                        </span>
                                                        <span className="text-[7.5px] font-black text-tan-primary">
                                                            {progressPercent.toFixed(0)}%
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Last Read Chapter Name (If available) */}
                                                    <p className="text-[8px] font-black text-brown-dark truncate bg-tan-light/20 px-2 py-0.5 rounded-md">
                                                        Lanjut: {b.karya.bab.find(bc => bc.chapter_no === b.last_chapter)?.title || `Bab ${b.last_chapter}`}
                                                    </p>

                                                    {/* Relative Time */}
                                                    <p className="text-[7px] text-brown-mid/50 font-bold italic text-right">
                                                        {formatDistanceToNow(new Date(b.updated_at), { addSuffix: true, locale: localeId })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all z-10 scale-75 origin-top-right">
                                        <div className="bg-white/90 dark:bg-slate-900/90 p-1 rounded-full shadow-xl border border-tan-light/20 backdrop-blur-sm">
                                            <RemoveBookmarkButton karyaId={b.karya.id} />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
