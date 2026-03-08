export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 animate-pulse pb-20">
            {/* Cover Section */}
            <div className="relative">
                <div className="h-48 bg-gray-200 dark:bg-slate-900"></div>
                <div className="absolute -bottom-12 left-6">
                    <div className="w-24 h-32 bg-gray-300 dark:bg-slate-800 rounded-xl shadow-lg border-4 border-white dark:border-slate-950"></div>
                </div>
            </div>

            {/* Title Section */}
            <div className="pt-16 px-6">
                <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2 mb-4">
                    <div className="h-5 w-14 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-5 w-14 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-5 w-14 bg-gray-200 dark:bg-slate-800 rounded"></div>
                </div>
                <div className="flex gap-4 mb-6">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                </div>
            </div>

            {/* Description */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-y border-gray-100 dark:border-slate-800">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-11/12 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-4/5"></div>
            </div>

            {/* Chapters */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800">
                <div className="h-5 w-32 bg-gray-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 dark:border-slate-800">
                            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3"></div>
                            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Reviews */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 mt-2 border-y border-gray-100 dark:border-slate-800">
                <div className="h-5 w-40 bg-gray-200 dark:bg-slate-800 rounded mb-4"></div>
                <div className="space-y-3">
                    {[1, 2].map(i => (
                        <div key={i} className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-100 dark:border-slate-800">
                            <div className="flex gap-2 items-center mb-3">
                                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-700"></div>
                                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-24"></div>
                            </div>
                            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full mb-1"></div>
                            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
