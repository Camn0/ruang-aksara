'use client';

import { useEffect, useState } from 'react';
import { registerPushSubscription } from '@/app/actions/push';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

export default function PushManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if ('serviceWorker' in navigator && VAPID_PUBLIC_KEY) {
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg);
                checkSubscription(reg);
            });
        }
    }, []);

    const checkSubscription = async (reg: ServiceWorkerRegistration) => {
        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);

        // Auto-sync jika sudah ada subscription (untuk case ganti device/browser)
        if (sub) {
            syncSubscription(sub);
        }
    };

    const syncSubscription = async (sub: PushSubscription) => {
        const subscriptionData = JSON.parse(JSON.stringify(sub));
        await registerPushSubscription(subscriptionData);
    };

    const subscribeToPush = async () => {
        if (!registration || !VAPID_PUBLIC_KEY) return;

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                toast.error('Izin notifikasi ditolak. Anda tidak akan menerima kabar penting.');
                return;
            }

            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            await syncSubscription(sub);
            setIsSubscribed(true);
            toast.success('Gerbang kabar telah terbuka! Anda akan menerima pesan rahasia secara real-time.');
        } catch (error) {
            console.error('[PushManager] Subscription Error:', error);
            toast.error('Gagal menghubungkan gerbang kabar.');
        }
    };

    // Headless: Bisikan notifikasi berjalan di latar belakang tanpa mengganggu pemandangan.
    return null;
}

// Utility: Convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

