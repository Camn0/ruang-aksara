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
            className={`w-12 h-12 shrink-0 flex items-center justify-center wobbly-border border-2 transition-all active:scale-95 rotate-3 ${isBookmarked ? 'bg-pine border-pine text-parchment shadow-lg' : 'bg-white border-ink/5 text-ink/20 hover:border-pine hover:text-pine'}`}
            title={isBookmarked ? "Hapus dari Library" : "Tambahkan ke Library"}
        >
            <BookMarked className="w-6 h-6" fill={isBookmarked ? "currentColor" : "none"} />
        </button>
    );
}
