import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookMarked, Settings, History as HistoryIcon, Star, Clock } from "lucide-react";
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="font-black text-xl text-gray-900 dark:text-gray-100">Perpustakaan</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <div className="px-6 py-4">
                {/* Search & Filter Bar */}
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <BookMarked className="w-4 h-4 text-gray-400" />
                    </div>
                    {/* Note: In a full implementation, this should be a client component for real-time filtering. 
                        For now, we'll keep the UI and note it needs a client wrapper or state. */}
                    <input
                        type="text"
                        placeholder="Cari di perpusmu..."
                        className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all shadow-sm"
                    />
                </div>

                {/* Tabs Navigation */}
                <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl mb-8 shadow-sm border border-gray-100 dark:border-slate-800">
                    <Link
                        href="/library?tab=riwayat"
                        className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'riwayat' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        Riwayat
                    </Link>
                    <Link
                        href="/library?tab=favorit"
                        className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'favorit' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        Favorit
                    </Link>
                    <Link
                        href="/library?tab=selesai"
                        className={`flex-1 text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'selesai' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                    >
                        Tamat
                    </Link>
                </div>

                {/* Tab Content: Riwayat */}
                {activeTab === 'riwayat' && (
                    bookmarks.length === 0 ? renderEmptyState("Belum ada riwayat baca", "Buku yang kamu baca akan otomatis muncul di sini.") : (
                        <div className="space-y-4">
                            {bookmarks.map(b => (
                                <div key={b.id} className="group relative">
                                    <Link href={`/novel/${b.karya.id}/${b.last_chapter}`} className="flex bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all flex gap-4">
                                        {b.karya.cover_url ? (
                                            <img src={b.karya.cover_url} alt={b.karya.title} className="w-20 h-28 object-cover rounded-xl shrink-0 shadow-sm" />
                                        ) : (
                                            <CoverPlaceholder title={b.karya.title} />
                                        )}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-1 mb-0.5">{b.karya.title}</h3>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2">{b.karya.penulis_alias}</p>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full uppercase tracking-tighter">
                                                        Bab {b.last_chapter}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                                                        <Clock className="w-3 h-3 text-indigo-300" />
                                                        <span className="italic">
                                                            Dibaca {new Date(b.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-gray-900 dark:text-gray-100">
                                                        {b.karya._count.bab > 0 ? Math.round((b.last_chapter / b.karya._count.bab) * 100) : 0}%
                                                    </span>
                                                    <span className="text-[9px] font-bold text-gray-400">
                                                        {b.last_chapter}/{b.karya._count.bab} Bab
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 relative overflow-hidden">
                                                    <div className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full transition-all duration-1000" style={{ width: `${b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RemoveBookmarkButton karyaId={b.karya.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Tab Content: Favorit */}
                {activeTab === 'favorit' && (
                    bookmarks.length === 0 ? renderEmptyState("Rak bukumu masih kosong", "Mulai simpan karya favoritmu untuk dibaca nanti.") : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {bookmarks.map(b => (
                                <div key={b.id} className="group relative flex flex-col gap-2">
                                    <Link href={`/novel/${b.karya.id}`} className="flex flex-col gap-2">
                                        <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                                            {b.karya.cover_url ? (
                                                <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center p-4 text-center text-[10px] text-indigo-700 dark:text-indigo-300 font-bold">{b.karya.title}</div>
                                            )}

                                            {/* Status Badge */}
                                            {b.karya.is_completed && (
                                                <div className="absolute top-2 left-2 px-2 py-1 bg-green-500/90 backdrop-blur-sm text-white text-[8px] font-black rounded-lg shadow-sm uppercase tracking-widest">Tamat</div>
                                            )}

                                            {/* Rating Overlay */}
                                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm text-white text-[9px] font-bold rounded flex items-center gap-1 shadow-sm">
                                                <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
                                                {b.karya.avg_rating.toFixed(1)}
                                            </div>

                                            {/* Progress Strip Bottom */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                                                <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0}%` }}></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{b.karya.title}</h3>
                                            <p className="text-[10px] font-medium text-gray-400 line-clamp-1">{b.karya.penulis_alias}</p>
                                        </div>
                                    </Link>
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RemoveBookmarkButton karyaId={b.karya.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Tab Content: Selesai */}
                {activeTab === 'selesai' && (
                    completedBookmarks.length === 0 ? renderEmptyState("Belum ada cerita yang tamat", "Buku di rakmu yang sudah berstatus 'Tamat' akan tampil di sini.") : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {completedBookmarks.map(b => (
                                <Link key={b.id} href={`/novel/${b.karya.id}`} className="group flex flex-col gap-2">
                                    <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                                        {b.karya.cover_url ? (
                                            <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center p-4 text-center text-[10px] text-gray-500 dark:text-gray-400 font-bold grayscale opacity-80">{b.karya.title}</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="bg-white text-gray-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Baca Lagi</span>
                                        </div>
                                        <div className="absolute top-0 right-0 p-3">
                                            <div className="bg-green-500 text-white p-1 rounded-bl-xl rounded-tr-xl font-black text-[8px] uppercase tracking-tighter shadow-lg">TAMAT</div>
                                        </div>
                                    </div>
                                    <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{b.karya.title}</h3>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
