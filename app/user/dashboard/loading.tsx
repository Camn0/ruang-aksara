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
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark animate-pulse pb-24 transition-colors duration-500">
            {/* Header Shell */}
            <header className="px-6 h-16 bg-bg-cream/80 dark:bg-brown-dark/80 backdrop-blur-md border-b border-tan-primary/10 flex items-center justify-between sticky top-0 z-50">
                <div className="h-6 w-32 bg-tan-primary/10 dark:bg-brown-mid rounded-full"></div>
                <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-tan-primary/10 dark:bg-brown-mid"></div>
                    <div className="w-8 h-8 rounded-full bg-tan-primary/10 dark:bg-brown-mid"></div>
                </div>
            </header>

            <main className="p-6 space-y-8">
                {/* Stats Section Skeleton */}
                <div className="space-y-4">
                    {/* Level Card Skeleton */}
                    <div className="h-32 bg-tan-primary/5 dark:bg-brown-mid/30 rounded-[2.5rem] border border-tan-primary/10"></div>
                    
                    {/* Grid Stats Skeleton */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="h-24 bg-brown-dark/10 dark:bg-brown-mid/40 rounded-3xl"></div>
                        <div className="h-24 bg-brown-mid/10 dark:bg-brown-mid/40 rounded-3xl"></div>
                        <div className="h-24 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-3xl"></div>
                    </div>
                </div>

                {/* Hero Reading Section Skeleton */}
                <div className="space-y-4">
                    <div className="h-6 w-48 bg-tan-primary/15 dark:bg-brown-mid rounded-full"></div>
                    <div className="h-56 bg-brown-dark/5 dark:bg-brown-mid/20 rounded-[2.5rem] border border-tan-primary/5 p-6 flex gap-6">
                        <div className="w-28 h-40 bg-tan-primary/10 dark:bg-brown-mid rounded-2xl shrink-0"></div>
                        <div className="flex-1 space-y-4 pt-2">
                            <div className="h-6 bg-tan-primary/15 dark:bg-brown-mid rounded-xl w-3/4"></div>
                            <div className="h-4 bg-tan-primary/10 dark:bg-brown-mid rounded-full w-1/2"></div>
                            <div className="pt-4 space-y-2">
                                <div className="h-3 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-full"></div>
                                <div className="h-3 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-2/3"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horizontal Scroll Section Skeleton */}
                <div className="space-y-5">
                    <div className="flex justify-between items-center">
                        <div className="h-6 w-40 bg-tan-primary/15 dark:bg-brown-mid rounded-full"></div>
                        <div className="h-4 w-12 bg-tan-primary/10 dark:bg-brown-mid rounded-full"></div>
                    </div>
                    <div className="flex gap-4 overflow-hidden">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-28 shrink-0 space-y-3">
                                <div className="h-40 bg-tan-primary/10 dark:bg-brown-mid rounded-2xl"></div>
                                <div className="h-4 bg-tan-primary/5 dark:bg-brown-mid rounded-lg w-full"></div>
                                <div className="h-3 bg-tan-primary/5 dark:bg-brown-mid rounded-lg w-2/3"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
