'use client';

import { useEffect } from 'react';
import { updateReadingProgress } from '@/app/actions/user';

interface ReadingProgressTrackerProps {
    karyaId: string;
    chapterNo: number;
    userId?: string;
}

/**
 * ReadingProgressTracker (Client Component)
 * 
 * Mengapa: 
 * 1. Menghindari Write DB saat Prefetch: Komponen ini hanya dieksekusi saat bab benar-benar
 *    dirender di browser user (mounted).
 * 2. Instancy: Update localStorage secara instan untuk UI, lalu sync ke DB di background.
 */
export default function ReadingProgressTracker({ karyaId, chapterNo, userId }: ReadingProgressTrackerProps) {
    useEffect(() => {
        // [1] Update LocalStorage (Instant UI)
        try {
            const bookmarks = JSON.parse(localStorage.getItem('ra-bookmarks') || '{}');
            bookmarks[karyaId] = chapterNo;
            localStorage.setItem('ra-bookmarks', JSON.stringify(bookmarks));
        } catch (e) {
            console.warn("⚠️ [LocalStorage] Gagal menyimpan progres lokal.");
        }

        // [2] Sync ke Database (Server side) - Hanya jika user login
        if (userId) {
            // Menggunakan Server Action secara Fire & Forget
            updateReadingProgress(karyaId, chapterNo).catch(err => {
                console.error("⚠️ [Sync] Gagal sinkronisasi bookmark ke server:", err);
            });
        }
    }, [karyaId, chapterNo, userId]);

    return null; // Komponen ini invisible (hanya logic)
}
