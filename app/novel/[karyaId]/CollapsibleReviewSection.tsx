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
        <div className="bg-white/60 dark:bg-brown-dark/60 mt-3 border-y border-tan-primary/5 transition-colors duration-300">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-6 flex items-center justify-between hover:bg-tan-primary/5 dark:hover:bg-slate-800/50 transition-colors group"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-tan-primary/5 dark:bg-tan-900/10 rounded-2xl flex items-center justify-center border border-tan-primary/10 shadow-inner group-hover:scale-110 transition-transform">
                        <MessageSquareQuote className="w-6 h-6 text-tan-primary" />
                    </div>
                    <div className="text-left">
                        <h2 className="text-lg font-black text-brown-dark dark:text-text-accent italic uppercase tracking-tighter">
                            Tanggapan Pembaca
                        </h2>
                        <p className="text-[10px] font-black text-tan-primary/60 uppercase tracking-widest mt-1">
                            {count} Ulasan Terukir
                        </p>
                    </div>
                </div>
                <div className={`p-2.5 rounded-full border transition-all ${isOpen ? 'rotate-180 bg-brown-dark border-brown-dark text-text-accent shadow-lg shadow-brown-dark/20' : 'text-tan-primary/40 border-tan-primary/10'}`}>
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
