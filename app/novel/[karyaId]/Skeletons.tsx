/**
 * @file Skeletons.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

"use client";

import { MessageSquareQuote } from "lucide-react";

export function ReviewSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-8 bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[2.5rem] border border-tan-primary/5 h-48" />
            ))}
        </div>
    );
}

export function ChapterSkeleton() {
    return (
        <div className="divide-y divide-tan-primary/5">
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-5 flex justify-between items-center h-16 animate-pulse">
                    <div className="space-y-2">
                        <div className="h-4 w-32 bg-tan-primary/10 rounded" />
                        <div className="h-3 w-48 bg-tan-primary/5 rounded" />
                    </div>
                </div>
            ))}
        </div>
    );
}
