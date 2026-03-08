import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookMarked, Settings, History as HistoryIcon } from "lucide-react";
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
                {/* Tabs Navigation */}
                <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl mb-6 shadow-inner border border-gray-200 dark:border-slate-800">
                    <Link
                        href="/library?tab=riwayat"
                        className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'riwayat' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Riwayat
                    </Link>
                    <Link
                        href="/library?tab=favorit"
                        className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'favorit' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Favorit
                    </Link>
                    <Link
                        href="/library?tab=selesai"
                        className={`flex-1 text-center py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'selesai' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}
                    >
                        Tamat
                    </Link>
                </div>

                {/* Tab Content: Riwayat */}
                {activeTab === 'riwayat' && (
                    bookmarks.length === 0 ? renderEmptyState("Belum ada riwayat baca", "Buku yang kamu baca akan otomatis muncul di sini.") : (
                        <div className="space-y-4 flex flex-col gap-3">
                            {bookmarks.map(b => (
                                <Link key={b.id} href={`/novel/${b.karya.id}/${b.last_chapter}`} className="group relative bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all flex gap-4 h-full">
                                    <RemoveBookmarkButton karyaId={b.karya.id} />
                                    {b.karya.cover_url ? (
                                        <img src={b.karya.cover_url} alt={b.karya.title} className="w-20 h-28 object-cover rounded-lg shrink-0 shadow-sm" />
                                    ) : (
                                        <CoverPlaceholder title={b.karya.title} />
                                    )}
                                    <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2 mb-1">{b.karya.title}</h3>
                                            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Lanjutkan: Bab {b.last_chapter}</p>
                                        </div>
                                        <div className="mt-2 w-full bg-gray-100 dark:bg-slate-800 rounded-full h-1.5 mb-1 relative overflow-hidden">
                                            <div className="bg-indigo-600 dark:bg-indigo-500 h-1.5 rounded-full" style={{ width: `${b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0}%` }}></div>
                                        </div>
                                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium flex justify-between items-center w-full">
                                            <span>{b.karya._count.bab > 0 ? Math.round((b.last_chapter / b.karya._count.bab) * 100) : 0}% selesai</span>
                                            <span>{b.karya._count.bab} Bab Tersedia</span>
                                        </div>
                                        <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">Terakhir dibaca: {new Date(b.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div className="self-center bg-gray-50 dark:bg-slate-800 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border border-gray-200 dark:border-slate-700">
                                        <ArrowLeft className="w-4 h-4 text-gray-400 dark:text-gray-500 rotate-180" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )
                )}

                {/* Tab Content: Favorit */}
                {activeTab === 'favorit' && (
                    bookmarks.length === 0 ? renderEmptyState("Rak bukumu masih kosong", "Mulai simpan karya favoritmu untuk dibaca nanti.") : (
                        <div className="grid grid-cols-3 gap-3">
                            {bookmarks.map(b => (
                                <div key={b.id} className="group relative flex flex-col gap-1.5 h-full">
                                    <RemoveBookmarkButton karyaId={b.karya.id} />
                                    <Link href={`/novel/${b.karya.id}`} className="flex flex-col gap-1.5 h-full">
                                        <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                                            {b.karya.cover_url ? (
                                                <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-[8px] text-gray-500 dark:text-gray-400">{b.karya.title}</div>
                                            )}
                                            {b.karya.is_completed && (
                                                <span className="absolute top-1 right-1 bg-green-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">TAMAT</span>
                                            )}
                                            <div className="absolute font-bold bottom-1 left-1 bg-black/50 backdrop-blur-sm text-white text-[9px] px-1.5 py-0.5 rounded shadow-sm flex items-center gap-1">
                                                <span>★ {b.karya.avg_rating.toFixed(1)}</span>
                                            </div>
                                            {/* Progress Bar Favorit */}
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-900/50">
                                                <div className="h-full bg-indigo-500" style={{ width: `${b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0}%` }}></div>
                                            </div>
                                        </div>
                                        <h3 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{b.karya.title}</h3>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Tab Content: Selesai */}
                {activeTab === 'selesai' && (
                    completedBookmarks.length === 0 ? renderEmptyState("Belum ada cerita yang tamat", "Buku di rakmu yang sudah berstatus 'Tamat' akan tampil di sini.") : (
                        <div className="grid grid-cols-3 gap-3">
                            {completedBookmarks.map(b => (
                                <Link key={b.id} href={`/novel/${b.karya.id}`} className="group flex flex-col gap-1.5 h-full">
                                    <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                                        {b.karya.cover_url ? (
                                            <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-105 transition-all grayscale opacity-80" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-[8px] text-gray-500 dark:text-gray-400 grayscale opacity-80">{b.karya.title}</div>
                                        )}
                                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full text-[10px] font-bold">TAMAT</span>
                                    </div>
                                    <h3 className="text-[11px] font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors opacity-90">{b.karya.title}</h3>
                                    <p className="text-[9px] text-gray-500 dark:text-gray-400 line-clamp-1">{b.karya.penulis_alias}</p>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
