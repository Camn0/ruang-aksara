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
        <div className="flex bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
            <button
                onClick={() => setSort('new')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${currentSort === 'new'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
            >
                <Clock className="w-3.5 h-3.5" />
                Terbaru
            </button>
            <button
                onClick={() => setSort('top')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${currentSort === 'top'
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
            >
                <TrendingUp className="w-3.5 h-3.5" />
                Populer
            </button>
        </div>
    );
}
