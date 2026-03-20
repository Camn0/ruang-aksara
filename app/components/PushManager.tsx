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

    // UI Helper: Hanya muncul jika belum subscribe
    if (isSubscribed) return null;

    return (
        <div className="fixed bottom-24 right-6 z-50 animate-bounce">
            <button
                onClick={subscribeToPush}
                className="bg-[#af8f6f] text-[#f2ead7] p-4 rounded-full shadow-2xl border-2 border-[#d7bfa7] hover:scale-110 transition-all flex items-start group"
            >
                <div className="relative">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white"></span>
                </div>
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-2 transition-all duration-500 whitespace-nowrap text-xs font-bold uppercase tracking-widest pt-1">Aktifkan Kabar</span>
            </button>
        </div>
    );
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

