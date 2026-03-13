export default function Loading() {
    return (
        <div className="min-h-screen bg-bg-cream dark:bg-slate-950 animate-pulse pb-20 transition-colors duration-300">
            {/* Cover Section - Matches new Library/Search aesthetic */}
            <div className="relative">
                <div className="h-56 bg-tan-primary/10 dark:bg-slate-900 border-b border-tan-primary/10"></div>
                <div className="absolute -bottom-16 left-6">
                    <div className="w-32 h-48 sm:w-40 sm:h-56 bg-tan-primary/20 dark:bg-slate-800 rounded-2xl shadow-xl border-4 border-white dark:border-slate-950"></div>
                </div>
            </div>

            {/* Title Section */}
            <div className="pt-20 px-6">
                <div className="h-8 bg-tan-primary/15 dark:bg-slate-800 rounded-lg w-3/4 mb-3"></div>
                <div className="h-5 bg-tan-primary/10 dark:bg-slate-800 rounded-lg w-1/3 mb-6"></div>
                <div className="flex gap-2 mb-6">
                    <div className="h-6 w-20 bg-tan-primary/5 dark:bg-slate-800 rounded-lg border border-tan-primary/10"></div>
                    <div className="h-6 w-20 bg-tan-primary/5 dark:bg-slate-800 rounded-lg border border-tan-primary/10"></div>
                    <div className="h-6 w-20 bg-tan-primary/5 dark:bg-slate-800 rounded-lg border border-tan-primary/10"></div>
                </div>
                <div className="flex gap-6 pt-6 border-t border-tan-primary/10">
                    <div className="h-5 w-24 bg-tan-primary/10 dark:bg-slate-800 rounded"></div>
                    <div className="h-5 w-24 bg-tan-primary/10 dark:bg-slate-800 rounded"></div>
                    <div className="h-5 w-24 bg-tan-primary/10 dark:bg-slate-800 rounded"></div>
                </div>
            </div>

            {/* Description */}
            <div className="px-6 py-8 bg-white/50 dark:bg-slate-900 mt-8 border-y border-tan-primary/10">
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-full mb-3"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-11/12 mb-3"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-4/5"></div>
            </div>

            {/* Chapters */}
            <div className="px-6 py-8 bg-white dark:bg-slate-900 mt-4 border-y border-tan-primary/10 shadow-sm">
                <div className="h-6 w-40 bg-brown-mid/10 dark:bg-slate-800 rounded-lg mb-6"></div>
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-tan-primary/5 last:border-0">
                            <div className="h-5 bg-tan-primary/10 dark:bg-slate-800 rounded-md w-2/3"></div>
                            <div className="w-8 h-8 rounded-full bg-tan-primary/5 dark:bg-slate-800"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews */}
            <div className="px-6 py-8 bg-white dark:bg-slate-900 mt-4 border-y border-tan-primary/10 shadow-sm">
                <div className="h-6 w-48 bg-brown-mid/10 dark:bg-slate-800 rounded-lg mb-8"></div>
                <div className="space-y-6">
                    {[1, 2].map(i => (
                        <div key={i} className="p-6 bg-tan-primary/5 dark:bg-slate-800/30 rounded-[2rem] border border-tan-primary/10 shadow-sm">
                            <div className="flex gap-4 items-center mb-4">
                                <div className="w-10 h-10 rounded-xl bg-tan-primary/15 dark:bg-slate-700"></div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-brown-mid/20 dark:bg-slate-800 rounded w-32"></div>
                                    <div className="h-3 bg-brown-mid/10 dark:bg-slate-800 rounded w-20"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-full"></div>
                                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-3/4"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
