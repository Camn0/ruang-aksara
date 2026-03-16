export default function Loading() {
    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark animate-pulse transition-colors duration-500 pb-20">
            {/* Header Shell */}
            <header className="px-6 h-16 bg-bg-cream/80 dark:bg-brown-dark/80 backdrop-blur-md border-b border-tan-primary/10 flex items-center justify-between sticky top-0 z-50">
                <div className="h-6 w-40 bg-tan-primary/10 dark:bg-brown-mid rounded-full"></div>
                <div className="w-10 h-10 rounded-full bg-tan-primary/10 dark:bg-brown-mid"></div>
            </header>

            <main className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
                {/* Stats Summary Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-32 bg-brown-dark/5 dark:bg-brown-mid/30 rounded-[2rem] border border-tan-primary/5 p-6 space-y-4">
                            <div className="w-8 h-8 rounded-lg bg-tan-primary/10 dark:bg-brown-mid"></div>
                            <div className="h-4 w-12 bg-tan-primary/15 dark:bg-brown-mid rounded-full"></div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content Area: Karya List */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center px-2">
                            <div className="h-7 w-48 bg-tan-primary/15 dark:bg-brown-mid rounded-full"></div>
                            <div className="h-10 w-32 bg-brown-dark/10 dark:bg-tan-primary/20 rounded-xl"></div>
                        </div>

                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-28 bg-white/40 dark:bg-brown-dark/40 rounded-[2rem] border border-tan-primary/10 p-5 flex gap-5 items-center">
                                    <div className="w-16 h-20 bg-tan-primary/10 dark:bg-brown-mid rounded-xl shrink-0"></div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 bg-tan-primary/15 dark:bg-brown-mid rounded-lg w-1/3"></div>
                                        <div className="h-3 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-1/2"></div>
                                    </div>
                                    <div className="w-20 h-8 bg-tan-primary/10 dark:bg-brown-mid rounded-lg"></div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar Area: Community/Recent */}
                    <div className="space-y-6">
                        <div className="h-7 w-40 bg-tan-primary/15 dark:bg-brown-mid rounded-full px-2"></div>
                        <div className="bg-brown-dark/5 dark:bg-brown-mid/20 rounded-[2.5rem] border border-tan-primary/5 p-6 space-y-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex gap-4 items-center">
                                    <div className="w-10 h-10 rounded-full bg-tan-primary/10 dark:bg-brown-mid shrink-0"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 bg-tan-primary/10 dark:bg-brown-mid rounded-full w-3/4"></div>
                                        <div className="h-2 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-1/2"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
