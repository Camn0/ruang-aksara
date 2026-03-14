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
                select: { last_chapter: true, updated_at: true }
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
    const getQualityLabel = (score: number) => {
        if (score >= 9) return "Legendary";
        if (score >= 8) return "Premium";
        if (score >= 6) return "High";
        return "Stable";
    };

    const lastBabDate = work.bab.length > 0 ? work.bab[work.bab.length - 1].created_at : null;
    const lastUpdateDate = lastBabDate ? new Date(lastBabDate) : null;

    const allInteractionTimes = work.bab.flatMap(b => b.comments.map(c => new Date(c.created_at).getHours()));
    const busyHourVal = allInteractionTimes.length > 0 ? 
        Object.entries(allInteractionTimes.reduce((acc, h) => { acc[h] = (acc[h] || 0) + 1; return acc; }, {} as Record<number, number>))
        .sort((a,b) => b[1] - a[1])[0][0] : "19";

    const totalInteractions = work.bab.reduce((acc, b) => acc + b._count.comments + b._count.reactions, 0);
    const interactionFreq = totalInteractions / (work.total_views || 1);

    const impactScore = (work.avg_rating * 0.5) + (Math.log10(work.total_views + 1) * 3) + ((work._count.bookmarks / (work.total_views || 1)) * 2);
    const avgDaysBetweenUpdates = work.bab.length > 1 ? 
        (new Date(work.bab[work.bab.length-1].created_at).getTime() - new Date(work.bab[0].created_at).getTime()) / (1000 * 60 * 60 * 24 * (work.bab.length - 1)) 
        : 0;

    const avgReaderAge = work.bookmarks.length > 0 ? 
        work.bookmarks.reduce((acc, b) => acc + (Date.now() - new Date(b.updated_at).getTime()), 0) / (work.bookmarks.length * 1000 * 60 * 60 * 24)
        : 0;

    // Fetch user works for ranking
    const userWorks = await prisma.karya.findMany({
        where: { uploader_id: (work as any).uploader_id },
        select: { id: true, _count: { select: { bookmarks: true } } }
    });

    const statsData: Record<string, { label: string; value: string | number; sub: string; tip?: string }[]> = {
        engagement: [
            { label: "Total Views", value: work.total_views.toLocaleString(), sub: "Total reach", tip: "Jumlah total kunjungan ke karya ini." },
            { label: "Active (7d)", value: work.bookmarks.filter(b => b.updated_at >= sevenDaysAgo).length, sub: "Unique readers", tip: "Jumlah pembaca unik yang berinteraksi dengan karya ini dalam 7 hari terakhir." },
            { label: "Trend", value: `${((work.bookmarks.filter(b => b.updated_at >= sevenDaysAgo).length / (work.bookmarks.length || 1)) * 100).toFixed(1)}%`, sub: "Weekly velocity", tip: "Persentase pembaca aktif mingguan dibandingkan total pembaca." },
            { label: "Avg Depth", value: `Bab ${(work.bookmarks.reduce((acc, b) => acc + b.last_chapter, 0) / (work.bookmarks.length || 1)).toFixed(1)}`, sub: "Progress index", tip: "Rata-rata bab terakhir yang dibaca oleh pembaca yang menyimpan karya ini." },
            { label: "Retention", value: `${work.bookmarks.length > 0 ? ((work.bookmarks.filter(b => b.last_chapter >= (work.bab.length > 10 ? 10 : work.bab.length)).length / work.bookmarks.length) * 100).toFixed(0) : 0}%`, sub: "To target bab", tip: "Persentase pembaca yang mencapai bab target (bab 10 atau bab terakhir jika kurang dari 10)." },
            { label: "Interactions", value: work.bab.reduce((acc, b) => acc + b._count.comments + b._count.reactions, 0), sub: "Total social", tip: "Total komentar dan reaksi di semua bab." },
            { label: "Int. Rate", value: (work.bab.reduce((acc, b) => acc + b._count.comments + b._count.reactions, 0) / (work.total_views || 1)).toFixed(2), sub: "Per view", tip: "Rasio total interaksi per tampilan karya." },
            { label: "Hotspot", value: `Bab ${work.bab.sort((a,b) => (b._count.comments + b._count.reactions) - (a._count.comments + a._count.reactions))[0]?.chapter_no || 1}`, sub: "Most engaged", tip: "Bab dengan interaksi (komentar + reaksi) terbanyak." },
            { label: "Virality", value: (work.reviews.reduce((acc, r) => acc + r._count.upvotes, 0) / (work.total_views || 1) * 100).toFixed(2), sub: "Share index", tip: "Indeks seberapa sering karya ini direkomendasikan atau dibagikan, dihitung dari upvote review per tampilan." },
            { label: "Status", value: work.total_views > 1000 ? "Hot" : "Rising", sub: "Algorithm tag", tip: "Tag algoritma berdasarkan total tampilan." }
        ],
        kepuasan: [
            { 
                label: "Avg Rating", 
                value: (work.ratings.filter(r => r.score > 0).length > 0 
                    ? (work.ratings.filter(r => r.score > 0).reduce((acc, r) => acc + r.score, 0) / work.ratings.filter(r => r.score > 0).length)
                    : 0).toFixed(2), 
                sub: "Skala 5.0", 
                tip: "Rata-rata rating bintang dari semua pembaca, mengecualikan nilai nol." 
            },
            { label: "Sentiment", value: `${work.ratings.length > 0 ? ((work.ratings.filter(r => r.score >= 4).length/work.ratings.length)*100).toFixed(0) : 0}%`, sub: "Rating 4-5 stars", tip: "Persentase rating bintang 4 dan 5 dari total rating." },
            { label: "Total Votes", value: work.ratings.length, sub: "Bintang masuk", tip: "Jumlah total rating bintang yang diterima." },
            { label: "Reviews", value: work._count.reviews, sub: "Ulasan teks", tip: "Jumlah total ulasan teks yang diberikan pembaca." },
            { label: "Top Review", value: work.reviews[0]?._count.upvotes || 0, sub: "Upvote tertinggi", tip: "Jumlah upvote tertinggi yang diterima oleh satu ulasan." },
            { label: "Interaction", value: work.reviews.reduce((acc, r) => acc + r._count.upvotes, 0), sub: "Total upvotes", tip: "Total upvote dari semua ulasan." },
            { label: "Growth", value: work.reviews.filter(r => r.created_at >= sevenDaysAgo).length, sub: "Review baru (7d)", tip: "Jumlah ulasan baru yang diterima dalam 7 hari terakhir." },
            { label: "Loyalty", value: `${((work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length / (work.bookmarks.length || 1)) * 100).toFixed(0)}%`, sub: "Completion rate", tip: "Persentase pembaca yang menyelesaikan karya ini (membaca hingga bab terakhir)." },
            { label: "Velocity", value: work.ratings.length > 10 ? "High" : "Steady", sub: "Feedback flow", tip: "Kecepatan penerimaan rating dan ulasan." },
            { label: "Impact", value: impactScore.toFixed(1), sub: "Author score", tip: "Skor dampak keseluruhan karya ini, menggabungkan rating, views, dan bookmark." }
        ],
        disimpan: [
            { label: "Total Saves", value: work._count.bookmarks, sub: "Library pembaca", tip: "Jumlah total pembaca yang menyimpan karya ini ke library mereka." },
            { label: "Conversion", value: `${work.total_views > 0 ? ((work._count.bookmarks / work.total_views) * 100).toFixed(1) : 0}%`, sub: "View ke Save", tip: "Persentase tampilan yang berubah menjadi bookmark (disimpan)." },
            { label: "Peak Hour", value: work.bab.flatMap(b => b.comments).length > 0 ? `${busyHourVal}:00` : "No data", sub: "Most busy interac. time", tip: "Jam paling sibuk untuk interaksi pembaca (komentar) pada karya ini." },
            { label: "Interaction Freq", value: interactionFreq.toFixed(2), sub: "Interactions per view", tip: "Frekuensi interaksi (komentar + reaksi) per tampilan karya." },
            { label: "Viral Score", value: (interactionFreq * 100).toFixed(1), sub: "Relative shareability", tip: "Skor potensi viral karya ini berdasarkan frekuensi interaksi." },
            { label: "Loyalty", value: `${work.bookmarks.length > 0 ? ((work.bookmarks.filter(b => b.last_chapter >= work.bab.length).length / (work.bookmarks.length || 1)) * 100).toFixed(0) : 0}%`, sub: "Sampai bab akhir", tip: "Persentase pembaca yang menyimpan karya ini dan telah membaca hingga bab terakhir." },
            { label: "Save Vel.", value: work.bookmarks.filter(b => b.updated_at >= sevenDaysAgo).length, sub: "Laju (last 7 days)", tip: "Jumlah bookmark baru atau update dalam 7 hari terakhir." },
            { label: "Drop Point", value: `Bab ${Object.entries(work.bookmarks.map(b => b.last_chapter).reduce((acc, c) => ({...acc, [c]: (acc[c] as number || 0) + 1}), {} as any)).sort((a,b) => (b[1] as any) - (a[1] as any))[0]?.[0] || '1'}`, sub: "Most drop-offs", tip: "Bab di mana sebagian besar pembaca cenderung berhenti membaca atau tidak melanjutkan." },
            { label: "Portfolio Rank", value: `#${userWorks.sort((a,b) => b._count.bookmarks - a._count.bookmarks).findIndex(w => w.id === work.id) + 1}`, sub: `Top ${Math.round(((userWorks.sort((a,b) => b._count.bookmarks - a._count.bookmarks).findIndex(w => w.id === work.id) + 1) / userWorks.length) * 100)}%`, tip: "Peringkat karya ini dibandingkan dengan karya lain dalam studio Anda berdasarkan jumlah bookmark." },
            { label: "Reader Age", value: `${avgReaderAge.toFixed(1)}d`, sub: "Avg days in library", tip: "Rata-rata durasi karya ini tersimpan di library (bookmark) pembaca." },
            { label: "Waiting", value: work.bookmarks.filter(b => b.last_chapter < work.bab.length).length, sub: "Waiting for update", tip: "Jumlah pembaca yang menyimpan karya ini dan menunggu update bab baru." },
            { label: "Resilience", value: `${getQualityLabel(impactScore)} (${impactScore.toFixed(1)})`, sub: "Reader stability", tip: "Stabilitas pembaca berdasarkan rasio bookmark terhadap views dan rating rata-rata." },
            { label: "Score", value: (impactScore * 0.8).toFixed(1), sub: "Bookmark health (0-10)", tip: "Skor kesehatan bookmark karya ini, mengindikasikan seberapa baik karya ini dipertahankan di library pembaca." }
        ],
        karya: [
            { label: "Chapters", value: work.bab.length, sub: "Total bab", tip: "Jumlah total bab yang telah diterbitkan dalam karya ini." },
            { label: "Wordcount", value: work.bab.reduce((acc, b) => acc + (b.content?.split(/\s+/).length || 0), 0).toLocaleString(), sub: "Kata terkumpul", tip: "Jumlah total kata dari semua bab." },
            { label: "Avg Length", value: work.bab.length > 0 ? (work.bab.reduce((acc, b) => acc + (b.content?.split(/\s+/).length || 0), 0) / work.bab.length).toFixed(0) : 0, sub: "Kata per bab", tip: "Rata-rata jumlah kata per bab." },
            { label: "Density", value: work.bab.length > 10 ? "Dense" : "Light", sub: `${(work.bab.reduce((acc, b) => acc + (b.content?.split(/\s+/).length || 0), 0) / 50000).toFixed(1)} vol index`, tip: "Indeks kepadatan karya berdasarkan jumlah bab dan total kata." },
            { label: "Consistency", value: avgDaysBetweenUpdates > 0 ? `${avgDaysBetweenUpdates.toFixed(1)}d/avg` : "New", sub: "Update frequency", tip: "Rata-rata hari antara setiap update bab." },
            { label: "Completion", value: work.is_completed ? "Tamat" : "Ongoing", sub: "Status karya", tip: "Status penyelesaian karya: Tamat atau Sedang Berlangsung." },
            { label: "Genre Diver.", value: work.genres.length, sub: "Klasifikasi", tip: "Jumlah genre yang diklasifikasikan untuk karya ini." },
            { label: "Reach", value: work.total_views.toLocaleString(), sub: "Total audiens", tip: "Total audiens yang telah melihat karya ini." },
            { label: "Quality", value: `${getQualityLabel(work.avg_rating * 2)} (${work.avg_rating.toFixed(2)})`, sub: "User assessment", tip: "Penilaian kualitas karya berdasarkan rating rata-rata pembaca." },
            { label: "Potential", value: impactScore > 8 ? "Top 5%" : "Top 20%", sub: `${(impactScore * 10).toFixed(0)} score`, tip: "Potensi pertumbuhan karya ini berdasarkan skor dampak." }
        ]
    };

    const ratingDistribution = [1, 2, 3, 4, 5].map(s => ({
        score: s,
        count: work.ratings.filter(r => r.score === s).length
    }));

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
        
        return work.bab.filter(b => 
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
        
        return work.bookmarks.filter(b => 
            new Date(b.updated_at) >= d && new Date(b.updated_at) < nextD
        ).length;
    });

    const stats = statsData[type] || [];

    return (
        <div className="min-h-screen bg-bg-cream/60 dark:bg-brown-dark transition-colors duration-500 pb-24 text-text-main dark:text-bg-cream">
            <div className="max-w-6xl mx-auto px-6 pt-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div className="flex-1">
                        <div className="flex items-center gap-6 mb-8">
                            <Link 
                                href={`/admin/stats/${type}`}
                                className="inline-flex items-center gap-2 text-[10px] font-black text-text-main/60 dark:text-tan-light uppercase tracking-[0.3em] hover:text-text-main dark:hover:text-bg-cream transition-colors group"
                            >
                                <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Kembali
                            </Link>
                            <span className="w-4 h-[1px] bg-text-main/10 dark:bg-white/10"></span>
                            <span className="text-[10px] font-black text-text-main/70 dark:text-tan-light uppercase tracking-[0.4em] italic">{work.title}</span>
                        </div>

                        <div className="flex items-center gap-6 mb-4">
                            <div className={`w-12 h-12 ${config.color} text-white rounded-2xl flex items-center justify-center shadow-lg border border-white/10`}>
                                <config.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{config.title}</h1>
                                <p className="text-[10px] font-bold text-text-main/50 dark:text-tan-light uppercase tracking-[0.4em] mt-2 italic">{config.description}</p>
                            </div>
                        </div>
                    </div>

                    <Link 
                        href={`/admin/editor/karya/${work.id}`}
                        className="bg-bg-cream dark:bg-brown-mid text-brown-dark dark:text-text-accent px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95 group border border-white/5"
                    >
                        <PenTool className="w-4 h-4" /> Edit Karya
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-16">
                    {stats.map((s, i: number) => (
                        <MetricCard key={i} label={s.label} value={s.value} sub={s.sub} tip={s.tip} />
                    ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {type === 'engagement' && (
                        <div className="lg:col-span-3 bg-white/40 dark:bg-brown-mid/20 rounded-[3rem] p-10 border border-text-main/5 dark:border-white/5">
                             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-tan-light mb-8">Chapter Performance (Reached Readers)</h4>
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
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-accent/70 dark:text-tan-light mb-8 leading-relaxed">
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
                                 <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-tan-light mb-8">Save Velocity (Last 7 Days)</h4>
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
                             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-text-main/50 dark:text-tan-light mb-8">Publishing Density (Last 30 Days)</h4>
                            <ActivityBarChart data={activityMapData} />
                            <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/5">
                                <p className="text-[10px] font-bold text-tan-primary uppercase tracking-widest">
                                    {activityMapData.filter(v => v > 0).length} active days
                                </p>
                                 <p className="text-[10px] font-black uppercase tracking-widest text-text-main/50 dark:text-tan-light italic">
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
                             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-accent/70 dark:text-tan-light mb-10">Prediksi Pertumbuhan Algoritma</p>
                            
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
                                     <p className="text-[9px] font-black uppercase tracking-[0.1em] text-text-accent/70 dark:text-tan-light leading-relaxed">
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
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-tan-light">Judul Karya</span>
                                <span className="text-xs font-black italic uppercase tracking-tight">{work.title}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-tan-light">Genre Utama</span>
                                <div className="flex gap-2">
                                    {work.genres.map(g => (
                                        <span key={g.id} className="text-[8px] font-black uppercase bg-text-main/5 dark:bg-white/5 px-3 py-1 rounded-full">{g.name}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between items-center py-4 border-b border-text-main/5 dark:border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-tan-light">Terakhir Update</span>
                                <span className="text-xs font-black italic uppercase tracking-tight">
                                    {lastUpdateDate ? 
                                        lastUpdateDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 
                                        'Belum Update'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-tan-light">UID Karya</span>
                                 <span className="text-[10px] font-mono text-text-main dark:text-text-accent opacity-60">{work.id}</span>
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
        <div className="w-full group/gauge bg-white/40 dark:bg-brown-mid/10 rounded-[2rem] p-8 border border-white/5 shadow-inner">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <span className="text-5xl font-black italic tracking-tighter leading-none text-text-main dark:text-text-accent">{percentage}%</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/50 dark:text-tan-light mt-2">Positive Sentiment Index</p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-black italic text-tan-primary">{total}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-text-main/50 dark:text-tan-light">Total Ratings</p>
                </div>
            </div>
            
            <div className="space-y-4">
                {distribution?.slice().reverse().map(d => {
                    const p = total > 0 ? (d.count / total) * 100 : 0;
                    return (
                        <div key={d.score} className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-[10px] font-black tracking-tighter">{d.score} Bintang</span>
                                    <Star className={`w-2 h-2 ${d.score >= 4 ? 'text-tan-primary fill-tan-primary' : 'text-text-main/20 dark:text-white/20'}`} />
                                </div>
                                <span className="text-[7px] font-black text-text-main/50 dark:text-tan-light uppercase tracking-tighter">{d.count} ulasan</span>
                            </div>
                            <div className="h-2 bg-text-main/5 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div 
                                    className={`h-full transition-all duration-1000 ease-out ${d.score >= 4 ? 'bg-gradient-to-r from-tan-primary to-brown-mid' : 'bg-text-main/20'}`} 
                                    style={{ width: `${p}%` }} 
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-[9px] font-black text-text-main/50 dark:text-tan-light uppercase tracking-[0.2em] text-center mt-8 italic border-t border-white/5 pt-4">
                *Indeks sentimen dihitung dari persentase rating bintang 4 & 5.
            </p>
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
    icon: Icon 
}: { 
    label: string, 
    value: string | number, 
    sub?: string, 
    tip?: string,
    icon?: any
}) {
    return (
        <div className="bg-white/40 dark:bg-brown-mid/20 rounded-3xl p-6 border border-text-main/5 dark:border-white/5 group hover:bg-white/60 dark:hover:bg-brown-mid/30 transition-all relative">
            <div className="flex justify-between items-start mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-main/60 dark:text-tan-light group-hover:opacity-100 transition-opacity">{label}</p>
                {tip && (
                    <div className="group/tip relative flex items-center justify-center">
                        <Info className="w-3.5 h-3.5 opacity-20 hover:opacity-100 cursor-help transition-opacity" />
                        <div className="absolute bottom-full right-0 mb-4 w-56 p-5 bg-[#2A1E17] dark:bg-brown-dark text-text-accent rounded-[1.5rem] text-[10px] font-bold leading-relaxed opacity-0 group-hover/tip:opacity-100 pointer-events-none transition-all z-50 shadow-2xl border border-white/5 border-t-white/10">
                            <p className="uppercase tracking-widest opacity-40 mb-2 border-b border-white/5 pb-2">Analisis Detail</p>
                            {tip}
                            <div className="absolute top-full right-4 w-2 h-2 bg-[#2A1E17] dark:bg-brown-dark transform rotate-45 -mt-1"></div>
                        </div>
                    </div>
                )}
            </div>
            <p className="text-2xl font-black italic tracking-tighter mb-1 text-text-main dark:text-text-accent leading-none">{value}</p>
            {sub && <p className="text-[9px] font-black text-text-main/50 dark:text-tan-light uppercase tracking-widest italic">{sub}</p>}
        </div>
    );
}

function RetentionFunnel({ stats }: { stats: { label: string, value: number, count?: number, color: string }[] }) {
    return (
        <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
            {stats.map((s, i) => (
                <div key={i} className="relative group/segment">
                    <div className="flex justify-between items-center mb-2 px-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-main/50 dark:text-tan-light">{s.label}</span>
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
                        <span className="text-[9px] font-black uppercase text-text-main/50 dark:text-tan-light rotate-45 mt-2 transition-opacity group-hover:opacity-100">{d.label}</span>
                    </div>
                );
            })}
        </div>
    );
}
