'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Home, Settings, Type, List, RotateCcw, Plus, Minus, X, Sun, Moon } from 'lucide-react';
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
    allChapters: { chapter_no: number; title: string | null }[];
    userReaction?: string;
    reactionStats?: { reaction_type: string; _count: { _all: number } }[];
}

export default function ReadingInterface({
    karyaId,
    babId,
    chapterNo,
    novelTitle,
    chapterTitle,
    content,
    nextChapter,
    prevChapter,
    allChapters,
    userReaction: initialUserReaction,
    reactionStats
}: ReadingInterfaceProps) {
    const [fontSize, setFontSize] = useState(18); // default 18px
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

    const handleReaction = async (type: string) => {
        const prev = userReaction;
        const next = type === userReaction ? undefined : type;
        setUserReaction(next);
        const { submitChapterReaction } = await import('@/app/actions/chapter');
        // @ts-ignore - Temporary until types sync
        const res = await submitChapterReaction(babId, type, karyaId);
        if (res.error) {
            setUserReaction(prev);
        }
    };

    // Keyboard Navigation
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

    // Load from local storage and handle mounting function for theme
    useEffect(() => {
        const savedSize = localStorage.getItem('ruangaksara_fontsize');
        if (savedSize) {
            setFontSize(Number(savedSize));
        }
        setMounted(true);
    }, []);

    // Scroll Tracking & Immersive UI Restore
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
            const header = document.querySelector('header');
            const nav = document.querySelector('nav');

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                header?.classList.add('-translate-y-full');
                nav?.classList.add('translate-y-full', 'opacity-0');
            } else {
                header?.classList.remove('-translate-y-full');
                nav?.classList.remove('translate-y-full', 'opacity-0');
            }
            lastScrollY = currentScrollY;

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

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <>
            {/* Header Sticky Atas */}
            <header className="px-4 h-16 bg-bg-cream/95 dark:bg-brown-dark/95 backdrop-blur-md border-b border-tan-primary/10 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-all duration-300">
                <Link href={`/novel/${karyaId}`} className="p-2 -ml-2 text-brown-dark dark:text-text-accent hover:bg-tan-primary/10 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1 px-4">
                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className="w-full group focus:outline-none"
                    >
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-tan-primary/10 text-tan-primary text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <List className="w-2 h-2" /> Daftar Isi
                            </div>
                            <h1 className="font-black text-sm text-brown-dark dark:text-text-accent leading-none group-hover:text-tan-primary transition-colors">Bab {chapterNo}</h1>
                            <p className="text-[10px] text-tan-primary/60 dark:text-tan-light truncate max-w-[180px] mx-auto font-black uppercase tracking-tighter mt-1">{chapterTitle || novelTitle}</p>
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

                    {/* Dropdown Settings */}
                    {showSettings && (
                        <div className="absolute top-full right-0 mt-3 w-64 bg-bg-cream dark:bg-brown-dark border border-tan-primary/10 rounded-[2rem] shadow-2xl p-6 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black text-tan-primary/40 uppercase tracking-[0.2em]">Pengaturan</span>
                                <button onClick={() => setShowSettings(false)} className="text-tan-primary/40 hover:text-tan-primary rounded-full p-1.5 bg-tan-primary/5 transition-colors">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[9px] text-tan-primary/60 dark:text-gray-500 uppercase font-black tracking-[0.2em] mb-3 block italic">Teropong Aksara</label>
                                    <div className="flex items-center justify-between bg-tan-primary/5 dark:bg-brown-mid border border-tan-primary/5 rounded-[1.25rem] p-1.5 shadow-inner">
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

                                <div>
                                    <label className="text-[9px] text-tan-primary/60 dark:text-gray-500 uppercase font-black tracking-[0.2em] mb-3 block italic">Suasana Jelajah</label>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center justify-between bg-tan-primary/5 dark:bg-brown-mid border border-tan-primary/5 rounded-[1.25rem] p-4 hover:bg-bg-cream dark:hover:bg-slate-700 transition-all active:scale-95 text-brown-dark dark:text-gray-200 shadow-sm group"
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

            {/* Overlays to close dropdown */}
            {showSettings && (
                <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
            )}

            <main className="px-6 py-8 sm:px-12 md:max-w-2xl md:mx-auto min-h-[70vh]">
                <article
                    className="prose dark:prose-invert mx-auto text-justify leading-loose whitespace-pre-wrap text-brown-dark dark:text-tan-light/90 font-serif max-w-none transition-all duration-200"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {content}
                </article>

                {/* Reaction System */}
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

            {/* Chapter Picker Overlay (Now more prominent) */}
            <ChapterPicker
                karyaId={karyaId}
                currentChapterNo={chapterNo}
                chapters={allChapters}
                isOpen={isOpenPicker}
                onClose={() => setIsOpenPicker(false)}
            />

            {/* Bottom Floating Navigation - Adjusted Position (bottom-6) */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 transition-all duration-300">
                <div className="flex bg-bg-cream/98 dark:bg-brown-dark/95 backdrop-blur-2xl border border-tan-primary/10 shadow-[0_20px_50px_-15px_rgba(59,42,34,0.3)] p-2 rounded-[2rem] items-center gap-2 transition-colors">
                    {/* Prev Chapter */}
                    {prevChapter ? (
                        <Link href={`/novel/${karyaId}/${prevChapter}`} className="p-3 text-tan-primary/60 hover:text-brown-dark hover:bg-tan-primary/10 rounded-full transition-all active:scale-90" title="Bab Sebelumnya">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    ) : (
                        <div className="p-3 text-tan-primary/20 cursor-not-allowed">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                    )}

                    <div className="w-[1px] h-6 bg-tan-primary/10" />

                    <Link href={`/novel/${karyaId}`} className="p-3 text-tan-primary/60 hover:text-brown-dark hover:bg-tan-primary/10 rounded-full transition-all active:scale-90" title="Kembali ke Detail Novel">
                        <Home className="w-5 h-5" />
                    </Link>

                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className={`p-3 border-4 border-white dark:border-slate-950 rounded-full shadow-lg hover:scale-110 active:scale-90 transition-all font-black ${prevChapter
                            ? 'bg-brown-dark text-text-accent shadow-brown-dark/20'
                            : 'bg-tan-primary/10 text-tan-primary'
                            }`}
                        title="Daftar Isi"
                    >
                        <List className="w-6 h-6" />
                    </button>

                    <div className="w-[1px] h-6 bg-tan-primary/10" />

                    {/* Next Chapter */}
                    {nextChapter ? (
                        <Link href={`/novel/${karyaId}/${nextChapter}`} className="p-3 bg-brown-dark text-text-accent rounded-full shadow-lg shadow-brown-dark/20 hover:scale-105 transition-all active:scale-90 flex items-center gap-1.5 pl-4 pr-5 group" title="Bab Selanjutnya">
                            <span className="text-[10px] font-black uppercase tracking-widest italic">Lanjut</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    ) : (
                        <div className="p-3 pr-5 text-tan-primary/30 flex items-center gap-2" title="Bab Terakhir">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] italic">Tamat</span>
                            <RotateCcw className="w-4 h-4 opacity-50" />
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
