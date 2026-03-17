import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
    Eye, Star, Bookmark, BookOpen, 
    TrendingUp, ArrowLeft, ChevronRight,
    BarChart3, Users, Clock, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

const STATS_OVERVIEW_CONFIG = [
    {
        id: 'engagement',
        title: "Engagement",
        label: "Total Views",
        icon: Eye,
        color: "bg-[#3B2A22]",
        hoverColor: "hover:bg-[#4A352B]",
        description: "Analisis jangkauan dan tayangan seluruh karya Anda."
    },
    {
        id: 'kepuasan',
        title: "Kepuasan",
        label: "Reader Stars",
        icon: Star,
        color: "bg-[#7A553A]",
        hoverColor: "hover:bg-[#8B6447]",
        description: "Evaluasi kualitas karya berdasarkan rating pembaca."
    },
    {
        id: 'disimpan',
        title: "Disimpan",
        label: "Total Saves",
        icon: Bookmark,
        color: "bg-[#433229]",
        hoverColor: "hover:bg-[#523E33]",
        description: "Jumlah pembaca yang memfavoritkan karya Anda."
    },
    {
        id: 'karya',
        title: "Koleksi",
        label: "Total Works",
        icon: BookOpen,
        color: "bg-[#D6BFA6] dark:bg-brown-mid",
        hoverColor: "hover:bg-[#E2CDB6] dark:hover:bg-brown-mid/80",
        textColor: "text-[#3B2A22] dark:text-text-accent",
        description: "Statistik performa mendalam untuk masing-masing karya."
    }
];

export default async function AnalyticsOverviewPage() {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'author'].includes(session.user.role)) {
        redirect('/');
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const whereKarya = session.user.role === 'admin' ? {} : { uploader_id: session.user.id };

    // Fetch aggregates and trend data in parallel
    const [
        karyaAggregates,
        totalBookmarks,
        totalFollowers,
        recentFollowers,
        recentBabActivity,
        recentBookmarkActivity
    ] = await Promise.all([
        prisma.karya.aggregate({
            where: whereKarya,
            _sum: { total_views: true },
            _avg: { avg_rating: true },
            _count: true
        }),
        prisma.bookmark.count({
            where: { karya: whereKarya }
        }),
        prisma.follow.count({
            where: { following_id: session.user.id }
        }),
        prisma.follow.count({
            where: { 
                following_id: session.user.id,
                created_at: { gte: sevenDaysAgo }
            }
        }),
        prisma.bab.findMany({
            where: { 
                karya: whereKarya,
                created_at: { gte: thirtyDaysAgo }
            },
            select: { created_at: true }
        }),
        prisma.bookmark.findMany({
            where: { 
                karya: whereKarya,
                updated_at: { gte: sevenDaysAgo }
            },
            select: { updated_at: true }
        })
    ]);

    // --- GLOBAL TREND CALCULATIONS ---
    
    // Activity Map (30 Days Consistency)
    const activityMapData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        
        return recentBabActivity.filter(b => 
            new Date(b.created_at) >= d && new Date(b.created_at) < nextD
        ).length;
    });

    // Save Velocity (7 Days Trend)
    const saveVelocityData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        
        return recentBookmarkActivity.filter(b => 
            new Date(b.updated_at) >= d && new Date(b.updated_at) < nextD
        ).length;
    });

    // Average rating is already calculated by _avg on Karya
    // For distribution, we still need an aggregate or separate counts if we want full precision
    // But we can approximate or use a separate efficient query for distribution if needed.
    const ratingDistributionAgg = await prisma.rating.groupBy({
        by: ['score'],
        where: { karya: whereKarya, score: { gt: 0 } },
        _count: true
    });

    const ratingDistribution = [1, 2, 3, 4, 5].map(s => ({
        score: s,
        count: ratingDistributionAgg.find(r => r.score === s)?._count || 0
    }));

    const totalScore = ratingDistributionAgg.reduce((acc, r) => acc + (r.score * r._count), 0);
    const totalRated = ratingDistributionAgg.reduce((acc, r) => acc + r._count, 0);
    const trueAvg = totalRated > 0 ? totalScore / totalRated : 0;

    const stats: Record<string, number> = {
        engagement: karyaAggregates._sum.total_views || 0,
        kepuasan: trueAvg,
        disimpan: totalBookmarks,
        karya: karyaAggregates._count,
        followers: totalFollowers,
        recentFollowers
    };

    const totalRatings = totalRated;
    const sentimentPercentage = totalRated > 0 ? Math.round((ratingDistribution.filter(r => r.score >= 4).reduce((acc, r) => acc + r.count, 0) / totalRated) * 100) : 0;

    return (
        <div className="min-h-screen bg-bg-cream/60 dark:bg-brown-dark transition-colors duration-500 pb-24">
            <div className="max-w-6xl mx-auto px-6 pt-12">
                <Link 
                    href="/admin/dashboard" 
                    prefetch={false}
                    className="inline-flex items-center gap-2 text-[10px] font-black text-text-main/50 dark:text-text-accent uppercase tracking-[0.3em] hover:text-text-main dark:hover:text-bg-cream mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-text-main dark:text-text-accent italic uppercase tracking-tighter mb-4">Analisis Studio</h1>
                        <p className="text-text-main/50 dark:text-text-accent/60 font-medium italic">Pusat data untuk melacak pertumbuhan dan performa karya Anda di Ruang Aksara.</p>
                    </div>
                    
                    {/* Quick Follower Stat */}
                    <div className="bg-bg-cream/40 dark:bg-brown-mid/20 rounded-[2rem] p-6 border border-tan-primary/5 dark:border-white/5 flex items-center gap-6 group transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-tan-primary/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-tan-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-black italic text-text-main dark:text-text-accent leading-none">{totalFollowers.toLocaleString()}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-main/50 dark:text-text-accent/80">Total Followers</p>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-text-main/10"></div>
                        <div>
                            <p className="text-lg font-black italic text-tan-primary flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +{recentFollowers}
                            </p>
                            <p className="text-[7px] font-black uppercase tracking-widest text-text-main/50 dark:text-text-accent/80">MINGGU INI</p>
                        </div>
                    </div>
                </div>
                
                {/* STUDIO TRENDS: THE BIG PICTURE */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
                    <div className="lg:col-span-2 bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[3rem] p-10 border border-tan-primary/5 dark:border-white/5 shadow-inner">
                        <div className="grid md:grid-cols-2 gap-12">
                            <Link href="/admin/stats/karya" prefetch={false} className="group/chart relative">
                                <div className="absolute top-0 right-0 opacity-0 group-hover/chart:opacity-40 transition-opacity whitespace-nowrap">
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] italic">Klik untuk Detail</span>
                                </div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-text-accent mb-8 flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Activity Map (Last 30d)
                                </h3>
                                <ActivityBarChart data={activityMapData} />
                                <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic text-text-main/50 dark:text-text-accent/60">
                                    <span>H-30</span>
                                    <span>{activityMapData.filter(v => v > 0).length} Updates</span>
                                    <span>H-1</span>
                                </div>
                            </Link>
                            <Link href="/admin/stats/disimpan" prefetch={false} className="group/chart relative">
                                <div className="absolute top-0 right-0 opacity-0 group-hover/chart:opacity-40 transition-opacity whitespace-nowrap">
                                    <span className="text-[7px] font-black uppercase tracking-[0.2em] italic">Klik untuk Detail</span>
                                </div>
                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-text-accent mb-8 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-tan-primary" /> Save Velocity (Last 7d)
                                </h3>
                                <SaveVelocityBarChart data={saveVelocityData} />
                                <div className="mt-8 flex justify-between items-center text-[10px] font-black uppercase tracking-widest italic text-text-main/50 dark:text-text-accent/60">
                                    <span>H-7</span>
                                    <span>+{saveVelocityData.reduce((a,b) => a+b, 0)} Saves</span>
                                    <span>H-1</span>
                                </div>
                            </Link>
                        </div>
                    </div>
                    <Link href="/admin/stats/kepuasan" prefetch={false} className="lg:col-span-1 block group/card">
                        <SentimentBreakdown
                            percentage={sentimentPercentage}
                            total={totalRatings}
                            distribution={ratingDistribution}
                            showHint={true}
                        />
                    </Link>
                </div>

                <div className="flex items-center gap-6 mb-8">
                    <h2 className="text-xl font-black italic uppercase text-text-main/60 dark:text-text-accent tracking-tighter">Kategori Statistik</h2>
                    <div className="flex-1 h-[1px] bg-text-main/10 dark:bg-tan-primary/10"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {STATS_OVERVIEW_CONFIG.map((conf) => (
                        <Link 
                            key={conf.id}
                            href={`/admin/stats/${conf.id}`}
                            prefetch={false}
                            className={`${conf.color} ${conf.hoverColor} ${conf.textColor || 'text-white'} p-10 rounded-[3rem] shadow-2xl dark:shadow-none flex flex-col justify-between group overflow-hidden relative min-h-[300px] transition-all hover:scale-[1.02] cursor-pointer`}
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-tan-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:rotate-6 transition-transform">
                                    <conf.icon className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black italic mb-2 uppercase tracking-tighter">{conf.title}</h2>
                                <p className="opacity-80 dark:text-text-accent/90">{conf.description}</p>
                            </div>

                            <div className="relative z-10 flex items-end justify-between">
                                <div>
                                    <p className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none mb-1">
                                        {conf.id === 'kepuasan' ? stats[conf.id].toFixed(1) : stats[conf.id].toLocaleString()}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 dark:text-text-accent group-hover:opacity-100 transition-opacity">{conf.label}</p>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="w-12 h-12 rounded-full bg-tan-primary/10 flex items-center justify-center border border-white/10 group-hover:translate-x-2 transition-transform">
                                        <ChevronRight className="w-6 h-6" />
                                    </div>
                                    <span className="text-[7px] font-black uppercase tracking-widest text-white/60 dark:text-text-accent opacity-0 group-hover:opacity-100 transition-opacity">Lihat Analisis</span>
                                </div>
                            </div>

                            {/* Decorative Design */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-tan-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- VISUAL COMPONENTS ---

function ActivityBarChart({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-1 w-full h-24 pt-4 group">
            {data.map((val, i) => (
                <div key={i} className="flex-1 relative group/bar h-full flex items-end">
                    {/* Ghost Bar for Zero visibility */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-text-main/5 dark:bg-tan-primary/5 rounded-t-sm" />
                    <div 
                        className={`w-full rounded-t-sm transition-all duration-300 origin-bottom group-hover/bar:bg-tan-primary ${val > 0 ? 'bg-tan-primary/60' : 'bg-transparent'}`}
                        style={{ height: `${(val / max) * 100}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-text-main text-bg-cream text-[7px] px-1 py-0.5 rounded whitespace-nowrap z-10 font-bold pointer-events-none">
                        {val} Ch.
                    </div>
                </div>
            ))}
        </div>
    );
}

function SaveVelocityBarChart({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-2 w-full h-24 pt-4 group">
            {data.map((val, i) => (
                <div key={i} className="flex-1 relative group/bar h-full flex items-end">
                    {/* Ghost Bar */}
                    <div className="absolute inset-x-0 bottom-0 h-[3px] bg-text-main/5 dark:bg-tan-primary/5 rounded-t-sm" />
                    <div 
                        className={`w-full rounded-t-sm transition-all duration-500 origin-bottom group-hover/bar:scale-y-110 ${val > 0 ? 'bg-tan-primary' : 'bg-transparent'}`}
                        style={{ height: `${(val / max) * 100}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-tan-primary text-white text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 font-black pointer-events-none">
                        {val}
                    </div>
                </div>
            ))}
        </div>
    );
}

function SentimentBreakdown({ percentage, total, distribution, showHint }: { percentage: number, total: number, distribution?: { score: number, count: number }[], showHint?: boolean }) {
    return (
        <div className="w-full bg-bg-cream/40 dark:bg-brown-mid/10 rounded-[3rem] p-8 border border-white/5 shadow-inner relative group/gauge transition-all group-hover/card:bg-bg-cream/60 dark:group-hover/card:bg-brown-mid/20">
            {showHint && (
                <div className="absolute top-6 right-8 opacity-0 group-hover/card:opacity-40 transition-opacity whitespace-nowrap">
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] italic">Klik untuk Detail</span>
                </div>
            )}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <span className="text-5xl font-black italic tracking-tighter leading-none text-text-main dark:text-text-accent">{percentage}%</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/50 dark:text-text-accent/60">Global Sentiment</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black italic text-tan-primary">{total}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-main/50 dark:text-text-accent/80">Total Ratings</p>
                </div>
            </div>
            
            <div className="space-y-3">
                {distribution?.slice().reverse().map(d => {
                    const p = total > 0 ? (d.count / total) * 100 : 0;
                    return (
                        <div key={d.score} className="space-y-1">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-1">
                                    <span className="text-[9px] font-black tracking-tighter text-text-main/50 dark:text-text-accent">{d.score} Star</span>
                                    <Star className={`w-2 h-2 ${d.score >= 4 ? 'text-tan-primary fill-tan-primary/80' : 'text-text-main/10 dark:text-white/10'}`} />
                                </div>
                                <span className="text-[8px] font-black text-text-main/40 dark:text-text-accent uppercase tracking-tighter">{d.count}</span>
                            </div>
                            <div className="h-1.5 bg-text-main/5 dark:bg-tan-primary/5 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out ${d.score >= 4 ? 'bg-tan-primary' : 'bg-text-main/20'}`} 
                                    style={{ width: `${p}%` }} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
