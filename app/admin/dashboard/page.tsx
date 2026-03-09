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

                <div className="max-w-5xl mx-auto relative z-10">
                    <div className="flex justify-between items-center mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl flex items-center justify-center text-white font-black italic shadow-2xl shadow-indigo-200 dark:shadow-none">
                                RA
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none mb-1">Studio Penulis</h1>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em]">{session.user.role === 'admin' ? 'Administrator' : 'Author'}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-slate-700"></span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{session.user.name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 items-center">
                            {session.user.role === 'admin' && (
                                <Link href="/admin/genre" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm">
                                    <Settings className="w-5 h-5" />
                                </Link>
                            )}
                            <Link href={`/profile/${session.user.id}`} className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-indigo-600 hover:bg-white transition-all shadow-sm">
                                <UserCircle2 className="w-5 h-5" />
                            </Link>
                            <LogoutButton />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/50 dark:shadow-none group hover:scale-[1.02] transition-all">
                            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl w-fit mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Engagement</p>
                            <div className="flex items-baseline gap-1 px-1">
                                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalViews.toLocaleString()}</p>
                                <span className="text-[10px] font-bold text-gray-400">Views</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/50 dark:shadow-none group hover:scale-[1.02] transition-all">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-900/30 rounded-xl w-fit mb-4 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                                <Star className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Kepuasan</p>
                            <div className="flex items-baseline gap-1 px-1">
                                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{avgRating.toFixed(1)}</p>
                                <span className="text-[10px] font-bold text-gray-400">Stars</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/50 dark:shadow-none group hover:scale-[1.02] transition-all">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-900/30 rounded-xl w-fit mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
                                <Bookmark className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Disimpan</p>
                            <div className="flex items-baseline gap-1 px-1">
                                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{totalBookmarks.toLocaleString()}</p>
                                <span className="text-[10px] font-bold text-gray-400">Saves</span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/50 dark:shadow-none group hover:scale-[1.02] transition-all">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl w-fit mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-1 px-1">Koleksi</p>
                            <div className="flex items-baseline gap-1 px-1">
                                <p className="text-3xl font-black text-gray-900 dark:text-gray-100">{daftarKarya.length}</p>
                                <span className="text-[10px] font-bold text-gray-400">Karya</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 mt-16 grid lg:grid-cols-12 gap-10">
                {/* Main Content: Story Management */}
                <div className="lg:col-span-8 space-y-10">
                    <section>
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 italic tracking-tight">Karya Anda</h2>
                            <Link href="/admin/editor/karya" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.1em] flex items-center gap-2 shadow-2xl shadow-indigo-200 dark:shadow-none transition-all active:scale-95 group">
                                <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" /> Karya Baru
                            </Link>
                        </div>

                        {daftarKarya.length === 0 ? (
                            <div className="text-center p-20 bg-white dark:bg-slate-900 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-[3rem] shadow-xl shadow-gray-100/30">
                                <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <PenTool className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="font-black text-lg text-gray-900 dark:text-gray-100 mb-2">Belum Ada Karya</h3>
                                <p className="text-gray-400 dark:text-gray-500 text-sm font-bold mb-8 max-w-xs mx-auto">Mulailah menulis mahakarya pertamamu dan temukan pembaca setiamu.</p>
                                <Link href="/admin/editor/karya" className="inline-block bg-indigo-600 text-white px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                                    Mulai Menulis
                                </Link>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {daftarKarya.map((item) => (
                                    <Link key={item.id} href={`/admin/editor/karya/${item.id}`} className="group bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-xl shadow-gray-100/50 dark:shadow-none transition-all flex gap-6 items-center active:scale-[0.98]">
                                        <div className="w-24 h-32 rounded-3xl overflow-hidden shrink-0 shadow-2xl border border-gray-50 dark:border-slate-800">
                                            {item.cover_url ? (
                                                <img src={item.cover_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-[10px] text-gray-400 font-black uppercase text-pretty">{item.title}</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-black text-gray-900 dark:text-gray-100 text-xl leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h3>
                                                {item.is_completed && <span className="bg-emerald-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-200 dark:shadow-none uppercase tracking-widest">Tamat</span>}
                                            </div>
                                            <p className="text-xs text-indigo-500 dark:text-indigo-400 font-black mb-5 uppercase tracking-[0.1em]">{item.penulis_alias}</p>

                                            <div className="flex gap-4 items-center">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter mb-1">Views</span>
                                                    <span className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-gray-100">
                                                        <BarChart3 className="w-3.5 h-3.5 text-indigo-500" /> {item.total_views.toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="w-[1px] h-6 bg-gray-100 dark:bg-slate-800"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter mb-1">Chapters</span>
                                                    <span className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-gray-100">
                                                        <BookOpen className="w-3.5 h-3.5 text-emerald-500" /> {item._count.bab}
                                                    </span>
                                                </div>
                                                <div className="w-[1px] h-6 bg-gray-100 dark:bg-slate-800"></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-tighter mb-1">Readers</span>
                                                    <span className="flex items-center gap-1.5 text-xs font-black text-gray-900 dark:text-gray-100">
                                                        <Users className="w-3.5 h-3.5 text-rose-500" /> {item._count.bookmarks}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 rounded-3xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all mr-2 shadow-inner group-hover:shadow-indigo-900/40">
                                            <ChevronRight className="w-8 h-8" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>
                </div>

                {/* Sidebar: Insights & Recent Community */}
                <div className="lg:col-span-4 space-y-10">
                    <section className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/50 dark:shadow-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[60px] opacity-10 -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-8 flex items-center gap-3 italic">
                                <MessageSquare className="w-6 h-6 text-indigo-500" /> Komunitas
                            </h2>

                            {latestComments.length === 0 ? (
                                <div className="text-center py-10 opacity-50">
                                    <MessageSquare className="w-10 h-10 mx-auto text-gray-200 mb-4" />
                                    <p className="text-xs text-gray-400 font-bold leading-relaxed uppercase tracking-tighter">Sunyi senyap...<br />Belum ada interaksi</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {latestComments.map(c => (
                                        <div key={c.id} className="group cursor-default animate-in fade-in slide-in-from-right-4 duration-500">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-slate-800 dark:to-slate-800 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-indigo-400 border border-indigo-100/50 dark:border-slate-700 shadow-sm">
                                                    {c.user.display_name[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">{c.user.display_name}</span>
                                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 transition-colors mb-2">
                                                <p className="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-3 leading-relaxed italic">"{c.content}"</p>
                                            </div>
                                            <Link href={`/novel/${c.bab.karya.id}`} className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-[0.1em] hover:text-indigo-600 flex items-center gap-1.5 ml-1">
                                                <BookOpen className="w-3 h-3" /> {c.bab.karya.title}
                                            </Link>
                                        </div>
                                    ))}
                                    <Link href="/admin/community" className="w-full text-center py-4 bg-gray-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em] hover:bg-indigo-600 hover:text-white transition-all block mt-6">Manajemen Komentar</Link>
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="bg-gradient-to-br from-indigo-900 to-indigo-950 rounded-[3rem] p-10 text-white relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent)]"></div>
                        <h3 className="text-2xl font-black italic mb-3 leading-tight relative z-10">Inspirasi Menanti</h3>
                        <p className="text-[11px] text-indigo-300 font-bold uppercase tracking-[0.1em] mb-8 leading-relaxed relative z-10">Setiap kata yang kamu tulis adalah permata bagi pembacamu.</p>
                        <Link href="/admin/editor/tips" className="inline-flex items-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3.5 rounded-full font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-black/20 relative z-10">
                            Tips Studio <Sparkles className="w-4 h-4" />
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}
