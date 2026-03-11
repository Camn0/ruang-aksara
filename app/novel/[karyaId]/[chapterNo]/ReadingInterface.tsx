'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Home, Settings, Type, List, RotateCcw, Plus, Minus, X, Sun, Moon, Star } from 'lucide-react';
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
            {/* Header: Bookmark Style */}
            <header className="px-4 h-16 bg-parchment-light/95 backdrop-blur-md border-b-4 border-ink-deep/10 flex items-center justify-between sticky top-0 z-40 transition-transform duration-500 selection:bg-pine/30">
                <Link href={`/novel/${karyaId}`} className="p-2 -ml-2 text-ink hover:text-pine hover:rotate-[-8deg] transition-all active:scale-90">
                    <ArrowLeft className="w-7 h-7" strokeWidth={1.5} />
                </Link>
                <div className="flex-1 px-4">
                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className="w-full group focus:outline-none"
                    >
                        <div className="flex flex-col items-center">
                            <h1 className="font-journal-title text-xl text-ink-deep leading-none group-hover:text-pine transition-colors">Bab {chapterNo}</h1>
                            <p className="font-marker text-[11px] text-ink/40 truncate max-w-[180px] mx-auto uppercase tracking-tighter mt-1">{chapterTitle || novelTitle}</p>
                        </div>
                    </button>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 -mr-2 text-ink hover:text-gold hover:rotate-[8deg] transition-all active:scale-90"
                    >
                        <Settings className="w-6 h-6" strokeWidth={1.5} />
                    </button>

                    {/* Dropdown Settings: Small Note Style */}
                    {showSettings && (
                        <div className="absolute top-full right-0 mt-4 w-60 bg-parchment wobbly-border paper-shadow p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300 rotate-[-1deg]">
                            <div className="flex items-center justify-between mb-6 border-b-2 border-ink/5 pb-2">
                                <span className="text-[10px] font-special text-pine uppercase tracking-widest">Catatan Penyesuaian</span>
                                <button onClick={() => setShowSettings(false)} className="text-ink/20 hover:text-dried-red transition-colors">
                                    <X className="w-5 h-5 wobbly-border-sm border-2 border-ink/5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-ink/40 uppercase font-marker tracking-widest mb-3 block">Ukuran Aksara</label>
                                    <div className="flex items-center justify-between bg-ink/5 wobbly-border-sm p-1">
                                        <button
                                            onClick={() => handleSetFontSize(fontSize - 2)}
                                            className="p-2 hover:bg-paper rounded-sm transition-all active:scale-90 text-ink/60 disabled:opacity-30"
                                            disabled={fontSize <= 12}
                                        >
                                            <Minus className="w-5 h-5" />
                                        </button>
                                        <span className="font-journal-title text-xl text-ink-deep w-12 text-center">{fontSize}</span>
                                        <button
                                            onClick={() => handleSetFontSize(fontSize + 2)}
                                            className="p-2 hover:bg-paper rounded-sm transition-all active:scale-90 text-ink/60 disabled:opacity-30"
                                            disabled={fontSize >= 32}
                                        >
                                            <Plus className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-ink/40 uppercase font-marker tracking-widest mb-3 block">Suasana</label>
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full flex items-center justify-between bg-paper/50 wobbly-border-sm p-3 hover:bg-gold/10 transition-all active:scale-95 group"
                                    >
                                        <span className="font-marker text-sm text-ink-deep">{mounted && theme === 'dark' ? 'Terang Benderang' : 'Hutan Gelap'}</span>
                                        {mounted && theme === 'dark' ? <Sun className="w-5 h-5 text-gold" /> : <Moon className="w-5 h-5 text-pine" />}
                                    </button>
                                </div>
                            </div>
                            <div className="mt-6 pt-4 border-t-2 border-ink/5 text-center">
                                <p className="text-[9px] font-special text-ink/20 italic">"Gunakan mata Anda dengan bijak."</p>
                            </div>
                        </div>
                    )}
                </div>
            </header>

            {/* Overlays to close dropdown */}
            {showSettings && (
                <div className="fixed inset-0 z-30" onClick={() => setShowSettings(false)} />
            )}

            <main className="px-6 py-12 sm:px-12 md:max-w-3xl md:mx-auto min-h-[70vh]">
                <div className="bg-paper/80 p-8 sm:p-12 wobbly-border paper-shadow-lg relative overflow-hidden transition-all duration-700">
                    <article
                        className="prose prose-stone dark:prose-invert mx-auto text-justify leading-loose whitespace-pre-wrap text-ink-deep font-journal-body max-w-none selection:bg-gold/40 scroll-smooth"
                        style={{ fontSize: `${fontSize}px` }}
                    >
                        {content}
                    </article>

                    {/* Decorative ink splatters for longer content */}
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-ink-deep/5 pointer-events-none rounded-full blur-3xl" />
                    <div className="absolute -top-10 -left-10 w-24 h-24 bg-pine/5 pointer-events-none rounded-full blur-2xl" />
                </div>

                {/* Reaction System: Paper Scraps */}
                <div className="mt-24 pt-16 border-t-4 border-ink/5 text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-block px-6 py-1.5 wobbly-border-sm bg-gold/20 text-ink-deep text-[11px] font-special uppercase tracking-widest mb-8 rotate-[-1deg]">
                        Lembaran ini Telah Selesai
                    </div>
                    <h3 className="text-3xl font-journal-title text-ink-deep mb-4 italic">Bagaimana jejak tinta ini?</h3>
                    <p className="font-journal-body text-[15px] text-ink/50 mb-10 max-w-xs mx-auto italic">"Berikan tandamu agar penulis tahu Anda telah sampai di sini."</p>

                    <div className="flex items-center justify-center gap-6 mb-12">
                        {REACTIONS.map((r, i) => {
                            const count = reactionStats?.find(s => s.reaction_type === r.type)?._count._all || 0;
                            const isActive = userReaction === r.type;
                            const rotation = (i % 2 === 0 ? -5 : 5) + (Math.random() * 4 - 2);

                            return (
                                <button
                                    key={r.type}
                                    onClick={() => handleReaction(r.type)}
                                    className="flex flex-col items-center gap-3 transition-all active:scale-90 group"
                                    style={{ transform: `rotate(${rotation}deg)` }}
                                >
                                    <div className={`w-16 h-16 wobbly-border flex items-center justify-center text-3xl transition-all paper-shadow ${isActive
                                        ? 'bg-gold border-ink-deep scale-110'
                                        : 'bg-paper dark:bg-parchment border-ink/10 hover:border-pine hover:bg-parchment-light'
                                        }`}>
                                        {r.emoji}
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className={`text-[11px] font-marker uppercase tracking-widest ${isActive ? 'text-ink-deep font-bold' : 'text-ink/40'}`}>{r.label}</span>
                                        <span className="text-[10px] font-special text-ink/20 mt-1">{count} Jejak</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-8">
                        <Star className="w-12 h-12 text-ink/5 mx-auto rotate-12" />
                    </div>
                </div>
            </main>

            {/* Chapter Picker Overlay */}
            <ChapterPicker
                karyaId={karyaId}
                currentChapterNo={chapterNo}
                chapters={allChapters}
                isOpen={isOpenPicker}
                onClose={() => setIsOpenPicker(false)}
            />

            {/* Bottom Floating Navigation: Scroll Tabs style */}
            <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 transition-all duration-500 selection:bg-pine/30">
                <div className="flex bg-parchment-light/90 backdrop-blur-md wobbly-border paper-shadow p-2 items-center gap-3 rotate-[-0.5deg]">
                    {/* Prev Chapter */}
                    {prevChapter ? (
                        <Link href={`/novel/${karyaId}/${prevChapter}`} className="p-3 text-ink/60 hover:text-pine hover:bg-paper wobbly-border-sm transition-all active:scale-90 hover:rotate-[-6deg]" title="Mundur">
                            <ArrowLeft className="w-6 h-6" strokeWidth={2} />
                        </Link>
                    ) : (
                        <div className="p-3 text-ink/10 cursor-not-allowed">
                            <ArrowLeft className="w-6 h-6" />
                        </div>
                    )}

                    <div className="w-1 h-8 bg-ink/5 wobbly-border-sm" />

                    <Link href={`/novel/${karyaId}`} className="p-3 text-ink/60 hover:text-pine hover:bg-paper wobbly-border-sm transition-all active:scale-90 hover:rotate-12" title="Rumah Novel">
                        <Home className="w-6 h-6" strokeWidth={2} />
                    </Link>

                    <button
                        onClick={() => setIsOpenPicker(true)}
                        className={`p-3 wobbly-border shadow-sm hover:scale-110 active:scale-90 transition-all rotate-3 ${prevChapter
                            ? 'bg-ink-deep text-parchment border-gold shadow-lg'
                            : 'bg-paper text-pine border-ink/10'
                            }`}
                        title="Daftar Isi"
                    >
                        <List className="w-6 h-6" strokeWidth={2.5} />
                    </button>

                    <div className="w-1 h-8 bg-ink/5 wobbly-border-sm" />

                    {/* Next Chapter */}
                    {nextChapter ? (
                        <Link href={`/novel/${karyaId}/${nextChapter}`} className="bg-pine text-parchment wobbly-border-sm px-6 py-3 hover:bg-ink-deep transition-all active:scale-95 flex items-center gap-3 shadow-md rotate-[-2deg]" title="Lanjut Melangkah">
                            <span className="text-sm font-journal-title tracking-widest pt-0.5">TERUSKAN</span>
                            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                        </Link>
                    ) : (
                        <div className="px-6 py-3 text-ink/20 font-journal-title tracking-widest opacity-50 flex items-center gap-3 bg-ink/5 wobbly-border-sm" title="Akhir Lembaran">
                            <span>TAMAT</span>
                            <RotateCcw className="w-5 h-5" />
                        </div>
                    )}
                </div>
            </nav>
        </>
    );
}
