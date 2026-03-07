import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-12 min-h-[60vh] h-full w-full">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-500 font-bold text-sm animate-pulse">Memuat Halaman...</p>
        </div>
    );
}
