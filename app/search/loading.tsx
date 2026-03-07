import { Search as SearchIcon, Star, TrendingUp } from "lucide-react";

export default function SearchLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24">
            {/* Header / Search Bar Skeleton */}
            <div className="bg-white dark:bg-slate-900 px-4 py-4 pt-10 rounded-b-[2.5rem] shadow-sm mb-6 sticky top-0 z-20 border-b border-gray-100 dark:border-slate-800 animate-pulse">
                <div className="relative max-w-lg mx-auto">
                    <div className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600">
                        <SearchIcon className="w-full h-full" />
                    </div>
                    <div className="w-full pl-12 pr-4 py-3.5 bg-gray-100 dark:bg-slate-800 rounded-2xl h-12"></div>
                </div>

                {/* Main Filter Skeleton */}
                <div className="flex justify-center mt-6">
                    <div className="bg-gray-100 dark:bg-slate-800 rounded-full p-1 inline-flex w-full max-w-sm h-10"></div>
                </div>

                {/* Genre Filter Skeleton */}
                <div className="mt-4 max-w-lg mx-auto">
                    <div className="flex items-center gap-2 overflow-x-hidden px-2 pb-2">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-8 w-20 bg-gray-100 dark:bg-slate-800 rounded-full shrink-0"></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Skeleton */}
            <div className="px-4 animate-pulse">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex flex-col group cursor-wait">
                            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden shadow-sm bg-gray-200 dark:bg-slate-800"></div>

                            <div className="mt-3 px-1 space-y-2">
                                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded-md w-3/4"></div>
                                <div className="h-3 bg-gray-100 dark:bg-slate-800/50 rounded-md w-1/2"></div>

                                <div className="flex items-center gap-3 pt-1">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-gray-200 dark:text-slate-700" />
                                        <div className="h-3 w-6 bg-gray-200 dark:bg-slate-800 rounded"></div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3 text-gray-200 dark:text-slate-700" />
                                        <div className="h-3 w-8 bg-gray-200 dark:bg-slate-800 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
