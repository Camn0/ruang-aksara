'use client';

import { useState } from 'react';
import { MessageSquareQuote, ChevronDown, ChevronUp } from 'lucide-react';

interface CollapsibleReviewSectionProps {
    children: React.ReactNode;
    count: number;
}

export default function CollapsibleReviewSection({ children, count }: CollapsibleReviewSectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
                        <MessageSquareQuote className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-base font-black text-gray-900 dark:text-gray-100 italic">
                            Tanggapan Pembaca
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                            {count} Ulasan Berformat
                        </p>
                    </div>
                </div>
                <div className={`p-2 rounded-full border border-gray-100 dark:border-slate-800 transition-all ${isOpen ? 'rotate-180 bg-indigo-600 border-indigo-600 text-white' : 'text-gray-400'}`}>
                    <ChevronDown className="w-5 h-5" />
                </div>
            </button>

            {isOpen && (
                <div className="px-6 pb-8 animate-in slide-in-from-top-2 fade-in duration-300">
                    {children}
                </div>
            )}
        </div>
    );
}
