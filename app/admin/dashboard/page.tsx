/**
 * ADMIN DASHBOARD PAGE
 * --------------------
 * Pusat kendali untuk Author dan Admin.
 * Fungsi:
 * 1. Agregasi Statistik: Menghitung total views, bookmarks, dan rating.
 * 2. Manajemen Karya: List karya yang dimiliki oleh user (Author) atau seluruh platform (Admin).
 * 3. Recent Activity: Menampilkan komentar terbaru dari pembaca.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unstable_cache, revalidateTag } from "next/cache";
import Link from "next/link";
import { 
    TrendingUp, Star, PenTool, Users, MessageSquare, BookOpen, 
    Plus, ChevronRight, BarChart3, Bookmark, Sparkles, Eye,
    BarChart, Moon, Sun
} from "lucide-react";
import ThemeToggle from "@/app/components/ThemeToggle";
import Image from "next/image";

// export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
    // [1] AUTHENTICATION & SESSION
    // Mengambil session aktif. Non-null assertion (!) aman karena sudah divalidasi di parent layout.
    const session = (await getServerSession(authOptions))!;

    // [2] DATA FETCHING: Daftar Karya (Cached)
    const getCachedDaftarKarya = (role: string, uploaderId: string) => unstable_cache(
        async () => prisma.karya.findMany({
            where: role === 'admin' ? undefined : { uploader_id: uploaderId },
            orderBy: { title: 'asc' },
            select: {
                id: true,
                title: true,
                total_views: true,
                avg_rating: true,
                cover_url: true,
                is_completed: true,
                uploader_id: true,
                _count: {
                    select: { bookmarks: true, bab: true }
                },
                genres: { 
                    take: 2,
                    select: { id: true, name: true }
                },
                bab: {
                    orderBy: { created_at: 'desc' },
                    take: 1,
                    select: { created_at: true }
                }
            }
        }),
        [`admin-works-${uploaderId}-${role}`],
        { revalidate: 600, tags: role === 'admin' ? ['karya-global'] : [`karya-author-${uploaderId}`] }
    )();

    const getCachedLatestComments = (uploaderId: string) => unstable_cache(
        async () => prisma.comment.findMany({
            where: {
                bab: {
                    karya: {
                        uploader_id: uploaderId
                    }
                }
            },
            orderBy: { created_at: 'desc' },
            take: 3, 
            select: {
                id: true,
                content: true,
                created_at: true,
                user: { select: { display_name: true, id: true } },
                bab: {
                    select: { 
                        karya: { select: { title: true, id: true } } 
                    }
                }
            }
        }),
        [`admin-comments-${uploaderId}`],
        { revalidate: 300, tags: [`comments-author-${uploaderId}`] }
    )();

    const [daftarKarya, latestComments] = await Promise.all([
        getCachedDaftarKarya(session.user.role, session.user.id),
        getCachedLatestComments(session.user.id)
    ]);

    // [3] STATISTICAL AGGREGATION (Optimization: Done in memory after single query)
    // Menjumlahkan views, bookmarks, dan menghitung rata-rata rating secara efisien.
    const totalViews = daftarKarya.reduce((acc, k) => acc + k.total_views, 0);
    const totalBookmarks = daftarKarya.reduce((acc, k) => acc + k._count.bookmarks, 0);
    const karyaWithRating = daftarKarya.filter(k => k.avg_rating > 0);
    const avgRating = karyaWithRating.length > 0
        ? karyaWithRating.reduce((acc, k) => acc + k.avg_rating, 0) / karyaWithRating.length
        : 0;

    return (
        <div className="min-h-screen bg-bg-cream/60 dark:bg-brown-dark transition-colors duration-500 pb-24">
            {/* Header Dashboard */}
            <div className="px-6 pt-12 mb-10 flex flex-col sm:flex-row justify-between items-end gap-4 max-w-6xl mx-auto">
                <div>
                    <h1 className="text-4xl font-black text-text-main dark:text-text-accent tracking-tight leading-none uppercase italic">Dashboard</h1>
                    <div className="w-12 h-1 bg-text-main/20 dark:bg-white/20 mt-4"></div>
                </div>
                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    <div className="flex items-center gap-3 bg-bg-cream/40 dark:bg-brown-dark/40 px-4 py-2 rounded-2xl border border-text-main/5 dark:border-white/5">
                        <span className="text-[10px] text-text-main dark:text-tan-primary font-black uppercase tracking-[0.2em]">
                            {session.user.role === 'admin' ? 'Administrator' : 'Author'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-text-main/20 dark:bg-white/20"></span>
                        <span className="text-[10px] text-text-main/60 dark:text-tan-light font-bold uppercase tracking-widest">
                            {session.user.name}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* --- TOP STATISTICS GRID (2x2 Mobile, uneven Desktop) --- */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-16">
                    {/* Engagement - Top Left on Mobile, Vertical on Desktop */}
                    <Link href="/admin/stats/engagement" prefetch={false} className="lg:row-span-2 bg-[#3B2A22] text-white p-4 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl dark:shadow-none flex flex-col justify-between group overflow-hidden relative min-h-[150px] md:min-h-[400px] hover:scale-[1.02] transition-all cursor-pointer border border-white/5">
                        <div className="relative z-10">
                            <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-6 border border-white/10 shadow-inner group-hover:rotate-6 transition-transform">
                                <BarChart className="w-4 h-4 md:w-6 md:h-6 text-white" />
                            </div>
                            <p className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.3em] text-white/60 dark:text-tan-light mb-1">Engagement</p>
                            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/40 dark:text-tan-light/40 opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0">Klik untuk Detail</span>
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-6xl font-black italic mb-2 tracking-tighter leading-none">{totalViews.toLocaleString()}</h2>
                            <div className="flex items-center gap-3">
                                <span className="w-8 md:w-16 h-[1px] bg-white/20"></span>
                                <p className="text-[9px] md:text-[14px] font-bold uppercase tracking-[0.3em] text-white/60 dark:text-tan-light">
                                    Views
                                </p>
                            </div>
                        </div>
                        {/* Decorative Blur */}
                        <div className="absolute top-0 right-0 w-32 h-32 md:w-64 md:h-64 bg-white/5 rounded-full blur-[40px] md:blur-[80px] -mr-10 -mt-10"></div>
                    </Link>

                    {/* Kepuasan - Top Right on Mobile */}
                    <Link href="/admin/stats/kepuasan" prefetch={false} className="bg-[#7A553A] text-white p-4 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-xl dark:shadow-none group transition-all relative overflow-hidden flex flex-col justify-between min-h-[150px] md:min-h-0 hover:scale-[1.02] cursor-pointer border border-white/5">
                        <div className="relative z-10 flex justify-between items-start">
                            <p className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.3em] text-white/70 dark:text-tan-light">Kepuasan</p>
                            <div className="w-7 h-7 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-[#7A553A] transition-all relative">
                                <Star className="w-3.5 h-3.5 md:w-6 md:h-6 fill-current" />
                                <span className="absolute -bottom-6 right-0 text-[7px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity whitespace-nowrap">Lihat Analisis</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-baseline justify-end gap-1 md:gap-3">
                            <p className="text-3xl md:text-5xl font-black italic tracking-tighter">{avgRating.toFixed(1)}</p>
                            <span className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] opacity-60">Stars</span>
                        </div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-[30px] -ml-12 -mb-12"></div>
                    </Link>

                    {/* Disimpan - Bottom Left on Mobile */}
                    <Link href="/admin/stats/disimpan" prefetch={false} className="bg-[#433229] text-white p-4 md:p-8 rounded-[2rem] md:rounded-[3.5rem] shadow-xl dark:shadow-none group transition-all relative overflow-hidden flex flex-col justify-between min-h-[150px] md:min-h-0 hover:scale-[1.02] cursor-pointer border border-white/5">
                        <div className="relative z-10 flex justify-between items-start">
                            <p className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.3em] text-white/70 dark:text-tan-light">Disimpan</p>
                            <div className="w-7 h-7 md:w-12 md:h-12 bg-white/10 rounded-xl md:rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-[#433229] transition-all relative">
                                <Bookmark className="w-3.5 h-3.5 md:w-6 md:h-6" />
                                <span className="absolute -bottom-6 right-0 text-[7px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity whitespace-nowrap">Lihat Analisis</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-baseline justify-end gap-1 md:gap-3">
                            <p className="text-3xl md:text-5xl font-black italic tracking-tighter">{totalBookmarks.toLocaleString()}</p>
                            <span className="text-[9px] md:text-[12px] font-black uppercase tracking-[0.2em] opacity-60">Saves</span>
                        </div>
                    </Link>

                    {/* Koleksi - Bottom Right on Mobile, Horizontal on Desktop */}
                    <Link href="/admin/stats/karya" prefetch={false} className="lg:col-span-2 bg-[#D6BFA6] dark:bg-brown-mid text-[#3B2A22] dark:text-text-accent p-4 md:p-8 rounded-[2rem] md:rounded-[4.5rem] shadow-xl dark:shadow-none group flex flex-col justify-between relative overflow-hidden min-h-[150px] md:min-h-[220px] hover:scale-[1.01] cursor-pointer transition-all border border-black/5 dark:border-white/5">
                        <div className="relative z-10 flex justify-between items-start">
                            <p className="text-[9px] md:text-[14px] font-black uppercase tracking-[0.4em] opacity-70">Koleksi</p>
                            <div className="w-7 h-7 md:w-14 md:h-14 bg-[#3B2A22]/10 dark:bg-white/10 rounded-xl md:rounded-[2rem] flex items-center justify-center border border-[#3B2A22]/10 dark:border-white/10 group-hover:bg-[#3B2A22] dark:group-hover:bg-tan-primary group-hover:text-text-accent dark:group-hover:text-brown-dark transition-all relative">
                                <BookOpen className="w-3.5 h-3.5 md:w-7 md:h-7" />
                                <span className="absolute -bottom-8 right-0 text-[8px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-40 transition-opacity whitespace-nowrap">Lihat Portofolio</span>
                            </div>
                        </div>
                        <div className="relative z-10 flex items-baseline justify-end gap-3 md:gap-4 mt-auto">
                            <p className="text-3xl md:text-6xl font-black italic tracking-tighter">{daftarKarya.length}</p>
                            <span className="text-[10px] md:text-[14px] font-black uppercase tracking-[0.3em] text-text-main/70 dark:text-tan-light">Karya</span>
                        </div>
                        {/* Decorative Stripe */}
                        <div className="absolute top-0 left-0 w-32 md:w-64 h-full bg-black/[0.02] -rotate-12 -translate-x-12"></div>
                    </Link>
                </div>

                <div className="grid lg:grid-cols-12 gap-12">
                    {/* --- MAIN CONTENT: STORY MANAGEMENT --- */}
                    <div className="lg:col-span-8 space-y-12">
                        <section>
                            <div className="flex justify-between items-center mb-10">
                                <h2 className="text-3xl font-black text-text-main dark:text-text-accent italic tracking-tight uppercase">Cerita Anda</h2>
                                <Link href="/admin/editor/karya" prefetch={false} className="bg-text-main dark:bg-brown-mid text-bg-cream px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-3 shadow-xl transition-all hover:-translate-y-1 active:scale-95 group border border-white/5">
                                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Karya Baru
                                </Link>
                            </div>

                            {/* Karya List Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {daftarKarya.length === 0 ? (
                                    <div className="col-span-full text-center py-32 bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[3rem] border border-dashed border-text-main/10 dark:border-white/10">
                                        <BookOpen className="w-16 h-16 text-text-main/10 dark:text-white/10 mx-auto mb-6" />
                                        <p className="text-text-main/50 dark:text-tan-light/50 font-black uppercase tracking-[0.2em] text-[12px]">Belum ada karya yang terbit</p>
                                    </div>
                                ) : (
                                    <>
                                        {daftarKarya.map((item) => (
                                            <div key={item.id} className="bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[2.5rem] p-5 border border-text-main/5 dark:border-white/5 flex gap-4 items-center group/card transition-all hover:bg-bg-cream/60 dark:hover:bg-brown-dark/60">
                                                {/* Cover Thumbnail */}
                                                <div className="w-20 h-28 rounded-[1.2rem] overflow-hidden shrink-0 shadow-lg border-2 border-white/50 dark:border-white/10 relative">
                                                    {item.cover_url ? (
                                                        <Image src={item.cover_url} width={80} height={112} alt={item.title} className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-1000" />
                                                    ) : (
                                                        <div className="w-full h-full bg-tan-primary/20 flex items-center justify-center p-3 text-center text-[8px] text-text-main/30 dark:text-white/30 font-black uppercase leading-tight">{item.title}</div>
                                                    )}
                                                </div>

                                                {/* Karya Details */}
                                                <div className="flex-1 py-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                        <h3 className="text-sm font-black text-text-main dark:text-text-accent italic leading-tight uppercase tracking-tight truncate">{item.title}</h3>
                                                        {item.is_completed && (
                                                            <span className="bg-brown-dark/90 dark:bg-brown-mid text-text-accent text-[6px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">TAMAT</span>
                                                        )}
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 items-center mb-3">
                                                        <div className="flex items-center gap-1 bg-text-main/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                                            <Eye className="w-2.5 h-2.5 text-text-main/40 dark:text-white/40" />
                                                            <span className="text-[9px] font-black text-text-main/60 dark:text-tan-light uppercase tracking-widest">{item.total_views.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-text-main/5 dark:bg-white/5 px-2 py-0.5 rounded-full">
                                                            <Bookmark className="w-2.5 h-2.5 text-text-main/40 dark:text-white/40" />
                                                            <span className="text-[9px] font-black text-text-main/60 dark:text-tan-light uppercase tracking-widest">{item._count.bookmarks}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-amber-400/10 px-2 py-0.5 rounded-full">
                                                            <Star className="w-2.5 h-2.5 fill-amber-400 text-transparent" />
                                                            <span className="text-[9px] font-black text-text-main/60 dark:text-tan-light uppercase tracking-widest">{item.avg_rating.toFixed(1)}</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap gap-2 items-center mb-4">
                                                        <div className="bg-text-main/5 dark:bg-white/5 px-3 py-1 rounded-full">
                                                            <span className="text-[8px] font-black text-text-main/60 dark:text-tan-light uppercase tracking-[0.2em]">{item._count.bab} Bab</span>
                                                        </div>
                                                        {item.genres.map((g: any) => (
                                                            <div key={g.id} className="bg-tan-primary/10 dark:bg-tan-primary/20 border border-tan-primary/20 px-3 py-1 rounded-full">
                                                                <span className="text-[8px] font-black text-tan-primary dark:text-tan-light uppercase tracking-[0.1em]">{g.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                        <div className="flex items-center justify-between gap-4 mt-2">
                                                            <div className="flex items-center gap-2 flex-1">
                                                                    <Link href={`/admin/editor/karya/${item.id}`} prefetch={false} className="bg-text-main dark:bg-tan-primary/80 dark:text-brown-dark text-bg-cream px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-brown-mid dark:hover:bg-tan-primary transition-all active:scale-95 group/btn flex-1 text-center">
                                                                        Edit Karya
                                                                    </Link>
                                                                <Link href={`/admin/stats/engagement`} prefetch={false} className="bg-text-main/5 dark:bg-white/10 text-text-main dark:text-text-accent p-2.5 rounded-xl hover:bg-tan-primary/20 transition-all active:scale-95 group/stats border border-text-main/5 dark:border-white/10" title="View Analysis">
                                                                    <BarChart3 className="w-3.5 h-3.5 text-current" />
                                                                </Link>
                                                            </div>
                                                            {item.bab[0] && (
                                                                <span className="text-[8px] text-text-main/50 dark:text-tan-light font-black uppercase tracking-tighter shrink-0">
                                                                    {new Date(item.bab[0].created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        {/* Pagination Dots Placeholder as seen in mockup */}
                                        <div className="col-span-full flex justify-center gap-2 mt-8">
                                            <div className="w-8 h-2 bg-text-main dark:bg-bg-cream rounded-full"></div>
                                            <div className="w-2 h-2 bg-text-main/20 dark:bg-bg-cream/20 rounded-full"></div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* --- SIDEBAR: RECENT COMMUNITY --- */}
                    <div className="lg:col-span-4 space-y-12">
                        {/* Recent Comments Section */}
                        <section className="bg-bg-cream/40 dark:bg-brown-dark/40 rounded-[3rem] p-8 border border-text-main/5 dark:border-white/5">
                            <h2 className="text-2xl font-black text-text-main dark:text-text-accent mb-8 flex items-center gap-4 italic tracking-tight uppercase">
                                <MessageSquare className="w-6 h-6 text-text-main dark:text-tan-primary" /> Komunitas
                            </h2>

                            {latestComments.length === 0 ? (
                                <div className="text-center py-16 opacity-50">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Interaksi kosong</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {latestComments.map(c => (
                                        <div key={c.id} className="group cursor-default">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-xl bg-text-main dark:bg-brown-mid flex items-center justify-center text-[10px] font-black text-bg-cream">
                                                    {c.user.display_name[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-black text-text-main dark:text-text-accent uppercase tracking-tight">{c.user.display_name}</span>
                                                    <span className="text-[9px] text-text-main/40 dark:text-tan-light font-black uppercase tracking-widest leading-none">{new Date(c.created_at).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            </div>
                                            <div className="bg-text-main/5 dark:bg-white/5 p-5 rounded-[2rem] border border-transparent transition-all mb-3">
                                                <p className="text-[13px] text-text-main/80 dark:text-tan-light leading-relaxed italic font-medium">"{c.content}"</p>
                                            </div>
                                            <Link href={`/admin/editor/karya/${c.bab.karya.id}`} className="text-[9px] text-text-main/60 dark:text-tan-primary font-black uppercase tracking-[0.2em] hover:text-text-main dark:hover:text-bg-cream flex items-center gap-2 ml-2 transition-all">
                                                <BookOpen className="w-3 h-3" strokeWidth={3} /> {c.bab.karya.title}
                                            </Link>
                                        </div>
                                    ))}
                                    <Link href="/admin/community" className="w-full text-center py-4 bg-text-main/5 dark:bg-white/10 rounded-[1.5rem] text-[9px] font-black text-text-main dark:text-text-accent uppercase tracking-[0.2em] hover:bg-text-main/10 dark:hover:bg-white/20 transition-all block mt-8">Manajemen Komentar</Link>
                                </div>
                            )}
                        </section>

                        {/* Tips Studio Promotional Section */}
                        <section className="bg-text-main dark:bg-brown-mid rounded-[3rem] p-10 text-bg-cream relative overflow-hidden group shadow-2xl dark:shadow-none shadow-text-main/20">
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:rotate-6 transition-transform">
                                    <Sparkles className="w-7 h-7 text-bg-cream" />
                                </div>
                                <h3 className="text-3xl font-black italic mb-3 leading-tight uppercase">Inspirasi</h3>
                                <p className="text-[11px] text-bg-cream/60 font-black uppercase tracking-[0.2em] mb-10 leading-relaxed">Setiap kata adalah permata bagi pembaca.</p>
                                <Link href="/admin/editor/tips" prefetch={false} className="inline-flex items-center gap-3 bg-text-accent text-brown-dark px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-110 active:scale-95 shadow-xl">
                                    Tips Studio
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all"></div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
