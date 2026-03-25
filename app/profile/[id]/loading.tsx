/**
 * @file loading.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

/**
 * Loading: Suspense boundary fallback rendering intelligent skeleton states while complex data resolves.
 */
export default function Loading() {
    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark animate-pulse transition-colors duration-500 pb-20">
            {/* Header Shell - Transparent on Banner */}
            <header className="px-4 h-16 flex items-center justify-between absolute top-0 w-full z-50">
                <div className="w-10 h-10 rounded-full bg-white/20"></div>
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                    <div className="w-10 h-10 rounded-full bg-white/20"></div>
                </div>
            </header>

            {/* Profile Banner Skeleton */}
            <div className="h-48 sm:h-56 bg-olive-banner/40 dark:bg-brown-mid/20"></div>

            <main className="max-w-4xl mx-auto px-6 relative">
                {/* Avatar Overlap Skeleton */}
                <div className="relative -mt-16 sm:-mt-20 mb-6">
                    <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-[2.5rem] bg-brown-dark/20 dark:bg-brown-mid border-[5px] border-bg-cream dark:border-brown-dark shadow-xl"></div>
                </div>

                {/* Identity & Bio Skeleton */}
                <div className="space-y-6 mb-10">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div className="space-y-3">
                            <div className="h-9 w-64 bg-tan-primary/15 dark:bg-brown-mid rounded-2xl"></div>
                            <div className="h-4 w-32 bg-tan-primary/10 dark:bg-brown-mid rounded-full"></div>
                        </div>
                        <div className="h-10 w-32 bg-brown-dark/10 dark:bg-tan-primary/20 rounded-[65px]"></div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className="h-4 w-full bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full"></div>
                        <div className="h-4 w-3/4 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full"></div>
                    </div>

                    {/* Stats Row Skeleton */}
                    <div className="flex gap-6 pt-2">
                        <div className="h-6 w-20 bg-tan-primary/10 dark:bg-brown-mid rounded-lg"></div>
                        <div className="h-6 w-20 bg-tan-primary/10 dark:bg-brown-mid rounded-lg"></div>
                    </div>
                </div>

                {/* Tab Navigation Skeleton */}
                <div className="sticky top-0 -mx-6 px-6 border-b border-tan-primary/10 flex gap-8 mb-8 overflow-x-auto hide-scrollbar bg-bg-cream/50 dark:bg-brown-dark/50 backdrop-blur-sm">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="py-4 h-10 w-20 bg-tan-primary/5 dark:bg-brown-mid rounded-lg my-2"></div>
                    ))}
                </div>

                {/* Content Area Skeleton: Activity Cards */}
                <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="h-24 bg-tan-primary/5 dark:bg-brown-mid/30 rounded-[2rem]"></div>
                        <div className="h-24 bg-tan-primary/5 dark:bg-brown-mid/30 rounded-[2rem]"></div>
                        <div className="h-24 bg-tan-primary/5 dark:bg-brown-mid/30 rounded-[2rem]"></div>
                    </div>

                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-40 bg-brown-dark/[0.02] dark:bg-brown-dark/40 rounded-[2.5rem] border border-tan-primary/5 p-6"></div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
