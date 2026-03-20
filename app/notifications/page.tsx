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
        <div className="min-h-screen bg-bg-paper">
            {/* Notification List Wrapper handles the unified header and layout */}
            <NotificationListWrapper 
                initialNotifications={notifications as any[]} 
                currentUserId={session.user.id} 
            />
            
            {/* Aesthetic Background Decoration */}
            <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-tan-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="fixed -top-10 -left-10 w-60 h-60 bg-brown-dark/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        </div>
    );
}
