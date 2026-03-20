'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getMyNotifications, markAllAsRead } from '@/app/actions/notification';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';

export default function NotificationBell() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        if (!session) return;
        const res = await getMyNotifications();
        if (res.success && res.data) {
            setNotifications(res.data);
            setUnreadCount(res.data.filter((n: any) => !n.read).length);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Simple polling every 30 seconds for a "small project"
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [session]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    if (!session) return null;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-tan-primary/10 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-brown-dark dark:text-text-accent" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-brown-dark border border-tan-primary/20 rounded-2xl shadow-2xl z-[100] animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="p-4 border-b border-tan-primary/10 flex justify-between items-center sticky top-0 bg-white dark:bg-brown-dark z-10">
                        <h3 className="font-lobster text-lg text-brown-dark dark:text-text-accent">Notifikasi</h3>
                        <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-tan-primary hover:underline"
                        >
                            Tandai semua dibaca
                        </button>
                    </div>

                    <div className="flex flex-col">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">
                                Belum ada notifikasi
                            </div>
                        ) : (
                            notifications.map((n) => (
                                <Link
                                    key={n.id}
                                    href={n.link || '#'}
                                    onClick={() => setIsOpen(false)}
                                    className={`p-4 border-b border-tan-primary/5 hover:bg-tan-primary/5 transition-colors flex gap-3 ${!n.read ? 'bg-tan-primary/[0.03]' : ''}`}
                                >
                                    {/* Category Icon */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${n.category === 'DIRECT' ? 'bg-red-500/10 text-red-500' :
                                            n.category === 'IMPORTANT' ? 'bg-amber-500/10 text-amber-500' :
                                                n.category === 'UPDATE' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-gray-500/10 text-gray-500'
                                        }`}>
                                        {n.type === 'REPLY' || n.type === 'MENTION' ? <span className="text-xs font-bold">@</span> :
                                            n.type === 'NEW_CHAPTER' || n.type === 'NEW_WORK' ? <span className="text-xs font-bold">!</span> :
                                                n.type === 'LIKE' ? <span className="text-xs font-bold">♥</span> :
                                                    <span className="text-xs font-bold">#</span>}
                                    </div>

                                    <div className="flex-1">
                                        <p className="text-sm text-brown-dark dark:text-text-accent">
                                            <span className="font-bold">{n.actor?.display_name || 'Seseorang'}</span>{' '}
                                            {n.type === 'REPLY' && 'membalas komentar Anda'}
                                            {n.type === 'MENTION' && 'menyebut Anda dalam komentar'}
                                            {n.type === 'LIKE' && 'menyukai postingan Anda'}
                                            {n.type === 'FOLLOW' && 'mulai mengikuti Anda'}
                                            {n.type === 'NEW_CHAPTER' && 'merilis bab baru'}
                                            {n.type === 'NEW_WORK' && 'merilis karya baru'}
                                            {n.type === 'AUTHOR_POST' && 'membuat postingan baru'}
                                        </p>
                                        {n.content && (
                                            <p className="text-xs text-gray-500 mt-1 line-clamp-2 italic">
                                                "{n.content}"
                                            </p>
                                        )}
                                        <p className="text-[10px] text-gray-400 mt-2">
                                            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: id })}
                                        </p>
                                    </div>
                                    {!n.read && <div className="w-2 h-2 bg-tan-primary rounded-full shrink-0 mt-1.5" />}
                                </Link>
                            ))
                        )}
                    </div>

                    <Link
                        href="/notifications"
                        onClick={() => setIsOpen(false)}
                        className="p-3 text-center text-xs text-tan-primary hover:bg-tan-primary/5 block sticky bottom-0 bg-white dark:bg-brown-dark border-t border-tan-primary/10"
                    >
                        Lihat semua notifikasi
                    </Link>
                </div>
            )}
        </div>
    );
}
