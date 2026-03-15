import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import ProfileContentWrapper from "./ProfileContentWrapper";

/**
 * Halaman Profil Pengguna (Server Component).
 */

async function getCachedUserProfile(id: string) {
    return unstable_cache(
        async () => {
            return await prisma.user.findFirst({
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
        [`user-profile-${id}`],
        { revalidate: 3600, tags: [`user-${id}`, `user-profile-${id}`] }
    )();
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);

    // [A] Resolving Identity (Cached #4)
    const userProfileRaw = await getCachedUserProfile(params.id);

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
        banner_url: string | null;
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

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-bg-cream dark:bg-brown-dark animate-pulse flex items-center justify-center">
                <p className="text-xs font-black text-tan-primary uppercase tracking-[0.3em] italic">Membuka Lembaran Profil...</p>
            </div>
        }>
            <ProfileContentWrapper 
                userProfile={userProfile} 
                isOwnProfile={isOwnProfile} 
                isFollowing={isFollowing} 
            />
        </Suspense>
    );
}
