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
        <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
                {step === 1 && (
                    <div className="space-y-8 flex flex-col items-center">
                        <div className="w-24 h-24 bg-indigo-600 outline outline-4 outline-offset-4 outline-indigo-200 dark:outline-indigo-500/30 rounded-2xl flex items-center justify-center shadow-2xl mb-6">
                            <span className="text-white text-4xl font-black font-serif italic">RA</span>
                        </div>
                        <h1 className="text-4xl font-black bg-gradient-to-br from-gray-900 dark:from-white to-gray-600 dark:to-gray-400 bg-clip-text text-transparent">
                            Selamat Datang<br />Ruang Aksara
                        </h1>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 flex flex-col items-center">
                        <div className="w-64 h-64 bg-indigo-50 dark:bg-indigo-900/40 rounded-full flex items-center justify-center relative overflow-hidden mb-4">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100 dark:from-indigo-900/50 to-purple-50 dark:to-purple-900/30 opacity-50"></div>
                            <svg className="w-32 h-32 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Temukan Ribuan<br />Dunia Baru</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
                            Nikmati karya sastra digital terbaik dari tangan-tangan berbakat di mana pun Anda berada.
                        </p>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-8 w-full">
                        <h2 className="text-4xl font-black text-gray-900 dark:text-gray-100 mb-12">Mulai</h2>

                        <div className="space-y-4 w-full px-4">
                            <button
                                onClick={() => router.push("/auth/login?type=admin")}
                                className="w-full py-4 px-6 bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 rounded-2xl font-bold text-lg flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
                            >
                                <span>Masuk Author/Admin</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>

                            <button
                                onClick={() => router.push("/auth/login?type=reader")}
                                className="w-full py-4 px-6 bg-indigo-600 dark:bg-indigo-500 text-white rounded-2xl font-bold text-lg flex items-center justify-between hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-all active:scale-95 shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                <span>Masuk Pembaca</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Pagination / Next Button fixed at bottom */}
            {step < 3 && (
                <div className="pb-12 pt-4 px-8 flex flex-col items-center space-y-8 relative z-10">
                    {/* Dots */}
                    <div className="flex gap-3">
                        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 1 ? 'bg-indigo-600 dark:bg-indigo-500 w-8' : 'bg-gray-300 dark:bg-slate-700'}`} />
                        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${step === 2 ? 'bg-indigo-600 dark:bg-indigo-500 w-8' : 'bg-gray-300 dark:bg-slate-700'}`} />
                    </div>

                    <button
                        onClick={handleNext}
                        className="w-full py-4 bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 rounded-2xl font-bold text-lg hover:bg-black dark:hover:bg-white transition-all active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
