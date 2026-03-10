import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCircle2, Settings, TrendingUp, Star, PenTool, Users, MessageSquare, BookOpen, Plus, ChevronRight, BarChart3, Bookmark, Sparkles } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";

export default async function AdminDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

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
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 transition-colors duration-500 pb-24">
            {/* Minimalist Dashboard Header - Studio Style */}
            <header className="px-6 pt-12 pb-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 transition-colors relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/5 dark:bg-violet-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>

                <div className="w-full px-6 mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-16 px-4">
                        <div className="flex items-center gap-5">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white font-black italic shadow-xl shadow-indigo-100 dark:shadow-none transition-transform hover:scale-105">
                                RA
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-2">Studio Penulis</h1>
                                <div className="flex items-center gap-2.5">
                                    <span className="text-[11px] text-indigo-500 font-black uppercase tracking-[0.2em]">{session.user.role === 'admin' ? 'Administrator' : 'Author'}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700"></span>
                                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">{session.user.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4 items-center">
                            {session.user.role === 'admin' && (
                                <Link href="/admin/genre" className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                                    <Settings className="w-5 h-5" />
                                </Link>
                            )}
                            <Link href={`/profile/${session.user.id}`} className="p-3.5 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100">
                                <UserCircle2 className="w-5 h-5" />
                            </Link>
                            <LogoutButton />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-indigo-500/10 transition-all duration-500">
                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl w-fit mb-5 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Engagement</p>
                            <div className="flex items-baseline gap-1.5 px-1">
                                <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{totalViews.toLocaleString()}</p>
                                <span className="text-[11px] font-bold text-gray-400 uppercase">Views</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-amber-500/10 transition-all duration-500">
                            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-2xl w-fit mb-5 group-hover:bg-amber-500 group-hover:text-white transition-all">
                                <Star className="w-6 h-6" />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Kepuasan</p>
                            <div className="flex items-baseline gap-1.5 px-1">
                                <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{avgRating.toFixed(1)}</p>
                                <span className="text-[11px] font-bold text-gray-400 uppercase">Stars</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-rose-500/10 transition-all duration-500">
                            <div className="p-3 bg-rose-50 dark:bg-rose-900/30 rounded-2xl w-fit mb-5 group-hover:bg-rose-500 group-hover:text-white transition-all">
                                <Bookmark className="w-6 h-6" />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Disimpan</p>
                            <div className="flex items-baseline gap-1.5 px-1">
                                <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{totalBookmarks.toLocaleString()}</p>
                                <span className="text-[11px] font-bold text-gray-400 uppercase">Saves</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/20 dark:shadow-none group hover:shadow-emerald-500/10 transition-all duration-500">
                            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl w-fit mb-5 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                                <BookOpen className="w-6 h-6" />
                            </div>
                            <p className="text-[11px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Koleksi</p>
                            <div className="flex items-baseline gap-1.5 px-1">
                                <p className="text-4xl font-black text-gray-900 dark:text-gray-100">{daftarKarya.length}</p>
                                <span className="text-[11px] font-bold text-gray-400 uppercase">Karya</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="w-full mx-auto px-6 mt-20 grid lg:grid-cols-12 gap-12">
                {/* Main Content: Story Management */}
                <div className="lg:col-span-8 space-y-12">
                    <section>
                        <div className="flex justify-between items-center mb-10 px-4">
                            <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Karya Anda</h2>
                            <Link href="/admin/editor/karya" className="bg-gray-900 dark:bg-indigo-600 hover:bg-indigo-600 text-white px-8 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] flex items-center gap-2.5 shadow-xl transition-all hover:-translate-y-1 active:scale-95 group">
                                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" /> Karya Baru
                            </Link>
                        </div>

                        {daftarKarya.length === 0 ? (
                            <div className="text-center py-32 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[4rem] shadow-2xl shadow-gray-200/30">
                                <div className="w-24 h-24 bg-gray-50 dark:bg-slate-800 rounded-[2.5rem] flex items-center justify-center mb-8 mx-auto shadow-inner">
                                    <PenTool className="w-12 h-12 text-gray-200" />
                                </div>
                                <h3 className="font-black text-2xl text-gray-900 dark:text-gray-100 mb-3 tracking-tight">Belum Ada Karya</h3>
                                <p className="text-gray-400 dark:text-gray-500 text-[13px] font-bold mb-10 max-w-sm mx-auto uppercase tracking-wide">Mulailah menulis mahakarya pertamamu dan temukan pembaca setiamu.</p>
                                <Link href="/admin/editor/karya" className="inline-block bg-indigo-600 text-white px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-500/20 active:scale-95">
                                    Mulai Menulis
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-8">
                                {daftarKarya.map((item) => (
                                    <Link key={item.id} href={`/admin/editor/karya/${item.id}`} className="group bg-white dark:bg-slate-900 p-6 rounded-[3.5rem] border border-gray-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-xl shadow-gray-200/20 dark:shadow-none transition-all flex gap-8 items-center active:scale-[0.99] duration-500">
                                        <div className="w-28 h-40 rounded-[2.5rem] overflow-hidden shrink-0 shadow-2xl border-4 border-white dark:border-slate-800">
                                            {item.cover_url ? (
                                                <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-3 text-center text-[11px] text-gray-400 font-black uppercase text-pretty">{item.title}</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 py-2">
                                            <div className="flex items-center gap-4 mb-3">
                                                <h3 className="font-black text-gray-900 dark:text-gray-100 text-2xl leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                                                {item.is_completed && <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-full shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest">Tamat</span>}
                                            </div>
                                            <p className="text-[13px] text-indigo-500 dark:text-indigo-400 font-extrabold mb-8 uppercase tracking-[0.15em]">{item.penulis_alias}</p>

                                            <div className="flex gap-6 items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-1.5">Views</span>
                                                    <span className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-gray-100">
                                                        <BarChart3 className="w-4 h-4 text-indigo-500" /> {totalViews.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="w-[1.5px] h-8 bg-gray-50 dark:bg-slate-800"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-1.5">Chapters</span>
                                                    <span className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-gray-100">
                                                        <BookOpen className="w-4 h-4 text-emerald-500" /> {item._count.bab}
                                                    </span>
                                                </div>
                                                <div className="w-[1.5px] h-8 bg-gray-50 dark:bg-slate-800"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-[0.2em] mb-1.5">Readers</span>
                                                    <span className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-gray-100">
                                                        <Users className="w-4 h-4 text-rose-500" /> {item._count.bookmarks}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-[2.5rem] bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all mr-2 shadow-inner group-hover:shadow-indigo-900/40 group-hover:scale-110">
                                            <ChevronRight className="w-8 h-8" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Insights & Recent Community */}
                <div className="lg:col-span-4 space-y-12">
                    <section className="bg-white dark:bg-slate-900 rounded-[4rem] p-10 border border-gray-100 dark:border-slate-800 shadow-2xl shadow-gray-200/40 dark:shadow-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[100px] opacity-10 -mr-24 -mt-24"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-10 flex items-center gap-4 italic tracking-tight">
                                <MessageSquare className="w-7 h-7 text-indigo-500" /> Komunitas
                            </h2>

                            {latestComments.length === 0 ? (
                                <div className="text-center py-16 opacity-50 bg-gray-50/50 dark:bg-slate-800 px-6 rounded-[3rem] border border-dashed border-gray-100">
                                    <MessageSquare className="w-12 h-12 mx-auto text-gray-200 mb-4" />
                                    <p className="text-xs text-gray-400 font-black leading-relaxed uppercase tracking-[0.2em]">Belum ada <br />interaksi masuk</p>
                                </div>
                            ) : (
                                <div className="space-y-10">
                                    {latestComments.map(c => (
                                        <div key={c.id} className="group cursor-default animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-800 flex items-center justify-center text-sm font-black text-indigo-600 dark:text-indigo-400 border border-gray-100 dark:border-slate-700 shadow-sm transition-transform group-hover:scale-110">
                                                    {c.user.display_name[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[13px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{c.user.display_name}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50/50 dark:bg-slate-800/50 p-6 rounded-[2rem] border border-transparent group-hover:border-indigo-100 dark:group-hover:border-indigo-900 transition-all mb-3 shadow-inner">
                                                <p className="text-[14px] text-gray-600 dark:text-gray-400 line-clamp-3 leading-relaxed italic font-medium">"{c.content}"</p>
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

                    <section className="bg-indigo-900 rounded-[4rem] p-12 text-white text-left relative overflow-hidden group shadow-3xl shadow-indigo-500/10">
                        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] group-hover:scale-110 transition-transform duration-1000"></div>
                        <div className="relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
                            <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center mb-8 border border-white/10 backdrop-blur-sm group-hover:rotate-6 transition-transform">
                                <Sparkles className="w-8 h-8 text-indigo-200" />
                            </div>
                            <h3 className="text-3xl font-black italic mb-4 leading-tight">Inspirasi Menanti</h3>
                            <p className="text-[12px] text-indigo-300 font-bold uppercase tracking-[0.15em] mb-10 leading-relaxed opacity-90">Setiap kata yang kamu tulis adalah permata bagi pembacamu.</p>
                            <Link href="/admin/editor/tips" className="inline-flex items-center gap-3 bg-white text-indigo-600 px-10 py-4 rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all hover:scale-110 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] active:scale-95 shadow-2xl shadow-black/20">
                                Tips Studio <Sparkles className="w-4 h-4" />
                            </Link>
                        </div>
                    </section>
                </div>
            </div>
        </div>
        </div >
    );
}
