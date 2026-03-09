'use client';

import { useState } from 'react';
import { BookMarked } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BookmarkButton({ karyaId, isBookmarkedInitial }: { karyaId: string, isBookmarkedInitial: boolean }) {
    const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleBookmark = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ karyaId })
            });

            if (res.ok) {
                setIsBookmarked(!isBookmarked);
                router.refresh();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleBookmark}
            disabled={loading}
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-full border transition-all active:scale-95 ${isBookmarked ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-900/40 dark:border-indigo-500/50 dark:text-indigo-400' : 'bg-gray-50 border-gray-100 text-gray-400 hover:border-gray-200 dark:bg-slate-800/50 dark:border-slate-800 dark:text-gray-500 dark:hover:border-slate-700'}`}
            title={isBookmarked ? "Hapus dari Library" : "Tambahkan ke Library"}
        >
            <BookMarked className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
    );
}
