"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    return (
        <div className="flex flex-col min-h-screen bg-parchment-light dark:bg-parchment-dark transition-colors duration-300 selection:bg-pine/30">
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-700">
                {step === 1 && (
                    <div className="space-y-10 flex flex-col items-center">
                        <div className="w-32 h-32 bg-ink-deep wobbly-border paper-shadow flex items-center justify-center mb-6 rotate-[-3deg]">
                            <span className="text-parchment text-5xl font-journal-title italic">RA</span>
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-5xl font-journal-title text-ink-deep tracking-tight">
                                Selamat Datang di<br />
                                <span className="text-gold drop-shadow-[2px_2px_0px_rgba(58,42,24,1)]">Ruang Aksara</span>
                            </h1>
                            <p className="font-marker text-xl text-ink/70">Sebuah jurnal misterius menanti...</p>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-8 flex flex-col items-center max-w-sm">
                        <div className="w-64 h-64 bg-white/30 dark:bg-black/20 wobbly-border flex items-center justify-center relative overflow-hidden mb-4 rotate-[2deg]">
                            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/p6.png')]"></div>
                            <svg className="w-32 h-32 text-ink-deep/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h2 className="text-4xl font-journal-title text-ink-deep">Temukan Ribuan<br />Dunia Baru</h2>
                        <p className="text-ink/80 font-journal-body text-xl leading-relaxed italic">
                            "Nikmati karya sastra digital terbaik dari tangan-tangan berbakat di mana pun Anda berada."
                        </p>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 w-full max-w-md">
                        <h2 className="text-5xl font-journal-title text-ink-deep mb-8 relative inline-block">
                            Mulai Berpetualang
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-dried-red/40 wobbly-border-sm"></div>
                        </h2>

                        <div className="space-y-6 w-full px-4">
                            <button
                                onClick={() => router.push("/auth/login?type=reader")}
                                className="w-full py-5 px-6 bg-gold text-ink-deep wobbly-border paper-shadow font-journal-title text-2xl flex items-center justify-between hover:scale-[1.02] transition-all active:scale-95 group"
                            >
                                <span>Masuk Pembaca</span>
                                <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => router.push("/auth/login?type=admin")}
                                className="w-full py-4 px-6 bg-white/50 dark:bg-black/20 border-2 border-ink-deep text-ink-deep wobbly-border-sm font-marker text-xl flex items-center justify-between hover:bg-white/80 transition-all active:scale-95"
                            >
                                <span>Penulis & Penjaga</span>
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination / Next Button */}
            {step < 3 && (
                <div className="pb-16 pt-4 px-8 flex flex-col items-center space-y-10 relative z-10">
                    {/* Dots: Sketchy Style */}
                    <div className="flex gap-4">
                        <div className={`h-4 border-2 border-ink transition-all duration-300 wobbly-border-sm ${step === 1 ? 'bg-ink w-10' : 'bg-transparent w-4'}`} />
                        <div className={`h-4 border-2 border-ink transition-all duration-300 wobbly-border-sm ${step === 2 ? 'bg-ink w-10' : 'bg-transparent w-4'}`} />
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full max-w-sm py-4 bg-ink-deep text-parchment-light wobbly-border paper-shadow font-journal-title text-2xl hover:bg-ink transition-all active:scale-95"
                    >
                        Lanjut
                    </button>
                </div>
            )}
        </div>
    );
}
