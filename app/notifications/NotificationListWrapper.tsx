'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Bell, MessageCircle, Heart, UserPlus, BookOpen, PenTool, Trash2, CheckCircle2 } from 'lucide-react';
import { markAsRead, deleteNotification } from '@/app/actions/notification';
import { toast } from 'sonner';

interface NotificationListWrapperProps {
    initialNotifications: any[];
    currentUserId: string;
}

export default function NotificationListWrapper({ initialNotifications, currentUserId }: NotificationListWrapperProps) {
    const [notifications, setNotifications] = useState(initialNotifications);

    const handleMarkRead = async (id: string) => {
        const res = await markAsRead(id);
        if (res.success) {
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        }
    };

    const handleDelete = async (id: string) => {
        const res = await deleteNotification(id);
        if (res.success) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Pesan rahasia telah dimusnahkan.');
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'REPLY': return MessageCircle;
            case 'MENTION': return MessageCircle;
            case 'LIKE': return Heart;
            case 'FOLLOW': return UserPlus;
            case 'NEW_CHAPTER': return BookOpen;
            case 'NEW_WORK': return PenTool;
            case 'AUTHOR_POST': return Bell;
            default: return Bell;
        }
    };

    if (notifications.length === 0) {
        return (
            <div className="text-center py-20 px-6">
                <Bell className="w-12 h-12 text-[#d7bfa7] mx-auto mb-4 opacity-50" />
                <h3 className="text-brown-dark dark:text-text-accent font-bold mb-2">Hutan Berbisik Sunyi</h3>
                <p className="text-sm text-gray-500">Belum ada burung pos yang membawakanmu kabar baru saat ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notifications.map((n) => {
                const Icon = getIcon(n.type);
                return (
                    <div 
                        key={n.id}
                        className={`group relative flex gap-4 p-5 rounded-3xl transition-all border-2 ${
                            n.isRead 
                            ? 'bg-tan-primary/5 border-transparent opacity-80' 
                            : 'bg-white dark:bg-[#2a1d17] border-tan-primary/20 shadow-md shadow-tan-primary/5 hover:border-tan-primary'
                        }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            n.isRead ? 'bg-gray-100 text-gray-400' : 'bg-tan-primary/10 text-tan-primary'
                        }`}>
                            <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <p className="text-brown-dark dark:text-text-accent leading-relaxed">
                                    <Link href={`/profile/${n.actor?.id}`} className="font-bold hover:text-tan-primary transition-colors">
                                        {n.actor?.display_name || 'Anonim'}
                                    </Link>
                                    {' '}
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {(() => {
                                            const isClustered = n.content?.startsWith('CLUSTER:');
                                            const rawCount = isClustered ? parseInt(n.content.split(':')[1]) : 0;
                                            const suffix = isClustered ? ` dan ${rawCount - 1} lainnya` : '';
                                            
                                            if (n.type === 'REPLY') {
                                                const isChapterComment = n.link.split('/').length > 3;
                                                return isChapterComment ? 'membalas komentar Anda di sebuah bab.' : 'membalas ulasan Anda.';
                                            }
                                            if (n.type === 'MENTION') return 'menyebut Anda dalam komentarnya.';
                                            if (n.type === 'LIKE') return `${suffix} menyukai tulisan Anda.`;
                                            if (n.type === 'FOLLOW') return `${suffix} mulai mengikuti perjalanan literasi Anda.`;
                                            if (n.type === 'NEW_CHAPTER') {
                                                return isClustered ? `merilis ${rawCount} bab baru untuk Anda baca.` : 'baru saja merilis bab terbaru.';
                                            }
                                            if (n.type === 'NEW_WORK') return 'baru saja merilis karya baru yang menarik!';
                                            if (n.type === 'AUTHOR_POST') return 'mengumumkan kabar terbaru lewat postingan baru.';
                                            return '';
                                        })()}
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

                            {!n.content?.startsWith('CLUSTER:') && n.content && (
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2 italic bg-tan-primary/5 p-3 rounded-2xl border border-dashed border-tan-primary/20">
                                    &quot;{n.content}&quot;
                                </p>
                            )}

                            <div className="mt-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-tighter text-gray-400">
                                <div className="flex gap-4">
                                    <span>{formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: localeId })}</span>
                                    {n.isRead && (
                                        <span className="flex items-center gap-1 text-green-600 italic">
                                            <CheckCircle2 className="w-3 h-3" /> Telah Dibaca
                                        </span>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    <Link 
                                        href={n.link}
                                        onClick={() => !n.isRead && handleMarkRead(n.id)}
                                        className="text-tan-primary hover:underline hover:opacity-80 transition-all font-black"
                                    >
                                        Buka Segel &gt;
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(n.id)}
                                        className="text-red-400 hover:text-red-600 ml-4 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" /> Musnahkan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
