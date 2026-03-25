/**
 * @file StaticNotificationBell.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';
import { getMyNotifications } from '@/app/actions/notification';

/**
 * StaticNotificationBell: Fallback server-rendered notification indicator for environments where WebSockets are unavailable.
 */
export default function StaticNotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchUnread = async () => {
        const res = await getMyNotifications();
        if (res.success && res.data) {
            const count = res.data.filter((n: any) => !n.isRead).length;
            setUnreadCount(count);
        }
    };

    useEffect(() => {
        fetchUnread();
        const interval = setInterval(fetchUnread, 60000); // Poll every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <Link 
            href="/notifications" 
            className="relative p-2 rounded-xl bg-tan-primary/5 hover:bg-tan-primary/10 transition-all active:scale-95 group shrink-0"
        >
            <Bell className="w-5 h-5 text-brown-dark dark:text-text-accent group-hover:text-tan-primary transition-colors" />
            {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg-cream dark:border-brown-dark animate-in zoom-in duration-300">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </Link>
    );
}

