import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import ProfileClient from "./ProfileClient";

interface ProfileContentWrapperProps {
    userProfile: any;
    isOwnProfile: boolean;
    isFollowing: boolean;
}

export default async function ProfileContentWrapper({ userProfile, isOwnProfile, isFollowing }: ProfileContentWrapperProps) {
    const session = await getServerSession(authOptions);

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
            select: {
                follower: { 
                    select: { id: true, username: true, display_name: true, avatar_url: true, role: true } 
                } 
            },
            orderBy: { created_at: 'desc' }
        }),
        // 2. Following
        prisma.follow.findMany({
            where: { follower_id: userProfile.id },
            select: {
                following: { 
                    select: { id: true, username: true, display_name: true, avatar_url: true, role: true } 
                } 
            },
            orderBy: { created_at: 'desc' }
        }),
        // 3. Karya (If Author)
        prisma.karya.findMany({
            where: { uploader_id: userProfile.id },
            orderBy: { total_views: 'desc' },
            select: {
                id: true,
                title: true,
                cover_url: true,
                avg_rating: true,
                total_views: true,
                penulis_alias: true,
                _count: { select: { bookmarks: true, ratings: true, bab: true } },
                genres: { 
                    take: 3,
                    select: { id: true, name: true }
                }
            }
        }),
        // 4. Postingan (If Author)
        (prisma as any).authorPost.findMany({
            where: { author_id: userProfile.id },
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                content: true,
                // @ts-ignore
                content_html: true,
                image_url: true,
                created_at: true,
                _count: { select: { likes: true, comments: true } },
                // @ts-ignore
                ...(session?.user ? { likes: { where: { user_id: session.user.id } } } : {}),
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
            where: { user_id: userProfile.id },
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
            where: { user_id: userProfile.id },
            select: {
                id: true,
                content: true,
                // @ts-ignore
                content_html: true,
                created_at: true,
                karya: { select: { id: true, title: true } }
            },
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
