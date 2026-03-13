export default function Loading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh] h-full w-full">
            <div className="relative w-12 h-12 mb-6">
                <div className="absolute inset-0 border-4 border-tan-primary/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-tan-primary rounded-full animate-spin"></div>
                <div className="absolute inset-2 border-2 border-brown-mid/10 rounded-full"></div>
                <div className="absolute inset-2 border-2 border-b-brown-mid rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
            </div>
            <p className="text-brown-mid/60 dark:text-tan-light font-black text-[10px] uppercase tracking-[0.2em] animate-pulse">Menyiapkan Ruang Aksara</p>
        </div>
    );
}
