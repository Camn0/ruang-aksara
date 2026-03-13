'use client';

import { Flame, Trophy, Star, ChevronRight, X, Info } from "lucide-react";
import { useState } from "react";

interface DashboardStatsProps {
    stats: {
        reading_streak: number;
        points: number;
    };
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
    const [showLevelInfo, setShowLevelInfo] = useState(false);
    const [showStreakInfo, setShowStreakInfo] = useState(false);
    const [showPointsInfo, setShowPointsInfo] = useState(false);

    // Level calculation logic (Sama dengan di parent)
    const level = Math.floor(Math.sqrt(stats.points / 10)) + 1;
    const nextLevelPoints = Math.pow(level, 2) * 10;
    const progressToNextLevel = Math.min(100, Math.round((stats.points / nextLevelPoints) * 100));

    const levelTiers = [
        { lv: '1-5', title: 'Pembaca Pemula', benefit: 'Akses standar seluruh fitur baca.' },
        { lv: '6-10', title: 'Kolektor Aksara', benefit: 'Unlock: Simpan hingga 50 karya di Library.' },
        { lv: '11-20', title: 'Kritikus Ulung', benefit: 'Prio: Komentarmu muncul lebih atas.' },
        { lv: '21+', title: 'Maestro Aksara', benefit: 'Eksklusif: Ikon profil emas & Badge Penulis.' },
    ];

    return (
        <div className="space-y-4">
            {/* Level Card - Full Width */}
            <div className="bg-white dark:bg-brown-dark rounded-[2.5rem] p-6 border border-tan-light/30 dark:border-brown-mid shadow-xl shadow-tan-light/10 dark:shadow-none flex flex-col gap-4 relative overflow-hidden group">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-tan-primary rounded-2xl flex items-center justify-center text-text-accent shadow-lg">
                            <Star className="w-6 h-6 fill-text-accent" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-tan-primary">Peringkat Anda</p>
                            <h3 className="text-xl font-open-sans font-bold text-text-main dark:text-text-accent">Level {level}</h3>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLevelInfo(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-tan-light/20 text-tan-primary rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-tan-light hover:text-brown-dark transition-all active:scale-95"
                    >
                        Benefit <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-[11px] font-bold text-tan-primary uppercase tracking-tighter">
                        <span>Progress Level</span>
                        <span className="text-brown-dark">{progressToNextLevel}%</span>
                    </div>
                    <div className="h-3 bg-tan-light/10 dark:bg-brown-mid rounded-full overflow-hidden border border-tan-light/20">
                        <div
                            className="h-full bg-tan-primary transition-all duration-1000"
                            style={{ width: `${progressToNextLevel}%` }}
                        />
                    </div>
                    <p className="text-[9px] text-tan-primary/70 font-bold italic">Butuh {nextLevelPoints - stats.points} poin lagi untuk naik level.</p>
                </div>

                <Star className="absolute -right-6 -bottom-6 w-32 h-32 text-tan-light/10 dark:text-slate-800 pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowStreakInfo(true)}
                    className="bg-brown-dark rounded-[2.5rem] p-5 text-text-accent shadow-xl shadow-brown-dark/10 relative overflow-hidden group border border-white/10 text-left transition-all active:scale-[0.98] cursor-pointer"
                >
                    <Flame className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Streak</p>
                        <Info className="w-4 h-4 opacity-40" />
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-black">{stats.reading_streak}</span>
                        <span className="text-sm font-bold mb-1 opacity-60">Hari</span>
                    </div>
                </button>

                <button
                    onClick={() => setShowPointsInfo(true)}
                    className="bg-brown-mid rounded-[2.5rem] p-5 text-text-accent shadow-xl shadow-brown-mid/10 relative overflow-hidden group border border-white/10 text-left transition-all active:scale-[0.98] cursor-pointer"
                >
                    <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Poin</p>
                        <Info className="w-4 h-4 opacity-40" />
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-black">{stats.points}</span>
                        <span className="text-sm font-bold mb-1 opacity-60">Pts</span>
                    </div>
                </button>
            </div>

            {/* Level Info Modal */}
            {showLevelInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-brown-dark/80 backdrop-blur-sm" onClick={() => setShowLevelInfo(false)} />
                    <div className="bg-bg-cream dark:bg-brown-dark w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-tan-light animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-open-sans font-bold text-text-main dark:text-text-accent italic">Level Guide</h2>
                                    <p className="text-[10px] text-tan-primary font-black uppercase tracking-widest mt-1">Sistem Reputasi Pembaca</p>
                                </div>
                                <button onClick={() => setShowLevelInfo(false)} className="p-2 bg-tan-light/20 rounded-full text-tan-primary hover:text-brown-dark transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {levelTiers.map((tier, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border transition-all ${level >= parseInt(tier.lv) ? 'bg-white dark:bg-indigo-900/20 border-tan-light shadow-sm' : 'bg-tan-light/5 dark:bg-brown-mid/50 border-transparent'}`}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[9px] font-black bg-tan-primary text-text-accent px-2 py-0.5 rounded shadow-sm">LV {tier.lv}</span>
                                            <span className="text-[11px] font-bold text-text-main dark:text-text-accent">{tier.title}</span>
                                        </div>
                                        <p className="text-[10px] text-tan-primary font-bold mt-1 line-clamp-2">{tier.benefit}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-brown-dark rounded-2xl border border-white/10">
                                <p className="text-[11px] text-text-accent font-bold leading-relaxed">
                                    Setiap 1 Bab yang kamu baca memberikan <span className="text-tan-primary">10 Poin</span>. Terus baca untuk tingkatkan levelmu!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Streak Info Modal */}
            {showStreakInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-brown-dark/80 backdrop-blur-sm" onClick={() => setShowStreakInfo(false)} />
                    <div className="bg-bg-cream dark:bg-brown-dark w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-tan-light animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-open-sans font-bold text-text-main dark:text-text-accent italic">Streak Baca</h2>
                                    <p className="text-[10px] text-brown-mid font-black uppercase tracking-widest mt-1">Konsistensi adalah Kunci</p>
                                </div>
                                <button onClick={() => setShowStreakInfo(false)} className="p-2 bg-tan-light/20 rounded-full text-tan-primary hover:text-brown-dark transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4 text-text-main/70 dark:text-tan-light text-xs font-bold leading-relaxed">
                                <p>Streak menunjukkan berapa hari berturut-turut kamu membaca di Ruang Aksara.</p>
                                <div className="p-4 bg-white dark:bg-orange-900/20 rounded-2xl border border-tan-light shadow-sm">
                                    <p className="text-brown-dark font-bold leading-relaxed">
                                        Baca minimal 1 Bab setiap hari untuk mempertahankan apimu. Jangan sampai terputus!
                                    </p>
                                </div>
                                <p>Tunjukkan dedikasimu di profil global Ruang Aksara.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Points Info Modal */}
            {showPointsInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-brown-dark/80 backdrop-blur-sm" onClick={() => setShowPointsInfo(false)} />
                    <div className="bg-bg-cream dark:bg-brown-dark w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-tan-light animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-open-sans font-bold text-text-main dark:text-text-accent italic">Poin Aksara</h2>
                                    <p className="text-[10px] text-tan-primary font-black uppercase tracking-widest mt-1">Kumpulkan poin untuk naik level</p>
                                </div>
                                <button onClick={() => setShowPointsInfo(false)} className="p-2 bg-tan-light/20 rounded-full text-tan-primary hover:text-brown-dark transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4 text-text-main/70 dark:text-tan-light text-xs font-bold leading-relaxed">
                                <p>Setiap aktivitasmu diapresiasi dengan poin yang akan mengakumulasi peringkatmu.</p>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-tan-primary shadow-sm" />
                                        <span>Baca 1 Bab: <strong>+10 Poin</strong></span>
                                    </li>
                                    <li className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-tan-primary shadow-sm" />
                                        <span>Streak Bonus (7 Hari): <strong>+50 Poin</strong></span>
                                    </li>
                                </ul>
                                <p className="italic text-[10px] text-tan-primary/60">Poin bersifat permanen dan tidak dapat berkurang.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
