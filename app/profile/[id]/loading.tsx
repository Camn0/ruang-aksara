export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark pb-24 lg:pb-8 flex justify-center animate-pulse transition-colors duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-brown-dark min-h-screen shadow-sm relative">
                {/* Header/Banner Section */}
                <div className="relative">
                    {/* Banner Image - Warm Palette */}
                    <div className="w-full h-44 md:h-56 bg-tan-primary/10 dark:bg-brown-mid shrink-0 border-b border-tan-primary/5"></div>
                </div>

                <div className="px-6 pb-6 relative">
                    {/* Avatar Profil - overlap ke banner */}
                    <div className="flex justify-between items-end -mt-20 mb-6 relative z-10 w-full px-2">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 border-white dark:border-slate-900 bg-tan-primary/20 dark:bg-brown-mid shadow-xl transition-all"></div>

                        {/* Edit Profil Button Skeleton */}
                        <div className="h-10 w-28 bg-tan-primary/10 dark:bg-brown-mid rounded-full border border-tan-primary/10"></div>
                    </div>

                    {/* Info Profil Dasar */}
                    <div className="mt-4 space-y-4">
                        <div className="h-8 bg-tan-primary/15 dark:bg-brown-mid rounded-lg w-1/2"></div>
                        <div className="h-4 bg-tan-primary/5 dark:bg-brown-mid/50 rounded-lg w-1/4"></div>
                        <div className="h-24 bg-tan-primary/5 dark:bg-brown-mid/30 rounded-3xl w-full mt-6 border border-tan-primary/10 shadow-inner"></div>
                    </div>

                    {/* Statistik Interaksi Dasar */}
                    <div className="flex gap-6 mt-8 pb-8 border-b border-tan-primary/10">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-3 items-center">
                                <div className="h-6 bg-tan-primary/15 dark:bg-brown-mid rounded-lg w-10"></div>
                                <div className="h-4 bg-tan-primary/5 dark:bg-brown-mid/50 rounded-lg w-14"></div>
                            </div>
                        ))}
                    </div>

                    {/* List Karya Skeleton */}
                    <div className="mt-10 space-y-8">
                        <div className="h-6 bg-brown-mid/15 dark:bg-brown-mid rounded-lg w-40 mb-6"></div>

                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex gap-5 p-5 border border-tan-primary/10 rounded-[2rem] bg-white dark:bg-brown-dark shadow-sm">
                                <div className="w-24 h-32 md:w-28 md:h-40 bg-tan-primary/20 dark:bg-brown-mid rounded-2xl shrink-0 shadow-sm"></div>
                                <div className="flex-1 space-y-4 pt-2">
                                    <div className="h-6 bg-tan-primary/15 dark:bg-brown-mid rounded-lg w-3/4"></div>
                                    <div className="flex gap-2">
                                        <div className="h-5 w-16 bg-tan-primary/5 dark:bg-brown-mid/50 rounded-lg border border-tan-primary/10"></div>
                                        <div className="h-5 w-16 bg-tan-primary/5 dark:bg-brown-mid/50 rounded-lg border border-tan-primary/10"></div>
                                    </div>
                                    <div className="h-16 bg-tan-primary/5 dark:bg-brown-mid/30 rounded-2xl w-full border border-tan-primary/5"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
