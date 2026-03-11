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
        <div className="text-center py-20 px-8 wobbly-border-sm bg-white/40 rotate-1 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-ink/5 wobbly-border flex items-center justify-center mb-6 mx-auto rotate-[-8deg]">
                <BookMarked className="w-8 h-8 text-ink/20" />
            </div>
            <h2 className="font-journal-title text-2xl text-ink-deep mb-3 italic">{message}</h2>
            <p className="font-journal-body text-lg text-ink/40 mb-8 leading-relaxed italic">{subMessage}</p>
            <Link href="/search" className="bg-pine text-parchment font-journal-title text-xl px-10 py-3 wobbly-border-sm hover:rotate-[-2deg] transition-all active:scale-95 inline-block shadow-md italic">
                Cari Penemuan Baru
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-parchment-light pb-32 selection:bg-pine/20">
            {/* Vignette Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 shadow-[inset_0_0_150px_rgba(0,0,0,0.1)] dark:shadow-[inset_0_0_200px_rgba(0,0,0,0.5)]" />

            {/* Header: Wobbly Tab */}
            <header className="px-6 h-16 bg-parchment border-b-4 border-ink/5 wobbly-border-b sticky top-0 z-30 flex items-center justify-between">
                <Link href="/" className="p-2 -ml-2 text-ink-deep hover:text-pine transition-all active:scale-90">
                    <ArrowLeft className="w-7 h-7" />
                </Link>
                <h1 className="font-journal-title text-2xl text-ink-deep absolute left-1/2 -translate-x-1/2 w-64 text-center truncate italic">
                    Arsip Pribadi
                </h1>
                <div className="w-10"></div>
            </header>

            <div className="px-6 py-8 max-w-4xl mx-auto">
                {/* Search Bar: Ink Field */}
                <div className="relative mb-8 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                        <BookMarked className="w-5 h-5 text-ink/20 group-focus-within:text-pine transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari di arsip perpusmu..."
                        className="w-full bg-white/60 border-2 border-ink/5 wobbly-border-sm py-4 pl-12 pr-6 font-journal-body text-xl text-ink-deep outline-none focus:bg-white focus:border-pine/20 transition-all italic"
                    />
                </div>

                {/* Tabs: The Bookmarks feel */}
                <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                    {[
                        { id: 'riwayat', label: 'Riwayat Baca' },
                        { id: 'favorit', label: 'Koleksi Pin' },
                        { id: 'selesai', label: 'Dokumen Tamat' }
                    ].map(tab => (
                        <Link
                            key={tab.id}
                            href={`/library?tab=${tab.id}`}
                            className={`px-8 py-3 wobbly-border-sm font-journal-title text-xl whitespace-nowrap transition-all active:scale-95 ${activeTab === tab.id ? 'bg-pine text-parchment -rotate-2 shadow-lg' : 'bg-white/40 text-ink/30 hover:bg-gold/20 hover:text-ink-deep rotate-1'}`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </div>

                {/* Tab Content: Riwayat */}
                {activeTab === 'riwayat' && (
                    bookmarks.length === 0 ? renderEmptyState("Arsip Kosong", "Dokumen yang Anda baca akan otomatis tercatat di sini.") : (
                        <div className="space-y-6">
                            {bookmarks.map((b, i) => (
                                <div key={b.id} className="group relative">
                                    <Link
                                        href={`/novel/${b.karya.id}/${b.last_chapter}`}
                                        className={`bg-white wobbly-border paper-shadow p-4 hover:scale-[1.01] transition-all flex gap-5 ${i % 2 === 0 ? 'rotate-[-0.5deg]' : 'rotate-[0.5deg]'}`}
                                    >
                                        <div className="relative shrink-0">
                                            {/* Tape effect */}
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 bg-gold/30 wobbly-border-sm rotate-12 z-10 mix-blend-multiply" />

                                            {b.karya.cover_url ? (
                                                <img src={b.karya.cover_url} alt={b.karya.title} className="w-24 h-36 object-cover wobbly-border border-2 border-white shadow-md bg-white" />
                                            ) : (
                                                <div className="w-24 h-36 bg-white wobbly-border border-2 flex items-center justify-center p-3 text-center shadow-md">
                                                    <span className="font-marker text-[10px] text-ink/30 italic uppercase">{b.karya.title}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                            <div>
                                                <h3 className="font-journal-title text-xl text-ink-deep leading-tight line-clamp-1 mb-1 italic">{b.karya.title}</h3>
                                                <p className="font-marker text-xs text-ink/40 uppercase tracking-widest mb-3">{b.karya.penulis_alias}</p>
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="font-journal-title text-lg text-pine italic underline decoration-dotted">
                                                        Bab {b.last_chapter}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 font-special text-[10px] text-ink/30 uppercase tracking-widest">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span className="italic">
                                                            Akses: {new Date(b.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="font-journal-title text-lg text-ink-deep italic">
                                                        {b.karya._count.bab > 0 ? Math.round((b.last_chapter / b.karya._count.bab) * 100) : 0}%
                                                    </span>
                                                    <span className="font-special text-[9px] text-ink/30 uppercase tracking-[0.2em]">
                                                        {b.last_chapter} / {b.karya._count.bab} CATATAN
                                                    </span>
                                                </div>
                                                <div className="w-full bg-ink/5 wobbly-border-sm h-3 relative overflow-hidden">
                                                    <div className="bg-pine h-full transition-all duration-1000" style={{ width: `${b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity rotate-12">
                                        <RemoveBookmarkButton karyaId={b.karya.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Tab Content: Favorit */}
                {activeTab === 'favorit' && (
                    bookmarks.length === 0 ? renderEmptyState("Rak Koleksi Kosong", "Pin dokumen favorit Anda untuk dipelajari lebih dalam.") : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {bookmarks.map((b, i) => (
                                <div key={b.id} className="group relative">
                                    <Link href={`/novel/${b.karya.id}`} className="flex flex-col gap-4">
                                        <div className={`aspect-[3/4] relative wobbly-border bg-white p-2 shadow-md transition-all duration-500 group-hover:scale-105 ${i % 3 === 0 ? 'rotate-[-2deg]' : i % 3 === 1 ? 'rotate-[1deg]' : 'rotate-[3deg]'}`}>
                                            {/* Tape effect */}
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 bg-gold/30 wobbly-border-sm rotate-12 z-10 mix-blend-multiply" />

                                            {b.karya.cover_url ? (
                                                <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all border border-ink/5" />
                                            ) : (
                                                <div className="w-full h-full bg-parchment-light flex items-center justify-center p-4 text-center font-marker text-xs text-ink/30 italic uppercase border border-ink/5">{b.karya.title}</div>
                                            )}

                                            {/* Status Badge: Wax Seal look */}
                                            {b.karya.is_completed && (
                                                <div className="absolute -top-1 -right-3 px-3 py-1 bg-dried-red text-parchment font-special text-[8px] font-black wobbly-border-sm shadow-md uppercase tracking-widest rotate-12">TAMAT</div>
                                            )}

                                            {/* Rating: Ink Note */}
                                            <div className="absolute bottom-4 left-4 flex items-center gap-1 font-journal-title text-lg text-gold drop-shadow-md">
                                                <Star className="w-4 h-4 fill-current" />
                                                {b.karya.avg_rating.toFixed(1)}
                                            </div>
                                        </div>
                                        <div className="text-center px-2">
                                            <h3 className="font-journal-title text-lg text-ink-deep line-clamp-1 italic group-hover:text-pine transition-colors uppercase tracking-tight">{b.karya.title}</h3>
                                            <p className="font-marker text-[11px] text-ink/40 line-clamp-1 truncate">{b.karya.penulis_alias}</p>
                                        </div>
                                    </Link>
                                    <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RemoveBookmarkButton karyaId={b.karya.id} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* Tab Content: Selesai */}
                {activeTab === 'selesai' && (
                    completedBookmarks.length === 0 ? renderEmptyState("Belum Ada Temuan Tamat", "Dokumen berstatus 'Tamat' yang telah Anda selesaikan akan muncul di sini.") : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {completedBookmarks.map((b, i) => (
                                <Link key={b.id} href={`/novel/${b.karya.id}`} className="group relative flex flex-col gap-4">
                                    <div className={`aspect-[3/4] relative wobbly-border bg-white p-2 shadow-md filter grayscale group-hover:grayscale-0 transition-all duration-700 ${i % 3 === 0 ? 'rotate-[2deg]' : i % 3 === 1 ? 'rotate-[-1deg]' : 'rotate-[-3deg]'}`}>
                                        {/* Red Stamp effect */}
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-20 group-hover:opacity-10 transition-opacity">
                                            <div className="border-4 border-dried-red text-dried-red font-special p-2 rotate-[-45deg] uppercase tracking-widest text-xl font-black">TERARSIP</div>
                                        </div>

                                        {b.karya.cover_url ? (
                                            <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover transition-all" />
                                        ) : (
                                            <div className="w-full h-full bg-parchment-light flex items-center justify-center p-4 text-center font-marker text-xs text-ink/30 italic uppercase">{b.karya.title}</div>
                                        )}
                                        <div className="absolute inset-0 bg-ink-deep/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <span className="bg-parchment text-ink-deep px-6 py-2 wobbly-border-sm font-journal-title text-sm italic shadow-xl">Buka Kembali</span>
                                        </div>
                                    </div>
                                    <h3 className="font-journal-title text-lg text-ink-deep text-center line-clamp-1 italic group-hover:text-pine transition-colors uppercase tracking-tight">{b.karya.title}</h3>
                                </Link>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
