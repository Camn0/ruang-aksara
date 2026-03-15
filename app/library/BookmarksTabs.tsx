"use client";

import Link from "next/link";

export default function BookmarksTabs({ activeTab }: { activeTab: string }) {
    return (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {['riwayat', 'tamat'].map((tab) => (
                <Link
                    key={tab}
                    href={`/library?tab=${tab}`}
                    className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab
                        ? 'bg-brown-dark dark:bg-text-accent text-text-accent dark:text-brown-dark shadow-lg'
                        : 'bg-tan-light/50 dark:bg-brown-mid text-brown-dark dark:text-text-accent hover:opacity-80'
                    }`}
                >
                    {tab === 'riwayat' ? 'Riwayat' : 'Tamat'}
                </Link>
            ))}
        </div>
    );
}
