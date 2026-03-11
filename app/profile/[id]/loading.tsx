export default function ProfileLoading() {
    return (
        <div className="min-h-screen bg-parchment-light transition-colors duration-300">
            {/* Header / Nav Skeleton */}
            <header className="px-6 h-20 bg-parchment wobbly-border-b border-ink/5 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <div className="w-10 h-10 wobbly-border-sm bg-gold/10 animate-pulse"></div>
                    <div className="hidden sm:block space-y-2">
                        <div className="h-6 w-40 bg-ink/10 wobbly-border-sm animate-pulse"></div>
                        <div className="h-3 w-24 bg-ink/5 wobbly-border-sm animate-pulse"></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 wobbly-border-sm bg-ink/10 animate-pulse"></div>
                    <div className="w-10 h-10 wobbly-border-sm bg-ink/10 animate-pulse"></div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Sidebar Skeleton */}
                    <aside className="lg:col-span-4 flex flex-col gap-8">
                        <div className="bg-white wobbly-border paper-shadow p-8 h-[500px] animate-pulse"></div>
                        <div className="bg-white wobbly-border paper-shadow h-24 animate-pulse"></div>
                    </aside>

                    {/* Content Skeleton */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/40 wobbly-border paper-shadow p-3 mb-10 h-20 animate-pulse"></div>
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white wobbly-border paper-shadow p-8 h-48 animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
