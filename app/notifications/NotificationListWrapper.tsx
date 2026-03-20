'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { markAsRead, markAllAsRead } from '@/app/actions/notification';
import { CheckCircle, BellOff } from 'lucide-react';

export default function NotificationListWrapper({ initialNotifications }: { initialNotifications: any[] }) {
    const [notifications, setNotifications] = useState(initialNotifications);
    const [filter, setFilter] = useState<'ALL' | 'DIRECT' | 'UPDATE' | 'SOCIAL'>('ALL');

    const handleMarkRead = async (notificationId: string) => {
        await markAsRead(notificationId);
        setNotifications(notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead();
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    };

    const filteredNotifications = notifications.filter(n => {
        if (filter === 'ALL') return true;
        if (filter === 'DIRECT') return n.category === 'DIRECT' || n.category === 'IMPORTANT';
        return n.category === filter;
    });

    return (
        <div className="space-y-8">
            {/* Tabs - Horizontal Scrollable on Mobile */}
            <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
                <div className="flex overflow-x-auto no-scrollbar gap-2 p-1 bg-tan-primary/5 rounded-2xl w-full sm:w-fit whitespace-nowrap">
                    {[
                        { id: 'ALL', label: 'Semua' },
                        { id: 'DIRECT', label: 'Penting' },
                        { id: 'UPDATE', label: 'Update' },
                        { id: 'SOCIAL', label: 'Sosial' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setFilter(tab.id as any)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${filter === tab.id
                                    ? 'bg-white dark:bg-brown-dark text-tan-primary shadow-sm ring-1 ring-tan-primary/10'
                                    : 'text-gray-500 hover:text-brown-dark hover:bg-white/50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleMarkAllRead}
                    className="group flex items-center gap-2 text-sm text-tan-primary hover:text-brown-dark transition-colors"
                >
                    <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Tandai semua telah dibaca
                </button>
            </div>

            <div className="grid gap-4">
                {filteredNotifications.map((n) => (
                    <div
                        key={n.id}
                        className={`group relative bg-white dark:bg-brown-dark border transition-all duration-300 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:scale-[1.01] ${!n.isRead ? 'border-tan-primary border-l-8 bg-tan-primary/[0.02]' : 'border-tan-primary/10'}`}
                    >
                        <div className="flex items-start gap-4">
                            {/* Actor Avatar or Placeholder */}
                            <div className="w-12 h-12 bg-tan-primary/10 rounded-2xl flex items-center justify-center text-brown-dark shrink-0 border border-tan-primary/10 overflow-hidden">
                                {n.actor?.avatar_url ? (
                                    <img src={n.actor.avatar_url} alt="actor" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold">{n.actor?.display_name?.charAt(0) || '?'}</span>
                                )}
                            </div>

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <p className="text-brown-dark dark:text-text-accent leading-relaxed">
                                        <Link href={`/profile/${n.actor?.id}`} className="font-bold hover:text-tan-primary transition-colors">
                                            {n.actor?.display_name || 'Anonim'}
                                        </Link>
                                        {' '}
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {n.type === 'REPLY' && 'membalas komentar Anda di sebuah bab.'}
                                            {n.type === 'MENTION' && 'menyebut Anda dalam komentarnya.'}
                                            {n.type === 'LIKE' && 'menyukai salah satu postingan Anda.'}
                                            {n.type === 'FOLLOW' && 'mulai mengikuti perjalanan literasi Anda.'}
                                            {n.type === 'NEW_CHAPTER' && 'baru saja merilis bab terbaru.'}
                                            {n.type === 'NEW_WORK' && 'baru saja merilis karya baru yang menarik!'}
                                            {n.type === 'AUTHOR_POST' && 'mengumumkan kabar terbaru lewat postingan baru.'}
                                        </span>
                                    </p>
                                    {!n.isRead && (
                                        <button
                                            onClick={() => handleMarkRead(n.id)}
                                            className="text-[10px] uppercase tracking-widest font-black text-tan-primary bg-tan-primary/5 px-3 py-1.5 rounded-full hover:bg-tan-primary hover:text-white transition-all"
                                        >
                                            Baca
                                        </button>
                                    )}
                                </div>

                                {n.content && (
                                    <div className="mt-4 p-4 bg-tan-primary/5 rounded-2xl border-l-2 border-tan-primary/20 italic text-sm text-gray-600 dark:text-gray-300">
                                        "{n.content}"
                                    </div>
                                )}

                                <div className="mt-4 flex items-center gap-4">
                                    <span className="text-[11px] font-open-sans text-gray-400">
                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: id })}
                                    </span>
                                    {n.link && (
                                        <Link
                                            href={n.link}
                                            onClick={() => !n.isRead && handleMarkRead(n.id)}
                                            className="text-[11px] font-bold text-tan-primary hover:underline flex items-center gap-1 group/link"
                                        >
                                            Lihat detail
                                            <span className="transition-transform group-hover/link:translate-x-1">→</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
