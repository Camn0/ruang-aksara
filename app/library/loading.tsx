export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 animate-pulse pb-24">
            {/* Header Skeleton */}
            <header className="px-6 pt-12 pb-6 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                    <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-full"></div>
                    <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded w-32"></div>
                    <div className="w-10 h-10"></div>
                </div>
            </header>

            <div className="px-6 py-4">
                {/* Search Bar Skeleton */}
                <div className="w-full h-12 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl mb-6"></div>

                {/* Tabs Skeleton */}
                <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl mb-8 border border-gray-100 dark:border-slate-800">
                    <div className="flex-1 h-10 bg-gray-100 dark:bg-slate-800 rounded-xl mr-1"></div>
                    <div className="flex-1 h-10 bg-gray-50 dark:bg-slate-800/50 rounded-xl mx-1"></div>
                    <div className="flex-1 h-10 bg-gray-50 dark:bg-slate-800/50 rounded-xl ml-1"></div>
                </div>

                {/* List Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3.5 flex gap-4">
                            <div className="w-20 h-28 bg-gray-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
                            <div className="flex-1 py-1 flex flex-col justify-between">
                                <div>
                                    <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2 mb-3"></div>
                                    <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-16"></div>
                                </div>
                                <div className="space-y-2 mt-auto">
                                    <div className="flex justify-between">
                                        <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-8"></div>
                                        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-12"></div>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full w-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
