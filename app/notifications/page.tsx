import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getMyNotifications } from '@/app/actions/notification';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { Bell, CheckCircle } from 'lucide-react';
import NotificationListWrapper from './NotificationListWrapper';

export const dynamic = 'force-dynamic';

export default async function NotificationsPage() {
    const session = await getServerSession(authOptions);
    if (!session) return <div className="p-20 text-center">Silakan Login</div>;

    const res = await getMyNotifications();
    const notifications = res.success ? res.data : [];

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tan-primary/20 rounded-2xl flex items-center justify-center text-brown-dark border border-tan-primary/20">
                        <Bell className="w-6 h-6 animate-bounce" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-lobster text-brown-dark dark:text-text-accent">Pusat Notifikasi</h1>
                        <p className="text-sm text-gray-500 font-open-sans">Pantau aktivitas terbaru Anda di Ruang Aksara</p>
                    </div>
                </div>
            </div>

            {/* Notification List Wrapper (to handle interactive marking) */}
            <NotificationListWrapper initialNotifications={notifications as any[]} />
            
            {/* Aesthetic Background Decoration */}
            <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-tan-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="fixed -top-10 -left-10 w-60 h-60 bg-brown-dark/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        </div>
    );
}
