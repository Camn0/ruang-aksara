import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { UserCircle2, Flame, History, Star } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";
import { unstable_cache } from "next/cache";

/**
 * Global cache untuk daftar karya terpopuler.
 * Mengapa: Data ini sama untuk semua pembaca, jadi cukup di-fetch sekali per jam.
 */
const getCachedFavorites = unstable_cache(
    async () => {
        return prisma.karya.findMany({
            orderBy: [{ avg_rating: 'desc' }, { total_views: 'desc' }],
            take: 5
        });
    },
    ['global-favorites'],
    { revalidate: 3600, tags: ['karya-global'] }
);

export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/onboarding');
    }

    // Paralelkan pengambilan data awal untuk mempercepat load page
    const [bookmarksRaw, favoritesRaw, follows] = await Promise.all([
        // Ambil riwayat bookmark (karya yang pernah dibaca beserta bab terakhirnya)
        prisma.bookmark.findMany({
            where: { user_id: session.user.id },
            include: {
                karya: {
                    select: { title: true, penulis_alias: true, id: true, deskripsi: true, cover_url: true, _count: { select: { bab: true } } }
                }
            },
            orderBy: { updated_at: 'desc' },
            take: 5
        }),
        // Ambil favorit hari ini via Cache
        getCachedFavorites(),
        // Ambil karya dari penulis yang di-follow (Rekomendasi)
        prisma.follow.findMany({
            where: { follower_id: session.user.id },
            select: { following_id: true }
        })
    ]);

    const bookmarks = bookmarksRaw as (typeof bookmarksRaw[0] & {
        karya: {
            title: string;
            penulis_alias: string;
            id: string;
            deskripsi: string | null;
            cover_url: string | null;
        }
    })[];

    const favorites = favoritesRaw as (typeof favoritesRaw[0] & {
        cover_url: string | null;
    })[];

    const followingIds = follows.map(f => f.following_id);
    const recommendationsRaw = await prisma.karya.findMany({
        where: { uploader_id: { in: followingIds } },
        orderBy: { total_views: 'desc' },
        take: 5
    });

    const recommendations = recommendationsRaw as (typeof recommendationsRaw[0] & {
        cover_url: string | null;
    })[];

    // Dummy helper untuk cover kosong
    const CoverPlaceholder = ({ title }: { title: string }) => (
        <div className="w-28 h-40 bg-gray-200 dark:bg-slate-800 rounded-lg flex items-center justify-center p-2 text-center text-xs text-gray-500 dark:text-gray-400 shadow-sm shrink-0">
            {title}
        </div>
    );

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
            <header className="px-6 pt-12 pb-4 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black italic">
                        RA
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none">Ruang Aksara</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Hai, {(session.user.name || 'Pembaca').split(' ')[0]}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/profile/${session.user.id}`}>
                        <UserCircle2 className="w-8 h-8 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" />
                    </Link>
                    <LogoutButton />
                </div>
            </header>

            <div className="px-6 py-6 space-y-10 pb-24">

                {/* Section: History Kamu */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Lanjutkan Membaca</h2>
                        </div>
                        <Link href="/library" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Lihat Semua</Link>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {bookmarks.length === 0 ? (
                            <div className="w-full p-6 border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-2xl text-center text-gray-400 dark:text-gray-500 text-sm">
                                Belum ada riwayat.
                            </div>
                        ) : (
                            bookmarks.slice(0, 5).map(b => (
                                <Link key={b.id} href={`/novel/${b.karya.id}/${b.last_chapter}`} className="snap-start shrink-0 w-32 flex flex-col gap-2">
                                    <div className="relative aspect-[2/3] w-32 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                                        {(b.karya as any).cover_url ? (
                                            <img src={(b.karya as any).cover_url} alt={b.karya.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-[10px] text-gray-500 dark:text-gray-400">{b.karya.title}</div>
                                        )}
                                        <div className="absolute bottom-0 inset-x-0 h-1 bg-gray-200 dark:bg-slate-700">
                                            <div className="h-full bg-indigo-600 dark:bg-indigo-500" style={{ width: `${(b.karya as any)._count?.bab > 0 ? Math.round((b.last_chapter / (b.karya as any)._count.bab) * 100) : 0}%` }}></div>
                                        </div>
                                    </div>
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1">{b.karya.title}</h3>
                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 self-start px-2 py-0.5 rounded">Bab {b.last_chapter}</p>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

                {/* Section: Favorit Hari Ini */}
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <Flame className="w-5 h-5 text-orange-500" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Favorit Hari Ini</h2>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {favorites.map(f => (
                            <Link key={f.id} href={`/novel/${f.id}`} className="snap-start shrink-0 w-32 flex flex-col gap-2 relative group">
                                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 z-10 font-bold">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span>{f.avg_rating.toFixed(1)}</span>
                                </div>
                                <div className="aspect-[2/3] w-32 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
                                    {(f as any).cover_url ? (
                                        <img src={(f as any).cover_url} alt={f.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center p-2 text-center text-[10px] text-gray-500 dark:text-gray-400">
                                            {f.title}
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2 mt-1">{f.title}</h3>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Section: Koleksi Bookmark (NEW) */}
                {bookmarks.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Koleksi Bookmark</h2>
                            <Link href="/library" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Terbaru Disimpan</Link>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {bookmarks.slice(0, 4).map(b => (
                                <Link key={b.id} href={`/novel/${b.karya.id}`} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 hover:border-indigo-200 dark:hover:border-indigo-500/50 rounded-2xl p-3 flex gap-3 shadow-sm active:scale-95 transition-all group">
                                    <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0">
                                        {(b.karya as any).cover_url ? (
                                            <img src={(b.karya as any).cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 dark:bg-slate-800" />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-[12px] font-bold text-gray-900 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{b.karya.title}</h4>
                                        <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{b.karya.penulis_alias}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Section: Rekomendasi / Yg Kamu Follow */}
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Dari Penulis Favoritmu</h2>
                        <Link href="/search" className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">Lihat Semua</Link>
                    </div>

                    <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
                        {recommendations.length === 0 ? (
                            <div className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-center text-gray-500 dark:text-gray-400 text-sm">
                                Kamu belum mengikuti penulis manapun.
                            </div>
                        ) : (
                            recommendations.map(r => (
                                <Link key={r.id} href={`/novel/${r.id}`} className="snap-start shrink-0 w-28 flex flex-col gap-2">
                                    {r.cover_url ? (
                                        <img src={r.cover_url} alt={r.title} className="w-28 h-40 object-cover rounded-xl shadow-sm" />
                                    ) : (
                                        <CoverPlaceholder title={r.title} />
                                    )}
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-2">{r.title}</h3>
                                </Link>
                            ))
                        )}
                    </div>
                </section>

            </div>
        </div>
    );
}
