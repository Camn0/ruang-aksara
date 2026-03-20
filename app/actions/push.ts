'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidateTag } from 'next/cache';

export async function registerPushSubscription(subscription: any) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    try {
        const { endpoint, keys } = subscription;
        if (!endpoint || !keys?.p256dh || !keys?.auth) {
            return { error: "Invalid subscription data" };
        }

        // Simpan atau update subscription
        // Kita gunakan upsert berdasarkan endpoint (unique)
        await (prisma as any).pushSubscription.upsert({
            where: { endpoint },
            update: {
                userId: session.user.id,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
            create: {
                userId: session.user.id,
                endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
            },
        });

        return { success: true };
    } catch (error) {
        console.error("[registerPushSubscription] Error:", error);
        return { error: "Failed to register push subscription" };
    }
}

export async function unregisterPushSubscription(endpoint: string) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: "Unauthorized" };

    try {
        await (prisma as any).pushSubscription.delete({
            where: { endpoint },
        });

        return { success: true };
    } catch (error) {
        console.error("[unregisterPushSubscription] Error:", error);
        return { error: "Failed to unregister push subscription" };
    }
}
