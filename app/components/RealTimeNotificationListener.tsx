'use client';

import { useEffect, useState } from 'react';
import { getMyNotifications, markAsRead } from '@/app/actions/notification';
import { toast } from 'sonner';
import { Bell, MessageCircle, Heart, UserPlus, BookOpen, PenTool } from 'lucide-react';
import Link from 'next/link';

export default function RealTimeNotificationListener({ currentUserId }: { currentUserId?: string }) {
    const [lastNotifId, setLastNotifId] = useState<string | null>(null);

    useEffect(() => {
        if (!currentUserId) return;

        // Load last seen ID from local storage to avoid showing old notifications on refresh
        const storedId = localStorage.getItem(`last_notif_${currentUserId}`);
        setLastNotifId(storedId);

        const pollNotifications = async () => {
            const res = await getMyNotifications();
            if (res.success && res.data && res.data.length > 0) {
                const latest = res.data[0];
                
                // If this is a new unread notification
                if (latest.id !== lastNotifId && !latest.isRead) {
                    showParchmentToast(latest);
                    setLastNotifId(latest.id);
                    localStorage.setItem(`last_notif_${currentUserId}`, latest.id);
                }
            }
        };

        // Initial check and then poll every 45 seconds (balance between real-time and DB load)
        pollNotifications();
        const interval = setInterval(pollNotifications, 45000);

        return () => clearInterval(interval);
    }, [currentUserId, lastNotifId]);

    const showParchmentToast = (notif: any) => {
        const Icon = getIcon(notif.type);
        
        toast.custom((t) => (
            <div className="bg-[#fdfbf7] dark:bg-[#2a1d17] border-2 border-[#d7bfa7] dark:border-[#7a553a] p-4 rounded-2xl shadow-2xl flex items-start gap-4 max-w-sm w-full transform transition-all animate-in slide-in-from-top-full duration-500 ring-1 ring-[#3b2a22]/5">
                <div className="w-10 h-10 rounded-xl bg-[#d7bfa7]/20 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#3b2a22] dark:text-[#f3e9d7]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-[#af8f6f] uppercase tracking-widest mb-1">Surat Baru Tiba</p>
                    <p className="text-xs font-bold text-[#3b2a22] dark:text-[#f3e9d7] leading-relaxed line-clamp-2">
                        {(() => {
                            const isClustered = notif.content?.startsWith('CLUSTER:');
                            const rawCount = isClustered ? parseInt(notif.content.split(':')[1]) : 0;
                            const suffix = isClustered ? ` dan ${rawCount - 1} lainnya` : '';
                            return (
                                <>
                                    <span className="text-[#8b4513] dark:text-[#af8f6f]">{notif.actor?.display_name || 'Alkemis Misterius'}</span>
                                    {suffix}
                                    {getMessage(notif.type, notif.link, isClustered, rawCount)}
                                </>
                            );
                        })()}
                    </p>
                    <div className="mt-3 flex gap-3">
                        <Link 
                            href={notif.link} 
                            onClick={() => {
                                toast.dismiss(t);
                                markAsRead(notif.id);
                            }}
                            className="text-[9px] font-black text-[#3b2a22] dark:text-[#f3e9d7] bg-[#d7bfa7] dark:bg-[#7a553a] px-3 py-1 rounded-full uppercase tracking-tighter hover:opacity-80 transition-all"
                        >
                            Buka Segel
                        </Link>
                        <button 
                            onClick={() => toast.dismiss(t)}
                            className="text-[9px] font-black text-[#af8f6f] uppercase tracking-tighter hover:text-[#3b2a22] transition-colors"
                        >
                            Nanti Saja
                        </button>
                    </div>
                </div>
            </div>
        ), {
            duration: 8000,
            position: 'top-center'
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'REPLY': return MessageCircle;
            case 'MENTION': return MessageCircle;
            case 'LIKE': return Heart;
            case 'FOLLOW': return UserPlus;
            case 'NEW_CHAPTER': return BookOpen;
            case 'NEW_WORK': return PenTool;
            default: return Bell;
        }
    };

    const getMessage = (type: string, link: string, isClustered: boolean, count: number) => {
        switch (type) {
            case 'REPLY': {
                const isChapterComment = link.split('/').length > 3;
                return isChapterComment ? " telah membalas catatanmu di tepi cerita." : " telah membalas ulasanmu.";
            }
            case 'MENTION': return " menyebut namamu dalam sebuah diskusi.";
            case 'LIKE': return " menyukai goresan pikiran yang kamu bagikan.";
            case 'FOLLOW': return " telah bergabung dalam perjalanan literasimu.";
            case 'NEW_CHAPTER': return isClustered ? ` merilis ${count} bab baru untukmu.` : " baru saja mengukir bab terbaru untukmu.";
            case 'NEW_WORK': return " menghadirkan semesta baru yang menanti dijelajahi.";
            case 'AUTHOR_POST': return " membagikan kabar terbaru lewat papan pengumuman.";
            default: return " mengirimkan pesan singkat untukmu.";
        }
    };

    return null; // Silent component
}
