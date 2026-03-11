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
            bg: "bg-rose-50 dark:bg-rose-900/20"
        },
        {
            title: "Alur yang Memikat",
            desc: "Pastikan setiap bab memiliki 'pertanyaan' yang membuat pembaca ingin lanjut.",
            icon: TrendingUp,
            color: "text-pine",
            bg: "bg-pine/5"
        },
        {
            title: "Dunia yang Hidup",
            desc: "Tunjukkan, jangan katakan. Gambarkan suasana melalui panca indera.",
            icon: Star,
            color: "text-amber-500",
            bg: "bg-amber-50 dark:bg-amber-900/20"
        },
        {
            title: "Disiplin Menulis",
            desc: "Tulislah setiap hari, meski hanya 100 kata. Konsistensi adalah kunci.",
            icon: PenTool,
            color: "text-emerald-500",
            bg: "bg-emerald-50 dark:bg-emerald-900/20"
        }
    ];

    return (
        <div className="pb-32 bg-parchment-light min-h-screen transition-all">
            {/* Page Header: Title & Subtitle */}
            <div className="px-8 pt-10 mb-16 relative">
                <div className="absolute top-10 right-10 w-32 h-32 bg-ink/5 rounded-full blur-3xl -z-10" />
                <h1 className="font-journal-title text-4xl text-ink-deep italic mb-2 tracking-tight uppercase">Manual Sang Pencatat</h1>
                <p className="font-marker text-[10px] text-pine uppercase tracking-[0.2em]">Panduan Mengasah Pena di Ruang Aksara</p>
            </div>

            <main className="w-full mx-auto px-8 -mt-8">
                {/* Tips Grid: Journal style logs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tips.map((tip, idx) => (
                        <div key={idx} className={`bg-white wobbly-border paper-shadow p-8 transition-all group ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0`}>
                            <div className={`w-14 h-14 wobbly-border-sm flex items-center justify-center mb-6 ${tip.bg} transition-transform group-hover:rotate-12`}>
                                <tip.icon className={`w-7 h-7 ${tip.color === 'text-pine' ? 'text-pine' : tip.color}`} />
                            </div>
                            <h3 className="font-journal-title text-2xl text-ink-deep mb-3 italic uppercase tracking-tight">{tip.title}</h3>
                            <p className="font-journal-body text-[15px] text-ink/60 leading-relaxed italic">{tip.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Promotional Banner: The Secret Dossier feel */}
                <div className="mt-16 bg-pine text-parchment wobbly-border paper-shadow p-12 text-center relative overflow-hidden group rotate-1 hover:rotate-0 transition-all">
                    <div className="absolute top-0 left-0 w-full h-full opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10 max-w-lg mx-auto">
                        <Bookmark className="w-12 h-12 mx-auto mb-8 text-gold opacity-50 group-hover:scale-110 transition-transform" />
                        <h2 className="font-journal-title text-3xl italic mb-4">Ingin Menjadi Legenda?</h2>
                        <p className="font-journal-body text-lg italic text-parchment/80 mb-10 leading-relaxed tracking-wide">
                            Kami sedang menyiapkan jalur bimbingan rahasia langsung dari para kurator arsip profesional.
                        </p>
                        <button className="bg-parchment text-pine px-10 py-5 wobbly-border-sm font-journal-title text-xl italic hover:rotate-2 active:scale-95 shadow-xl transition-all">
                            Usulkan Fitur Bimbingan
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
