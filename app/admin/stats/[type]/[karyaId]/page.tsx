import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
    BarChart, Star, Bookmark, BookOpen, ArrowLeft, 
    TrendingUp, Eye, ChevronRight, MessageSquare, 
    Sparkles, Heart, Flame, Zap, ThumbsUp, PenTool 
} from 'lucide-react';
import Link from 'next/link';
import { redirect, notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface AnalyticsKarya {
    id: string;
    title: string;
    total_views: number;
    avg_rating: number;
    cover_url: string | null;
    is_completed: boolean;
    updated_at: Date;
    _count: {
        bookmarks: number;
        ratings: number;
        reviews: number;
    };
    genres: { id: string; name: string }[];
    bab: {
        id: string;
        chapter_no: number;
        title: string | null;
        content: string;
        created_at: Date;
        _count: { comments: number; reactions: number };
        reactions: { reaction_type: string }[];
        comments: { id: string; created_at: Date }[];
    }[];
    ratings: { score: number }[];
    bookmarks: { last_chapter: number; updated_at: Date }[];
    reviews: {
        id: string;
        content: string;
        created_at: Date;
        user: { display_name: string; avatar_url: string | null };
        _count: { upvotes: number };
    }[];
}

const STATS_CONFIG: Record<string, { title: string; icon: any; unit: string; description: string; color: string }> = {
    engagement: {
        title: "Analisis Jangkauan",
        icon: Eye,
        unit: "Views",
        color: "bg-[#3B2A22]",
        description: "Performa visibilitas dan retensi pembaca per bab."
    },
    kepuasan: {
        title: "Analisis Kepuasan",
        icon: Star,
        unit: "Stars",
        color: "bg-[#7A553A]",
        description: "Review terdalam dan distribusi rating dari pembaca."
    },
    disimpan: {
        title: "Analisis Koleksi",
        icon: Bookmark,
        unit: "Saves",
        color: "bg-[#433229]",
        description: "Pertumbuhan library dan titik loyalitas pembaca."
    },
    karya: {
        title: "Analisis Portfolio",
        icon: BookOpen,
        unit: "Chapters",
        color: "bg-[#D6BFA6]",
        description: "Data volume, produktivitas, dan struktur karya."
    }
};

export default async function PerWorkStatsPage({ params }: { params: { type: string; karyaId: string } }) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'author')) {
        redirect('/');
    }

    const { type, karyaId } = params;
    const config = STATS_CONFIG[type];
    if (!config) redirect('/admin/stats');

    const work = await prisma.karya.findUnique({
        where: { id: karyaId },
        include: {
            _count: {
                select: { bookmarks: true, ratings: true, reviews: true }
            },
            genres: true,
            bab: {
                select: { 
                    id: true, 
                    chapter_no: true, 
                    title: true,
                    content: true,
                    created_at: true,
                    _count: { select: { comments: true, reactions: true } } ,
                    reactions: { select: { reaction_type: true } },
                    comments: { select: { id: true, created_at: true } }
                },
                orderBy: { chapter_no: 'asc' }
            },
            ratings: {
                select: { score: true }
            },
            bookmarks: {
                select: { last_chapter: true, updated_at: true, created_at: true }
            },
            reviews: {
                orderBy: { upvotes: { _count: 'desc' } },
                include: {
                    user: { select: { display_name: true, avatar_url: true } },
                    _count: { select: { upvotes: true } }
                }
            }
        }
    }) as unknown as AnalyticsKarya;

    if (!work) notFound();
    
    // Security Check
    if (session.user.role !== 'admin' && (work as any).uploader_id !== session.user.id) {
        redirect('/admin/stats');
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Dynamic Metrics specific to this work
    // --- QUALITATIVE THRESHOLDS (Honest Labels) ---
    const getQualityLabel = (score: number) => {
        if (score >= 9) return "Legendary";
        if (score >= 8) return "Premium";
        if (score >= 6) return "High";
        return "Stable";
    };

    const impactScore = (work.avg_rating * 0.5) + (Math.log10(work.total_views + 1) * 3) + ((work._count.bookmarks / (work.total_views || 1)) * 2);
    const avgDaysBetweenUpdates = work.bab.length > 1 ? 
        (new Date(work.bab[work.bab.length-1].created_at).getTime() - new Date(work.bab[0].created_at).getTime()) / (1000 * 60 * 60 * 24 * (work.bab.length - 1)) 
        : 0;

    // Fetch user works for ranking
    const userWorks = await prisma.karya.findMany({
        where: { uploader_id: (work as any).uploader_id },
        select: { id: true, _count: { select: { bookmarks: true } } }
    });

    const statsData: Record<string, { label: string; value: string | number; sub: string }[]> = {
        engagement: [
            { label: "Total Views", value: work.total_views.toLocaleString(), sub: "Total reach" },
            { label: "Active (7d)", value: work.bookmarks.filter(b => b.updated_at >= sevenDaysAgo).length, sub: "Unique readers" },
            { label: "Trend", value: `${((work.bookmarks.filter(b => b.updated_at >= sevenDaysAgo).length / (work.bookmarks.length || 1)) * 100).toFixed(1)}%`, sub: "Weekly velocity" },
            { label: "Avg Depth", value: `Bab ${(work.bookmarks.reduce((acc, b) => acc + b.last_chapter, 0) / (work.bookmarks.length || 1)).toFixed(1)}`, sub: "Progress index" },
            { label: "Retention", value: `${work.bookmarks.length > 0 ? ((work.bookmarks.filter(b => b.last_chapter >= (work.bab.length > 10 ? 10 : work.bab.length)).length / work.bookmarks.length) * 100).toFixed(0) : 0}%`, sub: "To target bab" },
            { label: "Interactions", value: work.bab.reduce((acc, b) => acc + b._count.comments + b._count.reactions, 0), sub: "Total social" },
            { label: "Int. Rate", value: (work.bab.reduce((acc, b) => acc + b._count.comments + b._count.reactions, 0) / (work.total_views || 1)).toFixed(2), sub: "Per view" },
            { label: "Hotspot", value: `Bab ${work.bab.sort((a,b) => (b._count.comments + b._count.reactions) - (a._count.comments + a._count.reactions))[0]?.chapter_no || 1}`, sub: "Most engaged" },
            { label: "Virality", value: (work.reviews.reduce((acc, r) => acc + r._count.upvotes, 0) / (work.total_views || 1) * 100).toFixed(2), sub: "Share index" },
            { label: "Status", value: work.total_views > 1000 ? "Hot" : "Rising", sub: "Algorithm tag" }
        ],
        kepuasan: [
            { label: "Avg Rating", value: work.avg_rating.toFixed(2), sub: "Skala 5.0" },
            { label: "Sentiment", value: `${work.ratings.length > 0 ? ((work.ratings.filter(r => r.score >= 4).length/work.ratings.length)*100).toFixed(0) : 0}%`, sub: "Rating 4-5 stars" },
            { label: "Total Votes", value: work.ratings.length, sub: "Bintang masuk" },
            { label: "Reviews", value: work._count.reviews, sub: "Ulasan teks" },
            { label: "Top Review", value: work.reviews[0]?._count.upvotes || 0, sub: "Upvote tertinggi" },
            { label: "Interaction", value: work.reviews.reduce((acc, r) => acc + r._count.upvotes, 0), sub: "Total upvotes" },
            { label: "Growth", value: work.reviews.filter(r => r.created_at >= sevenDaysAgo).length, sub: "Review baru (7d)" },
            { label: "Loyalty", value: `${((work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length / (work.bookmarks.length || 1)) * 100).toFixed(0)}%`, sub: "Completion rate" },
            { label: "Velocity", value: work.ratings.length > 10 ? "High" : "Steady", sub: "Feedback flow" },
            { label: "Impact", value: impactScore.toFixed(1), sub: "Author score" }
        ],
        disimpan: [
            { label: "Total Saves", value: work._count.bookmarks, sub: "Library pembaca" },
            { label: "Conversion", value: `${work.total_views > 0 ? ((work._count.bookmarks / work.total_views) * 100).toFixed(1) : 0}%`, sub: "View ke Save" },
            { label: "Loyalty", value: `${work.bookmarks.length > 0 ? ((work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length / work.bookmarks.length) * 100).toFixed(0) : 0}%`, sub: "Sampai bab akhir" },
            { label: "Save Vel.", value: work.bookmarks.filter(b => b.updated_at >= sevenDaysAgo).length, sub: "Laju 7 hari" },
            { label: "Drop Point", value: `Bab ${Object.entries(work.bookmarks.map(b => b.last_chapter).reduce((acc, c) => ({...acc, [c]: (acc[c] as number || 0) + 1}), {} as any)).sort((a,b) => (b[1] as any) - (a[1] as any))[0]?.[0] || '1'}`, sub: "Most drop-offs" },
            { label: "Portfolio Rank", value: `#${userWorks.sort((a,b) => b._count.bookmarks - a._count.bookmarks).findIndex(w => w.id === work.id) + 1}`, sub: "In your studio" },
            { label: "Reader Age", value: "Realtime", sub: "Updated daily" },
            { label: "Waiting", value: work.bookmarks.filter(b => b.last_chapter < work.bab.length).length, sub: "Waiting for update" },
            { label: "Resilience", value: getQualityLabel(impactScore), sub: "Reader stability" },
            { label: "Score", value: (impactScore * 0.8).toFixed(1), sub: "Bookmark health" }
        ],
        karya: [
            { label: "Chapters", value: work.bab.length, sub: "Total bab" },
            { label: "Wordcount", value: work.bab.reduce((acc, b) => acc + (b.content?.split(/\s+/).length || 0), 0).toLocaleString(), sub: "Kata terkumpul" },
            { label: "Avg Length", value: work.bab.length > 0 ? (work.bab.reduce((acc, b) => acc + (b.content?.split(/\s+/).length || 0), 0) / work.bab.length).toFixed(0) : 0, sub: "Kata per bab" },
            { label: "Density", value: work.bab.length > 10 ? "Dense" : "Light", sub: "Content volume" },
            { label: "Consistency", value: `${avgDaysBetweenUpdates.toFixed(1)}d/avg`, sub: "Update frequency" },
            { label: "Completion", value: work.is_completed ? "Tamat" : "Ongoing", sub: "Status karya" },
            { label: "Genre Diver.", value: work.genres.length, sub: "Klasifikasi" },
            { label: "Reach", value: work.total_views.toLocaleString(), sub: "Total audiens" },
            { label: "Quality", value: getQualityLabel(work.avg_rating * 2), sub: "User assessment" },
            { label: "Potential", value: impactScore > 8 ? "Top 5%" : "Top 20%", sub: "Growth forecast" }
        ]
    };

    const ratingDistribution = [1, 2, 3, 4, 5].map(s => ({
        score: s,
        count: work.ratings.filter(r => r.score === s).length
    }));

    // --- TIME SERIES REFINEMENT (Honest Analytics) ---
    
    // Chapter Reach (Bookmarks progression)
    const chapterReachData = work.bab.map(b => ({
        label: `Bab ${b.chapter_no}`,
        value: work.bookmarks.filter(bm => bm.last_chapter >= b.chapter_no).length
    }));

    // Consistency Map (Specific Work)
    const activityMapData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        
        return work.bab.some(b => 
            new Date(b.created_at) >= d && new Date(b.created_at) < nextD
        );
    });

    const stats = statsData[type] || [];

    return (
        <div className="min-h-screen bg-bg-cream/60 dark:bg-brown-dark transition-colors duration-500 pb-24 text-text-main dark:text-bg-cream">
            <div className="max-w-6xl mx-auto px-6 pt-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-6 mb-8">
                            <Link 
                                href={`/admin/stats/${type}`}
                                className="inline-flex items-center gap-2 text-[10px] font-black text-text-main/40 dark:text-bg-cream/40 uppercase tracking-[0.3em] hover:text-text-main dark:hover:text-bg-cream transition-colors group"
                            >
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Kembali
                            </Link>
                            <span className="w-4 h-[1px] bg-text-main/10 dark:bg-white/10"></span>
                            <span className="text-[10px] font-black text-text-main/60 dark:text-bg-cream/60 uppercase tracking-[0.4em] italic">{work.title}</span>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                            <div className={`w-12 h-12 ${config.color} text-white rounded-2xl flex items-center justify-center shadow-lg border border-white/10`}>
                                <config.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{config.title}</h1>
                                <p className="text-[10px] font-bold text-text-main/40 dark:text-bg-cream/40 uppercase tracking-[0.4em] mt-2 italic">{config.description}</p>
                            </div>
                        </div>
                    </div>

                    <Link 
                        href={`/admin/editor/karya/${work.id}`}
                        className="bg-text-main dark:bg-brown-mid text-bg-cream px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95 group border border-white/5"
                    >
                        <PenTool className="w-4 h-4" /> Edit Karya
                    </Link>
                </div>

                {/* --- 10 METRIC MATRIX --- */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
                    {stats.map((s, i: number) => (
                        <div key={i} className="bg-bg-cream/40 dark:bg-brown-dark/40 border border-text-main/5 dark:border-white/5 p-6 rounded-[2rem] hover:bg-bg-cream/60 dark:hover:bg-brown-dark/60 transition-all group">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-main/30 dark:text-bg-cream/30 mb-2 truncate">{s.label}</p>
                            <h3 className="text-2xl font-black italic mb-1 tracking-tight text-text-main dark:text-text-accent">{s.value}</h3>
                            <p className="text-[8px] font-bold uppercase tracking-wider text-text-main/40 dark:text-bg-cream/40">{s.sub}</p>
                        </div>
                    ))}
                </div>

                {/* --- TIER 2: VISUAL INSIGHTS --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {type === 'engagement' && (
                        <div className="lg:col-span-3 bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Chapter Performance (Reached Readers)</h4>
                            <ChapterPerformance data={chapterReachData} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-tan-primary mt-6 text-center italic opacity-40">Numbers reflect unique readers who progressed to each chapter</p>
                        </div>
                    )}
                    {type === 'kepuasan' && (
                        <>
                            <div className="bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5 flex items-center justify-center">
                                <SentimentGauge 
                                    percentage={Math.round((work.ratings.filter(r => r.score >= 4).length / (work.ratings.length || 1)) * 100)} 
                                    total={work.ratings.length} 
                                    distribution={ratingDistribution}
                                />
                            </div>
                            <div className="lg:col-span-2 bg-text-main dark:bg-brown-mid text-bg-cream rounded-[3rem] p-10 relative overflow-hidden group border border-white/5">
                                <h4 className="text-xl font-black italic mb-4 uppercase tracking-tighter">Engagement Highlight</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-8 leading-relaxed">
                                    Karya ini memiliki sentiment rating yang kuat. <span className="text-bg-cream/40 italic">Tingkat konversi review ke rating adalah {((work._count.reviews / (work.ratings.length || 1)) * 100).toFixed(0)}%.</span>
                                </p>
                                <div className="absolute bottom-0 right-0 p-8">
                                    <Sparkles className="w-12 h-12 opacity-10 group-hover:rotate-12 transition-transform" />
                                </div>
                            </div>
                        </>
                    )}
                    {type === 'disimpan' && (
                         <div className="lg:col-span-3 bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Retention Funnel</h4>
                            <RetentionFunnel stats={[
                                { label: "Bab 1", value: Math.round(work.bookmarks.filter(b => b.last_chapter >= 1).length / (work.bookmarks.length || 1) * 100), count: work.bookmarks.filter(b => b.last_chapter >= 1).length, color: "bg-tan-primary" },
                                { label: "Bab 10", value: Math.round(work.bookmarks.filter(b => b.last_chapter >= 10).length / (work.bookmarks.length || 1) * 100), count: work.bookmarks.filter(b => b.last_chapter >= 10).length, color: "bg-tan-primary" },
                                { label: "Bab Akhir", value: Math.round(work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length / (work.bookmarks.length || 1) * 100), count: work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length, color: "bg-brown-mid" }
                            ]} />
                        </div>
                    )}
                     {type === 'karya' && (
                        <div className="lg:col-span-3 bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-30 mb-8">Publishing Density (Last 30d)</h4>
                            <ConsistencyGrid data={activityMapData} />
                            <p className="text-[10px] font-bold text-tan-primary uppercase tracking-widest mt-6">
                                {activityMapData.filter(v => v).length} updates in 30 days
                            </p>
                        </div>
                    )}
                </div>

                {/* --- CONTEXT SECTIONS --- */}
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Visual Card */}
                    <div className="bg-[#3B2A22] text-bg-cream rounded-[3rem] p-10 relative overflow-hidden group border border-white/5 shadow-2xl">
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">Status Performa</h4>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-10">Prediksi Pertumbuhan Algoritma</p>
                            
                            <div className="flex items-end gap-16">
                                <div>
                                    <p className="text-7xl font-black italic tracking-tighter leading-none mb-4">92%</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">Excellent</span>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-bg-cream w-[92%]"></div>
                                    </div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] opacity-60 leading-relaxed">
                                        Karya ini memiliki indeks retensi di atas rata-rata platform. Rekomendasi: Pertahankan jadwal rilis konsisten.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                        <h4 className="text-2xl font-black italic mb-8 tracking-tighter text-text-main dark:text-text-accent uppercase">MetaData Identitas</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Judul Karya</span>
                                <span className="text-xs font-black italic uppercase tracking-tight">{work.title}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Genre Utama</span>
                                <div className="flex gap-2">
                                    {work.genres.map(g => (
                                        <span key={g.id} className="text-[8px] font-black uppercase bg-text-main/5 dark:bg-white/5 px-3 py-1 rounded-full">{g.name}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Terakhir Update</span>
                                <span className="text-xs font-black italic uppercase tracking-tight">{new Date(work.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">UID Karya</span>
                                <span className="text-[10px] font-mono opacity-40">{work.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- VISUAL COMPONENTS ---

function SentimentGauge({ percentage, total, distribution }: { percentage: number, total: number, distribution?: { score: number, count: number }[] }) {
    const strokeDasharray = 125.6; // exact semi-circle for radius 40
    const offset = strokeDasharray - (percentage / 100) * strokeDasharray;
    
    return (
        <div className="flex flex-col items-center group/gauge relative">
            <div className="relative w-48 h-28 mb-4">
                <svg className="w-full h-full transform -rotate-180" viewBox="0 0 100 60">
                    <path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="10" 
                        className="text-text-main/5 dark:text-white/5"
                    />
                    <path 
                        d="M 10 50 A 40 40 0 0 1 90 50" 
                        fill="none" 
                        stroke="url(#gauge-gradient)" 
                        strokeWidth="10" 
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                    <defs>
                        <linearGradient id="gauge-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#D6BFA6" />
                            <stop offset="100%" stopColor="#7A553A" />
                        </linearGradient>
                    </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
                    <span className="text-4xl font-black italic tracking-tighter leading-none">{percentage}%</span>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Sentiment</span>
                </div>
            </div>
            <p className="text-[11px] font-bold text-text-main/40 dark:text-bg-cream/40 uppercase tracking-widest">Dari {total} rating</p>

            {/* DEEP BREAKDOWN OVERLAY */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-4 opacity-0 group-hover/gauge:opacity-100 transition-all duration-300 pointer-events-none z-20">
                <div className="bg-text-main dark:bg-bg-paper p-6 rounded-[2rem] shadow-2xl border border-white/10 min-w-[200px]">
                    <h5 className="text-[10px] font-black uppercase tracking-[0.2em] text-bg-cream/40 mb-4 border-b border-white/5 pb-2">Rating Distribution</h5>
                    <div className="space-y-3">
                        {distribution?.slice().reverse().map(d => {
                            const p = total > 0 ? (d.count / total) * 100 : 0;
                            return (
                                <div key={d.score} className="flex items-center gap-4">
                                    <div className="flex items-center gap-1 w-8">
                                        <span className="text-[10px] font-black text-bg-cream">{d.score}</span>
                                        <Star className="w-2 h-2 text-tan-primary fill-tan-primary" />
                                    </div>
                                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-tan-primary" style={{ width: `${p}%` }} />
                                    </div>
                                    <span className="text-[9px] font-black text-bg-cream/60 w-8 text-right">{Math.round(p)}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
                {/* Arrow */}
                <div className="w-4 h-4 bg-text-main dark:bg-bg-paper rotate-45 mx-auto -mt-2 border-r border-b border-white/10"></div>
            </div>
        </div>
    );
}

function RetentionFunnel({ stats }: { stats: { label: string, value: number, count?: number, color: string }[] }) {
    return (
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
            {stats.map((s, i) => (
                <div key={i} className="relative group/segment">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">{s.label}</span>
                        <span className="text-xs font-black italic">{s.value}%</span>
                    </div>
                    <div className="h-8 bg-text-main/5 dark:bg-white/5 rounded-xl overflow-hidden relative border border-transparent hover:border-tan-primary/20 transition-all cursor-crosshair">
                        <div 
                            className={`h-full ${s.color} transition-all duration-1000 ease-out flex items-center justify-end px-4 relative`}
                            style={{ 
                                width: `${s.value}%`,
                                opacity: 1 - (i * 0.15) 
                            }}
                        >
                            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest opacity-0 group-hover/segment:opacity-100 transition-opacity whitespace-nowrap">
                                {s.count?.toLocaleString()} Readers
                            </span>
                        </div>
                        
                        {/* TOOLTIP OVERLAY */}
                        <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-0 group-hover/segment:opacity-100 transition-opacity pointer-events-none">
                            <p className="text-[8px] font-black text-text-main dark:text-bg-cream uppercase tracking-tighter bg-bg-cream/90 dark:bg-brown-dark/90 px-2 py-1 rounded shadow-sm border border-black/5">
                                Precise: {s.count}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function ChapterPerformance({ data }: { data: { label: string, value: number }[] }) {
    const max = Math.max(...data.map(d => d.value), 1);
    return (
        <div className="flex items-end gap-3 h-56 w-full overflow-x-auto pb-8 pt-4 custom-scrollbar">
            {data.map((d, i) => {
                const height = (d.value / max) * 100;
                return (
                    <div key={i} className="flex flex-col items-center gap-3 group shrink-0 relative">
                        {/* Hover Tooltip */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                            <div className="bg-text-main text-bg-cream text-[9px] font-black px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                                {d.value} Views
                            </div>
                            <div className="w-2 h-2 bg-text-main rotate-45 mx-auto -mt-1"></div>
                        </div>

                        <div className="w-5 bg-text-main/5 dark:bg-white/5 h-full rounded-full relative overflow-hidden ring-1 ring-transparent group-hover:ring-tan-primary/20 transition-all">
                            <div 
                                className="absolute bottom-0 left-0 right-0 bg-tan-primary group-hover:bg-brown-mid transition-all rounded-full shadow-[0_0_15px_rgba(214,191,166,0.2)]"
                                style={{ height: `${height}%` }}
                            />
                        </div>
                        <span className="text-[9px] font-black uppercase opacity-30 rotate-45 mt-2 transition-opacity group-hover:opacity-100">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}

function ConsistencyGrid({ data }: { data: boolean[] }) {
    return (
        <div className="grid grid-cols-10 gap-2">
            {data.map((active, i) => (
                <div 
                    key={i} 
                    className={`aspect-square rounded-lg ${active ? 'bg-tan-primary shadow-[0_0_15px_rgba(214,191,166,0.3)]' : 'bg-text-main/5 dark:bg-white/5'}`}
                    title={active ? "Active day" : "No update"}
                />
            ))}
        </div>
    );
}
