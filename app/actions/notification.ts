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
    // Avoid notifying yourself
    if (userId === actorId) return null;

    try {
        // [CLUSTERING LOGIC]
        // Group similar notifications (LIKE, FOLLOW, NEW_CHAPTER) to avoid spam
        if (type === 'LIKE' || type === 'FOLLOW' || type === 'NEW_CHAPTER') {
            const existing = await (prisma as any).notification.findFirst({
                where: { 
                    userId, 
                    type, 
                    isRead: false,
                    // Use clusteringKey for precise grouping if available, otherwise fallback to link
                    // For NEW_CHAPTER, clusteringKey is always the karya_id
                    ...(clusteringKey ? { link: { contains: clusteringKey } } : { link })
                },
                orderBy: { created_at: 'desc' }
            });

            if (existing) {
                let count = 2;
                if (existing.content && existing.content.startsWith('CLUSTER:')) {
                    const prevCount = parseInt(existing.content.split(':')[1]) || 1;
                    count = prevCount + 1;
                }

                return await (prisma as any).notification.update({
                    where: { id: existing.id },
                    data: {
                        actorId, // Update to the most recent actor
                        content: `CLUSTER:${count}`,
                        created_at: new Date() // Bring to top
                    }
                });
            }
        }

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
        
        // --- LAYER 3: TRIGGER WEB PUSH (PERSISTENT ALERTS) ---
        // We do this asynchronously to avoid blocking the main server action response
        (async () => {
            try {
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

                    await Promise.all(pushSubscriptions.map(async (sub: any) => {
                        const res = await sendPushNotification(sub, payload);
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
 * Scans content for @username and triggers MENTION notifications.
 */
export async function notifyMentions(content: string, actorId: string, link: string, category: 'DIRECT' | 'SOCIAL' = 'SOCIAL') {
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
                category,
                content: content,
                link
            })
        ));
    } catch (err) {
        console.error("[notifyMentions] Error:", err);
    }
}
