export default function Loading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh] h-full w-full bg-parchment-light">
            <div className="w-12 h-12 border-4 border-pine/10 border-t-pine rounded-full animate-spin mb-6 shadow-sm"></div>
            <p className="font-journal-body text-pine/60 italic text-lg animate-pulse">Menyingkap Lembaran Cerita...</p>
        </div>
    );
}
