/**
 * @file notification.ts
 * @description Centralized dispatch proxy processing the clustering algorithm for new activity alerts.
 * @author Ruang Aksara Engineering Team
 */

'use server';

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidateTag } from "next/cache";

/**
 * [INTERNAL] Helper function to trigger a notification.
 * This is used inside other server actions (e.g., submitComment, likeWork).
 * 
 * Logic Flow:
 * 1. [ANTI-SPAM] Checks if a similar unread notification exists for clustering (LIKES, FOLLOWS, NEW_CHAPTERS).
 * 2. [DATABASE] Creates a new notification or updates an existing cluster.
 * 3. [CACHE] Triggers Next.js tag revalidation so the UI stays fresh.
 * 4. [LAYER 3] Asynchronously pushes alerts to registered devices (Web Push).
 */
export async function createNotification({
    userId,
    actorId,
    type,
    category = 'UPDATE',
    content,
    link,
    clusteringKey
}: {
    userId: string;
    actorId?: string;
    type: 'REPLY' | 'MENTION' | 'LIKE' | 'NEW_CHAPTER' | 'FOLLOW' | 'AUTHOR_POST' | 'NEW_WORK';
    category?: 'DIRECT' | 'IMPORTANT' | 'UPDATE' | 'SOCIAL';
    content?: string;
    link: string;
    clusteringKey?: string;
}) {
    // [GUARD] Don't notify the user if they are the actor of the action (e.g. liking their own post)
    if (userId === actorId) return null;

    try {
        /**
         * [CLUSTERING LOGIC]
         * Prevents notification fatigue by grouping repeated actions into a single unread item.
         * Mode: Recursive Clustering.
         */
        if (type === 'LIKE' || type === 'FOLLOW' || type === 'NEW_CHAPTER') {
            const existing = await (prisma as any).notification.findFirst({
                where: { 
                    userId, 
                    type, 
                    isRead: false,
                    // Group by clusteringKey (if provided) or fallback to the exact link
                    ...(clusteringKey ? { link: { contains: clusteringKey } } : { link })
                },
                orderBy: { created_at: 'desc' }
            });

            if (existing) {
                let count = 2;
                if (existing.content && existing.content.startsWith('CLUSTER:')) {
                    // Extract previous count from the hidden CLUSTER:N string
                    const prevCount = parseInt(existing.content.split(':')[1]) || 1;
                    count = prevCount + 1;
                }

                // Maintain context if it exists (Title|Snippet|CLUSTER:N)
                const parts = existing.content?.split('|') || [];
                const baseContent = parts.length >= 2 ? `${parts[0]}|${parts[1]}` : existing.content;

                // Instead of a new row, we update the existing unread notification
                return await (prisma as any).notification.update({
                    where: { id: existing.id },
                    data: {
                        actorId, // Display the most recent reactor in the UI
                        content: baseContent?.includes('|') ? `${baseContent}|CLUSTER:${count}` : `CLUSTER:${count}`,
                        created_at: new Date() // Bring the item to the top of the 'Semua' feed
                    }
                });
            }
        }

        // Standard Creation: No cluster found, so create a fresh record
        const notif = await (prisma as any).notification.create({
            data: {
                userId,
                actorId,
                type,
                category,
                content: content?.substring(0, 500), // Cap length for DB safety
                link
            }
        });

        // Trigger cache revalidation so the 'Bell' dot and list stay in sync
        revalidateTag(`notifications-${userId}`);
        
        /**
         * [LAYER 3: WEB PUSH NOTIFICATIONS]
         * Non-blocking background task to send persistent device alerts.
         */
        (async () => {
            try {
                // Find all sub-endpoints registered for this user
                const pushSubscriptions = await (prisma as any).pushSubscription.findMany({
                    where: { userId }
                });

                if (pushSubscriptions.length > 0) {
                    const { sendPushNotification } = await import('@/lib/push');
                    const payload = {
                        title: "Ruang Aksara",
                        body: content || `Anda menerima kabar baru: ${type}`,
                        url: link,
                        icon: "/icon.png"
                    };

                    // Broadcast to all devices
                    await Promise.all(pushSubscriptions.map(async (sub: any) => {
                        const res = await sendPushNotification(sub, payload);
                        // [CLEANUP] If the device endpoint is 'GONE', delete the stale record
                        if (res.error === 'GONE') {
                            await (prisma as any).pushSubscription.delete({ where: { endpoint: sub.endpoint } });
                        }
                    }));
                }
            } catch (pErr) {
                console.error("[createNotification] Push Error:", pErr);
            }
        })();

        return notif;
    } catch (error) {
        console.error("[createNotification] Error:", error);
        return null;
    }
}

/**
 * getMyNotifications:
 * Fetches the user's latest notifications, including actor details.
 * Limit: 50 items for performance.
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
                        id: true,
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
 * markAsRead:
 * Marks a specific notification as 'Read' and refreshes the cache.
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
 * markAllAsRead:
 * Mark ALL unread notifications for a user as Read (Mass Action).
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
 * deleteNotification:
 * Permanently removes a notification from the user's history.
 */
export async function deleteNotification(id: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    try {
        await (prisma as any).notification.delete({
            where: { id, userId: session.user.id }
        });

        revalidateTag(`notifications-${session.user.id}`);
        return { success: true };
    } catch (error) {
        return { error: "Failed to delete notification" };
    }
}

/**
 * notifyMentions Utility:
 * Scans a message for @username mentions and sends notifications to those users.
 */
export async function notifyMentions(content: string, actorId: string, link: string, category: 'DIRECT' | 'SOCIAL' = 'SOCIAL', workTitle?: string) {
    try {
        // Regex for uncovering @handles
        const mentionRegex = /@(\w+)/g;
        const usernames: string[] = [];
        let match;
        
        // Aggregate unique mentions
        while ((match = mentionRegex.exec(content)) !== null) {
            if (match[1] && !usernames.includes(match[1])) {
                usernames.push(match[1]);
            }
        }

        if (usernames.length === 0) return;

        // Resolve User IDs for the mentions
        const users = await prisma.user.findMany({
            where: { username: { in: usernames } },
            select: { id: true, username: true }
        });

        // Trigger individual notifications
        await Promise.all(users.map(u => 
            createNotification({
                userId: u.id,
                actorId,
                type: 'MENTION',
                category,
                content: workTitle ? `${workTitle}|${content}` : content,
                link
            })
        ));
    } catch (err) {
        console.error("[notifyMentions] Error:", err);
    }
}
