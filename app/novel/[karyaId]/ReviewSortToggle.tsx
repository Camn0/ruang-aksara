'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { TrendingUp, Clock } from 'lucide-react';

export default function ReviewSortToggle({ karyaId }: { karyaId: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentSort = searchParams.get('sort') || 'new';

    const setSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        // Scroll to reviews section if needed, or just push
        router.push(`/novel/${karyaId}?${params.toString()}`, { scroll: false });
    };

    return (
        <div className="flex bg-ink/5 p-1 wobbly-border-sm w-fit backdrop-blur-sm">
            <button
                onClick={() => setSort('new')}
                className={`flex items-center gap-2 px-4 py-2 font-journal-title text-lg italic transition-all ${currentSort === 'new'
                    ? 'bg-parchment text-pine shadow-md wobbly-border-sm rotate-1'
                    : 'text-ink/30 hover:text-ink-deep'
                    }`}
            >
                <Clock className="w-4 h-4" />
                Terbaru
            </button>
            <button
                onClick={() => setSort('top')}
                className={`flex items-center gap-2 px-4 py-2 font-journal-title text-lg italic transition-all ${currentSort === 'top'
                    ? 'bg-parchment text-pine shadow-md wobbly-border-sm -rotate-1'
                    : 'text-ink/30 hover:text-ink-deep'
                    }`}
            >
                <TrendingUp className="w-4 h-4" />
                Populer
            </button>
        </div>
    );
}
