export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 lg:pb-8 flex justify-center animate-pulse">
            <div className="w-full max-w-2xl bg-white dark:bg-slate-900 min-h-screen shadow-sm relative">
                {/* Header/Banner Section */}
                <div className="relative">
                    {/* Banner Image */}
                    <div className="w-full h-40 md:h-52 bg-gray-200 dark:bg-slate-800 shrink-0"></div>
                </div>

                <div className="px-6 pb-6 relative">
                    {/* Avatar Profil - overlap ke banner */}
                    <div className="flex justify-between items-end -mt-16 mb-4 relative z-10 w-full">
                        <div className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 bg-gray-200 dark:bg-slate-800 shadow-md"></div>

                        {/* Edit Profil Button Skeleton */}
                        <div className="h-9 w-24 bg-gray-200 dark:bg-slate-800 rounded-lg"></div>
                    </div>

                    {/* Info Profil Dasar */}
                    <div className="mt-2 space-y-3">
                        <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded-lg w-1/2"></div>
                        <div className="h-4 bg-gray-100 dark:bg-slate-800/50 rounded-lg w-1/4"></div>
                        <div className="h-16 bg-gray-50 dark:bg-slate-800/30 rounded-xl w-full mt-4 border border-gray-100 dark:border-slate-800"></div>
                    </div>

                    {/* Statistik Interaksi Dasar */}
                    <div className="flex gap-4 sm:gap-6 mt-6 pb-6 border-b border-gray-100 dark:border-slate-800">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-md w-8"></div>
                                <div className="h-4 bg-gray-100 dark:bg-slate-800/50 rounded-md w-12"></div>
                            </div>
                        ))}
                    </div>

                    {/* List Karya Skeleton */}
                    <div className="mt-8 space-y-6">
                        <div className="h-6 bg-gray-200 dark:bg-slate-800 rounded-md w-32 mb-4"></div>

                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 border border-gray-100 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                                <div className="w-20 h-28 bg-gray-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
                                <div className="flex-1 space-y-3">
                                    <div className="h-5 bg-gray-200 dark:bg-slate-800 rounded-md w-3/4"></div>
                                    <div className="flex gap-2 pb-2">
                                        <div className="h-4 w-12 bg-gray-100 dark:bg-slate-800/50 rounded-full"></div>
                                        <div className="h-4 w-12 bg-gray-100 dark:bg-slate-800/50 rounded-full"></div>
                                    </div>
                                    <div className="h-16 bg-gray-50 dark:bg-slate-800/30 rounded-lg w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
