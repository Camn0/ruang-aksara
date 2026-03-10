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
            <header className="px-4 h-14 bg-[#FDFBF7]/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-40 shadow-sm transition-transform duration-300">
                <Link href={`/novel/${karyaId}`} className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-200 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex-1 px-4">
                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className="w-full group focus:outline-none"
                    >
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] font-black uppercase tracking-[0.2em] mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <List className="w-2 h-2" /> Daftar Isi
                            </div>
                            <h1 className="font-black text-sm text-gray-900 dark:text-gray-100 leading-none group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">Bab {chapterNo}</h1>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[180px] mx-auto font-medium">{chapterTitle || novelTitle}</p>
                        </div>
                    </button>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 -mr-2 text-gray-900 dark:text-gray-100 active:bg-gray-200 dark:active:bg-slate-800 rounded-full transition-colors"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    {/* Dropdown Settings */}
                    {showSettings && (
                        <div className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengaturan</span>
                                <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-1 bg-gray-50 dark:bg-slate-800">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-2 block">Ukuran Teks</label>
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-1">
                                        <button
                                            onClick={() => handleSetFontSize(fontSize - 2)}
                                            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors active:scale-95 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                            disabled={fontSize <= 12}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="text-sm font-bold text-gray-900 dark:text-gray-100 w-10 text-center">{fontSize}px</span>
                                        <button
                                            onClick={() => handleSetFontSize(fontSize + 2)}
                                            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors active:scale-95 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                                            disabled={fontSize >= 32}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mb-2 block">Tema</label>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center justify-between bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl p-3 hover:bg-white dark:hover:bg-slate-700 transition-colors active:scale-95 text-gray-700 dark:text-gray-200"
                                    >
                                        <span className="text-sm font-bold">{mounted && theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}</span>
                                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
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
                    className="prose prose-indigo dark:prose-invert mx-auto text-justify leading-loose whitespace-pre-wrap text-[#2c2c2c] dark:text-[#d4d4d4] font-serif max-w-none transition-all duration-200"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {content}
                </article>

                {/* Reaction System */}
                <div className="mt-20 pt-12 border-t border-gray-100 dark:border-slate-800 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest mb-6">
                        Hore! Selesai Membaca
                    </div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2 italic">Gimana bab ini?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs mx-auto">Ekspresikan perasaanmu setelah membaca bab ini.</p>

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
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all border-2 ${isActive
                                        ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200 dark:shadow-none scale-110'
                                        : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-indigo-200'
                                        }`}>
                                        {r.emoji}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>{r.label}</span>
                                        <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600">{count}</span>
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
            <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 transition-all duration-300">
                <div className="flex bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-slate-800 p-1.5 rounded-full shadow-2xl items-center gap-2 transition-colors">
                    {/* Prev Chapter */}
                    {prevChapter ? (
                        <Link href={`/novel/${karyaId}/${prevChapter}`} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all active:scale-90" title="Bab Sebelumnya">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    ) : (
                        <div className="p-2.5 text-gray-300 dark:text-gray-700 cursor-not-allowed">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                    )}

                    <div className="w-[1px] h-6 bg-gray-100 dark:bg-slate-800" />

                    <Link href={`/novel/${karyaId}`} className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-full transition-all active:scale-90" title="Kembali ke Detail Novel">
                        <Home className="w-5 h-5" />
                    </Link>

                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className={`p-2.5 border-2 border-white dark:border-slate-950 rounded-full shadow-sm hover:scale-110 active:scale-90 transition-all font-black ${prevChapter
                            ? 'bg-indigo-600 text-white shadow-indigo-200 dark:shadow-none'
                            : 'bg-gray-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                            }`}
                        title="Daftar Isi"
                    >
                        <List className="w-5 h-5 shadow-sm" />
                    </button>

                    <div className="w-[1px] h-6 bg-gray-100 dark:bg-slate-800" />

                    {/* Next Chapter */}
                    {nextChapter ? (
                        <Link href={`/novel/${karyaId}/${nextChapter}`} className="p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-90 flex items-center gap-1.5 pl-3 pr-4" title="Bab Selanjutnya">
                            <span className="text-xs font-black uppercase">Lanjut</span>
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    ) : (
                        <div className="p-2.5 pr-4 text-gray-400 dark:text-gray-600 flex items-center gap-1.5" title="Bab Terakhir">
                            <span className="text-xs font-black uppercase tracking-wider">Tamat</span>
                            <RotateCcw className="w-4 h-4 opacity-50" />
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
