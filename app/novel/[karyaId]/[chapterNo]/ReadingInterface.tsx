'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Star, MessageSquare, Heart, Settings, List, ArrowRight, RotateCcw,
    ChevronLeft, ChevronRight, ChevronDown, Home, X, Plus, Minus, Sun, Moon, Type
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ChapterPicker from "./ChapterPicker";

interface ReadingInterfaceProps {
    karyaId: string;
    babId: string;
    chapterNo: number;
    novelTitle: string;
    chapterTitle: string | null;
    content: string;
    nextChapter?: number;
    prevChapter?: number;
    userReaction?: string;
    reactionStats?: { reaction_type: string; _count: { _all: number } }[];
}

/**
 * ReadingInterface (Client Component):
 * The core engine for content consumption. It manages text appearance, 
 * immersive UI behaviors, and reading progress persistence.
 * 
 * Logic Highlights:
 * 1. Appearance Persistence: Font sizes and families are stored in 'localStorage' 
 *    to maintain a consistent user preference across sessions.
 * 2. Immersive Scroll: Dynamically hides/shows the navigation bars based on 
 *    scroll direction (Hide on Scroll Down, Show on Scroll Up).
 * 3. Progress Tracking: Automatically saves the current scroll position for 
 *    the specific chapter, allowing users to "pick up where they left off".
 * 4. Optimistic Reactions: Instant feedback for chapter-level reactions (Like, Love, etc.).
 */
export default function ReadingInterface({
    karyaId,
    babId,
    chapterNo,
    novelTitle,
    chapterTitle,
    content,
    nextChapter,
    prevChapter,
    userReaction: initialUserReaction,
    reactionStats
}: ReadingInterfaceProps) {
    // [STATE] Appearance & Visibility Settings
    const [fontSize, setFontSize] = useState(18); 
    const [fontFamily, setFontFamily] = useState('serif'); 
    const [lineHeight, setLineHeight] = useState(1.8);
    const [showSettings, setShowSettings] = useState(false);
    const [isOpenPicker, setIsOpenPicker] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const [userReaction, setUserReaction] = useState(initialUserReaction);

    const REACTIONS = [
        { type: 'LIKE', emoji: '👍', label: 'Suka' },
        { type: 'LOVE', emoji: '❤️', label: 'Cinta' },
        { type: 'FIRE', emoji: '🔥', label: 'Mantap' },
        { type: 'WOW', emoji: '😮', label: 'Wih' },
    ];

    /**
     * handleReaction:
     * Dispatches a social interaction to the server. 
     * Uses Dynamic Import for the action to reduce initial bundle size.
     */
    const handleReaction = async (type: string) => {
        const prev = userReaction;
        const next = type === userReaction ? undefined : type;
        setUserReaction(next);
        const { submitChapterReaction } = await import('@/app/actions/chapter');
        // @ts-ignore - Type synchronization check
        const res = await submitChapterReaction(babId, type, karyaId);
        if (res.error) {
            setUserReaction(prev);
        }
    };

    /**
     * useEffect: Keyboard Navigation
     * Listens for Arrow keys to facilitate "Next/Prev" page turning.
     */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' && nextChapter) {
                router.push(`/novel/${karyaId}/${nextChapter}`);
            } else if (e.key === 'ArrowLeft' && prevChapter) {
                router.push(`/novel/${karyaId}/${prevChapter}`);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [karyaId, nextChapter, prevChapter, router]);

    /**
     * useEffect: Preference Hydration
     * Restores the user's preferred font settings from localStorage.
     */
    useEffect(() => {
        const savedSize = localStorage.getItem('ruangaksara_fontsize');
        const savedFont = localStorage.getItem('ruangaksara_fontfamily');
        const savedLeading = localStorage.getItem('ruangaksara_lineheight');
        
        if (savedSize) setFontSize(Number(savedSize));
        if (savedFont) setFontFamily(savedFont);
        if (savedLeading) setLineHeight(Number(savedLeading));
        
        setMounted(true);
    }, []);

    /**
     * useEffect: Scroll Tracking & Immersive UI
     * 1. Restores vertical scroll position for this specific chapter.
     * 2. Toggles navbar visibility based on scroll delta.
     * 3. Debounces 'localStorage' updates for performance.
     */
    useEffect(() => {
        const scrollKey = `ruangaksara_scroll_${karyaId}_${chapterNo}`;
        const savedScroll = localStorage.getItem(scrollKey);

        if (savedScroll) {
            setTimeout(() => {
                window.scrollTo({
                    top: Number(savedScroll),
                    behavior: 'smooth'
                });
            }, 300);
        }

        let timeoutId: NodeJS.Timeout;
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const header = document.getElementById('reading-header');
            const nav = document.getElementById('reading-nav');

            // [LOGIC] Directional Visibility Toggle
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header?.classList.add('-translate-y-full');
                nav?.classList.add('translate-y-40');
            } else {
                header?.classList.remove('-translate-y-full');
                nav?.classList.remove('translate-y-40');
            }
            lastScrollY = currentScrollY;

            // [SYNC] Persist position every 1s of inactivity
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                localStorage.setItem(scrollKey, window.scrollY.toString());
            }, 1000);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [karyaId, chapterNo]);

    const handleSetFontSize = (size: number) => {
        const newSize = Math.max(12, Math.min(32, size));
        setFontSize(newSize);
        localStorage.setItem('ruangaksara_fontsize', newSize.toString());
    };

    const handleSetFontFamily = (font: string) => {
        setFontFamily(font);
        localStorage.setItem('ruangaksara_fontfamily', font);
    };

    const handleSetLineHeight = (leading: number) => {
        const newLeading = Math.max(1.2, Math.min(2.5, leading));
        setLineHeight(newLeading);
        localStorage.setItem('ruangaksara_lineheight', newLeading.toString());
    };

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            {/* Header Sticky Atas - Minimalist & Focus Friendly */}
            <header id="reading-header" className="px-4 h-16 bg-bg-cream/95 dark:bg-brown-dark/40 backdrop-blur-md border-b border-tan-primary/5 flex items-center justify-between sticky top-0 z-40 transition-all duration-500">
                <Link href={`/novel/${karyaId}`} prefetch={false} className="p-2 -ml-2 text-brown-dark dark:text-text-accent hover:bg-tan-primary/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1 px-4">
                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className="w-full group focus:outline-none"
                    >
                        <div className="flex flex-col items-center">
                            <h1 className="font-black text-[16px] text-brown-dark/90 dark:text-text-accent leading-none group-hover:text-tan-primary transition-colors uppercase tracking-tight">Bab {chapterNo}</h1>
                            <p className="text-[11px] text-tan-primary/40 dark:text-tan-light/40 truncate max-w-[200px] mx-auto font-black uppercase tracking-widest mt-1.5">{chapterTitle || novelTitle}</p>
                        </div>
                    </button>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 -mr-2 text-brown-dark dark:text-text-accent hover:bg-tan-primary/10 rounded-full transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* APPEARANCE CONTROLS */}
                    {showSettings && (
                        <div className="absolute top-full right-0 mt-3 w-72 bg-white/95 dark:bg-brown-dark/95 backdrop-blur-xl border border-tan-primary/20 dark:border-white/10 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] p-6 z-50 animate-in fade-in slide-in-from-top-2 overflow-y-auto max-h-[80vh]">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-tan-primary uppercase tracking-[0.2em] italic">Preferebsi Baca</span>
                                <button onClick={() => setShowSettings(false)} className="text-tan-primary hover:text-white hover:bg-tan-primary rounded-full p-2 bg-tan-primary/10 transition-all">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Font Size Logic */}
                                <div>
                                    <label className="text-[9px] text-tan-primary dark:text-gray-500 uppercase font-black tracking-[0.2em] mb-3 block italic">Ukuran Aksara</label>
                                    <div className="flex items-center justify-between bg-tan-primary/10 dark:bg-brown-mid border border-tan-primary/10 rounded-[1.5rem] p-1.5 shadow-inner">
                                        <button
                                            onClick={() => handleSetFontSize(fontSize - 2)}
                                            className="p-2.5 hover:bg-bg-cream dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-brown-dark dark:text-gray-300 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                                            disabled={fontSize <= 12}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-black text-brown-dark dark:text-text-accent min-w-[3rem] text-center italic">{fontSize}px</span>
                                        <button
                                            onClick={() => handleSetFontSize(fontSize + 2)}
                                            className="p-2.5 hover:bg-bg-cream dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-brown-dark dark:text-gray-300 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                                            disabled={fontSize >= 32}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Font Family Switcher */}
                                <div>
                                    <label className="text-[9px] text-tan-primary dark:text-gray-500 uppercase font-black tracking-[0.2em] mb-3 block italic">Gaya Aksara</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'serif', label: 'Klasik', class: 'font-serif' },
                                            { id: 'sans', label: 'Modern', class: 'font-sans' },
                                            { id: 'mono', label: 'Teknis', class: 'font-mono' }
                                        ].map((f) => (
                                            <button
                                                key={f.id}
                                                onClick={() => handleSetFontFamily(f.id)}
                                                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    fontFamily === f.id 
                                                    ? 'bg-tan-primary text-text-accent shadow-md' 
                                                    : 'bg-tan-primary/10 text-brown-dark dark:text-tan-light hover:bg-tan-primary/20'
                                                } ${f.class}`}
                                            >
                                                {f.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Line Height Control */}
                                <div>
                                    <label className="text-[9px] text-tan-primary dark:text-gray-500 uppercase font-black tracking-[0.2em] mb-3 block italic">Jarak Baris</label>
                                    <div className="flex items-center justify-between bg-tan-primary/10 dark:bg-brown-mid border border-tan-primary/10 rounded-[1.5rem] p-1.5 shadow-inner">
                                        <button
                                            onClick={() => handleSetLineHeight(lineHeight - 0.2)}
                                            className="p-2.5 hover:bg-bg-cream dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-brown-dark dark:text-gray-300 shadow-sm"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-[10px] font-black text-brown-dark dark:text-text-accent italic">{lineHeight.toFixed(1)}</span>
                                        <button
                                            onClick={() => handleSetLineHeight(lineHeight + 0.2)}
                                            className="p-2.5 hover:bg-bg-cream dark:hover:bg-slate-700 rounded-xl transition-all active:scale-95 text-brown-dark dark:text-gray-300 shadow-sm"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Theme Mode Toggle */}
                                <div>
                                    <label className="text-[9px] text-tan-primary dark:text-gray-500 uppercase font-black tracking-[0.2em] mb-3 block italic">Suasana Jelajah</label>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center justify-between bg-tan-primary/10 dark:bg-brown-mid border border-tan-primary/10 rounded-[1.5rem] p-4 hover:bg-bg-cream dark:hover:bg-slate-700 transition-all active:scale-95 text-brown-dark dark:text-gray-200 shadow-sm group"
                                    >
                                        <span className="text-xs font-black uppercase tracking-widest italic">{mounted && theme === 'dark' ? 'Hening Terang' : 'Hening Gelap'}</span>
                                        {mounted && theme === 'dark' ? (
                                            <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-45 transition-transform" />
                                        ) : (
                                            <Moon className="w-5 h-5 text-tan-primary group-hover:-rotate-12 transition-transform" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Backdrop for closing dropdown */}
            {showSettings && (
                <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
            )}

            {/* MAIN CONTENT AREA */}
            <main className="px-6 py-8 sm:px-12 md:max-w-2xl md:mx-auto min-h-[70vh]">
                <article
                    className={`prose dark:prose-invert mx-auto text-justify whitespace-pre-wrap text-brown-dark dark:text-tan-light/90 max-w-none transition-all duration-200 ${
                        fontFamily === 'serif' ? 'font-serif' : 
                        fontFamily === 'mono' ? 'font-mono' : 'font-sans'
                    }`}
                    style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
                >
                    {content}
                </article>

                {/* END-OF-CHAPTER SOCIAL HUB */}
                <div className="mt-20 pt-12 border-t border-tan-primary/10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-tan-primary/10 text-tan-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        Hore! Goresan Terakhir Selesai
                    </div>
                    <h3 className="text-2xl font-black text-brown-dark dark:text-text-accent mb-2 italic tracking-tighter uppercase">Bagaimana Rasanya?</h3>
                    <p className="text-xs font-black text-tan-primary/40 dark:text-tan-light mb-10 max-w-xs mx-auto uppercase tracking-widest leading-relaxed">Berikan jejak ekspresimu untuk bab ini.</p>

                    <div className="flex items-center justify-center gap-4 mb-8">
                        {REACTIONS.map((r) => {
                            const count = reactionStats?.find(s => s.reaction_type === r.type)?._count._all || 0;
                            const isActive = userReaction === r.type;

                            return (
                                <button
                                    key={r.type}
                                    onClick={() => handleReaction(r.type)}
                                    className={`flex flex-col items-center gap-2 transition-all active:scale-90 group`}
                                >
                                    <div className={`w-16 h-16 rounded-[1.25rem] flex items-center justify-center text-2xl transition-all border-2 ${isActive
                                        ? 'bg-brown-dark border-brown-dark shadow-xl shadow-brown-dark/20 scale-110'
                                        : 'bg-bg-cream/50 dark:bg-brown-dark/40 border-tan-primary/10 dark:border-brown-mid hover:border-tan-primary group-hover:bg-tan-primary/5'
                                        }`}>
                                        {r.emoji}
                                    </div>
                                    <div className="flex flex-col items-center mt-1">
                                        <span className={`text-[9px] font-black uppercase tracking-wider ${isActive ? 'text-brown-dark dark:text-tan-primary' : 'text-tan-primary/40'}`}>{r.label}</span>
                                        <span className="text-[10px] font-black text-tan-primary/20 dark:text-gray-600">{count}</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </main>

            <ChapterPicker
                karyaId={karyaId}
                currentChapterNo={chapterNo}
                isOpen={isOpenPicker}
                onClose={() => setIsOpenPicker(false)}
            />

            {/* BOTTOM NAV: "Floating" Navigation Anchor */}
            <nav id="reading-nav" className="fixed bottom-10 left-1/2 -translate-x-1/2 z-40 transition-all duration-300">
                <div className="bg-bg-cream/95 dark:bg-brown-dark/80 backdrop-blur-3xl px-2 py-2 rounded-full flex items-center gap-2 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] border border-tan-primary/10 dark:border-white/5">
                    {/* Previous Chapter Button */}
                    {prevChapter ? (
                        <Link 
                            href={`/novel/${karyaId}/${prevChapter}`} 
                            prefetch={false}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-tan-primary/5 text-tan-primary hover:text-brown-dark hover:bg-tan-primary transition-all active:scale-90"
                            title="Bab Sebelumnya"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </Link>
                    ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-tan-primary/[0.02] text-tan-primary/20 cursor-not-allowed">
                            <ChevronLeft className="w-6 h-6" />
                        </div>
                    )}

                    {/* Chapter Picker Trigger */}
                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className="flex items-center gap-3 px-6 py-2 rounded-full border border-tan-primary/5 bg-tan-primary/5 hover:bg-tan-primary/10 transition-all active:scale-95 group"
                    >
                        <span className="text-[11px] font-black text-brown-dark dark:text-text-accent uppercase tracking-[0.25em] italic">
                            Bab {chapterNo}
                        </span>
                        <ChevronDown className="w-3 h-3 text-tan-primary group-hover:rotate-180 transition-transform duration-500" />
                    </button>

                    {/* Next Chapter Button */}
                    {nextChapter ? (
                        <Link 
                            href={`/novel/${karyaId}/${nextChapter}`} 
                            prefetch={false}
                            className="w-12 h-12 flex items-center justify-center rounded-full bg-brown-dark text-text-accent shadow-lg shadow-brown-dark/10 hover:scale-105 transition-all active:scale-90"
                            title="Bab Selanjutnya"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Link>
                    ) : (
                        <div className="w-12 h-12 flex items-center justify-center rounded-full bg-tan-primary/[0.02] text-tan-primary/20 cursor-not-allowed" title="Bab Terakhir">
                            <RotateCcw className="w-5 h-5 opacity-50" />
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
