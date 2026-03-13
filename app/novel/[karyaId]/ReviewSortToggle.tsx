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
        <div className="flex bg-tan-primary/5 dark:bg-brown-mid p-1.5 rounded-[1.25rem] w-fit border border-tan-primary/5">
            <button
                onClick={() => setSort('new')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${currentSort === 'new'
                        ? 'bg-brown-dark text-text-accent shadow-lg shadow-brown-dark/20'
                        : 'text-tan-primary/40 hover:text-tan-primary hover:bg-tan-primary/5'
                    }`}
            >
                <Clock className="w-3.5 h-3.5" />
                Terbaru
            </button>
            <button
                onClick={() => setSort('top')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${currentSort === 'top'
                        ? 'bg-brown-dark text-text-accent shadow-lg shadow-brown-dark/20'
                        : 'text-tan-primary/40 hover:text-tan-primary hover:bg-tan-primary/5'
                    }`}
            >
                <TrendingUp className="w-3.5 h-3.5" />
                Populer
            </button>
        </div>
    );
}
