import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookMarked, Settings, History as HistoryIcon, Star, Clock, Search, Home } from "lucide-react";
import RemoveBookmarkButton from './RemoveBookmarkButton';

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

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
                        _count: { select: { bab: true } }
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
    const completedBookmarks = bookmarks.filter(b => b.karya._count.bab > 0 && b.last_chapter === b.karya._count.bab);

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

                <h1 className="font-open-sans font-bold text-4xl mb-8 text-text-main">Library Anda</h1>

                {/* Tabs Navigation (Adapted to new theme) */}
                <div className="flex gap-4 mb-12 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
                    {['riwayat', 'favorit', 'selesai'].map((tab) => (
                        <Link
                            key={tab}
                            href={`/library?tab=${tab}`}
                            className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-brown-dark text-text-accent shadow-lg scale-105' : 'bg-tan-primary text-text-accent hover:opacity-80'}`}
                        >
                            {tab === 'riwayat' ? 'Riwayat' : tab === 'favorit' ? 'Favorit' : 'Tamat'}
                        </Link>
                    ))}
                </div>

                {/* Content Grid */}
                {bookmarks.length === 0 ? renderEmptyState(
                    activeTab === 'riwayat' ? "Belum ada riwayat baca" : activeTab === 'favorit' ? "Rak bukumu masih kosong" : "Belum ada cerita yang tamat",
                    "Mulai jelajahi karya-karya hebat lainnya di Ruang Aksara."
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-6 gap-y-12">
                        {bookmarks.map((b, index) => {
                            const isOdd = index % 2 !== 0; // Simple alternating logic
                            return (
                                <div key={b.id} className="group relative flex flex-col gap-4">
                                    <Link href={activeTab === 'riwayat' ? `/novel/${b.karya.id}/${b.last_chapter}` : `/novel/${b.karya.id}`} className="group/card flex flex-col gap-3">
                                        <div className={`aspect-[3/4.5] relative rounded-[32px] overflow-hidden shadow-xl transition-all duration-500 group-hover/card:shadow-2xl group-hover/card:-translate-y-2 ${isOdd ? 'bg-brown-dark' : 'bg-brown-mid'}`}>
                                            {b.karya.cover_url ? (
                                                <img src={b.karya.cover_url} alt={b.karya.title} className={`w-full h-full object-cover transition-all duration-700 ${b.karya.is_completed ? 'grayscale-[0.4] brightness-50' : 'group-hover/card:scale-110'}`} />
                                            ) : (
                                                <div className={`w-full h-full flex items-center justify-center p-6 text-center text-xs text-text-accent font-bold leading-relaxed ${b.karya.is_completed ? 'bg-black/40' : ''}`}>{b.karya.title}</div>
                                            )}

                                            {/* Completed Badge & Darkening */}
                                            {b.karya.is_completed && (
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <div className="bg-brown-dark/80 text-text-accent px-4 py-1 rounded-full text-[10px] font-black tracking-[0.2em] border border-text-accent/20 backdrop-blur-sm">
                                                        TAMAT
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {/* Last Read Progress (Premium Bar) */}
                                            {activeTab === 'riwayat' && (
                                                <div className="absolute bottom-4 left-4 right-4 h-1.5 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                                                    <div 
                                                        className="h-full bg-gradient-to-r from-tan-light to-text-accent transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(242,234,215,0.5)]" 
                                                        style={{ width: `${b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0}%` }}
                                                    />
                                                </div>
                                            )}

                                            {/* Aesthetic Corner Bookmark for History */}
                                            {activeTab === 'riwayat' && (
                                                <div className="absolute top-0 right-6 w-6 h-8 bg-tan-primary shadow-md flex items-start justify-center pt-1 animate-in slide-in-from-top-4 duration-700">
                                                    <div className="w-2 h-2 rounded-full bg-white/40" />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col text-center px-1">
                                            <h3 className="font-open-sans font-extrabold text-sm text-text-main line-clamp-2 leading-tight mb-1 group-hover/card:text-brown-mid transition-colors min-h-[2.5rem] flex items-center justify-center">{b.karya.title}</h3>
                                            <p className="text-[10px] font-bold text-tan-primary/80 mb-2">{b.karya.penulis_alias || 'Anonim'}</p>
                                            
                                            <div className="mt-auto pt-2 border-t border-tan-primary/10">
                                                {activeTab === 'riwayat' ? (
                                                    <p className="text-[10px] font-black text-brown-dark bg-tan-light/20 py-1.5 rounded-xl border border-tan-primary/10">
                                                        Lanjut: Bab {b.last_chapter}
                                                    </p>
                                                ) : (
                                                    <p className="text-[10px] font-extrabold text-brown-dark opacity-60 uppercase tracking-widest">{b.karya._count.bab} Bab</p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <RemoveBookmarkButton karyaId={b.karya.id} />
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
