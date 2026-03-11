export default function Loading() {
    return (
        <div className="min-h-screen bg-parchment-light animate-pulse pb-24">
            {/* Header Skeleton */}
            <header className="px-6 h-16 bg-parchment border-b-4 border-ink/5 flex items-center justify-between">
                <div className="w-8 h-8 bg-ink/5 rounded-full"></div>
                <div className="h-6 bg-ink/10 wobbly-border-sm w-32"></div>
                <div className="w-8 h-8"></div>
            </header>

            <div className="px-6 py-8 max-w-4xl mx-auto">
                {/* Search Bar Skeleton */}
                <div className="w-full h-14 bg-paper/60 wobbly-border-sm mb-10 border-2 border-ink/5"></div>

                {/* Tabs Skeleton */}
                <div className="flex gap-2 mb-10">
                    <div className="w-32 h-12 bg-pine/20 wobbly-border-sm -rotate-2"></div>
                    <div className="w-32 h-12 bg-paper/40 wobbly-border-sm rotate-1"></div>
                    <div className="w-32 h-12 bg-paper/40 wobbly-border-sm rotate-1"></div>
                </div>

                {/* List Skeleton */}
                <div className="space-y-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex bg-paper wobbly-border paper-shadow p-4 gap-5">
                            <div className="w-24 h-36 bg-ink/10 wobbly-border shrink-0"></div>
                            <div className="flex-1 py-1 flex flex-col justify-between">
                                <div>
                                    <div className="h-5 bg-ink/10 wobbly-border-sm w-3/4 mb-2"></div>
                                    <div className="h-3 bg-ink/5 wobbly-border-sm w-1/2 mb-4"></div>
                                    <div className="h-4 bg-ink/10 wobbly-border-sm w-20"></div>
                                </div>
                                <div className="space-y-3 mt-auto">
                                    <div className="flex justify-between">
                                        <div className="h-4 bg-ink/10 wobbly-border-sm w-10"></div>
                                        <div className="h-3 bg-ink/5 wobbly-border-sm w-16"></div>
                                    </div>
                                    <div className="h-3 bg-ink/5 wobbly-border-sm w-full"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
