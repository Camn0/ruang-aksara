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
        <div className="space-y-6">
            {/* Level Card - Paper Scrap Style */}
            <div className="bg-white dark:bg-parchment-dark p-6 wobbly-border paper-shadow flex flex-col gap-4 relative overflow-hidden group rotate-[-1deg]">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gold wobbly-border flex items-center justify-center text-ink-deep shadow-inner rotate-3">
                            <Star className="w-8 h-8 fill-ink-deep/20" />
                        </div>
                        <div>
                            <p className="text-[10px] font-special uppercase tracking-widest text-pine">Reputasi Pembaca</p>
                            <h3 className="text-3xl font-journal-title text-ink-deep">Level {level}</h3>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLevelInfo(true)}
                        className="bg-pine text-parchment px-4 py-2 wobbly-border-sm text-[10px] font-marker uppercase hover:scale-105 transition-all active:scale-95 shadow-sm"
                    >
                        Benefit <ChevronRight className="w-4 h-4 inline ml-1" />
                    </button>
                </div>

                <div className="space-y-3 relative z-10">
                    <div className="flex justify-between text-xs font-marker text-ink/60 uppercase">
                        <span>Progress Menuju Lv {level + 1}</span>
                        <span className="text-ink-deep">{progressToNextLevel}%</span>
                    </div>
                    <div className="h-4 bg-ink/5 wobbly-border-sm overflow-hidden border border-ink/10">
                        <div
                            className="h-full bg-gold border-r-2 border-ink-deep transition-all duration-1000"
                            style={{ width: `${progressToNextLevel}%` }}
                        />
                    </div>
                    <p className="text-[11px] font-journal-body text-ink/70 italic leading-none">"Butuh {nextLevelPoints - stats.points} poin lagi untuk naik tingkat."</p>
                </div>

                <Star className="absolute -right-8 -bottom-8 w-40 h-40 text-ink/5 opacity-10 pointer-events-none rotate-12" />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-2">
                <button
                    onClick={() => setShowStreakInfo(true)}
                    className="bg-dried-red p-5 text-parchment wobbly-border paper-shadow relative overflow-hidden group text-left transition-all active:scale-95 rotate-1"
                >
                    <Flame className="absolute -right-6 -bottom-6 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform rotate-[-15deg]" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <p className="text-[11px] font-special uppercase tracking-widest opacity-80">Jejak Baca</p>
                        <Info className="w-4 h-4 opacity-70" />
                    </div>
                    <div className="flex items-end gap-2 relative z-10">
                        <span className="text-4xl font-journal-title">{stats.reading_streak}</span>
                        <span className="text-sm font-marker mb-1">Hari</span>
                    </div>
                </button>

                <button
                    onClick={() => setShowPointsInfo(true)}
                    className="bg-pine p-5 text-parchment wobbly-border paper-shadow relative overflow-hidden group text-left transition-all active:scale-95 rotate-[-1.5deg]"
                >
                    <Trophy className="absolute -right-6 -bottom-6 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform rotate-[12deg]" />
                    <div className="flex justify-between items-start mb-2 relative z-10">
                        <p className="text-[11px] font-special uppercase tracking-widest opacity-80">Poin Aksara</p>
                        <Info className="w-4 h-4 opacity-70" />
                    </div>
                    <div className="flex items-end gap-2 relative z-10">
                        <span className="text-4xl font-journal-title">{stats.points}</span>
                        <span className="text-xs font-marker mb-1">Poin</span>
                    </div>
                </button>
            </div>

            {/* Modals using same wobbly paper style */}
            {(showLevelInfo || showStreakInfo || showPointsInfo) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-ink-deep/60 backdrop-blur-sm" onClick={() => { setShowLevelInfo(false); setShowStreakInfo(false); setShowPointsInfo(false); }} />
                    <div className="bg-parchment w-full max-w-sm wobbly-border paper-shadow relative z-10 animate-in zoom-in-95 rotate-[-0.5deg]">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8 border-b-2 border-ink/10 pb-4">
                                <div>
                                    <h2 className="text-3xl font-journal-title text-ink-deep">
                                        {showLevelInfo ? "Panduan Tingkat" : showStreakInfo ? "Jejak Membara" : "Pundi Aksara"}
                                    </h2>
                                    <p className="text-[10px] text-pine font-special uppercase tracking-widest mt-1">
                                        {showLevelInfo ? "Sistem Reputasi" : showStreakInfo ? "Konsistensi" : "Kumpulkan Poin"}
                                    </p>
                                </div>
                                <button onClick={() => { setShowLevelInfo(false); setShowStreakInfo(false); setShowPointsInfo(false); }} className="p-2 hover:bg-ink/5 rounded-full text-ink/40 transition-colors">
                                    <X className="w-6 h-6 wobbly-border-sm border-2 border-ink/20" />
                                </button>
                            </div>

                            {showLevelInfo && (
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                                    {levelTiers.map((tier, i) => (
                                        <div key={i} className={`p-4 wobbly-border-sm border-2 transition-all ${level >= parseInt(tier.lv) ? 'bg-gold/10 border-gold' : 'bg-transparent border-ink/10'}`}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-[10px] font-special bg-ink-deep text-parchment px-2 py-0.5 shadow-sm rotate-[-2deg]">LV {tier.lv}</span>
                                                <span className="text-sm font-marker text-ink-deep">{tier.title}</span>
                                            </div>
                                            <p className="text-xs text-ink/80 font-journal-body italic leading-relaxed">{tier.benefit}</p>
                                        </div>
                                    ))}
                                    <div className="mt-8 p-4 bg-ink/5 border-2 border-dashed border-ink/20 rotate-1">
                                        <p className="text-xs text-ink/70 font-marker leading-relaxed">
                                            Setiap 1 Bab yang kamu baca memberikan <strong className="text-pine">10 Poin</strong>. Terus selami kata-kata untuk naik tingkat!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {showStreakInfo && (
                                <div className="space-y-6 text-ink/80">
                                    <p className="font-journal-body text-lg italic leading-relaxed">"Jejak ini menunjukkan berapa hari tanpa putus Anda telah menyentuh lembaran aksara."</p>
                                    <div className="p-5 bg-dried-red/10 wobbly-border-sm border-2 border-dried-red/30 rotate-1">
                                        <p className="font-marker text-dried-red text-sm leading-relaxed font-bold">
                                            Baca minimal 1 Bab setiap hari untuk menjaga api tetap menyala. Jika terputus sehari saja, api akan padam (kembali ke 0).
                                        </p>
                                    </div>
                                    <p className="font-special text-[11px] uppercase tracking-tighter opacity-70">Gunakan jejak ini untuk membuktikan dedikasi Anda.</p>
                                </div>
                            )}

                            {showPointsInfo && (
                                <div className="space-y-6 text-ink/80">
                                    <p className="font-journal-body text-lg italic leading-relaxed">"Poin-poin ini adalah saksi bisu dari setiap tinta yang Anda serap."</p>
                                    <ul className="space-y-4">
                                        <li className="flex items-center gap-4 group">
                                            <div className="w-4 h-4 wobbly-border-sm bg-pine group-hover:rotate-45 transition-transform" />
                                            <span className="font-marker text-sm">Menamatkan 1 Bab: <strong className="text-pine">+10 Poin</strong></span>
                                        </li>
                                        <li className="flex items-center gap-4 group">
                                            <div className="w-4 h-4 wobbly-border-sm bg-gold group-hover:rotate-45 transition-transform" />
                                            <span className="font-marker text-sm">Bonus 7 Hari Jejak: <strong className="text-gold">+50 Poin</strong></span>
                                        </li>
                                    </ul>
                                    <div className="mt-8 p-4 bg-gold/5 border-2 border-ink/5 wobbly-border-sm">
                                        <p className="text-[10px] font-special uppercase tracking-tighter italic text-ink/50">Poin tidak akan pernah luntur dari buku catatanmu.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
