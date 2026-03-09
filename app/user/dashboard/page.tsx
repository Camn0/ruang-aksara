import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCircle2, Sparkles, History, Star, BookOpen, Flame, Trophy, TrendingUp, ChevronRight } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";
import { unstable_cache } from "next/cache";

/**
 * Global cache untuk daftar karya yang baru diupdate.
 */
const getCachedRecentlyUpdated = unstable_cache(
    async () => {
        return prisma.karya.findMany({
            where: { bab: { some: {} } },
            include: {
                bab: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                    select: { created_at: true }
                }
            },
            orderBy: { bab: { _count: 'desc' } },
            take: 10
        });
    },
    ['global-recently-updated'],
    { revalidate: 600, tags: ['karya-global'] }
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
    let stats = await prisma.userStats.findUnique({
        where: { user_id: userId }
    });

    if (!stats) {
        stats = await prisma.userStats.create({
            data: { user_id: userId, points: 0, reading_streak: 0, total_chapters_read: 0 }
        });
    }
    return stats;
}

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/onboarding');
    }

    // Paralelkan pengambilan data
    const [bookmarksRaw, recentlyUpdatedRaw, stats] = await Promise.all([
        getCachedUserBookmarks(session.user.id),
        getCachedRecentlyUpdated(),
        getUserStats(session.user.id)
    ]);

    const bookmarks = bookmarksRaw as any[];

    // Hero: Most recently read
    const lastRead = bookmarks[0];

    // Recently Updated logic
    const recentlyUpdated = (recentlyUpdatedRaw as any[]).sort((a, b) => {
        const aDate = a.bab?.[0]?.created_at ? new Date(a.bab[0].created_at).getTime() : 0;
        const bDate = b.bab?.[0]?.created_at ? new Date(b.bab[0].created_at).getTime() : 0;
        return bDate - aDate;
    }).slice(0, 8);

    // Calculate Level
    const level = Math.floor(Math.sqrt(stats.points / 10)) + 1;
    const nextLevelPoints = Math.pow(level, 2) * 10;
    const progressToNextLevel = Math.min(100, Math.round((stats.points / nextLevelPoints) * 100));

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 transition-colors duration-500 pb-32">
            {/* Header with Glassmorphism */}
            <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-100 dark:border-slate-800 transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-indigo-200 dark:shadow-none">
                        RA
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none tracking-tight">Ruang Aksara</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 uppercase tracking-tighter">Level {level}</span>
                            <div className="w-16 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-amber-400" style={{ width: `${progressToNextLevel}%` }}></div>
                            </div>
                        </div>
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

                {/* Stats Grid - Gamification */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-5 text-white shadow-xl shadow-orange-100 dark:shadow-none relative overflow-hidden group">
                        <Flame className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Streak</p>
                        <div className="flex items-end gap-1">
                            <span className="text-3xl font-black">{stats.reading_streak}</span>
                            <span className="text-sm font-bold mb-1 opacity-80">Hari</span>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group">
                        <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
                        <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Poin</p>
                        <div className="flex items-end gap-1">
                            <span className="text-3xl font-black">{stats.points}</span>
                            <span className="text-sm font-bold mb-1 opacity-80">Pts</span>
                        </div>
                    </div>
                </div>

                {/* Hero section: Continue Reading */}
                {lastRead && (
                    <section className="relative">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 italic">Terakhir Dibaca</h2>
                        </div>
                        <Link href={`/novel/${lastRead.karya.id}/${lastRead.last_chapter}`} className="block group">
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100 dark:shadow-none flex gap-5 items-center group-active:scale-[0.98] transition-all">
                                <div className="w-24 h-32 rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-gray-100 dark:border-slate-800">
                                    {lastRead.karya.cover_url ? (
                                        <img src={lastRead.karya.cover_url} alt={lastRead.karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-[10px] text-gray-400 font-bold uppercase">{lastRead.karya.title}</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 leading-tight line-clamp-2 mb-1">{lastRead.karya.title}</h3>
                                    <p className="text-xs text-gray-400 dark:text-gray-500 font-bold mb-3 uppercase tracking-tighter">Bab {lastRead.last_chapter}</p>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-tighter italic">
                                            <span>Progress</span>
                                            <span>{lastRead.karya._count.bab > 0 ? Math.round((lastRead.last_chapter / lastRead.karya._count.bab) * 100) : 0}%</span>
                                        </div>
                                        <div className="h-2 bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden p-[2px]">
                                            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full shadow-sm" style={{ width: `${lastRead.karya._count.bab > 0 ? Math.round((lastRead.last_chapter / lastRead.karya._count.bab) * 100) : 0}%` }}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all mr-2">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>
                        </Link>
                    </section>
                )}

                {/* Section: Baru Diupdate - Horizontal Scroll with premium feel */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                                <Sparkles className="w-5 h-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">Update Terbaru</h2>
                        </div>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-6 snap-x hide-scrollbar">
                        {recentlyUpdated.map((f: any) => (
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

                {/* Section: Library Shortcuts */}
                <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-6 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100 dark:shadow-none">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-black text-gray-900 dark:text-gray-100 italic">Koleksi Anda</h2>
                        <Link href="/library" className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all">
                            <History className="w-5 h-5" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {bookmarks.slice(1, 5).map(b => (
                            <Link key={b.id} href={`/novel/${b.karya.id}`} className="flex items-center gap-3 p-2 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/50 transition-all group">
                                <div className="w-12 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                    {b.karya.cover_url ? (
                                        <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full bg-slate-200 dark:bg-slate-700" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="text-xs font-black text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight">{b.karya.title}</h4>
                                    <p className="text-[9px] font-bold text-gray-400 dark:text-gray-500 mt-0.5 uppercase tracking-tighter">Bab {b.last_chapter}</p>
                                </div>
                            </Link>
                        ))}
                        {bookmarks.length < 5 && (
                            <Link href="/search" className="flex items-center justify-center gap-2 p-4 bg-dashed border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-200 transition-all group">
                                <BookOpen className="w-4 h-4" />
                                <span className="text-xs font-black uppercase tracking-tighter">Cari Baru</span>
                            </Link>
                        )}
                    </div>
                </section>

                {/* Personalized Recommendation Placeholder or Author Spotlight */}
                <section className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[3rem] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 -mr-32 -mt-32"></div>
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black italic mb-2 leading-none">Temukan Dunia Baru</h2>
                        <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-6">Rekomendasi Spesial Untukmu</p>

                        <div className="bg-white/10 backdrop-blur-md rounded-[2rem] p-5 border border-white/10">
                            <p className="text-sm italic text-indigo-100 leading-relaxed mb-4">"Membaca adalah tiket gratis untuk berkeliling dunia tanpa harus beranjak dari tempat duduk."</p>
                            <Link href="/search" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-indigo-950/20">
                                Jelajahi <Sparkles className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}
