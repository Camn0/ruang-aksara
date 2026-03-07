import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCircle2, Settings, TrendingUp, Star, PenTool } from "lucide-react";
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
                select: { bookmarks: true }
            }
        }
    });

    // Cast to include all schema fields (cover_url, is_completed, deskripsi may not appear in stale Prisma types)
    const daftarKarya = daftarKaryaRaw as (typeof daftarKaryaRaw[0] & {
        cover_url: string | null;
        is_completed: boolean;
        deskripsi: string | null;
    })[];

    // Hitung agregat statistik global untuk admin/author ini
    const totalViews = daftarKarya.reduce((acc, k) => acc + k.total_views, 0);
    const totalBookmarks = daftarKarya.reduce((acc, k) => acc + k._count.bookmarks, 0);
    const karyaWithRating = daftarKarya.filter(k => k.avg_rating > 0);
    const avgRating = karyaWithRating.length > 0
        ? karyaWithRating.reduce((acc, k) => acc + k.avg_rating, 0) / karyaWithRating.length
        : 0;

    const CoverPlaceholder = ({ title }: { title: string }) => (
        <div className="w-20 h-28 bg-gray-200 rounded-lg flex items-center justify-center p-2 text-center text-[10px] text-gray-500 shadow-sm shrink-0">
            {title}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">
                            RA
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-none">Ruang Aksara</h1>
                            <p className="text-sm text-gray-500 capitalize">{session.user.role}</p>
                        </div>
                    </div>
                    <div className="flex gap-2 items-center">
                        {session.user.role === 'admin' && (
                            <Link href="/admin/genre">
                                <Settings className="w-8 h-8 p-1 text-gray-400 hover:text-gray-600" />
                            </Link>
                        )}
                        <Link href={`/profile/${session.user.id}`}>
                            <UserCircle2 className="w-8 h-8 text-gray-400 hover:text-indigo-600 transition-colors" />
                        </Link>
                        <LogoutButton />
                    </div>
                </div>

                {/* Global Stats Menu */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100/50 flex flex-col justify-center items-center text-center">
                        <div className="flex gap-1.5 items-center text-indigo-600 mb-1">
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold text-xs">Total Views</span>
                        </div>
                        <p className="text-xl font-black text-gray-900">{totalViews.toLocaleString()}</p>
                    </div>
                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100/50 flex flex-col justify-center items-center text-center">
                        <div className="flex gap-1.5 items-center text-orange-600 mb-1">
                            <Star className="w-4 h-4" />
                            <span className="font-semibold text-xs">Avg Rating</span>
                        </div>
                        <p className="text-xl font-black text-gray-900">{avgRating.toFixed(1)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100/50 flex flex-col justify-center items-center text-center">
                        <div className="flex gap-1.5 items-center text-emerald-600 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg>
                            <span className="font-semibold text-xs">Bookmarks</span>
                        </div>
                        <p className="text-xl font-black text-gray-900">{totalBookmarks.toLocaleString()}</p>
                    </div>
                </div>
            </header>

            {/* List Karya */}
            <div className="px-6 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Cerita Anda</h2>
                    {/* Tombol Tulis dipindah ke Bottom Nav, tapi sediakan link teks disini sbg helper */}
                    <Link href="/admin/editor/karya" className="text-indigo-600 text-sm font-semibold flex items-center gap-1">
                        <PenTool className="w-4 h-4" /> Buat Baru
                    </Link>
                </div>

                {daftarKarya.length === 0 ? (
                    <div className="text-center p-8 bg-white border border-dashed border-gray-200 rounded-2xl">
                        <p className="text-gray-500 text-sm mb-4">Belum ada karya yang diunggah.</p>
                        <Link href="/admin/editor/karya" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-indigo-200">
                            Mulai Menulis
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {daftarKarya.map((item) => (
                            <Link key={item.id} href={`/admin/editor/karya/${item.id}`} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4 items-start hover:border-indigo-200 transition-colors active:scale-95">
                                {item.cover_url ? (
                                    <img src={item.cover_url} alt={item.title} className="w-20 h-28 object-cover rounded-lg shrink-0" />
                                ) : (
                                    <CoverPlaceholder title={item.title} />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-gray-900 text-base leading-tight line-clamp-2 pr-2">{item.title}</h3>
                                        {item.is_completed && (
                                            <span className="bg-green-100 text-green-700 text-[10px] uppercase font-black px-2 py-0.5 rounded shrink-0">Tamat</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">Oleh {item.penulis_alias}</p>

                                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-3">
                                        {item.deskripsi || "Belum ada deskripsi."}
                                    </p>

                                    <div className="flex gap-3 text-[10px] font-bold text-gray-400 mt-auto">
                                        <span className="flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> {item.avg_rating.toFixed(1)}</span>
                                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {item.total_views}</span>
                                        <span className="flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bookmark"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" /></svg> {item._count.bookmarks}</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
