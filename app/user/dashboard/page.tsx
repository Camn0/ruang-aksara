import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCircle2, Sparkles, History, Star, BookOpen, Flame, Trophy, TrendingUp, ChevronRight, Heart } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";
import { unstable_cache } from "next/cache";
import DashboardStats from "./DashboardStats";

/**
 * Global cache untuk daftar karya yang Sedang Hangat (Trending).
 * Berdasarkan total views tertinggi.
 */
const getCachedTrending = unstable_cache(
    async () => {
        return prisma.karya.findMany({
            where: { bab: { some: {} } },
            orderBy: { total_views: 'desc' },
            take: 10
        });
    },
    ['global-trending-dashboard'],
    { revalidate: 3600, tags: ['karya-global'] }
);

/**
 * User-specific Bookmarks Cache
 */
const getCachedUserBookmarks = (userId: string) => unstable_cache(
    async () => prisma.bookmark.findMany({
        where: { user_id: userId },
        include: {
            karya: {
                include: {
                    _count: { select: { bab: true } }
                }
            }
        },
        orderBy: { updated_at: 'desc' },
        take: 10
    }),
    [`dashboard-bookmarks-${userId}`],
    { revalidate: 60, tags: [`library-${userId}`] }
)();

/**
 * User-specific Stats
 */
async function getUserStats(userId: string) {
    let stats = await (prisma as any).userStats.findUnique({
        where: { user_id: userId }
    });

    if (!stats) {
        stats = await (prisma as any).userStats.create({
            data: { user_id: userId, points: 0, reading_streak: 0, total_chapters_read: 0 }
        });
    }
    return stats;
}

/**
 * Fetch followed authors
 */
async function getFollowedAuthors(userId: string) {
    return prisma.follow.findMany({
        where: { follower_id: userId },
        include: {
            following: {
                select: {
                    id: true,
                    username: true,
                    display_name: true,
                    avatar_url: true,
                    role: true
                }
            }
        },
        take: 10
    });
}

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/onboarding');
    }

    // Paralelkan pengambilan data
    const [bookmarksRaw, trendingRaw, stats, followedAuthorsRaw] = await Promise.all([
        getCachedUserBookmarks(session.user.id),
        getCachedTrending(),
        getUserStats(session.user.id),
        getFollowedAuthors(session.user.id)
    ]);

    const bookmarks = bookmarksRaw as any[];

    // Hero: Most recently read
    const lastRead = bookmarks[0];

    const trending = (trendingRaw as any[]).slice(0, 8);


    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 transition-colors duration-500 pb-32">
            {/* Header with Glassmorphism */}
            <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100 dark:border-slate-800 transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-indigo-200 dark:shadow-none transition-transform hover:rotate-3">
                        RA
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">Ruang Aksara</h1>
                        <p className="text-[9px] text-indigo-500 font-bold uppercase tracking-widest mt-1">Dashboard Pembaca</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${session.user.id}`} className="relative group">
                        <UserCircle2 className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-all group-active:scale-90" />
                    </Link>
                    <LogoutButton />
                </div>
            </header>

            <div className="px-6 mt-8 space-y-10">

                {/* Stats Grid - Gamification Componentized for interactivity */}
                <DashboardStats stats={stats} />

                {/* Hero section: Continue Reading (Expanded to 4) */}
                {bookmarks.length > 0 && (
                    <section className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 italic">Lanjutkan Membaca</h2>
                            <Link href="/library" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Library</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Primary Hero */}
                            <Link href={`/novel/${bookmarks[0].karya.id}/${bookmarks[0].last_chapter}`} className="block group md:col-span-2">
                                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100 dark:shadow-none flex gap-5 items-center group-active:scale-[0.98] transition-all border-l-4 border-l-indigo-600">
                                    <div className="w-20 h-28 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-gray-100 dark:border-slate-800">
                                        {bookmarks[0].karya.cover_url ? (
                                            <img src={bookmarks[0].karya.cover_url} alt={bookmarks[0].karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-[10px] text-gray-400 font-bold uppercase">{bookmarks[0].karya.title}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[8px] font-black bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Terakhir</span>
                                            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 leading-tight truncate">{bookmarks[0].karya.title}</h3>
                                        </div>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 font-bold mb-3 uppercase tracking-tighter">Bab {bookmarks[0].last_chapter}</p>

                                        <div className="space-y-1">
                                            <div className="flex justify-between text-[9px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter italic">
                                                <span>Progres</span>
                                                <span>{bookmarks[0].karya._count.bab > 0 ? Math.round((bookmarks[0].last_chapter / bookmarks[0].karya._count.bab) * 100) : 0}%</span>
                                            </div>
                                            <div className="h-1.5 bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${bookmarks[0].karya._count.bab > 0 ? Math.round((bookmarks[0].last_chapter / bookmarks[0].karya._count.bab) * 100) : 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mr-1 shadow-inner">
                                        <ChevronRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </Link>

                            {/* Secondary Items */}
                            {bookmarks.slice(1, 4).map((b: any) => {
                                const progress = b.karya._count.bab > 0 ? Math.round((b.last_chapter / b.karya._count.bab) * 100) : 0;
                                return (
                                    <Link key={b.id} href={`/novel/${b.karya.id}/${b.last_chapter}`} className="block group">
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-3 border border-gray-100 dark:border-slate-800 shadow-md shadow-gray-50 dark:shadow-none flex gap-4 items-center group-active:scale-[0.98] transition-all">
                                            <div className="w-12 h-16 rounded-xl overflow-hidden shadow shrink-0 border border-gray-100 dark:border-slate-800">
                                                {b.karya.cover_url ? (
                                                    <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-800" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-1">
                                                <h3 className="text-xs font-black text-gray-900 dark:text-gray-100 leading-tight truncate mb-1">{b.karya.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-[9px] text-gray-400 dark:text-gray-500 font-bold uppercase tracking-tighter">Bab {b.last_chapter}</p>
                                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                                    <p className="text-[9px] text-indigo-500 font-black uppercase tracking-tighter">{progress}%</p>
                                                </div>
                                                <div className="h-1 bg-gray-50 dark:bg-slate-800 rounded-full mt-2 overflow-hidden w-24">
                                                    <div className="h-full bg-indigo-500" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600 transition-colors" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Section: Penulis yang Diikuti (Followed Authors) */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
                                <Heart className="w-5 h-5 text-pink-600" />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">Penulis Favoritmu</h2>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {followedAuthorsRaw.length === 0 ? (
                            <div className="w-full py-8 px-6 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-slate-800 text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mb-3 uppercase tracking-tighter">Belum ada penulis yang diikuti</p>
                                <Link href="/search" className="inline-block py-2 px-6 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-colors">Temukan Penulis</Link>
                            </div>
                        ) : (
                            followedAuthorsRaw.map((f: any) => (
                                <Link key={f.following.id} href={`/profile/${f.following.username}`} className="snap-start shrink-0 flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg group-hover:border-pink-500 transition-all group-active:scale-95">
                                        {f.following.avatar_url ? (
                                            <img src={f.following.avatar_url} alt={f.following.display_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                                                <UserCircle2 className="w-8 h-8 text-gray-300" />
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[10px] font-black text-gray-900 dark:text-gray-100 text-center line-clamp-1 w-16">{f.following.display_name}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* Section: Sedang Hangat - Horizontal Scroll with premium feel */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                                <Flame className="w-5 h-5 text-orange-600" />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">Sedang Hangat</h2>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
                        {trending.map((f: any) => (
                            <Link key={f.id} href={`/novel/${f.id}`} className="snap-start shrink-0 w-36 flex flex-col gap-3 group">
                                <div className="relative aspect-[3/4.2] w-full rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 dark:border-slate-800">
                                    {f.cover_url ? (
                                        <img src={f.cover_url} alt={f.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 text-center text-xs text-gray-400 font-bold uppercase">{f.title}</div>
                                    )}
                                    <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-md text-white text-[9px] px-2 py-1 rounded-full flex items-center gap-1 font-black">
                                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                        <span>{f.avg_rating.toFixed(1)}</span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                                        <p className="text-[10px] text-white/80 font-black uppercase tracking-tighter truncate">{f.penulis_alias}</p>
                                    </div>
                                </div>
                                <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight px-1 group-hover:text-indigo-600 transition-colors">{f.title}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Section: Library Shortcuts - Compact and Light */}
                <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100 dark:shadow-none">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 italic">Perpustakaan</h2>
                        </div>
                        <Link href="/library" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all border border-gray-100 dark:border-slate-800">
                            <History className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {bookmarks.slice(0, 8).map(b => (
                            <Link key={b.id} href={`/novel/${b.karya.id}`} className="flex items-center gap-3 p-2 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group overflow-hidden">
                                <div className="w-10 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100 dark:border-slate-800">
                                    {b.karya.cover_url ? (
                                        <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight">{b.karya.title}</h4>
                                    <p className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter mt-1">Bab {b.last_chapter}</p>
                                </div>
                            </Link>
                        ))}
                        {(bookmarks.length === 0 || bookmarks.length < 8) && (
                            <Link href="/search" className="flex items-center justify-center gap-2 py-4 bg-dashed border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-3xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all group">
                                <BookOpen className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Cari Baru</span>
                            </Link>
                        )}
                    </div>
                </section>


            </div>
        </div>
    );
}
