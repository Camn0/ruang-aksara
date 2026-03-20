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

/**
 * Notifications Page
 * 
 * Server Component that handles initial data fetching for the notification center.
 * It identifies the user, retrieves the initial 50 notifications, and 
 * renders the high-density interactive NotificationListWrapper.
 */
export default async function NotificationsPage() {
    // 1. Fetch the server-side session to identify the current user
    const session = await getServerSession(authOptions);

    // [SECURITY] If no session exists, prompt the user to login (Simple barrier)
    if (!session) return <div className="p-20 text-center text-text-muted font-bold">Silakan Login</div>;

    // 2. Initial Data Load: Fetch the most recent 50 notifications via Server Action
    const res = await getMyNotifications();
    const notifications = res.success ? res.data : [];

    return (
        <div className="min-h-screen bg-bg-paper">
            {/* 
                The NotificationListWrapper handles the unified header, 
                Twitter-style list layout, and all client-side interactions.
             */}
            <NotificationListWrapper 
                initialNotifications={notifications as any[]} 
                currentUserId={session.user.id} 
            />
            
            {/* 
                Aesthetic Background Decorations:
                Subtle radial blur glows to match the 'Magical Journal' theme.
             */}
            <div className="fixed -bottom-20 -right-20 w-80 h-80 bg-tan-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
            <div className="fixed -top-10 -left-10 w-60 h-60 bg-brown-dark/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        </div>
    );
}
