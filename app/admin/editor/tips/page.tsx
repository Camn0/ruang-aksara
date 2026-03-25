/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Administrator Dashboard architecture.
 * @author Ruang Aksara Engineering Team
 */

/**
 * TIPS STUDIO PAGE
 * ----------------
 * Halaman edukasi untuk para penulis (Author).
 * Fungsi:
 * 1. Edukasi: Memberikan tips menulis profesional (static content untuk saat ini).
 * 2. Motivasi: CTA untuk fitur bimbingan di masa depan.
 * 3. UI: Menggunakan kartu bertema warna (color-coded) untuk kemudahan navigasi visual.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sparkles, PenTool, Users, Star, TrendingUp, Bookmark } from "lucide-react";

export default async function TipsStudioPage() {
    // [1] AUTHENTICATION
    // Cek session (non-null assertion aman karena layout protection).
    const session = (await getServerSession(authOptions))!;

    // [2] CONTENT DATA: Tips Menulis
    // List statis yang mendefinisikan icon, warna, dan isi tips.
    const tips = [
        {
            title: "Karakter yang Bernapas",
            desc: "Berikan kelemahan pada karakter utamamu agar mereka terasa nyata.",
            icon: Users,
            color: "text-rose-500",
            bg: "bg-rose-50/50 dark:bg-rose-900/20"
        },
        {
            title: "Alur yang Memikat",
            desc: "Pastikan setiap bab memiliki 'pertanyaan' yang membuat pembaca ingin lanjut.",
            icon: TrendingUp,
            color: "text-tan-primary",
            bg: "bg-tan-primary/10 dark:bg-tan-primary/20"
        },
        {
            title: "Dunia yang Hidup",
            desc: "Tunjukkan, jangan katakan. Gambarkan suasana melalui panca indera.",
            icon: Star,
            color: "text-[#C6A982]",
            bg: "bg-[#C6A982]/10 dark:bg-[#C6A982]/20"
        },
        {
            title: "Disiplin Menulis",
            desc: "Tulislah setiap hari, meski hanya 100 kata. Konsistensi adalah kunci.",
            icon: PenTool,
            color: "text-brown-mid",
            bg: "bg-brown-mid/10 dark:bg-brown-mid/20"
        }
    ];

    return (
        <div className="pb-20">
            {/* Page Header: Title & Subtitle */}
            <div className="px-4 sm:px-8 pt-6 sm:pt-10 mb-12 sm:mb-16">
                <h1 className="text-2xl sm:text-4xl font-black text-brown-dark dark:text-text-accent tracking-tight leading-none uppercase italic mb-2">Tips Studio</h1>
                <p className="text-tan-primary font-extrabold text-[10px] sm:text-xs uppercase tracking-widest leading-none">Panduan Mengasah Pena</p>
            </div>

            <main className="w-full mx-auto px-4 sm:px-8 -mt-6 sm:-mt-8">
                {/* Tips Grid: Menyajikan kartu tips dengan hover effect yang dinamis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6">
                    {tips.map((tip, idx) => (
                        <div key={idx} className="bg-bg-cream/80 dark:bg-brown-dark p-4 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-tan-primary/10 dark:border-brown-mid shadow-xl shadow-brown-dark/5 hover:scale-[1.02] transition-all group backdrop-blur-sm">
                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 ${tip.bg} transition-transform group-hover:rotate-6`}>
                                <tip.icon className={`w-5 h-5 sm:w-7 sm:h-7 ${tip.color}`} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-sm sm:text-xl font-black text-brown-dark dark:text-text-accent mb-2 sm:mb-3 uppercase tracking-tight">{tip.title}</h3>
                            <p className="text-[10px] sm:text-[13px] text-brown-dark/60 dark:text-tan-light font-bold leading-relaxed">{tip.desc}</p>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
