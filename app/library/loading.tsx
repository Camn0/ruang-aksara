export default function LibraryLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 animate-pulse">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white dark:bg-slate-900 sticky top-0 z-20 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <div className="w-6 h-6 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="h-6 w-32 bg-gray-200 dark:bg-slate-800 rounded"></div>
                <div className="w-10"></div>
            </header>

            <div className="px-6 py-8 space-y-8">
                {/* Section Riwayat Bacaan */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-slate-800 rounded"></div>
                        <div className="h-5 w-40 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="flex gap-4 p-4 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm">
                        <div className="w-20 h-28 bg-gray-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
                        <div className="flex-1 space-y-2 py-2">
                            <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded w-1/2"></div>
                            <div className="h-2 bg-gray-100 dark:bg-slate-800/50 rounded w-full mt-4"></div>
                            <div className="h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded w-24 mt-2"></div>
                        </div>
                    </div>
                </div>

                {/* Section Bookmark */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-gray-200 dark:bg-slate-800 rounded"></div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex flex-col gap-2">
                                <div className="aspect-[3/4] bg-gray-200 dark:bg-slate-800 rounded-xl shadow-sm"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full mt-1"></div>
                                <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
