export default function Loading() {
    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark animate-pulse transition-colors duration-500">
            {/* Minimal Header Shell */}
            <header className="h-16 px-6 flex items-center justify-between border-b border-tan-primary/5">
                <div className="w-8 h-8 rounded-full bg-tan-primary/10 dark:bg-brown-mid"></div>
                <div className="h-4 w-40 bg-tan-primary/5 dark:bg-brown-mid rounded-full"></div>
                <div className="w-8 h-8 rounded-full bg-tan-primary/10 dark:bg-brown-mid"></div>
            </header>

            <main className="max-w-2xl mx-auto px-6 py-12 space-y-12">
                {/* Title Skeleton */}
                <div className="text-center space-y-4">
                    <div className="h-10 bg-tan-primary/15 dark:bg-brown-mid rounded-2xl w-3/4 mx-auto"></div>
                    <div className="h-4 bg-tan-primary/10 dark:bg-brown-mid rounded-full w-1/4 mx-auto"></div>
                </div>

                {/* Content Paragraphs Skeleton */}
                <div className="space-y-8">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="space-y-3">
                            <div className="h-4 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-full"></div>
                            <div className="h-4 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-[95%]"></div>
                            <div className="h-4 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-[98%]"></div>
                            {i % 3 === 0 && <div className="h-4 bg-tan-primary/5 dark:bg-brown-mid/40 rounded-full w-2/3"></div>}
                        </div>
                    ))}
                </div>

                {/* Navigation Footer Skeleton */}
                <div className="pt-20 flex justify-between items-center border-t border-tan-primary/10">
                    <div className="h-12 w-32 bg-brown-dark/5 dark:bg-brown-mid/30 rounded-2xl"></div>
                    <div className="h-12 w-32 bg-brown-dark/5 dark:bg-brown-mid/30 rounded-2xl"></div>
                </div>
            </main>
        </div>
    );
}
