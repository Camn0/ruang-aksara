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
                className="flex items-center justify-between p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl group transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/40"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Lanjutkan Membaca</p>
                        <p className="text-sm font-black text-gray-900 dark:text-gray-100">Bab {lastChapter}</p>
                    </div>
                </div>
                <ArrowLeft className="w-5 h-5 text-indigo-600 dark:text-indigo-400 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
        </div>
    );
}
