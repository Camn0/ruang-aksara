'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sparkles, BookOpen, Target, Heart } from 'lucide-react';

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState<'visi' | 'misi'>('visi');

    return (
        <div className="min-h-screen bg-[#F2EAD7]/60 dark:bg-brown-dark transition-colors duration-500 pb-20">
            {/* Header / Nav */}
            <header className="px-6 h-20 flex items-center justify-between sticky top-0 bg-[#F2EAD7]/80 dark:bg-brown-dark/80 backdrop-blur-md z-50 border-b border-[#3B2A22]/5">
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="p-2 bg-[#3B2A22] text-[#F2EAD7] rounded-xl group-hover:scale-110 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </div>
                </Link>
                <h1 className="text-[10px] font-black text-[#3B2A22]/40 uppercase tracking-[0.4em] italic">Tentang Kami</h1>
            </header>

            <main className="max-w-4xl mx-auto px-6 pt-16">
                {/* Title Section with Relaxed Overlap */}
                <div className="relative mb-32 sm:mb-40">
                    <div className="flex flex-col items-center">
                        <div className="relative group pr-20 pb-10">
                            <div className="bg-[#3B2A22] text-white px-12 py-8 rounded-[2rem] shadow-2xl relative z-10">
                                <h2 className="text-6xl sm:text-7xl font-black italic uppercase tracking-tighter">Tentang</h2>
                            </div>
                            <div className="absolute -bottom-10 -right-10 bg-[#3B2A22] text-white px-12 py-8 rounded-[2rem] shadow-xl z-20 group-hover:translate-x-4 group-hover:translate-y-4 transition-transform duration-500">
                                <h2 className="text-6xl sm:text-7xl font-black italic uppercase tracking-tighter">Kami</h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subtitle / Intro - Improved Line Height and Margins */}
                <div className="prose prose-stone dark:prose-invert max-w-none text-center mb-32 sm:mb-40">
                    <p className="text-xl sm:text-2xl text-[#3B2A22]/80 dark:text-gray-300 italic font-medium leading-[1.8] max-w-3xl mx-auto">
                        "Ruang Aksara adalah rumah bagi setiap imajinasi yang ingin terbang bebas. Kami percaya bahwa setiap orang memiliki cerita yang layak untuk dibagikan, dan setiap kata adalah langkah menuju dunia yang lebih berwarna."
                    </p>
                </div>

                {/* Visi Misi Section - Increased Gap */}
                <div className="grid md:grid-cols-2 gap-20 items-center mb-40 sm:mb-48">
                    {/* Left side: Image/Illustration */}
                    <div className="relative group">
                        <div className="w-full aspect-[4/5] bg-[#3B2A22]/5 rounded-[3rem] overflow-hidden border border-[#3B2A22]/10 relative">
                            <img 
                                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=1000&auto=format&fit=crop" 
                                alt="Books Library"
                                className="w-full h-full object-cover grayscale-[0.3] group-hover:scale-110 transition-transform duration-1000"
                            />
                            <div className="absolute inset-0 bg-[#3B2A22]/10 group-hover:bg-transparent transition-colors"></div>
                        </div>
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#C6A982] rounded-[2rem] flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                            <Sparkles className="w-12 h-12 text-white" />
                        </div>
                    </div>

                    {/* Right side: Visi Misi Tabs - Increased Padding */}
                    <div className="bg-[#B59F84]/15 p-12 sm:p-16 rounded-[4rem] border border-[#3B2A22]/5">
                        <div className="flex gap-4 p-1.5 bg-[#3B2A22] rounded-full mb-10 w-fit mx-auto md:mx-0">
                            <button 
                                onClick={() => setActiveTab('visi')}
                                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'visi' ? 'bg-[#F2EAD7] text-[#3B2A22]' : 'text-white/60 hover:text-white'}`}
                            >
                                Visi
                            </button>
                            <button 
                                onClick={() => setActiveTab('misi')}
                                className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'misi' ? 'bg-[#F2EAD7] text-[#3B2A22]' : 'text-white/60 hover:text-white'}`}
                            >
                                Misi
                            </button>
                        </div>

                        <div className="min-h-[200px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {activeTab === 'visi' ? (
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                                            <Target className="w-6 h-6 text-[#3B2A22]" />
                                        </div>
                                        <p className="text-[#3B2A22] font-medium leading-relaxed italic">
                                            Menjadi platform literasi digital nomor satu di Indonesia yang menghubungkan jutaan penulis dan pembaca dalam harmoni kreativitas.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex gap-4 items-start">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm">
                                            <Heart className="w-6 h-6 text-[#3B2A22]" />
                                        </div>
                                        <p className="text-[#3B2A22] font-medium leading-relaxed italic">
                                            Memberdayakan penulis dengan fitur editor yang magis, memberikan pengalaman membaca yang tenang, dan membangun komunitas yang saling menginspirasi.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Closing Tag */}
                <div className="text-center pb-24 border-t border-[#3B2A22]/5 pt-24">
                    <div className="flex items-center justify-center gap-4 mb-8 grayscale opacity-40">
                         <div className="w-12 h-[1px] bg-[#3B2A22]"></div>
                         <BookOpen className="w-6 h-6" />
                         <div className="w-12 h-[1px] bg-[#3B2A22]"></div>
                    </div>
                    <p className="text-[10px] font-black text-[#3B2A22]/30 uppercase tracking-[0.5em]">Ruang Aksara — 2024</p>
                </div>
            </main>
        </div>
    );
}
