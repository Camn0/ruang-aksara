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
import Link from "next/link";
import { TrendingUp, Star, PenTool, Users, MessageSquare, BookOpen, Plus, ChevronRight, BarChart3, Bookmark, Sparkles } from "lucide-react";

export default async function AdminDashboardPage() {
    // [1] AUTHENTICATION & SESSION
    // Mengambil session aktif. Non-null assertion (!) aman karena sudah divalidasi di parent layout.
    const session = (await getServerSession(authOptions))!;

    // [2] DATA FETCHING: Daftar Karya
    // Admin melihat semua, Author hanya melihat miliknya sendiri (Security barrier).
    const daftarKarya = await prisma.karya.findMany({
        where: session.user.role === 'admin' ? undefined : { uploader_id: session.user.id },
        orderBy: { title: 'asc' },
        include: {
            _count: {
                select: { bookmarks: true, bab: true }
            }
        }
    });

    // [3] STATISTICAL AGGREGATION (Optimization: Done in memory after single query)
    // Menjumlahkan views, bookmarks, dan menghitung rata-rata rating secara efisien.
    const totalViews = daftarKarya.reduce((acc, k) => acc + k.total_views, 0);
    const totalBookmarks = daftarKarya.reduce((acc, k) => acc + k._count.bookmarks, 0);
    const karyaWithRating = daftarKarya.filter(k => k.avg_rating > 0);
    const avgRating = karyaWithRating.length > 0
        ? karyaWithRating.reduce((acc, k) => acc + k.avg_rating, 0) / karyaWithRating.length
        : 0;

    // [4] DATA FETCHING: Community Interaction
    // Mengambil komentar terbaru khusus untuk karya milik user yang sedang login.
    const latestComments = await prisma.comment.findMany({
        where: {
            bab: {
                karya: {
                    uploader_id: session.user.id
                }
            }
        },
        orderBy: { created_at: 'desc' },
        take: 3, // Performa: Hanya ambil 3 item terbaru.
        include: {
            user: true,
            bab: {
                include: { karya: { select: { title: true, id: true } } }
            }
        }
    });

    return (
        <div className="pb-32">
            {/* Header Dashboard: Info User & Role */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
                <h1 className="font-journal-title text-4xl text-ink-deep italic tracking-tight uppercase">Buku Kendali</h1>
                <div className="flex items-center gap-3 bg-paper/40 px-6 py-2 wobbly-border-sm rotate-1">
                    <span className="font-special text-[11px] text-pine font-black uppercase tracking-[0.2em]">{session.user.role === 'admin' ? 'Curator' : 'Researcher'}</span>
                    <span className="w-1 h-1 rounded-full bg-ink/20"></span>
                    <span className="font-journal-body text-lg text-ink-deep italic font-bold">{session.user.name}</span>
                </div>
            </div>

            {/* --- TOP STATISTICS GRID --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
                    { label: 'Engagement', val: totalViews.toLocaleString(), unit: 'Views', icon: TrendingUp, color: 'text-pine', bg: 'bg-pine/10' },
                    { label: 'Kepuasan', val: avgRating.toFixed(1), unit: 'Stars', icon: Star, color: 'text-gold', bg: 'bg-gold/10' },
                    { label: 'Disimpan', val: totalBookmarks.toLocaleString(), unit: 'Saves', icon: Bookmark, color: 'text-dried-red', bg: 'bg-dried-red/10' },
                    { label: 'Katalog', val: daftarKarya.length, unit: 'Karya', icon: BookOpen, color: 'text-ink-deep', bg: 'bg-ink/10' }
                ].map((stat, i) => (
                    <div key={i} className={`bg-paper wobbly-border paper-shadow p-8 flex flex-col items-center text-center transition-all hover:scale-105 duration-500 ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                        <div className={`p-4 ${stat.bg} w-fit wobbly-border-sm mb-6 ${stat.color}`}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <p className="font-special text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                        <div className="flex items-baseline gap-2">
                            <p className="font-journal-title text-4xl text-ink-deep italic">{stat.val}</p>
                            <span className="font-marker text-xs text-ink/40 uppercase">{stat.unit}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-12 gap-12">
                {/* --- MAIN CONTENT: STORY MANAGEMENT --- */}
                <div className="lg:col-span-8 space-y-12">
                    <section>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
                            <h2 className="font-journal-title text-3xl text-ink-deep italic underline decoration-dotted decoration-ink/20">Katalog Karya</h2>
                            <Link href="/admin/editor/karya" className="bg-pine text-parchment font-journal-title text-xl px-10 py-3 wobbly-border-sm hover:rotate-[-2deg] transition-all active:scale-95 shadow-md italic flex items-center gap-3">
                                <Plus className="w-5 h-5" /> Dokumen Baru
                            </Link>
                        </div>

                        {/* Empty State */}
                        {daftarKarya.length === 0 ? (
                            <div className="text-center py-24 wobbly-border-sm bg-paper/40 rotate-1 mx-auto max-w-lg">
                                <div className="w-20 h-20 bg-ink/10 wobbly-border flex items-center justify-center mb-8 mx-auto -rotate-12">
                                    <PenTool className="w-10 h-10 text-ink/10" />
                                </div>
                                <h3 className="font-journal-title text-2xl text-ink-deep mb-3 italic">Belum Ada Catatan</h3>
                                <p className="font-journal-body text-lg text-ink/40 mb-10 leading-relaxed italic">Tulis mahakarya pertamamu dan temukan pembaca setiamu di antara pepohonan.</p>
                                <Link href="/admin/editor/karya" className="bg-gold text-ink-deep font-journal-title text-xl px-12 py-4 wobbly-border-sm hover:rotate-2 transition-all active:scale-95 shadow-lg italic">
                                    Mulai Menulis
                                </Link>
                            </div>
                        ) : (
                            /* Karya List Grid */
                            <div className="space-y-8">
                                {daftarKarya.map((item, i) => (
                                    <Link key={item.id} href={`/admin/editor/karya/${item.id}`} className={`group flex flex-col sm:flex-row gap-8 bg-paper wobbly-border paper-shadow p-6 hover:scale-[1.01] transition-all duration-500 ${i % 2 === 0 ? '-rotate-[0.5deg]' : 'rotate-[0.5deg]'}`}>
                                        {/* Cover Thumbnail */}
                                        <div className="relative shrink-0 mx-auto sm:mx-0">
                                            {/* Tape effect */}
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-5 bg-gold/30 wobbly-border-sm rotate-12 z-10 mix-blend-multiply" />

                                            <div className="w-28 h-40 wobbly-border border-4 border-paper shadow-xl overflow-hidden bg-paper">
                                                {item.cover_url ? (
                                                    <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                ) : (
                                                    <div className="w-full h-full bg-parchment-light flex items-center justify-center p-4 text-center font-marker text-[10px] text-ink/30 italic uppercase">{item.title}</div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Karya Details */}
                                        <div className="flex-1 min-w-0 py-2">
                                            <div className="flex items-center gap-4 mb-2">
                                                <h3 className="font-journal-title text-2xl text-ink-deep leading-tight line-clamp-1 italic group-hover:text-pine transition-colors uppercase tracking-tight">{item.title}</h3>
                                                {item.is_completed && <span className="bg-dried-red text-parchment font-special text-[8px] px-3 py-1 wobbly-border-sm shadow-md uppercase tracking-widest rotate-6">TAMAT</span>}
                                            </div>
                                            <p className="font-marker text-sm text-ink/40 uppercase tracking-widest mb-6">{item.penulis_alias}</p>

                                            <div className="flex gap-8 items-center flex-wrap">
                                                {[
                                                    { label: 'Akses', val: item.total_views.toLocaleString(), icon: BarChart3, color: 'text-pine' },
                                                    { label: 'Catatan', val: item._count.bab, icon: BookOpen, color: 'text-gold' },
                                                    { label: 'Pin', val: item._count.bookmarks, icon: Users, color: 'text-dried-red' }
                                                ].map((stat, idx) => (
                                                    <div key={idx} className="flex flex-col">
                                                        <span className="font-special text-[9px] text-ink/20 uppercase tracking-widest mb-1">{stat.label}</span>
                                                        <span className={`flex items-center gap-2 font-journal-title text-lg italic ${stat.color}`}>
                                                            <stat.icon className="w-4 h-4 opacity-30" /> {stat.val}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 wobbly-border bg-ink/10 items-center justify-center text-ink/10 group-hover:bg-pine group-hover:text-parchment transition-all self-center hidden sm:flex rotate-12 group-hover:rotate-0">
                                            <ChevronRight className="w-7 h-7" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* --- SIDEBAR: INSIGHTS & RECENT COMMUNITY --- */}
                <div className="lg:col-span-4 space-y-12">
                    {/* Recent Comments Section */}
                    <section className="bg-paper wobbly-border paper-shadow p-8 relative overflow-hidden -rotate-1">
                        <div className="relative z-10">
                            <h2 className="font-journal-title text-2xl text-ink-deep mb-8 flex items-center gap-4 italic underline decoration-dotted decoration-ink/20">
                                <MessageSquare className="w-6 h-6 text-pine" /> Komunitas
                            </h2>

                            {latestComments.length === 0 ? (
                                <div className="text-center py-12 bg-ink/10 wobbly-border-sm px-6">
                                    <MessageSquare className="w-10 h-10 mx-auto text-ink/10 mb-4 rotate-12" />
                                    <p className="font-journal-body text-sm text-ink/30 italic uppercase tracking-[0.2em]">Belum ada <br />interaksi masuk</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {latestComments.map((c, i) => (
                                        <div key={c.id} className={`group ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 wobbly-border-sm bg-paper border-2 border-ink/5 flex items-center justify-center font-journal-title text-xl text-ink-deep shadow-sm">
                                                    {c.user.display_name[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-journal-title text-lg text-ink-deep italic">{c.user.display_name}</span>
                                                    <span className="font-special text-[9px] text-ink/30 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                            <div className="bg-parchment-light wobbly-border-sm p-5 shadow-inner mb-3">
                                                <p className="font-journal-body text-sm text-ink/60 leading-relaxed italic">"{c.content}"</p>
                                            </div>
                                            <Link href={`/novel/${c.bab.karya.id}`} className="font-marker text-xs text-pine hover:text-ink-deep transition-all flex items-center gap-2 italic ml-2">
                                                📚 {c.bab.karya.title}
                                            </Link>
                                        </div>
                                    ))}
                                    <Link href="/admin/community" className="w-full text-center py-4 bg-ink/10 wobbly-border-sm font-journal-title text-sm text-ink-deep hover:bg-pine hover:text-parchment transition-all block mt-8 italic">Pusat Interaksi</Link>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Tips Studio Promotional Section */}
                    <section className="bg-pine wobbly-border paper-shadow p-10 text-parchment relative overflow-hidden group rotate-2">
                        <div className="relative z-10 text-center sm:text-left">
                            <div className="w-16 h-16 bg-white/10 wobbly-border-sm flex items-center justify-center mb-8 mx-auto sm:mx-0 group-hover:rotate-12 transition-transform">
                                <Sparkles className="w-8 h-8 text-gold" />
                            </div>
                            <h3 className="font-journal-title text-3xl italic mb-4 leading-tight">Inspirasi Menanti</h3>
                            <p className="font-journal-body text-lg italic text-parchment/70 mb-10 leading-relaxed">Setiap kata yang kamu tulis adalah permata bagi pembacamu.</p>
                            <Link href="/admin/editor/tips" className="bg-parchment text-pine font-journal-title text-xl px-10 py-4 wobbly-border-sm hover:rotate-2 transition-all active:scale-95 shadow-xl italic inline-block">
                                Tips Studio ✨
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
