/**
 * @file push.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the Platform Infrastructure.
 * @author Ruang Aksara Engineering Team
 */

import webpush from 'web-push';

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const privateKey = process.env.VAPID_PRIVATE_KEY || '';

if (publicKey && privateKey) {
    webpush.setVapidDetails(
        'mailto:admin@ruangaksara.id',
        publicKey,
        privateKey
    );
}

export async function sendPushNotification(subscription: any, payload: any) {
    try {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        const result = await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload)
        );
        return { success: true, result };
    } catch (error: any) {
        console.error("[sendPushNotification] Error:", error.statusCode, error.body);

        // Jika 410 (Gone) atau 404 (Not Found), subscription sudah tidak valid
        if (error.statusCode === 410 || error.statusCode === 404) {
            return { error: 'GONE', endpoint: subscription.endpoint };
        }

        return { error: 'FAILED', message: error.message };
    }
}
