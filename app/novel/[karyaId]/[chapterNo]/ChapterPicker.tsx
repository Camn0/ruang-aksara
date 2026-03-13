'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { List, X, ChevronRight, BookOpen, Clock, ArrowRight } from 'lucide-react';

interface ChapterPickerProps {
    karyaId: string;
    currentChapterNo: number;
    chapters: { chapter_no: number; title: string | null }[];
    isOpen?: boolean;
    onClose?: () => void;
}

export default function ChapterPicker({
    karyaId,
    currentChapterNo,
    chapters,
    isOpen: controlledIsOpen,
    onClose: controlledOnClose
}: ChapterPickerProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(false);

    // Support both controlled and uncontrolled
    const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
    const setIsOpen = controlledOnClose !== undefined ? controlledOnClose : setInternalIsOpen;

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setIsOpen]);

    // Prevent scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col md:flex-row justify-end">
            <div
                className="absolute inset-0 bg-brown-dark/20 backdrop-blur-md transition-opacity animate-in fade-in duration-500"
                onClick={() => setIsOpen(false)}
            />

            {/* The "Sheet" / Sidebar */}
            <div className="relative w-full md:w-[420px] h-[95vh] md:h-full bg-[#FDFBF7] dark:bg-slate-950 mt-auto md:mt-0 rounded-t-[3.5rem] md:rounded-t-none md:rounded-l-[3.5rem] shadow-[-20px_0_60px_-15px_rgba(59,42,34,0.15)] flex flex-col overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-500 ease-out border-l border-tan-primary/10">

                {/* Drag Handle for Mobile */}
                <div className="w-12 h-1.5 bg-gray-200 dark:bg-slate-800 rounded-full mx-auto mt-4 md:hidden shrink-0" />

                {/* Header Section */}
                <div className="px-10 pt-10 pb-8 border-b border-tan-primary/5 flex items-center justify-between sticky top-0 z-10 bg-[#FDFBF7]/80 dark:bg-slate-950/80 backdrop-blur-md">
                    <div>
                        <h3 className="font-black text-3xl text-brown-dark dark:text-gray-100 flex items-center gap-4 italic tracking-tighter uppercase">
                            <List className="w-7 h-7 text-tan-primary" />
                            Goresan Bab
                        </h3>
                        <div className="flex items-center gap-3 mt-2.5">
                            <span className="text-[10px] font-black bg-brown-dark text-text-accent px-3 py-1 rounded-full uppercase tracking-widest italic shadow-lg shadow-brown-dark/10">{chapters.length} Bab Terukir</span>
                            <span className="w-1 h-1 bg-tan-primary/20 rounded-full"></span>
                            <span className="text-[10px] font-black text-tan-primary/40 uppercase tracking-[0.2em] italic">Serial Karya</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-12 h-12 bg-tan-primary/5 dark:bg-slate-900 border border-tan-primary/10 rounded-full flex items-center justify-center text-tan-primary/40 hover:text-brown-dark transition-all hover:rotate-90 active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
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
                                    className={`flex items-center gap-4 px-8 py-6 rounded-[2.5rem] transition-all group relative overflow-hidden border ${isActive
                                        ? 'bg-brown-dark text-text-accent border-brown-dark shadow-2xl shadow-brown-dark/20 translate-x-2'
                                        : 'bg-white dark:bg-slate-900 border-tan-primary/5 dark:border-slate-800 hover:border-tan-primary/20 hover:bg-tan-primary/5'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black shrink-0 shadow-inner ${isActive ? 'bg-white/10' : 'bg-tan-primary/5 dark:bg-slate-800 text-tan-primary/40'}`}>
                                        {ch.chapter_no}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-sm font-black truncate leading-tight uppercase tracking-tight italic ${isActive ? 'text-text-accent' : 'text-brown-dark dark:text-gray-100'}`}>
                                            {ch.title || `Bab ${ch.chapter_no}`}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            {isActive ? (
                                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-text-accent/40 italic">Sedang Dijelajahi</span>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-3 h-3 text-tan-primary/20" />
                                                    <span className="text-[9px] font-black text-tan-primary/40 uppercase tracking-widest italic">Tersedia</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1.5 ${isActive ? 'text-text-accent' : 'text-tan-primary/20'}`} />

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
                <div className="p-10 border-t border-tan-primary/5 bg-[#FDFBF7]/80 dark:bg-slate-950/80 backdrop-blur-md">
                    <Link
                        href={`/novel/${karyaId}`}
                        className="w-full h-16 bg-brown-dark text-text-accent rounded-full flex items-center justify-center font-black text-[10px] uppercase tracking-[0.3em] hover:scale-105 transition-all active:scale-95 gap-4 group"
                    >
                        Tutup & Kembali <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
