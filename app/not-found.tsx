/**
 * @file not-found.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/**
 * NotFound: Graceful 404 client boundary capturing bad routes and preventing application crash loops.
 */
export default function NotFound() {
    return (
        <div className="min-h-screen bg-bg-cream flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
            <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] text-[15rem] sm:text-[20rem] font-black text-text-main/[0.03] dark:text-white/[0.02] select-none leading-none z-0">404</h1>
            <div className="relative z-10 flex flex-col items-center">
                <h2 className="text-4xl sm:text-6xl font-black text-text-main italic uppercase tracking-tighter mb-4">Halaman Tak Ditemukan</h2>
                <p className="text-text-main/60 font-medium italic mb-12 max-w-md mx-auto">
                    Sepertinya lembaran yang Anda cari telah hilang dari arsip Ruang Aksara.
                </p>
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 bg-text-main text-bg-cream px-8 py-4 rounded-full font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Beranda
                </Link>
            </div>
        </div>
    );
}
