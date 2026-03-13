export default function Loading() {
    return (
        <div className="min-h-screen bg-bg-cream dark:bg-slate-950 pb-28 animate-pulse transition-colors duration-300">
            {/* Fake Header - Matches Reader Header aesthetic */}
            <header className="px-4 h-14 bg-bg-cream/95 dark:bg-slate-950/95 border-b border-tan-primary/10 flex items-center justify-between sticky top-0 z-40">
                <div className="w-8 h-8 bg-tan-primary/5 dark:bg-slate-800 rounded-full border border-tan-primary/10"></div>
                <div className="flex flex-col items-center gap-1.5">
                    <div className="h-4 w-24 bg-tan-primary/10 dark:bg-slate-800 rounded-full"></div>
                    <div className="h-2 w-36 bg-tan-primary/5 dark:bg-slate-800/50 rounded-full"></div>
                </div>
                <div className="w-8 h-8 bg-tan-primary/5 dark:bg-slate-800 rounded-full border border-tan-primary/10"></div>
            </header>

            {/* Fake Content - High-end Paragraph Skeletons */}
            <main className="px-6 py-12 sm:px-12 md:max-w-2xl md:mx-auto space-y-5">
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-full"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-11/12"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-full"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-4/5 pt-4"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-full mt-4"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-full"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-10/12"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-full"></div>
                <div className="h-4 bg-tan-primary/10 dark:bg-slate-800 rounded-full w-3/4"></div>
            </main>

            {/* Fake Footer - Standardized Bottom Nav */}
            <nav className="fixed bottom-0 inset-x-0 h-20 bg-white/95 dark:bg-slate-900/95 border-t border-tan-primary/10 flex items-center justify-between px-8 z-30 md:max-w-md md:left-1/2 md:-translate-x-1/2 md:rounded-t-3xl md:border-x shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="w-8 h-8 bg-tan-primary/10 dark:bg-slate-800 rounded-full"></div>
                <div className="w-[4.5rem] h-[4.5rem] bg-tan-primary/20 dark:bg-slate-800 rounded-full -mt-10 border-4 border-bg-cream dark:border-slate-950 shadow-lg"></div>
                <div className="w-8 h-8 bg-tan-primary/10 dark:bg-slate-800 rounded-full"></div>
            </nav>
        </div>
    );
}
