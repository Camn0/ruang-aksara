/**
 * @file actions.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the Server Logic Backend.
 * @author Ruang Aksara Engineering Team
 */

"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

import { prisma } from '@/lib/prisma';

export async function toggleFollow(targetUserId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new Error("Unauthorized");

    const followerId = session.user.id;

    if (followerId === targetUserId) {
        throw new Error("Cannot follow yourself");
    }

    // Check if already following
    const existing = await prisma.follow.findUnique({
        where: {
            follower_id_following_id: {
                follower_id: followerId,
                following_id: targetUserId
            }
        }
    });

    if (existing) {
        // Unfollow
        await prisma.follow.delete({
            where: { id: existing.id }
        });
    } else {
        // Follow
        await prisma.follow.create({
            data: {
                follower_id: followerId,
                following_id: targetUserId
            }
        });
    }

    revalidatePath(`/profile/${targetUserId}`);
}
