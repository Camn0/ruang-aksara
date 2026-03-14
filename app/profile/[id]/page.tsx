import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import ProfileClient from "./ProfileClient";

/**
 * Halaman Profil Pengguna (Server Component).
 */
export default async function ProfilePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    // [A] Resolving Identity
    const userProfileRaw = await prisma.user.findFirst({
        where: {
            OR: [
                { id: params.id },
                { username: params.id }
            ]
        },
        include: {
            _count: {
                select: { followers: true, following: true }
            }
        }
    });

    if (!userProfileRaw) {
        if (session?.user?.id === params.id || session?.user?.role === 'admin') {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-brown-dark flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
                    <h1 className="text-xl font-black text-gray-900 dark:text-text-accent mb-2">Sesi Tidak Valid</h1>
                    <p className="text-sm text-gray-500 dark:text-tan-light mb-8 max-w-sm mx-auto">
                        Profil Anda sudah tidak ditemukan di database.
                    </p>
                </div>
            );
        }
        return notFound();
    }

    const userProfile = userProfileRaw as (typeof userProfileRaw & {
        avatar_url: string | null;
        _count: { followers: number; following: number; };
        bio?: string | null;
        twitter_link?: string | null;
        website_link?: string | null;
        instagram_link?: string | null;
    });

    const isOwnProfile = session?.user?.id === userProfile.id;

    // [D] Fetching Follow Status
    let isFollowing = false;
    if (session?.user && !isOwnProfile) {
        const followRecord = await (prisma as any).follow.findUnique({
            where: {
                follower_id_following_id: {
                    follower_id: session.user.id,
                    following_id: userProfile.id
                }
            }
        });
        isFollowing = !!followRecord;
    }

    // [E] COMPREHENSIVE DATA FETCHING for ProfileClient
    // We fetch everything upfront to enable smooth Client-side tab switching without reloads
    const [
        followersList,
        followingList,
        userWorks,
        authorPosts,
        recentComments,
        userReviews,
        bookmarkCount
    ] = await Promise.all([
        // 1. Followers
        prisma.follow.findMany({
            where: { following_id: userProfile.id },
            include: { follower: { select: { id: true, username: true, display_name: true, avatar_url: true, role: true } } },
            orderBy: { created_at: 'desc' }
        }),
        // 2. Following
        prisma.follow.findMany({
            where: { follower_id: userProfile.id },
            include: { following: { select: { id: true, username: true, display_name: true, avatar_url: true, role: true } } },
            orderBy: { created_at: 'desc' }
        }),
        // 3. Karya (If Author)
        prisma.karya.findMany({
            where: { uploader_id: userProfile.id },
            orderBy: { total_views: 'desc' },
            include: { 
                _count: { select: { bookmarks: true, ratings: true, bab: true } },
                genres: { take: 3 }
            }
        }),
        // 4. Postingan (If Author)
        (prisma as any).authorPost.findMany({
            where: { author_id: userProfile.id },
            orderBy: { created_at: 'desc' },
            include: {
                _count: { select: { likes: true, comments: true } },
                ...(session?.user ? { likes: { where: { user_id: session.user.id } } } : {}),
                comments: { include: { user: true }, orderBy: { created_at: 'asc' }, take: 5 }
            }
        }),
        // 5. Recent Comments
        prisma.comment.findMany({
            where: { user_id: userProfile.id },
            include: { bab: { include: { karya: true } } },
            orderBy: { created_at: 'desc' },
            take: 15
        }),
        // 6. User Reviews
        prisma.review.findMany({
            where: { user_id: userProfile.id },
            include: { karya: { select: { id: true, title: true } } },
            orderBy: { created_at: 'desc' },
            take: 10
        }),
        // 7. Bookmark Count for Stats
        prisma.bookmark.count({ where: { user_id: userProfile.id } })
    ]);

    const stats = {
        bookmarks: bookmarkCount,
        reviews: userReviews.length,
        comments: recentComments.length
    };

    return (
        <ProfileClient
            userProfile={userProfile}
            isOwnProfile={isOwnProfile}
            isFollowing={isFollowing}
            followers={followersList.map(f => f.follower)}
            following={followingList.map(f => f.following)}
            works={userWorks}
            posts={authorPosts}
            comments={recentComments}
            reviews={userReviews}
            stats={stats}
            session={session}
        />
    );
}
