import { ArrowLeft, Settings, List, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 pb-28 animate-pulse text-gray-900">
            {/* Fake Header */}
            <header className="px-4 h-14 bg-[#FDFBF7]/95 dark:bg-slate-950/95 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-40">
                <div className="p-2 -ml-2 text-gray-300 dark:text-gray-700">
                    <ArrowLeft className="w-6 h-6" />
                </div>
                <div className="flex flex-col items-center gap-2">
                    <div className="h-4 w-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-2 w-32 bg-gray-100 dark:bg-slate-800/50 rounded"></div>
                </div>
                <div className="p-2 -mr-2 text-gray-300 dark:text-gray-700">
                    <Settings className="w-5 h-5" />
                </div>
            </header>

            {/* Fake Content */}
            <main className="px-6 py-12 sm:px-12 md:max-w-2xl md:mx-auto space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-11/12"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-4/5 pt-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full mt-4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-10/12"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
            </main>

            {/* Fake Footer */}
            <nav className="fixed bottom-0 inset-x-0 h-20 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 z-30 md:max-w-md md:left-1/2 md:-translate-x-1/2 md:rounded-t-3xl md:border-x">
                <div className="flex flex-col items-center gap-1 p-2 text-gray-200 dark:text-slate-800">
                    <ChevronLeft className="w-6 h-6" />
                    <div className="h-2 w-8 bg-gray-200 dark:bg-slate-800 rounded mt-1"></div>
                </div>

                <div className="flex flex-col items-center gap-1 p-4 bg-gray-200 dark:bg-slate-800 rounded-full -mt-8 border-4 border-[#FDFBF7] dark:border-slate-950">
                    <List className="w-6 h-6 text-white dark:text-slate-600" />
                </div>

                <div className="flex flex-col items-center gap-1 p-2 text-gray-200 dark:text-slate-800">
                    <ChevronRight className="w-6 h-6" />
                    <div className="h-2 w-8 bg-gray-200 dark:bg-slate-800 rounded mt-1"></div>
                </div>
            </nav>
        </div>
    );
}
