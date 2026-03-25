/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Administrator Dashboard architecture.
 * @author Ruang Aksara Engineering Team
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { 
    Star, Bookmark, BookOpen, ArrowLeft, 
    TrendingUp, Eye, ChevronRight, MessageSquare, 
    Sparkles, Heart, Flame, Zap, ThumbsUp, PenTool,
    Clock, Users, PieChart, BarChart3, Info
} from 'lucide-react';
import Link from 'next/link';
import { redirect, notFound } from "next/navigation";
import { Metadata } from "next";

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
        color: "bg-[#D6BFA6] dark:bg-brown-mid",
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

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const getQualityLabel = (score: number) => {
        if (score >= 9) return "Legendary";
        if (score >= 8) return "Premium";
        if (score >= 6) return "High";
        return "Stable";
    };

    // [1] LEAN BASE DATA FETCH
    const workBase = await prisma.karya.findUnique({
        where: { id: karyaId },
        select: {
            id: true,
            title: true,
            total_views: true,
            avg_rating: true,
            cover_url: true,
            is_completed: true,
            uploader_id: true,
            _count: {
                select: { bookmarks: true, ratings: true, reviews: true }
            },
            genres: { select: { id: true, name: true } }
        }
    });

    if (!workBase) notFound();

    // Security Check
    if (session.user.role !== 'admin' && workBase.uploader_id !== session.user.id) {
        redirect('/admin/stats');
    }

    // [2] PARALLEL SPECIALIZED AGGREGATIONS
    const [
        babData,
        bookmarkDistribution,
        ratingDistributionAgg,
        recentBookmarksCount,
        recentReviews,
        userWorks,
        timeSeriesData
    ] = await Promise.all([
        prisma.bab.findMany({
            where: { karya_id: karyaId },
            select: { 
                id: true, 
                chapter_no: true, 
                created_at: true,
                _count: { select: { comments: true, reactions: true } }
            },
            orderBy: { chapter_no: 'asc' }
        }),
        prisma.bookmark.groupBy({
            by: ['last_chapter'],
            where: { karya_id: karyaId },
            _count: true
        }),
        prisma.rating.groupBy({
            by: ['score'],
            where: { karya_id: karyaId, score: { gt: 0 } },
            _count: true
        }),
        prisma.bookmark.count({
            where: { karya_id: karyaId, updated_at: { gte: sevenDaysAgo } }
        }),
        prisma.review.findMany({
            where: { karya_id: karyaId },
            orderBy: { upvotes: { _count: 'desc' } },
            take: 5,
            select: {
                id: true,
                created_at: true,
                _count: { select: { upvotes: true } }
            }
        }),
        prisma.karya.findMany({
            where: { uploader_id: workBase.uploader_id },
            select: { id: true, _count: { select: { bookmarks: true } } }
        }),
        // Fetch time-series bookmarks/bab in one go if needed, or but here we use the specific ones
        prisma.bookmark.findMany({
            where: { karya_id: karyaId, updated_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
            select: { updated_at: true }
        })
    ]);

    // [3] METRIC CALCULATION ENGINE
    const totalSaves = workBase._count.bookmarks;
    const totalChapters = babData.length;
    const totalInteractions = babData.reduce((acc, b) => acc + b._count.comments + b._count.reactions, 0);
    const interactionFreq = totalInteractions / (workBase.total_views || 1);
    
    // Retention Logic using grouped data
    const getReachForChapter = (chNo: number) => {
        return bookmarkDistribution
            .filter(d => d.last_chapter >= chNo)
            .reduce((acc, d) => acc + d._count, 0);
    };

    const chapterReachData = babData.map(b => ({
        label: `Bab ${b.chapter_no}`,
        value: getReachForChapter(b.chapter_no)
    }));

    const retention10 = totalChapters >= 10 ? getReachForChapter(10) : (totalChapters > 0 ? getReachForChapter(totalChapters) : 0);
    const retentionRate = totalSaves > 0 ? (retention10 / totalSaves) * 100 : 0;

    const totalRatedWork = ratingDistributionAgg.reduce((acc, r) => acc + r._count, 0);
    const totalScoreWork = ratingDistributionAgg.reduce((acc, r) => acc + (r.score * r._count), 0);
    const trueAvgRatingWork = totalRatedWork > 0 ? totalScoreWork / totalRatedWork : 0;

    const impactScore = (trueAvgRatingWork * 0.5) + (Math.log10(workBase.total_views + 1) * 3) + ((totalSaves / (workBase.total_views || 1)) * 2);
    
    const avgDaysBetweenUpdates = totalChapters > 1 ? 
        (new Date(babData[totalChapters-1].created_at).getTime() - new Date(babData[0].created_at).getTime()) / (1000 * 60 * 60 * 24 * (totalChapters - 1)) 
        : 0;

    const totalUpvotes = recentReviews.reduce((acc, r) => acc + r._count.upvotes, 0);
    const sentimentScoreVal = (totalRatedWork > 0) ? (ratingDistributionAgg.reduce((acc, r) => acc + (r.score >= 4 ? r._count : 0), 0) / totalRatedWork * 100) : 0;

    const ratingDistribution = [1, 2, 3, 4, 5].map(s => ({
        score: s,
        count: ratingDistributionAgg.find(r => r.score === s)?._count || 0
    }));

    const lastBabDate = babData.length > 0 ? babData[babData.length - 1].created_at : null;
    const lastUpdateDate = lastBabDate ? new Date(lastBabDate) : null;

    // Consistency Map (Specific Work)
    const activityMapData = Array.from({ length: 30 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (29 - i));
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        return babData.filter(b => b.created_at >= d && b.created_at < nextD).length;
    });

    // Save Velocity (7 Days Trend)
    const saveVelocityData = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        d.setHours(0, 0, 0, 0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        return timeSeriesData.filter(b => b.updated_at >= d && b.updated_at < nextD).length;
    });

    // Help TS/UI with a consolidated work object
    const work = {
        ...workBase,
        bab: babData,
        ratings: ratingDistributionAgg.map(r => ({ score: r.score })), // Mock for legacy sentiment component
        bookmarks: [] as any[], // Mock
        reviews: recentReviews
    };

    const statsData: Record<string, { label: string; value: string | number; sub: string; tip?: string }[]> = {
        engagement: [
            { label: "Total Views", value: work.total_views.toLocaleString(), sub: "Total reach" },
            { label: "Active (7d)", value: recentBookmarksCount, sub: "Unique readers" },
            { label: "Trend", value: `${((recentBookmarksCount / (totalSaves || 1)) * 100).toFixed(1)}%`, sub: "Weekly velocity" },
            { label: "Avg Depth", value: `Bab ${(bookmarkDistribution.reduce((acc, d) => acc + (d.last_chapter * d._count), 0) / (totalSaves || 1)).toFixed(1)}`, sub: "Progress index" },
            { label: "Retention", value: `${retentionRate.toFixed(0)}%`, sub: "To target bab" },
            { label: "Interactions", value: totalInteractions, sub: "Total social" },
            { label: "Int. Rate", value: interactionFreq.toFixed(2), sub: "Per view" },
            { label: "Hotspot", value: `Bab ${babData.slice().sort((a,b) => (b._count.comments + b._count.reactions) - (a._count.comments + a._count.reactions))[0]?.chapter_no || 1}`, sub: "Most engaged" },
            { label: "Virality", value: (totalUpvotes / (workBase.total_views || 1) * 100).toFixed(2), sub: "Share index" },
            { label: "Status", value: work.total_views > 1000 ? "Hot" : "Rising", sub: "Algorithm tag" }
        ],
        kepuasan: [
            { label: "Avg Rating", value: workBase.avg_rating.toFixed(2), sub: "Skala 5.0" },
            { label: "Sentiment", value: `${sentimentScoreVal.toFixed(0)}%`, sub: "Rating 4-5 stars" },
            { label: "Total Votes", value: workBase._count.ratings, sub: "Bintang masuk" },
            { label: "Reviews", value: workBase._count.reviews, sub: "Ulasan teks" },
            { label: "Top Review", value: recentReviews[0]?._count.upvotes || 0, sub: "Upvote tertinggi" },
            { label: "Interaction", value: totalUpvotes, sub: "Total upvotes" },
            { label: "Growth", value: recentReviews.filter(r => r.created_at >= sevenDaysAgo).length, sub: "Review baru (7d)" },
            { label: "Loyalty", value: `${((getReachForChapter(totalChapters) / (totalSaves || 1)) * 100).toFixed(0)}%`, sub: "Completion rate" },
            { label: "Velocity", value: workBase._count.ratings > 10 ? "High" : "Steady", sub: "Feedback flow" },
            { label: "Impact", value: impactScore.toFixed(1), sub: "Author score" }
        ],
        disimpan: [
            { label: "Total Saves", value: totalSaves, sub: "Library pembaca" },
            { label: "Conversion", value: `${workBase.total_views > 0 ? ((totalSaves / workBase.total_views) * 100).toFixed(1) : 0}%`, sub: "View ke Save" },
            { label: "Interaction Freq", value: interactionFreq.toFixed(2), sub: "Interactions per view" },
            { label: "Loyalty", value: `${((getReachForChapter(totalChapters) / (totalSaves || 1)) * 100).toFixed(0)}%`, sub: "Sampai bab akhir" },
            { label: "Save Vel.", value: recentBookmarksCount, sub: "Laju (last 7 days)" },
            { label: "Drop Point", value: `Bab ${bookmarkDistribution.slice().sort((a,b) => b._count - a._count)[0]?.last_chapter || '1'}`, sub: "Most drop-offs" },
            { label: "Portfolio Rank", value: `#${userWorks.sort((a,b) => b._count.bookmarks - a._count.bookmarks).findIndex(w => w.id === workBase.id) + 1}`, sub: `Top Rank` },
            { label: "Waiting", value: totalSaves - getReachForChapter(totalChapters), sub: "Waiting for update" },
            { label: "Resilience", value: `${getQualityLabel(impactScore)}`, sub: "Reader stability" }
        ],
        karya: [
            { label: "Chapters", value: totalChapters, sub: "Total bab" },
            { label: "Wordcount", value: (totalChapters * 1250).toLocaleString(), sub: "Est. total kata" },
            { label: "Avg Length", value: "1250", sub: "Est. kata per bab" },
            { label: "Consistency", value: avgDaysBetweenUpdates > 0 ? `${avgDaysBetweenUpdates.toFixed(1)}d/avg` : "New", sub: "Update frequency" },
            { label: "Completion", value: workBase.is_completed ? "Tamat" : "Ongoing", sub: "Status karya" },
            { label: "Reach", value: workBase.total_views.toLocaleString(), sub: "Total audiens" },
            { label: "Quality", value: `${getQualityLabel(workBase.avg_rating * 2)}`, sub: "User assessment" }
        ]
    };

    const stats = statsData[type] || [];

    return (
        <div className="min-h-screen bg-bg-cream/60 dark:bg-brown-dark transition-colors duration-500 pb-24 text-text-main dark:text-bg-cream">
            <div className="max-w-6xl mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-6 mb-8">
                            <Link 
                                href={`/admin/stats/${type}`}
                                prefetch={false}
                                className="inline-flex items-center gap-2 text-[10px] font-black text-text-main/60 dark:text-text-accent uppercase tracking-[0.3em] hover:text-text-main dark:hover:text-bg-cream transition-colors group"
                            >
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Kembali
                            </Link>
                            <span className="w-4 h-[1px] bg-text-main/10 dark:bg-white/10"></span>
                            <span className="text-[10px] font-black text-text-main/70 dark:text-text-accent uppercase tracking-[0.4em] italic">{work.title}</span>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                            <div className={`w-12 h-12 ${config.color} text-white rounded-2xl flex items-center justify-center shadow-lg border border-white/10`}>
                                <config.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{config.title}</h1>
                                <p className="text-[10px] font-bold text-text-main/50 dark:text-text-accent uppercase tracking-[0.4em] mt-2 italic">{config.description}</p>
                            </div>
                        </div>
                    </div>

                    <Link 
                        href={`/admin/editor/karya/${work.id}`}
                        prefetch={false}
                        className="bg-bg-cream dark:bg-brown-mid text-brown-dark dark:text-text-accent px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95 group border border-white/5"
                    >
                        <PenTool className="w-4 h-4" /> Edit Karya
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
                    {stats.map((s, i: number) => (
                        <MetricCard key={i} label={s.label} value={s.value} sub={s.sub} tip={s.tip} icon={s.label.toLowerCase().includes('view') ? Eye : s.label.toLowerCase().includes('rate') ? TrendingUp : s.label.toLowerCase().includes('interaction') ? MessageSquare : s.label.toLowerCase().includes('hotspot') ? Flame : s.label.toLowerCase().includes('viral') ? Zap : null} />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {type === 'engagement' && (
                        <div className="lg:col-span-3 bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-text-accent mb-8">Chapter Performance (Reached Readers)</h4>
                            <ChapterPerformance data={chapterReachData} />
                             <p className="text-[10px] font-black uppercase tracking-widest text-tan-primary mt-6 text-center italic opacity-60">Numbers reflect unique readers who progressed to each chapter</p>
                        </div>
                    )}
                    {type === 'kepuasan' && (
                        <>
                            <div className="lg:col-span-1">
                                <SentimentBreakdown 
                                    percentage={Math.round((work.ratings.filter(r => r.score >= 4).length / (work.ratings.length || 1)) * 100)} 
                                    total={work.ratings.length} 
                                    distribution={ratingDistribution}
                                />
                            </div>
                            <div className="lg:col-span-2 bg-[#3B2A22] dark:bg-brown-mid text-text-accent rounded-[3rem] p-10 relative overflow-hidden group border border-white/5">
                                <h4 className="text-xl font-black italic mb-4 uppercase tracking-tighter">Engagement Highlight</h4>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-accent/70 dark:text-text-accent mb-8 leading-relaxed">
                                    Karya ini memiliki sentiment rating yang kuat. <span className="text-text-accent/50 italic">Tingkat konversi review ke rating adalah {((work._count.reviews / (work.ratings.length || 1)) * 100).toFixed(0)}%.</span>
                                </p>
                                <div className="absolute bottom-0 right-0 p-8">
                                    <Sparkles className="w-12 h-12 opacity-10 group-hover:rotate-12 transition-transform" />
                                </div>
                            </div>
                        </>
                    )}
                    {type === 'disimpan' && (
                         <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
                            <div className="bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60 mb-8">Retention Funnel</h4>
                                <RetentionFunnel stats={[
                                    { label: "Bab 1", value: Math.round(work.bookmarks.filter(b => b.last_chapter >= 1).length / (work.bookmarks.length || 1) * 100), count: work.bookmarks.filter(b => b.last_chapter >= 1).length, color: "bg-tan-primary" },
                                    { label: "Bab 10", value: Math.round(work.bookmarks.filter(b => b.last_chapter >= 10).length / (work.bookmarks.length || 1) * 100), count: work.bookmarks.filter(b => b.last_chapter >= 10).length, color: "bg-tan-primary" },
                                    { label: "Bab Akhir", value: Math.round(work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length / (work.bookmarks.length || 1) * 100), count: work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length, color: "bg-brown-mid" }
                                ]} />
                            </div>
                            <div className="bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-text-accent mb-8">Save Velocity (Last 7 Days)</h4>
                                <SaveVelocityBarChart data={saveVelocityData} />
                                <div className="mt-8 pt-8 border-t border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-tan-primary">
                                        Max Velocity: {Math.max(...saveVelocityData)} saves/day
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                     {type === 'karya' && (
                        <div className="lg:col-span-3 bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-text-accent mb-8">Publishing Density (Last 30 Days)</h4>
                            <ActivityBarChart data={activityMapData} />
                            <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5">
                                <p className="text-[10px] font-bold text-tan-primary uppercase tracking-widest">
                                    {activityMapData.filter(v => v > 0).length} active days
                                </p>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-text-main/50 dark:text-text-accent italic">
                                     {work.bab.length} Total Chapters Published
                                 </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-[#3B2A22] text-text-accent rounded-[3rem] p-10 relative overflow-hidden group border border-white/5 shadow-2xl">
                        <div className="relative z-10">
                            <h4 className="text-2xl font-black italic mb-2 tracking-tighter uppercase">Status Performa</h4>
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-accent/70 dark:text-text-accent mb-10">Prediksi Pertumbuhan Algoritma</p>
                            
                            <div className="flex items-end gap-16">
                                <div>
                                    <p className="text-7xl font-black italic tracking-tighter leading-none mb-4">{Math.round(impactScore * 10)}%</p>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-400">{getQualityLabel(impactScore)}</span>
                                    </div>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-text-accent" style={{ width: `${Math.round(impactScore * 10)}%` }}></div>
                                    </div>
                                     <p className="text-[9px] font-black uppercase tracking-[0.1em] text-text-accent/70 dark:text-text-accent leading-relaxed">
                                       {impactScore >= 8 ? 
                                            "Karya ini memiliki indeks retensi di atas rata-rata platform. Rekomendasi: Pertahankan jadwal rilis konsisten." :
                                            "Karya ini sedang dalam masa pertumbuhan. Rekomendasi: Tingkatkan interaksi dengan pembaca untuk mendongkrak algoritma."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                    </div>

                    <div className="bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                        <h4 className="text-2xl font-black italic mb-8 tracking-tighter text-text-main dark:text-text-accent uppercase">MetaData Identitas</h4>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-text-accent">Judul Karya</span>
                                <span className="text-xs font-black italic uppercase tracking-tight text-text-main dark:text-text-accent">{work.title}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-text-accent">Genre Utama</span>
                                <div className="flex gap-2">
                                    {work.genres.map(g => (
                                        <span key={g.id} className="text-[8px] font-black uppercase bg-text-main/5 dark:bg-white/5 px-3 py-1 rounded-full">{g.name}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-text-accent">Terakhir Update</span>
                                <span className="text-xs font-black italic uppercase tracking-tight text-text-main dark:text-text-accent">
                                    {lastUpdateDate ? 
                                        lastUpdateDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 
                                        'Belum Update'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-text-accent">UID Karya</span>
                                 <span className="text-[10px] font-mono text-text-main dark:text-text-accent opacity-80">{work.id}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- VISUAL COMPONENTS ---

function SentimentBreakdown({ percentage, total, distribution }: { percentage: number, total: number, distribution?: { score: number, count: number }[] }) {
    return (
        <div className="w-full bg-white/40 dark:bg-brown-mid/10 rounded-[2.5rem] p-10 border border-white/5 shadow-inner relative overflow-hidden group/gauge transition-all">
            <div className="relative z-10 flex flex-col items-center mb-10">
                <div className="relative w-44 h-22 mb-6">
                    {/* Semi-Circle Gauge SVG */}
                    <svg viewBox="0 0 100 50" className="w-full h-full">
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-text-main/5 dark:text-white/5"
                        />
                        <path
                            d="M 10 50 A 40 40 0 0 1 90 50"
                            fill="none"
                            stroke="url(#gaugeGradientKarya)"
                            strokeWidth="8"
                            strokeDasharray="125.6"
                            strokeDashoffset={125.6 - (125.6 * (percentage / 100))}
                            className="transition-all duration-[2000ms] ease-out"
                            style={{ strokeLinecap: 'round' }}
                        />
                        <defs>
                            <linearGradient id="gaugeGradientKarya" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#D6BFA6" />
                                <stop offset="100%" stopColor="#7A553A" />
                            </linearGradient>
                        </defs>
                    </svg>
                    
                    <div className="absolute bottom-0 left-0 right-0 text-center">
                        <span className="text-4xl font-black italic tracking-tighter leading-none text-text-main dark:text-text-accent">{percentage}%</span>
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-main/40 dark:text-text-accent/60">Positive Index</p>
                    </div>
                </div>

                <div className="flex justify-between w-full px-4 mb-2">
                    <div className="text-center">
                        <p className="text-xl font-black italic text-tan-primary leading-none">{total}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-text-main/40 dark:text-text-accent/60 mt-1">Total Ratings</p>
                    </div>
                </div>
            </div>
            
            <div className="space-y-4 relative z-10">
                {distribution?.slice().reverse().map((d, index) => {
                    const p = total > 0 ? (d.count / total) * 100 : 0;
                    return (
                        <div key={d.score} className="space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[9px] font-black tracking-tighter text-text-main/60 dark:text-text-accent/80">{d.score} Stars</span>
                                    <Star className="w-2 h-2 text-tan-primary fill-tan-primary" />
                                </div>
                                <span className="text-[8px] font-black text-text-main/40 dark:text-text-accent uppercase tracking-tighter">{d.count} reviews</span>
                            </div>
                            <div className="h-1.5 bg-text-main/5 dark:bg-white/5 rounded-full overflow-hidden">
                                <div 
                                    className="h-full transition-all duration-[1500ms] bg-gradient-to-r from-tan-primary to-brown-mid" 
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

function SaveVelocityBarChart({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-1.5 w-full h-32 pt-4 group">
            {data.map((val, i) => (
                <div key={i} className="flex-1 relative group/bar h-full flex items-end">
                    {/* Ghost Bar */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-text-main/5 dark:bg-white/5 rounded-t-sm" />
                    <div 
                        className={`w-full rounded-t-sm transition-all duration-500 origin-bottom group-hover/bar:scale-y-110 ${val > 0 ? 'bg-tan-primary' : 'bg-transparent'}`}
                        style={{ height: `${(val / max) * 100}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-text-main text-bg-cream text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                        {val} Saves
                    </div>
                    {i % 2 === 0 && (
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[7px] font-black opacity-30 uppercase tracking-tighter">
                            H-{6-i}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

function ActivityBarChart({ data }: { data: number[] }) {
    const max = Math.max(...data, 1);
    return (
        <div className="flex items-end gap-1.5 w-full h-32 pt-4 group">
            {data.map((val, i) => (
                <div key={i} className="flex-1 relative group/bar h-full flex items-end">
                    {/* Ghost Bar */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-text-main/5 dark:bg-white/5 rounded-t-sm" />
                    <div 
                        className={`w-full rounded-t-sm transition-all duration-300 origin-bottom group-hover/bar:bg-tan-primary ${val > 0 ? 'bg-tan-primary/60' : 'bg-transparent'}`}
                        style={{ height: `${(val / max) * 100}%` }}
                    />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-text-main text-bg-cream text-[8px] px-1.5 py-0.5 rounded whitespace-nowrap z-10 pointer-events-none">
                        {val} Chapters
                    </div>
                    {i % 7 === 0 && (
                        <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[8px] font-black opacity-20 uppercase tracking-tighter whitespace-nowrap">
                            H-{29-i}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

function MetricCard({ 
    label, 
    value, 
    sub, 
    tip, 
    icon: Icon,
    color: iconColor 
}: { 
    label: string, 
    value: string | number, 
    sub?: string, 
    tip?: string,
    icon?: any,
    color?: string
}) {
    return (
        <div className="bg-bg-cream/80 dark:bg-brown-mid/20 rounded-3xl p-6 border border-tan-light/50 dark:border-white/5 group hover:bg-bg-cream dark:hover:bg-brown-mid/30 transition-all relative">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className={`w-3.5 h-3.5 ${iconColor || 'text-tan-primary dark:text-text-accent'} opacity-80`} />}
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-text-accent group-hover:opacity-100 transition-opacity">{label}</p>
                </div>
                {tip && (
                    <div className="group/tip relative flex items-center justify-center">
                        <Info className="w-3.5 h-3.5 opacity-40 hover:opacity-100 dark:opacity-80 dark:text-text-accent cursor-help transition-opacity" />
                        <div className="absolute bottom-full right-0 mb-4 w-56 p-5 bg-brown-dark text-text-accent rounded-[1.5rem] text-[10px] font-bold leading-relaxed opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all z-50 shadow-2xl border border-white/10 shadow-brown-dark/20">
                            <p className="uppercase tracking-widest opacity-60 mb-2 border-b border-white/10 pb-2">Analisis Detail</p>
                            {tip}
                            <div className="absolute top-full right-4 w-2 h-2 bg-brown-dark transform rotate-45 -mt-1"></div>
                        </div>
                    </div>
                )}
            </div>
            <p className="text-2xl font-black italic tracking-tighter mb-1 text-text-main dark:text-text-accent leading-none">{value}</p>
            {sub && <p className="text-[9px] font-black text-text-main/70 dark:text-text-accent/60 uppercase tracking-widest italic">{sub}</p>}
        </div>
    );
}

function RetentionFunnel({ stats }: { stats: { label: string, value: number, count?: number, color: string }[] }) {
    return (
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
            {stats.map((s, i) => (
                <div key={i} className="relative group/segment">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/50 dark:text-text-accent">{s.label}</span>
                        <span className="text-xs font-black italic">{s.value}%</span>
                    </div>
                    <div className="h-8 bg-text-main/5 dark:bg-white/5 rounded-xl overflow-hidden relative border border-transparent hover:border-tan-primary/20 transition-all cursor-crosshair">
                        <div 
                            className={`h-full ${s.color} transition-all duration-1000 ease-out flex items-center justify-end px-4 relative`}
                            style={{ 
                                width: `${s.value}%`
                            }}
                        >
                            <span className="text-[9px] font-black text-white px-2 py-0.5 bg-black/20 rounded-lg uppercase tracking-widest opacity-0 group-hover/segment:opacity-100 transition-opacity whitespace-nowrap">
                                {s.count?.toLocaleString()} Readers
                            </span>
                        </div>
                        
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
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10">
                            <div className="bg-text-main dark:bg-brown-dark text-bg-cream text-[9px] font-black px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap border border-white/5">
                                {d.value} Views
                            </div>
                            <div className="w-2 h-2 bg-text-main dark:bg-brown-dark rotate-45 mx-auto -mt-1"></div>
                        </div>

                        <div className="w-5 bg-text-main/5 dark:bg-white/5 h-full rounded-full relative overflow-hidden ring-1 ring-transparent group-hover:ring-tan-primary/20 transition-all">
                            <div 
                                className="absolute bottom-0 left-0 right-0 bg-tan-primary group-hover:bg-brown-mid transition-all rounded-full shadow-[0_0_15px_rgba(214,191,166,0.2)]"
                                style={{ height: `${height}%` }}
                            />
                        </div>
                        <span className="text-[9px] font-black uppercase text-text-main/50 dark:text-text-accent rotate-45 mt-2 transition-opacity group-hover:opacity-100">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
