export default function Loading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh] h-full w-full">
            <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400 font-bold text-sm animate-pulse">Memuat Halaman...</p>
        </div>
    );
}
