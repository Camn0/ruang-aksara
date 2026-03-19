'use client';

import { useState } from 'react';
import { Plus, Check } from 'lucide-react';
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
            className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${isBookmarked ? 'bg-green-500/10 border-green-500/30 text-green-600 shadow-sm' : 'bg-tan-primary/5 border-tan-primary/5 text-tan-primary/30 hover:border-tan-primary/20 hover:text-tan-primary/50 dark:bg-brown-mid/20 dark:border-brown-mid/50'}`}
            title={isBookmarked ? "Hapus dari Library" : "Tambahkan ke Library"}
        >
            {isBookmarked ? (
                <Check className="w-5 h-5 stroke-[3]" />
            ) : (
                <Plus className="w-5 h-5 stroke-[3]" />
            )}
        </button>
    );
}
