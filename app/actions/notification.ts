'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

/**
 * [INTERNAL] Helper function to trigger a notification.
 * This is used inside other server actions (e.g., submitComment).
 */
export async function createNotification({
    userId,
    actorId,
    type,
    category = 'UPDATE',
    content,
    link
}: {
    userId: string;
    actorId?: string;
    type: 'REPLY' | 'MENTION' | 'LIKE' | 'NEW_CHAPTER' | 'FOLLOW' | 'AUTHOR_POST' | 'NEW_WORK';
    category?: 'DIRECT' | 'IMPORTANT' | 'UPDATE' | 'SOCIAL';
    content?: string;
    link: string;
}) {
    // Avoid notifying yourself
    if (userId === actorId) return null;

    try {
        const notif = await (prisma as any).notification.create({
            data: {
                userId,
                actorId,
                type,
                category,
                content: content?.substring(0, 500), // Safety cap
                link
            }
        });

        // Trigger cache revalidation for the receiver
        revalidateTag(`notifications-${userId}`);
        
        return notif;
    } catch (error) {
        console.error("[createNotification] Error:", error);
        return null;
    }
}

/**
 * Fetches all notifications for the current logged-in user.
 */
export async function getMyNotifications() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    try {
        const notifications = await (prisma as any).notification.findMany({
            where: { userId: session.user.id },
            include: {
                actor: {
                    select: {
                        display_name: true,
                        username: true,
                        avatar_url: true
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        return { success: true, data: notifications };
    } catch (error) {
        console.error("[getMyNotifications] Error:", error);
        return { error: "Failed to fetch notifications" };
    }
}

/**
 * Marks a specific notification as read.
 */
export async function markAsRead(notificationId: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    try {
        await (prisma as any).notification.update({
            where: { id: notificationId, userId: session.user.id },
            data: { isRead: true }
        });

        revalidateTag(`notifications-${session.user.id}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to update notification" };
    }
}

/**
 * Marks all notifications as read for the current user.
 */
export async function markAllAsRead() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    try {
        await (prisma as any).notification.updateMany({
            where: { userId: session.user.id, isRead: false },
            data: { isRead: true }
        });

        revalidateTag(`notifications-${session.user.id}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to update notifications" };
    }
}

/**
 * Scans content for @username and triggers MENTION notifications.
 */
export async function notifyMentions(content: string, actorId: string, link: string) {
    const mentionRegex = /@(\w+)/g;
    const usernames: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
        if (match[1] && !usernames.includes(match[1])) {
            usernames.push(match[1]);
        }
    }

    if (usernames.length === 0) return;

    try {
        const users = await prisma.user.findMany({
            where: { username: { in: usernames } },
            select: { id: true, username: true }
        });

        await Promise.all(users.map(u => 
            createNotification({
                userId: u.id,
                actorId,
                type: 'MENTION',
                category: 'DIRECT',
                content: content,
                link
            })
        ));
    } catch (err) {
        console.error("[notifyMentions] Error:", err);
    }
}
