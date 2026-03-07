'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Settings, Plus, Minus, X, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

interface ReadingInterfaceProps {
    karyaId: string;
    chapterNo: number;
    title: string;
    content: string;
}

export default function ReadingInterface({ karyaId, chapterNo, title, content }: ReadingInterfaceProps) {
    const [fontSize, setFontSize] = useState(18); // default 18px
    const [showSettings, setShowSettings] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();

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
            }, 300); // Allow some time for fonts and layout to shift before scrolling
        }

        let timeoutId: NodeJS.Timeout;
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Immersive UI Logic (Hide on scroll down, show on scroll up)
            const header = document.querySelector('header');
            const nav = document.querySelector('nav');

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down
                header?.classList.add('-translate-y-full');
                nav?.classList.add('translate-y-full', 'opacity-0');
            } else {
                // Scrolling up
                header?.classList.remove('-translate-y-full');
                nav?.classList.remove('translate-y-full', 'opacity-0');
            }
            lastScrollY = currentScrollY;

            // Scroll Tracking Storage
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                localStorage.setItem(scrollKey, window.scrollY.toString());
            }, 1000); // Save scroll position every 1 second of inactivity while scrolling
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeoutId);
        };
    }, [karyaId, chapterNo]);

    // Save to local storage
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
                <div className="text-center">
                    <h1 className="font-bold text-sm text-gray-900 dark:text-gray-100 leading-tight">Bab {chapterNo}</h1>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{title}</p>
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

            {/* Konten Membaca Utama */}
            <main className="px-6 py-8 sm:px-12 md:max-w-2xl md:mx-auto">
                <article
                    className="prose prose-indigo dark:prose-invert mx-auto text-justify leading-loose whitespace-pre-wrap text-[#2c2c2c] dark:text-[#d4d4d4] font-serif max-w-none transition-all duration-200"
                    style={{ fontSize: `${fontSize}px` }}
                >
                    {content}
                </article>
            </main>
        </>
    );
}
