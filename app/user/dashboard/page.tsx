import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { UserCircle2, History, Star, BookOpen, Flame, ChevronRight, Heart, Eye, Users, Check } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import DashboardContentWrapper from "./DashboardContentWrapper";
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

async function getUserStats(userId: string) {
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
        const bookmarks = await prisma.bookmark.findMany({
            where: { user_id: userId },
            select: { last_chapter: true }
        });

        if (bookmarks.length > 0) {
            const totalRead = bookmarks.reduce((acc, b) => acc + b.last_chapter, 0);
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
}

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

async function getFollowedAuthors(userId: string) {
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
}

async function DashboardStream({ userId }: { userId: string }) {
    const [bookmarksRaw, trendingRaw, stats, followedAuthorsRaw, newWorksFollowedRaw] = await Promise.all([
        getCachedUserBookmarks(userId),
        getCachedTrending(userId),
        getUserStats(userId),
        getCachedNewWorksFromFollowed(userId),
        getFollowedAuthors(userId)
    ]);

    const bookmarks = bookmarksRaw as any[];
    const trending = (trendingRaw as any[]).slice(0, 8);
    const newWorksFollowed = newWorksFollowedRaw as any[];

    // Fetch chapter titles for ALL bookmarks
    const chapterLookup = bookmarks.length > 0 ? await prisma.bab.findMany({
        where: {
            OR: bookmarks.map(b => ({
                karya_id: b.karya.id,
                chapter_no: b.last_chapter
            }))
        },
        select: { karya_id: true, chapter_no: true, title: true }
    }) : [];

    const titleMap: Record<string, string> = {};
    chapterLookup.forEach(bab => {
        titleMap[`${bab.karya_id}-${bab.chapter_no}`] = bab.title || `Bab ${bab.chapter_no}`;
    });

    const followedAuthors = followedAuthorsRaw as any[];

    return (
        <DashboardContentWrapper 
            bookmarks={bookmarks}
            trending={trending}
            stats={stats}
            followedAuthors={followedAuthors}
            newWorksFollowed={newWorksFollowed}
            titleMap={titleMap}
        />
    );
}

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/onboarding');

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark transition-colors duration-500 pb-32">
            <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-bg-cream/70 dark:bg-brown-dark/70 backdrop-blur-xl sticky top-0 z-30 border-b border-tan-light dark:border-brown-mid transition-all">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md shrink-0">
                        <Image src="/icon.png" alt="Ruang Aksara" width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h1 className="text-xl font-open-sans font-bold text-text-main dark:text-text-accent leading-none tracking-tight">Ruang Aksara</h1>
                        <p className="text-[9px] text-tan-primary font-bold uppercase tracking-widest mt-1">Dashboard Pembaca</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href={`/profile/${session.user.id}`} prefetch={false} className="relative group">
                        <UserCircle2 className="w-8 h-8 text-tan-primary group-hover:text-brown-dark transition-all group-active:scale-90" />
                    </Link>
                    <LogoutButton />
                </div>
            </header>

            <Suspense fallback={
                <div className="px-6 mt-8 animate-pulse space-y-10">
                    <div className="h-32 bg-tan-light/20 rounded-[2.5rem]" />
                    <div className="h-64 bg-tan-light/20 rounded-[2.5rem]" />
                    <div className="h-48 bg-tan-light/20 rounded-[2.5rem]" />
                </div>
            }>
                <DashboardStream userId={session.user.id} />
            </Suspense>
        </div>
    );
}