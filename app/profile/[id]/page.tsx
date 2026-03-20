import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import ProfileClient from "./ProfileClient";
import { revalidatePath } from "next/cache";

export const dynamic = 'force-dynamic';

/**
 * ProfilePage (Server Component):
 * The central hub for user identity, social interactions, and author portfolio.
 * 
 * Architecture Patterns:
 * 1. Intelligent Caching: Uses 'unstable_cache' with specific tags (`profile-${id}`, `following-${id}`) 
 *    to allow granular revalidation via Server Actions.
 * 2. Parallel Data Fetching: Aggregates multiple Prisma queries into 'Promise.all' within a cached 
 *    wrapper to minimize Time-to-First-Byte (TTFB).
 * 3. Identity Resolution: Supports both UUID and Username-based routing for SEO-friendly URLs.
 */

// --- CACHED DATA FETCHERS ---

/**
 * getCachedUserProfile:
 * Fetches the core identity of a user.
 * Tags: `profile-${id}` allows 'updateUserProfile' to flush this cache upon metadata changes.
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

/**
 * getCachedFollowStatus:
 * Determines the 'friendship' edge between the viewer and the profile owner.
 * Tags: `following-${followerId}` allows 'toggleFollow' to flush this specifically.
 */
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

/**
 * getCachedProfileData:
 * A mega-aggregator for profile-specific content (Works, Posts, Comments, Reviews).
 * Logic:
 * - Aggregates 7 distinct queries into a single cacheable unit.
 * - Handles conditional 'like' status for the current viewer in author posts.
 */
const getCachedProfileData = (profileId: string, currentUserId?: string) => unstable_cache(
    async () => {
        return Promise.all([
            // 1. Followers List: The community backbone.
            prisma.follow.findMany({
                where: { following_id: profileId },
                select: {
                    follower: { 
                        select: { id: true, username: true, display_name: true, avatar_url: true, role: true } 
                    } 
                },
                orderBy: { created_at: 'desc' }
            }),
            // 2. Following List: The user's interests.
            prisma.follow.findMany({
                where: { follower_id: profileId },
                select: {
                    following: { 
                        select: { id: true, username: true, display_name: true, avatar_url: true, role: true } 
                    } 
                },
                orderBy: { created_at: 'desc' }
            }),
            // 3. Story Portfolio: Displays the author's published works with performance stats.
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
                    },
                    bab: {
                        orderBy: { created_at: 'desc' },
                        take: 1,
                        select: { created_at: true }
                    }
                }
            }),
            // 4. Author Ephemera: Social posts shared by the author.
            (prisma as any).authorPost.findMany({
                where: { author_id: profileId },
                orderBy: { created_at: 'desc' },
                select: {
                    id: true,
                    content: true,
                    image_url: true,
                    created_at: true,
                    _count: { select: { likes: true, comments: true } },
                    // Conditional join to check if the viewer has already liked the post.
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
            // 5. Community Trace (Comments): Where the user has been active.
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
            // 6. Literary Criticality (Reviews): Formal reviews written by the user.
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
            // 7. Library Breadth: Total bookmarks across the platform.
            prisma.bookmark.count({ where: { user_id: profileId } })
        ]);
    },
    [`profile-data-${profileId}-${currentUserId || 'anon'}`],
    { revalidate: 300, tags: [`profile-${profileId}`, `works-author-${profileId}`, `posts-author-${profileId}`] }
)();

/**
 * ProfilePage Entry Point:
 * Logic:
 * 1. Session Retrieval: Identifies the 'viewer' for ACL and follow status.
 * 2. Identity Resolution: Fetches the 'owner' profile (checks if it exists).
 * 3. Aggregated Data Load: Pulls social graph and content trace via cache.
 * 4. Client Delegation: Hands over processed props to 'ProfileClient' for interactive UI.
 */
export default async function ProfilePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    // [Step 1] Resolve Profile Identity
    const userProfileRaw = await getCachedUserProfile(params.id);

    // Handle Edge Case: Profile not found or session mismatch
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

    // Type Assertion for complex Prisma select
    const userProfile = userProfileRaw as (typeof userProfileRaw & {
        avatar_url: string | null;
        banner_url: string | null;
        _count: { followers: number; following: number; };
        bio?: string | null;
        social_links?: any;
    });

    const isOwnProfile = session?.user?.id === userProfile.id;

    // [Step 2] Resolve Social Relationship (Cached)
    let isFollowing = false;
    if (session?.user && !isOwnProfile) {
        const followRecord = await getCachedFollowStatus(session.user.id, userProfile.id);
        isFollowing = !!followRecord;
    }

    // [Step 3] Fetch Aggregated Statistics and Content
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

    // [Step 4] Handover to interactive Client Layer
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
