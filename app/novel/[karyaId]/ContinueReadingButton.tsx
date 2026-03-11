'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft } from 'lucide-react';

/**
 * ContinueReadingButton
 * 
 * Mengapa: Membaca progres dari localStorage secara aman di sisi client.
 * Komponen ini hanya muncul jika ada riwayat baca untuk karya ini.
 */
export default function ContinueReadingButton({ karyaId }: { karyaId: string }) {
    const [lastChapter, setLastChapter] = useState<number | null>(null);

    useEffect(() => {
        try {
            const bookmarks = JSON.parse(localStorage.getItem('ra-bookmarks') || '{}');
            const chapter = bookmarks[karyaId];
            if (chapter && chapter > 1) {
                setLastChapter(Number(chapter));
            }
        } catch (e) {
            console.error('Failed to load bookmark', e);
        }
    }, [karyaId]);

    if (!lastChapter) return null;

    return (
        <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <Link
                href={`/novel/${karyaId}/${lastChapter}`}
                className="flex items-center justify-between p-4 bg-white/40 border-2 border-ink/5 wobbly-border-sm group transition-all hover:bg-white hover:border-pine/20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 wobbly-border-sm bg-pine flex items-center justify-center text-parchment shadow-lg transition-transform group-hover:scale-110">
                        <BookOpen className="w-5 h-5 transition-transform group-hover:rotate-12" />
                    </div>
                    <div>
                        <p className="font-marker text-[9px] text-pine uppercase tracking-[0.2em] mb-0.5">Lanjutkan Petualangan</p>
                        <p className="font-journal-title text-xl text-ink-deep italic">Bab {lastChapter}</p>
                    </div>
                </div>
                <ArrowLeft className="w-6 h-6 text-pine rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
