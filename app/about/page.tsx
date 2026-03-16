'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, Target, Heart } from 'lucide-react';
import NextImage from 'next/image';

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState<'visi' | 'misi'>('visi');

    return (
        <div className="min-h-screen bg-bg-cream/60 dark:bg-brown-dark transition-colors duration-500 pb-20">
            {/* Header / Nav */}
            <header className="px-6 h-20 flex items-center justify-between sticky top-0 bg-bg-cream/80 dark:bg-brown-dark/80 backdrop-blur-md z-50 border-b border-text-main/5 dark:border-tan-primary/10">
                <Link href="/" prefetch={false} className="flex items-center gap-2 group">
                    <div className="p-2 bg-text-main text-bg-cream rounded-xl group-hover:scale-110 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <h1 className="text-[10px] font-black text-text-main/40 dark:text-tan-primary/40 uppercase tracking-[0.4em] italic">Tentang Kami</h1>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-16">
                {/* Title Section with Relaxed Overlap */}
                <div className="relative mb-32 sm:mb-40">
                    <div className="flex flex-col items-center">
                        <div className="relative group pr-20 pb-20">
                            <div className="bg-text-main text-bg-cream px-12 py-8 rounded-[2rem] shadow-2xl relative z-10">
                                <h2 className="text-6xl sm:text-7xl font-black italic uppercase tracking-tighter">Tentang</h2>
                            </div>
                            <div className="absolute -bottom-4 -right-10 bg-text-main text-bg-cream px-12 py-8 rounded-[2rem] shadow-xl z-20 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500">
                                <h2 className="text-6xl sm:text-7xl font-black italic uppercase tracking-tighter">Kami</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtitle / Intro - Improved Line Height and Margins */}
                <div className="prose prose-stone dark:prose-invert max-w-none text-center mb-32 sm:mb-40">
                    <p className="text-xl sm:text-2xl text-text-main/80 dark:text-tan-light italic font-medium leading-[1.8] max-w-3xl mx-auto">
                        "Ruang Aksara adalah rumah bagi setiap imajinasi yang ingin terbang bebas. Kami percaya bahwa setiap orang memiliki cerita yang layak untuk dibagikan, dan setiap kata adalah langkah menuju dunia yang lebih berwarna."
                    </p>
                </div>

                {/* Visi Misi Section - Overhauled Side-by-Side */}
                <div className="flex flex-col md:flex-row bg-tan-primary/10 dark:bg-brown-dark/30 rounded-[3.5rem] overflow-hidden border border-text-main/5 dark:border-tan-primary/10 mb-40 sm:mb-48 shadow-lg">
                    {/* Left: Image Container */}
                    <div className="w-full md:w-1/2 aspect-square md:aspect-auto relative overflow-hidden">
                        <NextImage
                            src="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000&auto=format&fit=crop"
                            fill
                            alt="Books Library"
                            className="w-full h-full object-cover transition-transform duration-1000"
                            priority
                        />
                        <div className="absolute inset-0 bg-text-main/20"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                            <Sparkles className="w-16 h-16 text-bg-cream/40" />
                        </div>
                    </div>

                    {/* Right: Content Container (Tan Box) */}
                    <div className="w-full md:w-1/2 bg-tan-light/30 dark:bg-brown-mid/10 p-12 sm:p-20 flex flex-col justify-center">
                        <div className="flex bg-bg-cream/50 dark:bg-brown-dark/20 p-1.5 rounded-2xl mb-12 w-fit border border-text-main/5">
                            <button
                                onClick={() => setActiveTab('visi')}
                                className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'visi' ? 'bg-text-main text-bg-cream shadow-xl translate-y-[-2px]' : 'text-text-main/40 hover:text-text-main'}`}
                            >
                                Visi
                            </button>
                            <button
                                onClick={() => setActiveTab('misi')}
                                className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${activeTab === 'misi' ? 'bg-text-main text-bg-cream shadow-xl translate-y-[-2px]' : 'text-text-main/40 hover:text-text-main'}`}
                            >
                                Misi
                            </button>
                        </div>

                        <div className="min-h-[160px] animate-in fade-in slide-in-from-right-4 duration-700">
                            {activeTab === 'visi' ? (
                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-text-main/30 dark:text-tan-primary/40 mb-2">Tujuan Utama</h3>
                                    <p className="text-text-main dark:text-text-accent text-2xl font-bold leading-tight italic">
                                        &quot;Menjadi platform literasi digital nomor satu di Indonesia yang menghubungkan jutaan penulis dan pembaca dalam harmoni kreativitas.&quot;
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-text-main/30 dark:text-tan-primary/40 mb-2">Misi Kami</h3>
                                    <p className="text-text-main dark:text-text-accent text-2xl font-bold leading-tight italic">
                                        &quot;Memberdayakan penulis dengan fitur editor yang magis, memberikan pengalaman membaca yang tenang, dan membangun komunitas yang saling menginspirasi.&quot;
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Closing Tag */}
                <div className="text-center pb-24 border-t border-text-main/5 dark:border-tan-primary/10 pt-24">
                    <div className="flex items-center justify-center gap-4 mb-8 grayscale opacity-40">
                        <div className="w-12 h-[1px] bg-text-main"></div>
                        <BookOpen className="w-6 h-6 text-text-main dark:text-tan-primary" />
                        <div className="w-12 h-[1px] bg-text-main"></div>
                    </div>
                    <p className="text-[10px] font-black text-text-main/30 dark:text-tan-primary/30 uppercase tracking-[0.5em]">Ruang Aksara — 2024</p>
                </div>
            </main>
        </div>
    );
}
