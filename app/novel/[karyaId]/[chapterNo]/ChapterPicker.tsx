'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { List, X, ChevronRight, BookOpen, Clock } from 'lucide-react';

interface ChapterPickerProps {
    karyaId: string;
    currentChapterNo: number;
    chapters: { chapter_no: number; title: string | null }[];
}

export default function ChapterPicker({ karyaId, currentChapterNo, chapters }: ChapterPickerProps) {
    const [isOpen, setIsOpen] = useState(false);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // Prevent scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    return (
        <>
            {/* Minimalist Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="p-2.5 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-full shadow-xl text-gray-500 hover:text-indigo-600 transition-all active:scale-90 flex items-center gap-2 group"
                title="Daftar Isi"
            >
                <List className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest overflow-hidden max-w-0 group-hover:max-w-[80px] transition-all duration-300 whitespace-nowrap">Daftar Isi</span>
            </button>

            {/* Premium Sheet Container */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col md:flex-row justify-end animate-in fade-in duration-300">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md transition-opacity"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* The "Sheet" / Sidebar */}
                    <div className="relative w-full md:w-96 h-[85vh] md:h-full bg-[#FDFBF7] dark:bg-slate-950 mt-auto md:mt-0 rounded-t-[3rem] md:rounded-t-none md:rounded-l-[3rem] shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.3)] dark:shadow-none flex flex-col overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-500 ease-out border-l border-white/10">

                        {/* Drag Handle for Mobile */}
                        <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mt-4 md:hidden shrink-0" />

                        {/* Header Section */}
                        <div className="px-8 pt-6 pb-6 border-b border-gray-100 dark:border-slate-900 flex items-center justify-between sticky top-0 z-10 bg-[#FDFBF7]/80 dark:bg-slate-950/80 backdrop-blur-md">
                            <div>
                                <h3 className="font-black text-2xl text-gray-900 dark:text-gray-100 flex items-center gap-3 italic tracking-tight">
                                    <BookOpen className="w-6 h-6 text-indigo-600" />
                                    Daftar Isi
                                </h3>
                                <div className="flex items-center gap-3 mt-1.5">
                                    <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded uppercase tracking-widest">{chapters.length} Bab</span>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Serial Karya</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-12 h-12 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all hover:rotate-90 active:scale-90"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Search/Filter (Future enhancement placeholder) */}
                        <div className="px-8 py-4 bg-gray-50/50 dark:bg-slate-900/30 flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Urutkan: Terlama</span>
                            <div className="flex gap-1">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                                <span className="w-2 h-2 bg-gray-200 dark:bg-slate-800 rounded-full"></span>
                            </div>
                        </div>

                        {/* Chapters List */}
                        <div className="flex-1 overflow-y-auto px-4 py-4 hide-scrollbar">
                            <div className="space-y-2">
                                {chapters.map((ch) => {
                                    const isActive = ch.chapter_no === currentChapterNo;
                                    return (
                                        <Link
                                            key={ch.chapter_no}
                                            href={`/novel/${karyaId}/${ch.chapter_no}`}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all group relative overflow-hidden ${isActive
                                                ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none translate-x-1'
                                                : 'bg-white dark:bg-slate-900 border border-gray-50 dark:border-slate-900 hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isActive ? 'bg-white/20' : 'bg-gray-50 dark:bg-slate-800 text-gray-400'}`}>
                                                {ch.chapter_no}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-black truncate leading-tight uppercase tracking-tight ${isActive ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                                                    {ch.title || `Bab ${ch.chapter_no}`}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-1">
                                                    {isActive ? (
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-indigo-200">Sedang Dibaca</span>
                                                    ) : (
                                                        <div className="flex items-center gap-1.5">
                                                            <Clock className="w-3 h-3 text-gray-300" />
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Bab Tersedia</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${isActive ? 'text-white' : 'text-gray-300'}`} />

                                            {/* Reflection Effect for Active */}
                                            {isActive && (
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Footer / Quick Navigation Action */}
                        <div className="p-8 border-t border-gray-100 dark:border-slate-900 bg-[#FDFBF7]/80 dark:bg-slate-950/80 backdrop-blur-md">
                            <Link
                                href={`/novel/${karyaId}`}
                                className="w-full h-14 bg-gray-900 dark:bg-white text-white dark:text-slate-950 rounded-full flex items-center justify-center font-black text-xs uppercase tracking-[0.2em] hover:bg-indigo-600 dark:hover:bg-indigo-500 dark:hover:text-white transition-all active:scale-95 gap-3"
                            >
                                <X className="w-4 h-4" /> Tutup & Kembali
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
