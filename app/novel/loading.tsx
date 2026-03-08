export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 animate-pulse pb-24">
            <div className="px-6 pt-6 pb-4">
                <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-32 mb-4"></div>
            </div>
            <div className="px-6 space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="flex gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <div className="w-16 h-20 bg-gray-200 dark:bg-slate-800 rounded-lg shrink-0"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-1/2 mb-2"></div>
                            <div className="flex gap-3 mt-2">
                                <div className="h-3 w-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
                                <div className="h-3 w-12 bg-gray-200 dark:bg-slate-800 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
