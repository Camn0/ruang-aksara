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
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${isBookmarked ? 'bg-tan-primary/10 border-tan-primary/30 text-tan-primary' : 'bg-tan-primary/5 border-tan-primary/5 text-tan-primary/30 hover:border-tan-primary/20 hover:text-tan-primary/50 dark:bg-slate-800/50 dark:border-slate-800'}`}
            title={isBookmarked ? "Hapus dari Library" : "Tambahkan ke Library"}
        >
            <BookMarked className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
    );
}
