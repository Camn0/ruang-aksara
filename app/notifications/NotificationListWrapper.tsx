/**
 * @file NotificationListWrapper.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Bell, MessageCircle, Heart, UserPlus, BookOpen, PenTool, Trash2, CheckCircle2 } from 'lucide-react';
import { markAsRead, markAllAsRead, deleteNotification } from '@/app/actions/notification';
import { toast } from 'sonner';

interface NotificationListWrapperProps {
    initialNotifications: any[];
    currentUserId: string;
}

/**
 * NotificationListWrapper Component
 * 
 * Provides a high-density, Twitter-inspired activity feed for users.
 * Features include:
 * - Dynamic tab system (Semua, Penting, Update, Sosial) driven by DB categories.
 * - Anti-spam clustering logic for Likes, Follows, and New Chapters.
 * - Premium visual cues (unread glows, static themed icons, overlapping avatars).
 * - Interactive actions (Mark Read, Delete, Bulk Clear).
 */
/**
 * NotificationListWrapper: Encapsulates the explicit React DOM lifecycle and state-management for the notification list wrapper interactive workflow.
 */
export default function NotificationListWrapper({ initialNotifications, currentUserId }: NotificationListWrapperProps) {
    // local state for notifications to allow instant UI updates without full page reloads
    const [notifications, setNotifications] = useState(initialNotifications);
    // track the active category tab
    const [activeTab, setActiveTab] = useState('Semua');

    /**
     * Marks a specific notification as 'Read' in the DB and local state.
     */
    const handleMarkRead = async (id: string) => {
        const res = await markAsRead(id);
        if (res.success) {
            // Update local state to reflect read status instantly
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        }
    };

    /**
     * Marks ALL notifications for the current user as read.
     * Uses the markAllAsRead server action and displays a success toast.
     */
    const handleMarkAllRead = async () => {
        const res = await markAllAsRead();
        if (res.success) {
            // Update all local notifications to be read
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success('Pesan rahasia telah dibaca.');
        }
    };

    /**
     * Deletes a notification from the DB and removes it from the local list.
     */
    const handleDelete = async (id: string) => {
        const res = await deleteNotification(id);
        if (res.success) {
            // Filter out the deleted notification from the local state
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Pesan rahasia telah dimusnahkan.');
        }
    };

    /**
     * Maps notification types to specific visual configurations (icon, brand color, etc.)
     */
    const getTypeConfig = (type: string) => {
        switch (type) {
            case 'REPLY': return { icon: MessageCircle, color: 'text-blue-500', bg: 'bg-blue-500/10' };
            case 'MENTION': return { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-400/10' };
            case 'LIKE': return { icon: Heart, color: 'text-red-500', bg: 'bg-red-500/10' };
            case 'FOLLOW': return { icon: UserPlus, color: 'text-green-500', bg: 'bg-green-500/10' };
            case 'NEW_CHAPTER': return { icon: BookOpen, color: 'text-tan-primary', bg: 'bg-tan-primary/10' };
            case 'NEW_WORK': return { icon: PenTool, color: 'text-purple-500', bg: 'bg-purple-500/10' };
            case 'AUTHOR_POST': return { icon: Bell, color: 'text-amber-500', bg: 'bg-amber-500/10' };
            default: return { icon: Bell, color: 'text-tan-primary', bg: 'bg-tan-primary/10' };
        }
    };

    /**
     * Defined tabs for categorization based on the 'Inbox' logic.
     * Penting: Direct/Important alerts.
     * Update: Content discovery (New chapters/works).
     * Sosial: High-frequency user interactions.
     */
    const tabs = [
        { id: 'Semua', filter: (n: any) => true },
        { id: 'Penting', filter: (n: any) => n.category === 'DIRECT' || n.category === 'IMPORTANT' },
        { id: 'Update', filter: (n: any) => n.category === 'UPDATE' },
        { id: 'Sosial', filter: (n: any) => n.category === 'SOCIAL' }
    ];

    // Determine currently displayed items based on the activeTab filter
    const currentTab = tabs.find(t => t.id === activeTab);
    const filteredNotifications = notifications.filter(n => currentTab?.filter(n) ?? true);

    return (
        <div className="max-w-4xl mx-auto min-h-screen bg-bg-paper border-x border-sep/30 animate-in fade-in duration-500 mb-20">
            {/* 
                Unified Sticky Header:
                Contains the page title and the 'Bersihkan Semua' mass action.
             */}
            <div className="sticky top-0 z-30 bg-bg-paper/90 backdrop-blur-xl border-b border-sep/20">
                <div className="px-6 py-6 border-b border-sep/10">
                    <div className="flex items-center justify-between gap-4 mb-2">
                        <div className="flex items-center gap-4">
                            {/* Static Bell icon (No animation to keep focus on content) */}
                            <div className="w-10 h-10 bg-tan-primary/10 rounded-xl flex items-center justify-center text-tan-primary border border-tan-primary/20">
                                <Bell className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-text-main tracking-tight">Pusat Notifikasi</h1>
                                <p className="text-xs text-text-muted font-bold tracking-widest uppercase opacity-60">Pantau aktivitas terbaru Anda</p>
                            </div>
                        </div>
                        {/* Compact bulk mark-as-read button */}
                        <button
                            onClick={handleMarkAllRead}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-tan-primary/10 text-tan-primary transition-all active:scale-95 text-[10px] font-black uppercase tracking-[0.15em] border border-tan-primary/20 bg-tan-primary/[0.02]"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Bersihkan Semua
                        </button>
                    </div>
                </div>

                {/* Navigation Tabs Bar */}
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="flex-1 relative py-5 text-[11px] font-black uppercase tracking-[0.25em] transition-all hover:bg-tan-primary/[0.02] group"
                        >
                            <span className={`${activeTab === tab.id ? 'text-text-main' : 'text-text-muted opacity-50'}`}>
                                {tab.id}
                            </span>
                            {/* Active indicator bar */}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-tan-primary" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notification Activity Stream */}
            <div className="divide-y divide-sep/20">
                {notifications.length === 0 ? (
                    /* Empty state for the entire list */
                    <div className="text-center py-32 px-10">
                        <div className="w-24 h-24 bg-tan-primary/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Bell className="w-12 h-12 text-tan-primary opacity-20" />
                        </div>
                        <h3 className="text-2xl font-black text-text-main mb-3">Hutan Berbisik Sunyi</h3>
                        <p className="text-base text-text-muted leading-relaxed max-w-sm mx-auto">Selamat! Belum ada burung pos yang membawakanmu kabar baru saat ini.</p>
                    </div>
                ) : filteredNotifications.length === 0 ? (
                    /* Empty state for a specific tab category */
                    <div className="text-center py-24 px-10">
                        <p className="text-sm font-black text-text-muted/40 uppercase tracking-widest italic leading-relaxed">Tidak ada kabar dalam kategori &quot;{activeTab}&quot;</p>
                    </div>
                ) : (
                    /* Render the matching notification items */
                    filteredNotifications.map((n) => {
                        const config = getTypeConfig(n.type);
                        
                        const parts = n.content?.split('|') || [];
                        const isClustered = n.content?.includes('CLUSTER:') || false;
                        const clusterCount = isClustered ? parseInt(n.content.split('CLUSTER:')[1]) || 1 : 1;
                        const suffix = isClustered ? ` dan ${clusterCount - 1} lainnya` : '';
                        
                        // Resolve Work Title: 
                        // ONLY set workTitle if we have the | delimiter (parts.length >= 2).
                        // Legacy data only has one part (the content).
                        const workTitle = (parts.length >= 2) ? parts[0] : null;
                        
                        // Resolve Preview Snippet:
                        // If parts.length >= 2, the snippet is parts[1]. 
                        // If legacy (length 1 and not clustered), the whole content is the snippet.
                        const previewSnippet = parts.length >= 2 ? parts[1] : (parts.length === 1 && !isClustered ? parts[0] : null);
                        
                        return (
                            <div
                                key={n.id}
                                className={`flex gap-6 px-8 py-8 transition-all hover:bg-tan-primary/[0.03] cursor-pointer relative group ${!n.isRead ? 'bg-tan-primary/[0.015]' : ''
                                    }`}
                                onClick={() => {
                                    // Marking as read upon interaction
                                    if (!n.isRead) handleMarkRead(n.id);
                                    // Direct navigation to the context (Comment, Work, etc.)
                                    window.location.href = n.link;
                                }}
                            >
                                {/* 
                                    Left Visual Rail:
                                    Contains the type-specific icon and the unread glow indicator.
                                 */}
                                <div className="flex flex-col items-center gap-4 shrink-0 pt-1">
                                    <div className={`w-11 h-11 rounded-2xl ${config.bg} flex items-center justify-center border border-current shadow-sm`}>
                                        <config.icon className={`w-6 h-6 ${config.color}`} />
                                    </div>
                                    {/* Unread dot (Static for cleaner look as per latest request) */}
                                    {!n.isRead && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-tan-primary shadow-[0_0_10px_rgba(176,137,104,0.5)]" />
                                    )}
                                </div>

                                {/* Main Notification Content Area */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-6">
                                        <div className="flex-1 min-w-0">
                                            {/* Identity Row: Shows the actor avatar and name */}
                                            <div className="flex items-center gap-4 mb-3">
                                                <Link
                                                    href={`/profile/${n.actor?.id}`}
                                                    className="shrink-0 group/avatar relative"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Avatar frame */}
                                                    <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-sep/20 group-hover/avatar:border-tan-primary transition-all shadow-sm bg-bg-paper">
                                                        <img
                                                            src={n.actor?.avatar_url || '/default-avatar.png'}
                                                            alt={n.actor?.display_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    {/* Cluster badge: displayed if multiple users triggered this (e.g., Many Likes) */}
                                                    {isClustered && (
                                                        <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-xl bg-tan-primary border-4 border-bg-paper text-xs font-black text-white flex items-center justify-center shadow-lg">
                                                            +{clusterCount - 1}
                                                        </div>
                                                    )}
                                                </Link>
                                                
                                                <div className="min-w-0">
                                                    <h4 className="text-base font-black text-text-main truncate hover:underline underline-offset-4 decoration-tan-primary/40">
                                                        {n.actor?.display_name || 'Penulis Misterius'}
                                                    </h4>
                                                    <p className="text-[11px] font-black text-text-muted/50 uppercase tracking-[0.15em] mt-0.5">
                                                        {/* Human-readable relative time (e.g. 2 minutes ago) */}
                                                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: localeId })}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Notification Message Text: Dynamic based on type and cluster status */}
                                            <div className="text-[17px] text-text-main leading-relaxed">
                                                <span className="text-text-muted font-bold group-hover:text-text-main transition-colors">
                                                    {(() => {
                                                        if (n.type === 'REPLY') {
                                                            const isChapterComment = n.link.includes('/novel/') && n.link.split('/').length > 3;
                                                            const isReviewComment = n.link.includes('/novel/') && !isChapterComment;
                                                            const isPostComment = n.link.includes('/profile/');

                                                            return (
                                                                <>
                                                                    {isChapterComment ? 'membalas komentar Anda' : isReviewComment ? 'membalas ulasan Anda' : 'membalas postingan Anda'}
                                                                    {workTitle ? (
                                                                        <> di <span className="text-tan-primary font-black italic">"{workTitle}"</span></>
                                                                    ) : (
                                                                        isChapterComment ? ' di sebuah bab.' : '.'
                                                                    )}
                                                                </>
                                                            );
                                                        }
                                                        if (n.type === 'MENTION') {
                                                            const isPost = n.link.includes('/profile/');
                                                            return (
                                                                <>
                                                                    menyebut Anda dalam {isPost ? 'postingannya' : 'komentarnya'}
                                                                    {workTitle && <> di <span className="text-tan-primary font-black italic">"{workTitle}"</span></>}
                                                                    .
                                                                </>
                                                            );
                                                        }
                                                        if (n.type === 'LIKE') {
                                                            const isChapterComment = n.link.includes('#comment-');
                                                            const isReviewComment = n.link.includes('#rev-comment-') || (n.link.includes('/novel/') && !n.link.includes('/chapter/')); // Fallback for reviews
                                                            const isPost = n.link.includes('/profile/');

                                                            return (
                                                                <>
                                                                    {suffix} menyukai 
                                                                    {isChapterComment ? ' komentar Anda' : isReviewComment ? ' ulasan Anda' : isPost ? ' postingan Anda' : ' tulisan Anda'}
                                                                    {workTitle && <> di <span className="text-tan-primary font-black italic">"{workTitle}"</span></>}
                                                                    .
                                                                </>
                                                            );
                                                        }
                                                        if (n.type === 'FOLLOW') return `${suffix} mulai mengikuti perjalanan literasi Anda.`;
                                                        if (n.type === 'NEW_CHAPTER') {
                                                            return isClustered ? ` merilis ${clusterCount} bab baru untuk Anda baca.` : ' baru saja merilis bab terbaru.';
                                                        }
                                                        if (n.type === 'NEW_WORK') return ' baru saja merilis karya baru yang menarik!';
                                                        if (n.type === 'AUTHOR_POST') return ' mengumumkan kabar terbaru lewat postingan baru.';
                                                        return '';
                                                    })()}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Row Action: Discrete Delete button visible only on hover */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(n.id);
                                            }}
                                            className="p-3 text-text-muted/40 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shrink-0"
                                            title="Hapus Kabar"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* 
                                        Quote Block / Content Preview: 
                                        Shows the snippet of the comment/message for better context.
                                     */}
                                    {previewSnippet && (
                                        <div className="mt-5 relative group/preview">
                                            {/* Vertical accent decoration */}
                                            <div className="absolute left-0 top-1 bottom-1 w-1.5 bg-tan-primary/10 group-hover/preview:bg-tan-primary transition-all rounded-full" />
                                            <div className="pl-6 py-1 text-[15px] text-text-muted italic line-clamp-3 leading-relaxed opacity-70 group-hover:opacity-100 transition-all font-medium border-l border-sep/10">
                                                &quot;{previewSnippet}&quot;
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}