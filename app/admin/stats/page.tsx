import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
    Eye, Star, Bookmark, BookOpen, 
    TrendingUp, ArrowLeft, ChevronRight,
    BarChart3, Users
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
        color: "bg-[#D6BFA6]",
        hoverColor: "hover:bg-[#E2CDB6]",
        textColor: "text-[#3B2A22]",
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

    // Fetch aggregates and follower counts
    const [works, totalFollowers, recentFollowers] = await Promise.all([
        prisma.karya.findMany({
            where: session.user.role === 'admin' ? undefined : { uploader_id: session.user.id },
            select: {
                total_views: true,
                avg_rating: true,
                _count: { select: { bookmarks: true } }
            }
        }),
        prisma.follow.count({
            where: { following_id: session.user.id }
        }),
        prisma.follow.count({
            where: { 
                following_id: session.user.id,
                created_at: { gte: sevenDaysAgo }
            }
        })
    ]);

    const stats: Record<string, number> = {
        engagement: works.reduce((acc, w) => acc + w.total_views, 0),
        kepuasan: works.length > 0 ? works.reduce((acc, w) => acc + w.avg_rating, 0) / works.length : 0,
        disimpan: works.reduce((acc, w) => acc + w._count.bookmarks, 0),
        karya: works.length,
        followers: totalFollowers,
        recentFollowers
    };

    return (
        <div className="min-h-screen bg-bg-cream/60 dark:bg-brown-dark transition-colors duration-500 pb-24">
            <div className="max-w-6xl mx-auto px-6 pt-12">
                <Link 
                    href="/admin/dashboard" 
                    className="inline-flex items-center gap-2 text-[10px] font-black text-text-main/40 dark:text-bg-cream/40 uppercase tracking-[0.3em] hover:text-text-main dark:hover:text-bg-cream mb-8 transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Kembali ke Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-text-main dark:text-text-accent italic uppercase tracking-tighter mb-4">Analisis Studio</h1>
                        <p className="text-text-main/40 dark:text-bg-cream/40 font-medium italic">Pusat data untuk melacak pertumbuhan dan performa karya Anda di Ruang Aksara.</p>
                    </div>
                    
                    {/* Quick Follower Stat */}
                    <div className="bg-white/40 dark:bg-brown-mid/20 rounded-[2rem] p-6 border border-text-main/5 dark:border-white/5 flex items-center gap-6 group transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-tan-primary/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-tan-primary" />
                            </div>
                            <div>
                                <p className="text-2xl font-black italic text-text-main dark:text-text-accent leading-none">{totalFollowers.toLocaleString()}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-text-main/40 dark:text-white/40">Total Followers</p>
                            </div>
                        </div>
                        <div className="w-[1px] h-8 bg-text-main/10"></div>
                        <div>
                            <p className="text-lg font-black italic text-tan-primary flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> +{recentFollowers}
                            </p>
                            <p className="text-[7px] font-black uppercase tracking-widest text-text-main/30">MINGGU INI</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {STATS_OVERVIEW_CONFIG.map((conf) => (
                        <Link 
                            key={conf.id}
                            href={`/admin/stats/${conf.id}`}
                            className={`${conf.color} ${conf.hoverColor} ${conf.textColor || 'text-white'} p-10 rounded-[3rem] shadow-2xl dark:shadow-none flex flex-col justify-between group overflow-hidden relative min-h-[300px] transition-all hover:scale-[1.02] cursor-pointer`}
                        >
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-8 border border-white/10 group-hover:rotate-6 transition-transform">
                                    <conf.icon className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black italic mb-2 uppercase tracking-tighter">{conf.title}</h2>
                                <p className="opacity-60 text-xs font-medium max-w-[240px] leading-relaxed">{conf.description}</p>
                            </div>

                            <div className="relative z-10 flex items-end justify-between">
                                <div>
                                    <p className="text-5xl md:text-6xl font-black italic tracking-tighter leading-none mb-1">
                                        {conf.id === 'kepuasan' ? stats[conf.id].toFixed(1) : stats[conf.id].toLocaleString()}
                                    </p>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">{conf.label}</p>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 group-hover:translate-x-2 transition-transform">
                                    <ChevronRight className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Decorative Design */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
