'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { List, X, ChevronRight, BookOpen, Clock, ArrowLeft } from 'lucide-react';

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
                className="absolute inset-0 bg-ink-deep/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-500"
                onClick={() => setIsOpen(false)}
            />

            {/* The "Journal Index" sidebar */}
            <div className="relative w-full md:w-96 h-[90vh] md:h-full bg-parchment dark:bg-parchment-dark mt-auto md:mt-0 rounded-t-[3rem] md:rounded-t-none md:wobbly-border-l-4 border-ink-deep/20 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom md:slide-in-from-right duration-500 ease-out transition-colors">

                {/* Drag Handle for Mobile */}
                <div className="w-16 h-1.5 bg-ink/10 rounded-full mx-auto mt-4 md:hidden shrink-0" />

                {/* Header Section */}
                <div className="px-8 pt-8 pb-8 border-b-2 border-dotted border-ink/10 flex items-center justify-between sticky top-0 z-10 bg-parchment/80 dark:bg-parchment-dark/80 backdrop-blur-md">
                    <div>
                        <h3 className="font-journal-title text-3xl text-ink-deep flex items-center gap-3 italic">
                            <BookOpen className="w-7 h-7 text-pine rotate-[-12deg]" />
                            Indeks Bab
                        </h3>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] font-special bg-pine/10 text-pine px-2 py-0.5 wobbly-border-sm uppercase tracking-widest">{chapters.length} Goresan</span>
                            <span className="w-1 h-1 bg-ink/10 rounded-full"></span>
                            <span className="text-[10px] font-marker text-ink/40 uppercase tracking-widest italic">Terarsip</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-12 h-12 bg-white/40 wobbly-border-sm flex items-center justify-center text-ink/30 hover:text-dried-red hover:rotate-90 transition-all active:scale-90"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Chapters List */}
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar">
                    <div className="space-y-4">
                        {chapters.map((ch) => {
                            const isActive = ch.chapter_no === currentChapterNo;
                            return (
                                <Link
                                    key={ch.chapter_no}
                                    href={`/novel/${karyaId}/${ch.chapter_no}`}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-5 px-6 py-5 wobbly-border-sm transition-all group relative overflow-hidden ${isActive
                                        ? 'bg-gold text-ink-deep shadow-lg translate-x-2 border-ink-deep'
                                        : 'bg-white/40 dark:bg-parchment-dark/40 border-ink/5 hover:border-pine/30 hover:bg-white/80'
                                        }`}
                                >
                                    <div className={`w-10 h-10 wobbly-border-sm flex items-center justify-center text-sm font-journal-title shrink-0 ${isActive ? 'bg-ink-deep text-parchment rotate-[-6deg]' : 'bg-ink/5 text-ink/30'}`}>
                                        {ch.chapter_no}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className={`text-base font-journal-title truncate leading-tight italic ${isActive ? 'text-ink-deep' : 'text-ink/80 group-hover:text-pine'}`}>
                                            {ch.title || `Bab ${ch.chapter_no}`}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {isActive ? (
                                                <span className="text-[9px] font-special uppercase tracking-widest text-ink/40">Sedang Dibuka</span>
                                            ) : (
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3 text-ink/20" />
                                                    <span className="text-[9px] font-marker text-ink/30 uppercase tracking-tighter">Lembaran Tersimpan</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-2 ${isActive ? 'text-ink-deep' : 'text-ink/20'}`} />

                                    {/* Paper Texture Overlay for Active */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-parchment-texture opacity-5 pointer-events-none"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t-2 border-dotted border-ink/10 bg-parchment/80 dark:bg-parchment-dark/80 backdrop-blur-md">
                    <Link
                        href={`/novel/${karyaId}`}
                        className="w-full h-14 bg-ink-deep text-parchment wobbly-border flex items-center justify-center font-journal-title text-xl hover:bg-pine hover:text-white transition-all active:scale-95 gap-3 rotate-[1deg] shadow-lg"
                    >
                        <ArrowLeft className="w-5 h-5" /> Kembali ke Arsip Utama
                    </Link>
                    <p className="text-[10px] font-special text-ink/20 text-center mt-6 uppercase tracking-[0.3em]">Ruang Aksara — Jilid IV</p>
                </div>
            </div>
        </div>
    );
}
