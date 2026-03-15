import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import ProfileClient from "./ProfileClient";

/**
 * Halaman Profil Pengguna (Server Component).
 */
const getCachedUserProfile = (id: string) => unstable_cache(
    async () => {
        return prisma.user.findFirst({
            where: {
                OR: [
                    { id: id },
                    { username: id }
                ]
            },
            select: {
                id: true,
                username: true,
                display_name: true,
                avatar_url: true,
                banner_url: true,
                bio: true,
                role: true,
                social_links: true,
                _count: {
                    select: { followers: true, following: true }
                }
            }
        });
    },
    [`user-profile-identity-${id}`],
    { revalidate: 3600, tags: [`profile-${id}`] }
)();

const getCachedFollowStatus = (followerId: string, followingId: string) =>
    unstable_cache(
        async () => (prisma as any).follow.findUnique({
            where: {
                follower_id_following_id: {
                    follower_id: followerId,
                    following_id: followingId
                }
            }
        }),
        [`follow-status-${followerId}-${followingId}`],
        { revalidate: 3600, tags: [`following-${followerId}`] }
    )();

const getCachedProfileData = (profileId: string, currentUserId?: string) => unstable_cache(
    async () => {
        return Promise.all([
            // 1. Followers
            prisma.follow.findMany({
                where: { following_id: profileId },
                select: {
                    follower: { 
                        select: { id: true, username: true, display_name: true, avatar_url: true, role: true } 
                    } 
                },
                orderBy: { created_at: 'desc' }
            }),
            // 2. Following
            prisma.follow.findMany({
                where: { follower_id: profileId },
                select: {
                    following: { 
                        select: { id: true, username: true, display_name: true, avatar_url: true, role: true } 
                    } 
                },
                orderBy: { created_at: 'desc' }
            }),
            // 3. Karya (If Author)
            prisma.karya.findMany({
                where: { uploader_id: profileId },
                orderBy: { total_views: 'desc' },
                select: {
                    id: true,
                    title: true,
                    cover_url: true,
                    avg_rating: true,
                    total_views: true,
                    penulis_alias: true,
                    deskripsi: true, 
                    is_completed: true,
                    _count: { select: { bookmarks: true, ratings: true, bab: true } },
                    genres: { 
                        take: 3,
                        select: { id: true, name: true }
                    }
                }
            }),
            // 4. Postingan (If Author)
            (prisma as any).authorPost.findMany({
                where: { author_id: profileId },
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    content: true,
                    image_url: true,
                    created_at: true,
                    _count: { select: { likes: true, comments: true } },
                    ...(currentUserId ? { likes: { where: { user_id: currentUserId } } } : {}),
                    comments: { 
                        select: {
                            id: true,
                            content: true,
                            created_at: true,
                            user: {
                                select: { id: true, username: true, display_name: true, avatar_url: true }
                            }
                        }, 
                        orderBy: { created_at: 'asc' }, 
                        take: 5 
                    }
                }
            }),
            // 5. Recent Comments
            prisma.comment.findMany({
                where: { user_id: profileId },
                select: {
                    id: true,
                    content: true,
                    created_at: true,
                    bab: {
                        select: {
                            id: true,
                            chapter_no: true,
                            karya: {
                                select: { id: true, title: true }
                            }
                        }
                    }
                },
                orderBy: { created_at: 'desc' },
                take: 15
            }),
            // 6. User Reviews
            prisma.review.findMany({
                where: { user_id: profileId },
                select: {
                    id: true,
                    content: true,
                    rating: true,
                    created_at: true,
                    karya: { select: { id: true, title: true } }
                },
                orderBy: { created_at: 'desc' },
                take: 10
            }),
            // 7. Bookmark Count for Stats
            prisma.bookmark.count({ where: { user_id: profileId } })
        ]);
    },
    [`profile-data-${profileId}-${currentUserId || 'anon'}`],
    { revalidate: 300, tags: [`profile-${profileId}`, `works-author-${profileId}`, `posts-author-${profileId}`] }
)();

/**
 * Halaman Profil Pengguna (Server Component).
 */
export default async function ProfilePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    // [A] Resolving Identity (Cached)
    const userProfileRaw = await getCachedUserProfile(params.id);

    if (!userProfileRaw) {
        if (session?.user?.id === params.id || session?.user?.role === 'admin') {
            return (
                <div className="min-h-screen bg-bg-main dark:bg-brown-dark flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
                    <h1 className="text-xl font-black text-text-main mb-2">Sesi Tidak Valid</h1>
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
        banner_url: string | null;
        _count: { followers: number; following: number; };
        bio?: string | null;
        twitter_link?: string | null;
        website_link?: string | null;
        instagram_link?: string | null;
    });

    const isOwnProfile = session?.user?.id === userProfile.id;

    // [D] Fetching Follow Status (Cached)
    let isFollowing = false;
    if (session?.user && !isOwnProfile) {
        const followRecord = await getCachedFollowStatus(session.user.id, userProfile.id);
        isFollowing = !!followRecord;
    }



    const [
        followersList,
        followingList,
        userWorks,
        authorPosts,
        recentComments,
        userReviews,
        bookmarkCount
    ] = await getCachedProfileData(userProfile.id, session?.user?.id);

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
