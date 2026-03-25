/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { UserCircle2, History, Star, BookOpen, Flame, ChevronRight, Heart, Eye, Users, Check, Sparkles, MessageSquare, Library } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";
import ThemeToggle from "@/app/components/ThemeToggle";
import StaticNotificationBell from "@/app/components/StaticNotificationBell";
import { unstable_cache } from "next/cache";
import DashboardStats from "./DashboardStats";
import { formatDistanceToNow } from 'date-fns';
import { id as localeID } from 'date-fns/locale';

const getCachedTrending = (userId: string) => unstable_cache(
    async () => {
        return prisma.karya.findMany({
            where: { bab: { some: {} } },
            orderBy: { total_views: 'desc' },
            select: {
                id: true,
                title: true,
                cover_url: true,
                penulis_alias: true,
                avg_rating: true,
                total_views: true,
                _count: { select: { bab: true } },
                bookmarks: {
                    where: { user_id: userId },
                    select: { last_chapter: true }
                }
            },
            take: 10
        });
    },
    [`global-trending-dashboard-v2-${userId}`],
    { revalidate: 3600, tags: ['karya-global'] }
)();

const getCachedUserBookmarks = (userId: string) => unstable_cache(
    async () => prisma.bookmark.findMany({
        where: { user_id: userId },
        select: {
            id: true,
            last_chapter: true,
            updated_at: true,
            karya: {
                select: {
                    id: true,
                    title: true,
                    cover_url: true,
                    penulis_alias: true,
                    avg_rating: true,
                    total_views: true,
                    is_completed: true,
                    _count: { select: { bab: true } },
                    genres: {
                        take: 2,
                        select: { id: true, name: true }
                    },
                    ratings: {
                        where: { user_id: userId },
                        select: { score: true }
                    }
                }
            }
        },
        orderBy: { updated_at: 'desc' },
        take: 10
    }),
    [`dashboard-bookmarks-v2-${userId}`],
    { revalidate: 60, tags: [`library-${userId}`] }
)();

const getCachedUserStats = (userId: string) => unstable_cache(
    async () => {
        let stats = await (prisma as any).userStats.findUnique({
            where: { user_id: userId }
        });

        if (!stats) {
            stats = await (prisma as any).userStats.create({
                data: { 
                    user_id: userId, 
                    points: 0, 
                    reading_streak: 0, 
                    total_chapters_read: 0 
                }
            });
        }

        if (stats.total_chapters_read === 0) {
            const bookmarksAggregate = await prisma.bookmark.aggregate({
                where: { user_id: userId },
                _sum: { last_chapter: true }
            });

            const totalRead = bookmarksAggregate._sum.last_chapter || 0;

            if (totalRead > 0) {
                const initialPoints = totalRead * 10;

                stats = await (prisma as any).userStats.update({
                    where: { user_id: userId },
                    data: {
                        total_chapters_read: totalRead,
                        points: initialPoints,
                        last_read_at: new Date(),
                        reading_streak: 1
                    }
                });
            }
        }
        
        return stats;
    },
    [`user-stats-${userId}`],
    { revalidate: 3600, tags: [`stats-${userId}`] }
)();

const getCachedNewWorksFromFollowed = (userId: string) => unstable_cache(
    async () => {
        const following = await prisma.follow.findMany({
            where: { follower_id: userId },
            select: { following_id: true }
        });
        
        const followingIds = following.map(f => f.following_id);
        if (followingIds.length === 0) return [];
        
        return prisma.karya.findMany({
            where: { uploader_id: { in: followingIds } },
            select: {
                id: true,
                title: true,
                cover_url: true,
                penulis_alias: true,
                avg_rating: true,
                total_views: true,
                is_completed: true,
                _count: { select: { bab: true } },
                genres: {
                    take: 2,
                    select: { id: true, name: true }
                },
                bookmarks: {
                    where: { user_id: userId },
                    select: { last_chapter: true }
                }
            },
            orderBy: { id: 'desc' },
            take: 10
        });
    },
    [`new-works-followed-v2-${userId}`],
    { revalidate: 3600, tags: [`following-${userId}`] }
)();

const getCachedAuthorPosts = (userId: string) => unstable_cache(
    async () => {
        const following = await prisma.follow.findMany({
            where: { follower_id: userId },
            select: { following_id: true }
        });
        
        const followingIds = following.map(f => f.following_id);
        if (followingIds.length === 0) return [];
        
        return (prisma as any).authorPost.findMany({
            where: { author_id: { in: followingIds } },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                content: true,
                image_url: true,
                created_at: true,
                author: {
                    select: {
                        id: true,
                        username: true,
                        display_name: true,
                        avatar_url: true
                    }
                },
                _count: { select: { likes: true, comments: true } }
            },
            take: 5
        });
    },
    [`dashboard-author-posts-${userId}`],
    { revalidate: 300, tags: [`following-${userId}`] }
)();

const getCachedFollowedAuthors = (userId: string) => unstable_cache(
    async () => {
        return prisma.follow.findMany({
            where: { follower_id: userId },
            select: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        display_name: true,
                        avatar_url: true,
                        _count: { select: { followers: true } }
                    }
                }
            },
            take: 10
        });
    },
    [`dashboard-followed-authors-${userId}`],
    { revalidate: 3600, tags: [`following-${userId}`] }
)();

const getCachedChapterTitles = (userId: string, lookupKeys: string[]) => unstable_cache(
    async () => {
        if (lookupKeys.length === 0) return [];
        const conditions = lookupKeys.map(key => {
            const [karya_id, chapter_no] = key.split(':');
            return { karya_id, chapter_no: Number(chapter_no) };
        });
        return prisma.bab.findMany({
            where: { OR: conditions },
            select: { karya_id: true, chapter_no: true, title: true }
        });
    },
    [`dashboard-chapter-titles-list-${userId}-${lookupKeys.sort().join(',')}`],
    { revalidate: 3600, tags: [`library-${userId}`] }
)();

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/onboarding');

    const [bookmarksRaw, trendingRaw, stats, followedAuthorsRaw, newWorksFollowedRaw, authorPostsRaw] = await Promise.all([
        getCachedUserBookmarks(session.user.id),
        getCachedTrending(session.user.id),
        getCachedUserStats(session.user.id),
        getCachedFollowedAuthors(session.user.id),
        getCachedNewWorksFromFollowed(session.user.id),
        getCachedAuthorPosts(session.user.id)
    ]);

    const bookmarks = bookmarksRaw as any[];
    const trending = (trendingRaw as any[]).slice(0, 8);
    const newWorksFollowed = newWorksFollowedRaw as any[];
    const authorPosts = authorPostsRaw as any[];

    // Fetch chapter titles for ALL bookmarks
    const lookupKeys = bookmarks.map(b => `${b.karya.id}:${b.last_chapter}`);
    const chapterLookup = await getCachedChapterTitles(session.user.id, lookupKeys);

    const titleMap: Record<string, string> = {};
    chapterLookup.forEach(bab => {
        titleMap[`${bab.karya_id}-${bab.chapter_no}`] = bab.title || `Bab ${bab.chapter_no}`;
    });

    const getChapterTitle = (karyaId: string, chapterNo: number) => 
        titleMap[`${karyaId}-${chapterNo}`] || `Bab ${chapterNo}`;

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark transition-colors duration-500 pb-32">
            <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-bg-cream/70 dark:bg-brown-dark/70 backdrop-blur-xl sticky top-0 z-30 border-b border-tan-light dark:border-brown-mid transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0">
                        <Image src="/icon.png" alt="Ruang Aksara" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-open-sans font-black text-text-main dark:text-text-accent leading-none tracking-tight italic uppercase">Beranda Pembaca</h1>
                        <p className="text-[9px] text-tan-primary font-bold uppercase tracking-widest mt-1">Jelajahi Mahakarya</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <StaticNotificationBell />
                    <ThemeToggle />
                    <LogoutButton />
                </div>
            </header>

            <div className="px-6 mt-8 space-y-10">
                <DashboardStats stats={stats} />

                {/* HERO: Lanjutkan Membaca */}
                {bookmarks.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-open-sans font-bold text-text-main dark:text-text-accent italic">Lanjutkan Membaca</h2>
                            <Link href="/library" prefetch={false} className="text-[10px] font-bold uppercase tracking-widest text-tan-primary hover:text-brown-dark dark:hover:text-text-accent">Perpustakaan</Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(() => {
                                const hero = bookmarks[0];
                                const hasNext = hero.last_chapter < hero.karya._count.bab;
                                const timeStr = new Date(hero.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                                
                                return (
                                    <Link href={`/novel/${hero.karya.id}/${hero.last_chapter}`} prefetch={false} className="block group md:col-span-2">
                                        <div className="bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[2.5rem] p-5 border border-tan-light/20 dark:border-brown-mid shadow-2xl flex flex-col sm:flex-row gap-6 group-active:scale-[0.98] transition-all relative overflow-hidden backdrop-blur-sm">
                                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-tan-primary/5 rounded-full blur-3xl" />
                                            <div className="w-28 sm:w-32 aspect-[3/4.2] rounded-2xl overflow-hidden shadow-2xl shrink-0 border border-tan-light/50 dark:border-brown-mid relative z-10">
                                                {hero.karya.cover_url ? <Image src={hero.karya.cover_url} width={128} height={180} sizes="(max-width: 640px) 112px, 128px" priority className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="w-full h-full bg-tan-light/20 flex items-center justify-center font-bold uppercase">{hero.karya.title}</div>}
                                                <div className="absolute top-2 left-2 bg-brown-dark/60 backdrop-blur-md text-text-accent text-[7px] px-1.5 py-0.5 rounded-md font-black">{hero.karya.is_completed ? 'TAMAT' : 'ONGOING'}</div>
                                            </div>
                                            <div className="flex-1 flex flex-col py-1 relative z-10">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[7px] font-black bg-tan-primary text-text-accent px-2 py-0.5 rounded-full uppercase tracking-widest">Terakhir Dibaca</span>
                                                    <span className="text-[7px] font-bold text-brown-mid/60 dark:text-text-accent/80 uppercase tracking-widest italic">
                                                        {formatDistanceToNow(new Date(hero.updated_at), { addSuffix: true, locale: localeID })}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-black text-text-main dark:text-text-accent mb-1 group-hover:text-tan-primary transition-colors line-clamp-1">{hero.karya.title}</h3>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <p className="text-[10px] text-tan-primary font-black uppercase tracking-widest">{hero.karya.penulis_alias}</p>
                                                    <span className="w-1 h-1 bg-tan-light rounded-full" />
                                                    <div className="flex gap-1">{(hero.karya.genres || []).map((g: any) => <span key={g.id} className="text-[8px] text-brown-mid/60 dark:text-text-accent/60 font-bold uppercase border border-tan-light dark:border-brown-mid px-1.5 rounded-md">{g.name}</span>)}</div>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2 mb-4">
                                                    <div className="flex items-center gap-1"><Star className="w-2.5 h-2.5 text-tan-primary fill-tan-primary" /><span className="text-[10px] font-black dark:text-text-accent">{hero.karya.avg_rating.toFixed(1)}</span></div>
                                                    <div className="flex items-center gap-1"><Eye className="w-2.5 h-2.5 text-brown-mid/40 dark:text-text-accent/40" /><span className="text-[10px] font-bold opacity-60 dark:text-text-accent">{hero.karya.total_views > 1000 ? `${(hero.karya.total_views/1000).toFixed(1)}k` : hero.karya.total_views}</span></div>
                                                    <div className="flex items-center gap-1"><BookOpen className="w-2.5 h-2.5 text-brown-mid/40 dark:text-text-accent/40" /><span className="text-[10px] font-bold opacity-60 dark:text-text-accent">{hero.karya._count.bab} Bab</span></div>
                                                </div>
                                                <div className="mt-auto space-y-2">
                                                    <div className="flex justify-between items-end">
                                                        <div><p className="text-[8px] font-black uppercase tracking-widest text-brown-mid/40 dark:text-text-accent/40 mb-1">Status Membaca</p><p className="text-xs font-black text-tan-primary">{getChapterTitle(hero.karya.id, hero.last_chapter)}</p></div>
                                                        <div className="text-right"><p className="text-[8px] font-black uppercase tracking-widest text-brown-mid/40 dark:text-text-accent/40 mb-1">Progres</p><p className="text-xs font-black italic dark:text-text-accent">{hero.last_chapter} / {hero.karya._count.bab}</p></div>
                                                    </div>
                                                    <div className="h-2 bg-tan-light/30 dark:bg-brown-mid/30 rounded-full overflow-hidden">
                                                        <div className="h-full bg-tan-primary transition-all duration-1000" style={{ width: `${(hero.last_chapter / hero.karya._count.bab) * 100}%` }} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="shrink-0 flex flex-col justify-center items-center gap-2 relative z-10"><div className="w-12 h-12 rounded-2xl bg-tan-light/20 dark:bg-brown-mid/40 flex items-center justify-center text-tan-primary group-hover:bg-tan-primary group-hover:text-text-accent transition-all"><ChevronRight className="w-6 h-6" /></div>{hasNext && <div className="bg-tan-primary/10 text-tan-primary text-[7px] font-black px-2 py-1 rounded-full animate-bounce">Bab Selanjutnya tersedia!</div>}</div>
                                        </div>
                                    </Link>
                                );
                            })()}

                            {/* Secondary Reading Cards */}
                            {bookmarks.slice(1, 4).map((b: any) => {
                                const hasNext = b.last_chapter < b.karya._count.bab;
                                return (
                                    <Link key={b.id} href={`/novel/${b.karya.id}/${b.last_chapter}`} prefetch={false} className="block group">
                                        <div className="bg-bg-cream/30 dark:bg-brown-dark/30 rounded-3xl p-4 border border-tan-light/20 dark:border-brown-mid shadow-lg flex flex-col gap-4 group-active:scale-[0.98] transition-all relative border-l-4 border-l-tan-primary backdrop-blur-sm">
                                            <div className="flex gap-4 items-start">
                                                <div className="w-16 h-24 rounded-xl overflow-hidden shadow-md shrink-0 border border-tan-light/50 dark:border-brown-mid relative">
                                                    {b.karya.cover_url ? <Image src={b.karya.cover_url} width={64} height={96} sizes="64px" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" /> : <div className="w-full h-full bg-tan-light/10" />}
                                                    <div className="absolute top-1 left-1 bg-brown-dark/60 backdrop-blur-md text-text-accent text-[6px] px-1 py-0.5 rounded-sm font-black uppercase">{b.karya.is_completed ? 'TAMAT' : 'ONGOING'}</div>
                                                </div>
                                                <div className="flex-1 min-w-0 py-0.5">
                                                    <h3 className="text-sm font-black text-text-main dark:text-text-accent truncate mb-1 group-hover:text-tan-primary transition-colors">{b.karya.title}</h3>
                                                    <div className="flex items-center gap-1.5 mb-2">
                                                        <p className="text-[8px] text-tan-primary font-black uppercase tracking-widest truncate">{b.karya.penulis_alias}</p>
                                                        <span className="w-0.5 h-0.5 bg-tan-light rounded-full" />
                                                        <p className="text-[8px] text-brown-mid/60 dark:text-text-accent/80 font-bold uppercase truncate max-w-[40px]">{b.karya.genres?.[0]?.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="text-[6px] font-black bg-tan-primary/10 text-tan-primary px-1.5 py-0.5 rounded shadow-sm border border-tan-primary/10 uppercase tracking-widest truncate">
                                                            {formatDistanceToNow(new Date(b.updated_at), { addSuffix: true, locale: localeID })}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-3 items-center">
                                                        <div className="flex items-center gap-0.5 text-tan-primary"><Star className="w-2.5 h-2.5 fill-tan-primary" /><span className="text-[9px] font-black dark:text-text-accent">{b.karya.avg_rating.toFixed(1)}</span></div>
                                                        <div className="flex items-center gap-0.5 text-brown-mid/40 dark:text-text-accent/40"><Eye className="w-2.5 h-2.5" /><span className="text-[9px] font-bold dark:text-text-accent">{b.karya.total_views > 1000 ? `${(b.karya.total_views/1000).toFixed(1)}k` : b.karya.total_views}</span></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-end"><p className="text-[10px] font-black text-tan-primary truncate max-w-[70%]">{getChapterTitle(b.karya.id, b.last_chapter)}</p><p className="text-[9px] font-black italic opacity-60 shrink-0">{b.last_chapter} / {b.karya._count.bab}</p></div>
                                                <div className="h-1.5 bg-tan-light/20 dark:bg-brown-mid/30 rounded-full overflow-hidden w-full"><div className="h-full bg-tan-primary transition-all duration-500" style={{ width: `${(b.last_chapter / b.karya._count.bab) * 100}%` }} /></div>
                                                {hasNext && <div className="text-[7px] font-black text-tan-primary italic animate-pulse">Bab Baru Tersedia!</div>}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Followed Authors Section */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-tan-light/50 dark:bg-brown-mid/40 rounded-xl"><Heart className="w-5 h-5 text-brown-dark dark:text-text-accent" /></div>
                            <h2 className="text-lg font-open-sans font-bold text-text-main dark:text-text-accent">Penulis Favoritmu</h2>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar scrollbar-hide">
                        {followedAuthorsRaw.length === 0 ? (
                            <div className="w-full py-8 px-6 bg-tan-light/20 rounded-[2.5rem] border border-dashed border-tan-light text-center">
                                <p className="text-xs text-tan-primary font-bold mb-3 uppercase tracking-tighter">Belum ada penulis yang diikuti</p>
                                <Link href="/search" prefetch={false} className="inline-block py-2 px-6 bg-tan-light/30 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-tan-light transition-all">Temukan Penulis</Link>
                            </div>
                        ) : (
                            followedAuthorsRaw.map((f: any) => (
                                <Link key={f.following.id} href={`/profile/${f.following.username}`} prefetch={false} className="shrink-0 flex flex-col items-center gap-2 group">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-tan-light dark:border-brown-mid group-hover:border-tan-primary transition-all relative">
                                        {f.following.avatar_url ? <Image src={f.following.avatar_url} width={64} height={64} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full bg-tan-light/20 flex items-center justify-center"><UserCircle2 className="w-8 h-8 text-tan-primary" /></div>}
                                        <div className="absolute bottom-0 inset-x-0 bg-brown-dark/60 backdrop-blur-[2px] py-0.5 flex items-center justify-center gap-1"><Users className="w-2 h-2 text-text-accent" /><span className="text-[7px] font-black text-text-accent">{f.following._count.followers}</span></div>
                                    </div>
                                    <p className="text-[10px] font-bold text-text-main dark:text-text-accent text-center line-clamp-1 w-16">{f.following.display_name}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* NEW WORKS: Karya Terbaru Penulis Diikuti */}
                {newWorksFollowed.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-tan-light/50 dark:bg-brown-mid/40 rounded-xl"><BookOpen className="w-5 h-5 text-brown-dark dark:text-text-accent" /></div>
                                <h2 className="text-lg font-open-sans font-bold text-text-main dark:text-text-accent">Karya Terbaru Penulis</h2>
                            </div>
                            <span className="text-[10px] font-black text-tan-primary bg-tan-primary/10 px-3 py-1 rounded-full uppercase tracking-widest border border-tan-primary/20">Update</span>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar scrollbar-hide">
                            {newWorksFollowed.map((f: any) => (
                                <Link key={f.id} href={`/novel/${f.id}`} prefetch={false} className="shrink-0 w-44 flex flex-col gap-3 group">
                                    <div className="relative aspect-[3/4.2] w-full rounded-[2.5rem] overflow-hidden shadow-xl border border-tan-light/30 dark:border-brown-mid/40 transition-all duration-500">
                                        {f.cover_url ? <Image src={f.cover_url} width={176} height={246} sizes="176px" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="w-full h-full bg-tan-light/20 flex items-center justify-center p-4 text-center text-xs text-tan-primary font-bold uppercase">{f.title}</div>}
                                        <div className="absolute top-3 inset-x-3 flex justify-between items-start">
                                            <div className="bg-brown-dark/70 backdrop-blur-md text-text-accent text-[8px] px-2.5 py-1 rounded-full flex items-center gap-1 font-black border border-white/10"><Star className="w-2.5 h-2.5 fill-tan-primary text-tan-primary" /><span>{f.avg_rating.toFixed(1)}</span></div>
                                            <div className="bg-tan-primary/90 backdrop-blur-md text-text-accent text-[8px] px-2.5 py-1 rounded-full flex items-center gap-1 font-black border border-white/10"><Eye className="w-2.5 h-2.5" /><span>{f.total_views > 1000 ? `${(f.total_views/1000).toFixed(1)}k` : f.total_views}</span></div>
                                        </div>
                                        <div className="absolute inset-x-0 bottom-0 min-h-[50%] bg-gradient-to-t from-brown-dark/95 via-brown-dark/50 to-transparent flex flex-col justify-end p-5">
                                            <div className="flex items-center gap-1.5 mb-1"><p className="text-[9px] text-tan-primary font-black uppercase tracking-widest truncate">{f.penulis_alias}</p><span className="w-1 h-1 bg-text-accent/30 rounded-full" /><p className="text-[9px] text-text-accent font-bold uppercase tracking-widest">{f.is_completed ? 'TAMAT' : 'ONGOING'}</p></div>
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="flex gap-1">{(f.genres || []).slice(0, 1).map((g: any) => <span key={g.id} className="text-[7px] text-text-accent/60 font-bold uppercase border border-white/10 px-2 py-0.5 rounded-sm">{g.name}</span>)}<span className="text-[7px] text-text-accent/60 font-bold uppercase border border-white/10 px-2 py-0.5 rounded-sm">{f._count.bab} Bab</span></div>
                                                {f.bookmarks?.[0] && (
                                                    <p className="text-[8px] font-black text-tan-primary italic">{f.bookmarks[0].last_chapter} / {f._count.bab}</p>
                                                )}
                                            </div>
                                            {f.bookmarks?.[0] && (
                                                <div className="h-1 bg-tan-primary/20 rounded-full overflow-hidden w-full">
                                                    <div className="h-full bg-tan-primary transition-all duration-1000" style={{ width: `${(f.bookmarks[0].last_chapter / f._count.bab) * 100}%` }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-black text-text-main dark:text-text-accent line-clamp-1 group-hover:text-tan-primary transition-colors">{f.title}</h3>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* AUTHOR POSTS: Catatan Penulis */}
                {authorPosts.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-tan-light/50 dark:bg-brown-mid/40 rounded-xl"><Sparkles className="w-5 h-5 text-brown-dark dark:text-text-accent" /></div>
                                <h2 className="text-lg font-open-sans font-bold text-text-main dark:text-text-accent">Catatan Penulis</h2>
                            </div>
                        </div>
                        <div className="flex gap-5 overflow-x-auto pb-6 hide-scrollbar scrollbar-hide">
                            {authorPosts.map((post: any) => (
                                <Link key={post.id} href={`/profile/${post.author.username}`} prefetch={false} className="shrink-0 w-72 flex flex-col gap-3 group">
                                    <div className="bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[2rem] p-5 border border-tan-light/20 dark:border-brown-mid shadow-lg group-active:scale-[0.98] transition-all relative overflow-hidden backdrop-blur-sm h-full flex flex-col">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-8 h-8 rounded-xl overflow-hidden border border-tan-light/50 dark:border-brown-mid shrink-0">
                                                {post.author.avatar_url ? (
                                                    <Image src={post.author.avatar_url} width={32} height={32} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full bg-tan-light/10 flex items-center justify-center"><UserCircle2 className="w-4 h-4 text-tan-primary" /></div>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black text-text-main dark:text-text-accent uppercase tracking-tight truncate">{post.author.display_name}</p>
                                                <p className="text-[8px] text-tan-primary font-bold uppercase tracking-widest">
                                                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: localeID })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[12px] text-text-main/80 dark:text-text-accent/80 line-clamp-3 italic font-medium leading-relaxed mb-4">
                                                "{post.content}"
                                            </p>
                                            {post.image_url && (
                                                <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-tan-light/20 dark:border-brown-mid/40 mb-3">
                                                    <Image src={post.image_url} fill className="object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 pt-3 border-t border-tan-light/20 dark:border-brown-mid/40 mt-auto">
                                            <div className="flex items-center gap-1.5 text-tan-primary"><Heart className="w-3 h-3" /><span className="text-[9px] font-black">{post._count.likes}</span></div>
                                            <div className="flex items-center gap-1.5 text-brown-mid/40 dark:text-text-accent/40"><MessageSquare className="w-3 h-3" /><span className="text-[9px] font-black">{post._count.comments}</span></div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* TRENDING: Sedang Hangat */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-tan-light/50 dark:bg-brown-mid/40 rounded-xl"><Flame className="w-5 h-5 text-brown-dark dark:text-text-accent" /></div>
                            <h2 className="text-lg font-open-sans font-bold text-text-main dark:text-text-accent">Sedang Hangat</h2>
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 hide-scrollbar scrollbar-hide">
                        {trending.map((f: any) => (
                            <Link key={f.id} href={`/novel/${f.id}`} prefetch={false} className="shrink-0 w-36 flex flex-col gap-3 group">
                                <div className="relative aspect-[3/4.2] w-full rounded-[2.5rem] overflow-hidden shadow-lg border border-tan-light/30 dark:border-brown-mid/40">
                                    {f.cover_url ? <Image src={f.cover_url} width={144} height={200} sizes="144px" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" /> : <div className="w-full h-full bg-tan-light/20 flex items-center justify-center p-4 text-center text-xs text-tan-primary font-bold uppercase">{f.title}</div>}
                                    <div className="absolute top-3 inset-x-3 flex justify-between items-start">
                                        <div className="bg-brown-dark/60 backdrop-blur-md text-text-accent text-[8px] px-2 py-1 rounded-full flex items-center gap-1 font-black shadow-lg"><Star className="w-2 h-2 fill-tan-primary text-tan-primary" /><span>{f.avg_rating.toFixed(1)}</span></div>
                                        <div className="bg-tan-primary/90 backdrop-blur-md text-text-accent text-[8px] px-2 py-1 rounded-full flex items-center gap-1 font-black shadow-lg"><Eye className="w-2 h-2" /><span>{f.total_views > 1000 ? `${(f.total_views/1000).toFixed(1)}k` : f.total_views}</span></div>
                                    </div>
                                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-brown-dark/95 via-brown-dark/40 to-transparent flex flex-col justify-end p-4">
                                        <div className="flex items-center gap-1.5 truncate mb-1"><p className="text-[8px] text-text-accent font-bold uppercase tracking-widest truncate">{f.penulis_alias}</p><span className="w-1 h-1 bg-text-accent/30 rounded-full" /><p className="text-[8px] text-text-accent font-bold uppercase tracking-widest shrink-0">{f._count.bab} Bab</p></div>
                                        {f.bookmarks?.[0] && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between items-center text-[7px] font-black text-tan-primary italic">
                                                    <span>Progres</span>
                                                    <span>{f.bookmarks[0].last_chapter} / {f._count.bab}</span>
                                                </div>
                                                <div className="h-1 bg-tan-primary/20 rounded-full overflow-hidden w-full">
                                                    <div className="h-full bg-tan-primary transition-all duration-700" style={{ width: `${(f.bookmarks[0].last_chapter / f._count.bab) * 100}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {f.total_views > 5000 && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"><div className="bg-brown-dark/80 backdrop-blur-xl p-3 rounded-full border border-white/20 scale-0 group-hover:scale-100 transition-transform duration-500"><Flame className="w-6 h-6 text-tan-primary animate-pulse" /></div></div>}
                                </div>
                                <h3 className="text-sm font-bold text-text-main dark:text-text-accent line-clamp-1 group-hover:text-tan-primary transition-colors">{f.title}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}