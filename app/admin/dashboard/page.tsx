import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { TrendingUp, Star, PenTool, Users, MessageSquare, BookOpen, Plus, ChevronRight, BarChart3, Bookmark, Sparkles } from "lucide-react";

export default async function AdminDashboardPage() {
    const session = (await getServerSession(authOptions))!;

    // Ambil daftar karya
    const daftarKaryaRaw = await prisma.karya.findMany({
        where: session.user.role === 'admin' ? undefined : { uploader_id: session.user.id },
        orderBy: { title: 'asc' },
        include: {
            _count: {
                select: { bookmarks: true, bab: true }
            }
        }
    });

    const daftarKarya = daftarKaryaRaw as any[];

    // Hitung agregat statistik global
    const totalViews = daftarKarya.reduce((acc, k) => acc + k.total_views, 0);
    const totalBookmarks = daftarKarya.reduce((acc, k) => acc + k._count.bookmarks, 0);
    const karyaWithRating = daftarKarya.filter(k => k.avg_rating > 0);
    const avgRating = karyaWithRating.length > 0
        ? karyaWithRating.reduce((acc, k) => acc + k.avg_rating, 0) / karyaWithRating.length
        : 0;

    // Fetch latest comments for author's works (Community section)
    const latestComments = await prisma.comment.findMany({
        where: {
            bab: {
                karya: {
                    uploader_id: session.user.id
                }
            }
        },
        orderBy: { created_at: 'desc' },
        take: 3,
        include: {
            user: true,
            bab: {
                include: { karya: { select: { title: true, id: true } } }
            }
        }
    });

    return (
        <div className="pb-24">
            <div className="px-3 sm:px-6 pt-6 sm:pt-10 mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none uppercase italic">Dashboard</h1>
                <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] sm:text-[11px] text-indigo-500 font-black uppercase tracking-[0.2em]">{session.user.role === 'admin' ? 'Administrator' : 'Author'}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700"></span>
                    <span className="text-[10px] sm:text-[11px] text-gray-400 font-bold uppercase tracking-widest">{session.user.name}</span>
                </div>
            </div>

            <div className="w-full mx-auto px-3 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
                    <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-indigo-500/10 transition-all duration-500">
                        <div className="p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-[9px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1 px-1">Engagement</p>
                        <div className="flex items-baseline gap-1 px-1">
                            <p className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">{totalViews.toLocaleString()}</p>
                            <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase">Views</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-amber-500/10 transition-all duration-500">
                        <div className="p-2 sm:p-3 bg-amber-50 dark:bg-amber-900/30 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-5 group-hover:bg-amber-500 group-hover:text-white transition-all">
                            <Star className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-[9px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1 px-1">Kepuasan</p>
                        <div className="flex items-baseline gap-1 px-1">
                            <p className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">{avgRating.toFixed(1)}</p>
                            <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase">Stars</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-rose-500/10 transition-all duration-500">
                        <div className="p-2 sm:p-3 bg-rose-50 dark:bg-rose-900/30 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-5 group-hover:bg-rose-500 group-hover:text-white transition-all">
                            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-[9px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1 px-1">Disimpan</p>
                        <div className="flex items-baseline gap-1 px-1">
                            <p className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">{totalBookmarks.toLocaleString()}</p>
                            <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase">Saves</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 sm:p-8 rounded-3xl sm:rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-emerald-500/10 transition-all duration-500">
                        <div className="p-2 sm:p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl sm:rounded-2xl w-fit mb-3 sm:mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <p className="text-[9px] sm:text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-0.5 sm:mb-1 px-1">Koleksi</p>
                        <div className="flex items-baseline gap-1 px-1">
                            <p className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100">{daftarKarya.length}</p>
                            <span className="text-[9px] sm:text-[11px] font-bold text-gray-400 uppercase">Karya</span>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-12 gap-4 sm:gap-12">
                    {/* Main Content: Story Management */}
                    <div className="lg:col-span-8 space-y-8 sm:space-y-12">
                        <section>
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-10 px-1 sm:px-4">
                                <h2 className="text-xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Karya Anda</h2>
                                <Link href="/admin/editor/karya" className="bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 text-white px-5 sm:px-8 py-2.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-[11px] uppercase tracking-[0.15em] flex items-center gap-2.5 shadow-xl transition-all hover:-translate-y-1 active:scale-95 group w-full sm:w-auto justify-center">
                                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" /> Karya Baru
                                </Link>
                            </div>

                            {daftarKarya.length === 0 ? (
                                <div className="text-center py-20 sm:py-32 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl shadow-gray-200/30 px-6">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 dark:bg-slate-800 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center mb-6 sm:mb-8 mx-auto shadow-inner">
                                        <PenTool className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200" />
                                    </div>
                                    <h3 className="font-black text-xl sm:text-2xl text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 tracking-tight">Belum Ada Karya</h3>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-[13px] font-bold mb-8 sm:mb-10 max-w-sm mx-auto uppercase tracking-wide px-4">Mulailah menulis mahakarya pertamamu dan temukan pembaca setiamu.</p>
                                    <Link href="/admin/editor/karya" className="inline-block bg-indigo-600 text-white px-10 sm:px-12 py-4 sm:py-5 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95">
                                        Mulai Menulis
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:gap-8">
                                    {daftarKarya.map((item) => (
                                        <Link key={item.id} href={`/admin/editor/karya/${item.id}`} className="group bg-white dark:bg-slate-900 p-3 sm:p-6 rounded-3xl sm:rounded-[3.5rem] border border-gray-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all flex flex-col sm:flex-row gap-4 sm:gap-8 items-start sm:items-center active:scale-[0.99] duration-500">
                                            <div className="w-20 h-30 sm:w-28 sm:h-40 rounded-xl sm:rounded-[2.5rem] overflow-hidden shrink-0 shadow-2xl border-2 sm:border-4 border-white dark:border-slate-800 mx-auto sm:mx-0">
                                                {item.cover_url ? (
                                                    <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                                ) : (
                                                    <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-3 text-center text-[10px] text-gray-400 font-black uppercase text-pretty">{item.title}</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 py-1 sm:py-2 text-center sm:text-left w-full">
                                                <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1 sm:gap-4 mb-1 sm:mb-3">
                                                    <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg sm:text-2xl leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                                                    {item.is_completed && <span className="bg-emerald-500 text-white text-[7px] sm:text-[9px] font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest w-fit">Tamat</span>}
                                                </div>
                                                <p className="text-[10px] sm:text-[13px] text-indigo-500 dark:text-indigo-400 font-extrabold mb-4 sm:mb-8 uppercase tracking-[0.15em]">{item.penulis_alias}</p>

                                                <div className="flex justify-center sm:justify-start gap-4 sm:gap-6 items-center flex-wrap">
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] sm:text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-0.5 sm:mb-1.5">Views</span>
                                                        <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-black text-gray-900 dark:text-gray-100">
                                                            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500" /> {totalViews.toLocaleString()}
                                                        </span>
                                                    </div>
                                                    <div className="hidden sm:block w-[1.5px] h-8 bg-gray-50 dark:bg-slate-800"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] sm:text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-0.5 sm:mb-1.5">Chapters</span>
                                                        <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-black text-gray-900 dark:text-gray-100">
                                                            <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" /> {item._count.bab}
                                                        </span>
                                                    </div>
                                                    <div className="hidden sm:block w-[1.5px] h-8 bg-gray-50 dark:bg-slate-800"></div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[8px] sm:text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-0.5 sm:mb-1.5">Readers</span>
                                                        <span className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-sm font-black text-gray-900 dark:text-gray-100">
                                                            <Users className="w-3 h-3 sm:w-4 sm:h-4 text-rose-500" /> {item._count.bookmarks}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-[2.5rem] bg-gray-50 dark:bg-slate-800 items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all mr-0 sm:mr-2 shadow-inner group-hover:shadow-indigo-900/40 group-hover:scale-110 shrink-0 self-center hidden sm:flex">
                                                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Sidebar: Insights & Recent Community */}
                    <div className="lg:col-span-4 space-y-8 sm:space-y-12">
                        <section className="bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[4rem] p-6 sm:p-10 border border-gray-100 dark:border-slate-800 shadow-2xl shadow-gray-200/40 dark:shadow-none relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[100px] opacity-10 -mr-24 -mt-24"></div>
                            <div className="relative z-10">
                                <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 mb-6 sm:mb-10 flex items-center gap-3 sm:gap-4 italic tracking-tight">
                                    <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-indigo-500" /> Komunitas
                                </h2>

                                {latestComments.length === 0 ? (
                                    <div className="text-center py-12 sm:py-16 opacity-50 bg-gray-50/50 dark:bg-slate-800 px-4 sm:px-6 rounded-[2rem] sm:rounded-[3rem] border border-dashed border-gray-100">
                                        <MessageSquare className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                                        <p className="text-xs text-gray-400 font-black leading-relaxed uppercase tracking-[0.2em]">Belum ada <br />interaksi masuk</p>
                                    </div>
                                ) : (
                                    <div className="space-y-10">
                                        {latestComments.map(c => (
                                            <div key={c.id} className="group cursor-default animate-in fade-in slide-in-from-right-4 duration-500">
                                                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 flex items-center justify-center text-xs sm:text-sm font-black text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-110">
                                                        {c.user.display_name[0].toUpperCase()}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[11px] sm:text-[13px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{c.user.display_name}</span>
                                                        <span className="text-[9px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-all mb-2 sm:mb-3 shadow-inner">
                                                    <p className="text-[12px] sm:text-[14px] text-gray-600 dark:text-gray-400 line-clamp-2 sm:line-clamp-3 leading-relaxed italic font-medium">"{c.content}"</p>
                                                </div>
                                                <Link href={`/novel/${c.bab.karya.id}`} className="text-[11px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-[0.15em] hover:text-indigo-600 flex items-center gap-2 ml-2 transition-transform hover:translate-x-1">
                                                    <BookOpen className="w-3.5 h-3.5" /> {c.bab.karya.title}
                                                </Link>
                                            </div>
                                        ))}
                                        <Link href="/admin/community" className="w-full text-center py-5 bg-gray-100 dark:bg-slate-800 rounded-[2rem] text-[11px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 uppercase tracking-[0.25em] hover:bg-gray-200 dark:hover:bg-slate-700 transition-all block mt-10 border border-transparent hover:border-indigo-100">Manajemen Komentar</Link>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="bg-indigo-900 rounded-3xl sm:rounded-[4rem] p-8 sm:p-12 text-white text-left relative overflow-hidden group shadow-3xl shadow-indigo-500/10">
                            <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover:scale-110 transition-transform duration-1000"></div>
                            <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/10 rounded-xl sm:rounded-[1.5rem] flex items-center justify-center mb-6 sm:mb-8 border border-white/10 backdrop-blur-sm group-hover:rotate-6 transition-transform">
                                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-200" />
                                </div>
                                <h3 className="text-2xl sm:text-3xl font-black italic mb-3 sm:mb-4 leading-tight">Inspirasi Menanti</h3>
                                <p className="text-[10px] sm:text-[12px] text-indigo-300 font-bold uppercase tracking-[0.1em] sm:tracking-[0.15em] mb-8 sm:mb-10 leading-relaxed opacity-90 px-4 sm:px-0">Setiap kata yang kamu tulis adalah permata bagi pembacamu.</p>
                                <Link href="/admin/editor/tips" className="inline-flex items-center gap-3 bg-white text-indigo-600 px-8 sm:px-10 py-3 sm:py-4 rounded-full font-black text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 shadow-2xl shadow-black/20">
                                    Tips Studio <Sparkles className="w-4 h-4" />
                                </Link>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
