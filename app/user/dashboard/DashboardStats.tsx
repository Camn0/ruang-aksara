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
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100 dark:shadow-none flex flex-col gap-4 relative overflow-hidden group">
                <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                            <Star className="w-6 h-6 fill-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Peringkat Anda</p>
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">Level {level}</h3>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLevelInfo(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all active:scale-95"
                    >
                        Info Benefit <ChevronRight className="w-3 h-3" />
                    </button>
                </div>

                <div className="space-y-2 relative z-10">
                    <div className="flex justify-between text-[11px] font-black text-gray-400 uppercase tracking-tighter">
                        <span>Progress Level</span>
                        <span className="text-indigo-600 dark:text-indigo-400">{progressToNextLevel}%</span>
                    </div>
                    <div className="h-3 bg-gray-50 dark:bg-slate-800 rounded-full overflow-hidden border border-gray-100 dark:border-slate-700">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-gradient-x transition-all duration-1000"
                            style={{ width: `${progressToNextLevel}%` }}
                        />
                    </div>
                    <p className="text-[9px] text-gray-400 font-bold italic">Butuh {nextLevelPoints - stats.points} poin lagi untuk naik level.</p>
                </div>

                <Star className="absolute -right-6 -bottom-6 w-32 h-32 text-gray-50 dark:text-slate-800 opacity-50 pointer-events-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <button
                    onClick={() => setShowStreakInfo(true)}
                    className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-5 text-white shadow-xl shadow-orange-100 dark:shadow-none relative overflow-hidden group border border-white/10 text-left transition-all active:scale-[0.98] cursor-pointer"
                >
                    <Flame className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Streak</p>
                        <Info className="w-4 h-4 opacity-50" />
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-black">{stats.reading_streak}</span>
                        <span className="text-sm font-bold mb-1 opacity-80">Hari</span>
                    </div>
                </button>

                <button
                    onClick={() => setShowPointsInfo(true)}
                    className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-xl shadow-indigo-100 dark:shadow-none relative overflow-hidden group border border-white/10 text-left transition-all active:scale-[0.98] cursor-pointer"
                >
                    <Trophy className="absolute -right-4 -bottom-4 w-24 h-24 opacity-20 group-hover:scale-110 transition-transform" />
                    <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Poin</p>
                        <Info className="w-4 h-4 opacity-50" />
                    </div>
                    <div className="flex items-end gap-1">
                        <span className="text-3xl font-black">{stats.points}</span>
                        <span className="text-sm font-bold mb-1 opacity-80">Pts</span>
                    </div>
                </button>
            </div>

            {/* Level Info Modal */}
            {showLevelInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowLevelInfo(false)} />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 italic">Level Guide</h2>
                                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Sistem Reputasi Pembaca</p>
                                </div>
                                <button onClick={() => setShowLevelInfo(false)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {levelTiers.map((tier, i) => (
                                    <div key={i} className={`p-4 rounded-2xl border transition-all ${level >= parseInt(tier.lv) ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800' : 'bg-gray-50/50 dark:bg-slate-800/50 border-transparent'}`}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[9px] font-black bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm text-indigo-600">LV {tier.lv}</span>
                                            <span className="text-[11px] font-black text-gray-900 dark:text-gray-100">{tier.title}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold mt-1">{tier.benefit}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-100 dark:border-amber-800">
                                <p className="text-[10px] text-amber-700 dark:text-amber-400 font-bold leading-relaxed">
                                    Setiap 1 Bab yang kamu baca memberikan <strong>10 Poin</strong>. Terus baca untuk meningkatkan reputasimu di Ruang Aksara!
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Streak Info Modal */}
            {showStreakInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowStreakInfo(false)} />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 italic">Streak Baca</h2>
                                    <p className="text-[10px] text-orange-600 font-black uppercase tracking-widest mt-1">Konsistensi adalah Kunci</p>
                                </div>
                                <button onClick={() => setShowStreakInfo(false)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400 text-xs font-medium leading-relaxed">
                                <p>Streak menunjukkan berapa hari berturut-turut kamu membaca di Ruang Aksara.</p>
                                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-800">
                                    <p className="text-orange-700 dark:text-orange-400 font-bold">
                                        Baca minimal 1 Bab setiap hari untuk mempertahankan apimu. Jika terputus satu hari saja, streak-mu akan kembali ke 0!
                                    </p>
                                </div>
                                <p>Gunakan streak-mu untuk memamerkan dedikasimu di profil global.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Points Info Modal */}
            {showPointsInfo && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowPointsInfo(false)} />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 border border-gray-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 italic">Poin Aksara</h2>
                                    <p className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mt-1">Kumpulkan untuk Naik Level</p>
                                </div>
                                <button onClick={() => setShowPointsInfo(false)} className="p-2 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-4 text-gray-600 dark:text-gray-400 text-xs font-medium leading-relaxed">
                                <p>Poin dikumpulkan melalui aktivitas membaca dan berinteraksi di platform.</p>
                                <ul className="space-y-2">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span>Baca 1 Bab: <strong>+10 Poin</strong></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span>Streak Bonus (7 Hari): <strong>+50 Poin</strong></span>
                                    </li>
                                </ul>
                                <p className="italic text-[10px]">Poin tidak akan berkurang dan digunakan sebagai penentu Level utama kamu.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
