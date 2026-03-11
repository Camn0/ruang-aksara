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
    const trending = (trendingRaw as any[]).slice(0, 8);


    return (
        <div className="min-h-screen bg-parchment-light dark:bg-parchment-dark transition-colors duration-500 pb-32 selection:bg-pine/30">
            {/* Header: Journal Header Style */}
            <header className="px-6 pt-10 pb-6 flex justify-between items-center bg-parchment/80 dark:bg-parchment-dark/80 backdrop-blur-md sticky top-0 z-30 border-b-4 border-ink-deep/10 transition-all">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-ink-deep wobbly-border-sm flex items-center justify-center text-parchment font-journal-title text-2xl rotate-[-2deg] shadow-md">
                        RA
                    </div>
                    <div>
                        <h1 className="text-2xl font-journal-title text-ink-deep leading-none">Ruang Aksara</h1>
                        <p className="font-special text-[10px] text-pine uppercase tracking-widest mt-1">Catatan Pembaca</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Link href={`/profile/${session.user.id}`} className="relative group hover:rotate-6 transition-transform">
                        <UserCircle2 className="w-9 h-9 text-ink hover:text-pine transition-all group-active:scale-90" strokeWidth={1.5} />
                    </Link>
                    <LogoutButton />
                </div>
            </header>

            <div className="px-6 mt-10 space-y-12 max-w-4xl mx-auto">

                {/* Stats Grid */}
                <DashboardStats stats={stats} />

                {/* Hero section: Continue Reading (Expanded to 4) */}
                {bookmarks.length > 0 && (
                    <section className="relative">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-3xl font-journal-title text-ink-deep flex items-center gap-2">
                                <History className="w-6 h-6 text-pine" />
                                Lanjutkan Perjalanan
                            </h2>
                            <Link href="/library" className="font-special text-xs uppercase tracking-widest text-pine hover:text-ink-deep transition-colors border-b-2 border-dotted border-pine/30 pb-0.5">Semua Catatan</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Primary Hero */}
                            <Link href={`/novel/${bookmarks[0].karya.id}/${bookmarks[0].last_chapter}`} className="block group md:col-span-2">
                                <div className="bg-paper p-6 wobbly-border paper-shadow flex gap-6 items-center group-active:scale-[0.98] transition-all border-l-8 border-l-gold rotate-[0.5deg]">
                                    <div className="w-24 h-32 wobbly-border overflow-hidden shadow-xl shrink-0 group-hover:rotate-2 transition-transform duration-500">
                                        {bookmarks[0].karya.cover_url ? (
                                            <img src={bookmarks[0].karya.cover_url} alt={bookmarks[0].karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full bg-ink/5 flex items-center justify-center p-2 text-center text-[10px] text-ink/40 font-marker uppercase">{bookmarks[0].karya.title}</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex flex-col mb-3">
                                            <span className="text-[10px] font-special bg-pine/10 text-pine px-2 py-0.5 rounded-sm uppercase tracking-widest w-fit mb-1">Membaca Sekarang</span>
                                            <h3 className="text-2xl font-journal-title text-ink-deep leading-tight truncate">{bookmarks[0].karya.title}</h3>
                                        </div>
                                        <p className="font-marker text-sm text-ink/60 mb-4 uppercase tracking-tighter">Bab {bookmarks[0].last_chapter} — Terakhir Disentuh</p>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-[10px] font-special text-pine uppercase tracking-tighter italic">
                                                <span>Kelengkapan</span>
                                                <span>{bookmarks[0].karya._count.bab > 0 ? Math.round((bookmarks[0].last_chapter / bookmarks[0].karya._count.bab) * 100) : 0}%</span>
                                            </div>
                                            <div className="h-3 bg-ink/5 wobbly-border-sm overflow-hidden border border-ink/10">
                                                <div className="h-full bg-gold transition-all duration-1000" style={{ width: `${bookmarks[0].karya._count.bab > 0 ? Math.round((bookmarks[0].last_chapter / bookmarks[0].karya._count.bab) * 100) : 0}%` }}></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-12 h-12 wobbly-border-sm bg-ink/5 flex items-center justify-center text-ink/40 group-hover:bg-gold group-hover:text-ink-deep transition-all mr-2">
                                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </Link>

                            {/* Secondary Items */}
                            {bookmarks.slice(1, 4).map((b: any) => {
                                const progress = b.karya._count.bab > 0 ? Math.round((b.last_chapter / b.karya._count.bab) * 100) : 0;
                                return (
                                    <Link key={b.id} href={`/novel/${b.karya.id}/${b.last_chapter}`} className="block group">
                                        <div className="bg-paper/60 p-4 wobbly-border-sm paper-shadow flex gap-4 items-center group-active:scale-[0.98] transition-all rotate-[-0.5deg]">
                                            <div className="w-14 h-20 wobbly-border overflow-hidden shadow-md shrink-0 border-2 border-ink/10 group-hover:rotate-[-2deg] transition-transform">
                                                {b.karya.cover_url ? (
                                                    <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full bg-ink/5" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 pr-2">
                                                <h3 className="text-base font-journal-title text-ink-deep leading-tight truncate mb-1">{b.karya.title}</h3>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-marker text-[11px] text-ink/60 uppercase tracking-tighter">Bab {b.last_chapter}</p>
                                                    <span className="w-1 h-1 bg-ink/20 rounded-full" />
                                                    <p className="font-marker text-[11px] text-pine uppercase tracking-tighter">{progress}%</p>
                                                </div>
                                                <div className="h-1.5 bg-ink/5 wobbly-border-sm mt-2 overflow-hidden w-full border border-ink/5">
                                                    <div className="h-full bg-pine/40" style={{ width: `${progress}%` }} />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-ink/20 group-hover:text-gold transition-colors" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Section: Authors */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-dried-red/10 wobbly-border-sm rotate-[3deg]">
                                <Heart className="w-6 h-6 text-dried-red" />
                            </div>
                            <h2 className="text-3xl font-journal-title text-ink-deep">Penulis Terpilih</h2>
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-6 snap-x hide-scrollbar">
                        {followedAuthorsRaw.length === 0 ? (
                            <div className="w-full py-12 px-6 bg-paper/40 wobbly-border border-dashed border-ink/20 text-center rotate-[-0.5deg]">
                                <p className="font-marker text-ink/50 mb-6 italic text-lg">"Halaman ini masih kosong. Siapa yang akan mengisinya?"</p>
                                <Link href="/search" className="inline-block py-3 px-8 bg-gold text-ink-deep wobbly-border-sm font-journal-title text-xl hover:scale-105 active:scale-95 transition-all shadow-sm">Temukan Penjaga Kata</Link>
                            </div>
                        ) : (
                            followedAuthorsRaw.map((f: any) => (
                                <Link key={f.following.id} href={`/profile/${f.following.username}`} className="snap-start shrink-0 flex flex-col items-center gap-3 group">
                                    <div className="w-20 h-20 wobbly-border p-1 bg-paper paper-shadow group-hover:rotate-6 transition-all group-active:scale-95 group-hover:border-gold">
                                        <div className="w-full h-full wobbly-border-sm overflow-hidden bg-ink/5">
                                            {f.following.avatar_url ? (
                                                <img src={f.following.avatar_url} alt={f.following.display_name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <UserCircle2 className="w-10 h-10 text-ink/20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <p className="font-marker text-sm text-ink-deep text-center line-clamp-1 w-20 leading-none">{f.following.display_name}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* Section: Trending - Large Magical Covers */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gold/10 wobbly-border-sm rotate-[-4deg]">
                                <Flame className="w-6 h-6 text-gold drop-shadow-[0_0_8px_rgba(212,184,114,0.5)]" />
                            </div>
                            <h2 className="text-3xl font-journal-title text-ink-deep">Yang Sedang Terbakar</h2>
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-10 snap-x hide-scrollbar">
                        {trending.map((f: any) => (
                            <Link key={f.id} href={`/novel/${f.id}`} className="snap-start shrink-0 w-44 flex flex-col gap-4 group">
                                <div className="relative aspect-[3/4.5] w-full wobbly-border paper-shadow overflow-hidden bg-paper group-hover:rotate-1 transition-transform duration-700">
                                    {f.cover_url ? (
                                        <img src={f.cover_url} alt={f.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                    ) : (
                                        <div className="w-full h-full bg-parchment flex items-center justify-center p-4 text-center text-xs text-ink/40 font-marker uppercase">{f.title}</div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-ink-deep/80 backdrop-blur-sm text-gold px-3 py-1 wobbly-border-sm flex items-center gap-1.5 font-special text-[11px]">
                                        <Star className="w-3 h-3 fill-gold text-gold" />
                                        <span>{f.avg_rating.toFixed(1)}</span>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink-deep/90 via-ink-deep/40 to-transparent flex flex-col justify-end p-4">
                                        <p className="font-marker text-[11px] text-parchment/70 uppercase tracking-widest truncate">{f.penulis_alias}</p>
                                    </div>
                                </div>
                                <h3 className="font-journal-title text-lg text-ink-deep line-clamp-2 leading-tight px-1 group-hover:text-pine transition-colors">{f.title}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Section: Library Shortcuts */}
                <section className="bg-paper/40 p-8 wobbly-border paper-shadow-lg rotate-1">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-7 h-7 text-pine rotate-[-12deg]" />
                            <h2 className="text-3xl font-journal-title text-ink-deep italic underline decoration-pine/20 underline-offset-8">Simpanan Lembaran</h2>
                        </div>
                        <Link href="/library" className="w-12 h-12 wobbly-border-sm bg-parchment-light flex items-center justify-center text-ink/40 hover:text-pine hover:rotate-6 transition-all border-2 border-ink/10">
                            <History className="w-6 h-6" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {bookmarks.slice(0, 8).map(b => (
                            <Link key={b.id} href={`/novel/${b.karya.id}`} className="flex items-center gap-4 p-3 bg-parchment/40 wobbly-border-sm border-2 border-transparent hover:border-pine/30 hover:bg-paper transition-all group overflow-hidden">
                                <div className="w-12 h-16 wobbly-border-sm overflow-hidden shrink-0 shadow-sm transition-transform group-hover:rotate-[-3deg]">
                                    {b.karya.cover_url ? (
                                        <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <div className="w-full h-full bg-ink/10 flex items-center justify-center text-[10px] text-ink/20 font-marker">Buku</div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-journal-title text-sm text-ink-deep line-clamp-1 leading-tight">{b.karya.title}</h4>
                                    <p className="font-marker text-[11px] text-pine uppercase tracking-widest mt-1">Bab {b.last_chapter}</p>
                                </div>
                            </Link>
                        ))}
                        {(bookmarks.length === 0 || bookmarks.length < 8) && (
                            <Link href="/search" className="flex items-center justify-center gap-3 py-6 wobbly-border-sm border-2 border-dashed border-ink/20 text-ink/40 hover:text-pine hover:border-pine/30 transition-all group bg-paper/20">
                                <BookOpen className="w-5 h-5 group-hover:rotate-[20deg] transition-transform" />
                                <span className="font-journal-title text-lg">Cari Lembar Baru</span>
                            </Link>
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
