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
        <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-500">
            <Link
                href={`/novel/${karyaId}/${lastChapter}`}
                className="flex items-center justify-between p-5 bg-tan-primary/5 dark:bg-tan-900/20 border border-tan-primary/10 rounded-[2rem] group transition-all hover:bg-tan-primary/10 shadow-sm"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-brown-dark flex items-center justify-center text-text-accent shadow-xl shadow-brown-dark/20 transition-transform group-hover:scale-110">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-tan-primary uppercase tracking-[0.2em]">Lanjutkan Jejak</p>
                        <p className="text-sm font-black text-brown-dark dark:text-gray-100 italic">Bab {lastChapter}</p>
                    </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-tan-primary rotate-180 group-hover:translate-x-1 transition-all" />
            </Link>
        </div>
    );
}
