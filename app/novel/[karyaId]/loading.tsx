export default function Loading() {
    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark animate-pulse pb-24 transition-colors duration-300">
            {/* Header Shell */}
            <header className="px-6 h-16 bg-bg-cream/80 dark:bg-brown-dark/80 backdrop-blur-md border-b border-tan-primary/10 flex items-center justify-between sticky top-0 z-20">
                <div className="w-10 h-10 rounded-full bg-tan-primary/10"></div>
                <div className="h-6 w-32 bg-tan-primary/10 dark:bg-brown-mid rounded-full"></div>
                <div className="w-10"></div>
            </header>

            {/* Cover & Hero Section */}
            <div className="bg-bg-cream/40 dark:bg-brown-dark/40 border-b border-tan-primary/5 pt-8 pb-10 px-6 relative">
                <div className="flex gap-6 items-start">
                    {/* Cover Skeleton - Accurate Size */}
                    <div className="w-32 h-48 sm:w-44 sm:h-64 bg-tan-primary/20 dark:bg-brown-mid rounded-3xl shadow-xl border border-white/50 dark:border-brown-mid shrink-0"></div>
                    
                    <div className="flex-1 py-1">
                        {/* Title & Author */}
                        <div className="h-8 bg-tan-primary/15 dark:bg-brown-mid rounded-2xl w-3/4 mb-4"></div>
                        <div className="h-4 bg-tan-primary/10 dark:bg-brown-mid rounded-full w-1/3 mb-6"></div>

                        {/* Genres & Tags */}
                        <div className="flex gap-2 mb-6">
                            <div className="h-7 w-20 bg-tan-primary/10 dark:bg-brown-mid rounded-full"></div>
                            <div className="h-7 w-20 bg-tan-primary/10 dark:bg-brown-mid rounded-full"></div>
                        </div>

                        {/* Synopsis Preview */}
                        <div className="space-y-2 mb-6">
                            <div className="h-3 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-full"></div>
                            <div className="h-3 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-11/12"></div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex gap-8 pt-6 border-t border-tan-primary/10">
                            <div className="h-6 w-16 bg-tan-primary/10 dark:bg-brown-mid rounded-lg"></div>
                            <div className="h-6 w-20 bg-tan-primary/10 dark:bg-brown-mid rounded-lg"></div>
                            <div className="h-6 w-16 bg-tan-primary/10 dark:bg-brown-mid rounded-lg"></div>
                        </div>
                    </div>
                </div>

                {/* Main Actions */}
                <div className="mt-8 flex gap-2">
                    <div className="flex-1 h-14 bg-brown-dark/10 dark:bg-tan-primary/20 rounded-[2rem]"></div>
                    <div className="w-14 h-14 bg-tan-primary/10 dark:bg-brown-mid rounded-2xl"></div>
                    <div className="w-14 h-14 bg-tan-primary/10 dark:bg-brown-mid rounded-2xl"></div>
                </div>
            </div>

            {/* Chapter List Section */}
            <div className="mt-3 bg-bg-cream/60 dark:bg-brown-dark/60 border-y border-tan-primary/5">
                <div className="p-6 border-b border-tan-primary/10">
                    <div className="h-5 w-32 bg-tan-primary/15 dark:bg-brown-mid rounded-full"></div>
                </div>
                <div className="divide-y divide-tan-primary/5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-5 flex justify-between items-center">
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-tan-primary/10 dark:bg-brown-mid rounded-lg w-1/2"></div>
                                <div className="h-3 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-lg w-1/4"></div>
                            </div>
                            <div className="w-8 h-8 rounded-xl bg-tan-primary/5 dark:bg-brown-mid/20"></div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Review Section Shell */}
            <div className="mt-6 bg-bg-cream/40 dark:bg-brown-dark/40 border-y border-tan-primary/5 p-8">
                <div className="h-6 w-48 bg-tan-primary/15 dark:bg-brown-mid rounded-full mb-8"></div>
                <div className="space-y-4">
                    <div className="h-40 bg-bg-cream/80 dark:bg-brown-dark/80 rounded-[2.5rem] border border-tan-primary/10"></div>
                </div>
            </div>
        </div>
    );
}
