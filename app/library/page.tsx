import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookMarked, Settings, History as HistoryIcon } from "lucide-react";

import { prisma } from '@/lib/prisma';

export default async function LibraryPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/onboarding');
    }

    // Ambil riwayat bookmark (yang juga berfungsi sebagai history)
    const bookmarksRaw = await prisma.bookmark.findMany({
        where: { user_id: session.user.id },
        include: {
            karya: {
                select: { title: true, penulis_alias: true, id: true, cover_url: true, is_completed: true, deskripsi: true }
            }
        },
        orderBy: { updated_at: 'desc' }
    });

    // Cast as per other pages to avoid stale type issues
    const bookmarks = bookmarksRaw as (typeof bookmarksRaw[0] & {
        karya: {
            title: string;
            penulis_alias: string;
            id: string;
            cover_url: string | null;
            is_completed: boolean;
            deskripsi: string | null;
        }
    })[];

    const CoverPlaceholder = ({ title }: { title: string }) => (
        <div className="w-20 h-28 bg-indigo-50 rounded-lg flex items-center justify-center p-2 text-center text-[10px] text-indigo-700 shadow-sm shrink-0 border border-indigo-100">
            {title}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header */}
            <header className="px-6 pt-12 pb-6 bg-white sticky top-0 z-20 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <Link href="/" className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="font-black text-xl text-gray-900">Perpustakaan</h1>
                    <div className="w-10"></div>
                </div>
            </header>

            <div className="px-6 py-8">
                {bookmarks.length === 0 ? (
                    <div className="text-center py-24 px-8 border border-dashed border-gray-200 rounded-3xl bg-white">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <BookMarked className="w-8 h-8 text-gray-400" />
                        </div>
                        <h2 className="font-bold text-gray-900 mb-2">Belum ada koleksi</h2>
                        <p className="text-sm text-gray-500 mb-6 leading-relaxed">Mulai simpan karya favoritmu untuk dibaca nanti.</p>
                        <Link href="/search" className="bg-indigo-600 px-6 py-3 rounded-full text-white font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-200">
                            Cari Cerita
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {/* Sedang Dibaca / History */}
                        <section>
                            <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                                <HistoryIcon className="w-4 h-4 text-indigo-600" /> Lanjutkan Membaca
                            </h2>
                            <div className="flex flex-col gap-3">
                                {bookmarks.slice(0, 3).map(b => (
                                    <Link key={b.id} href={`/novel/${b.karya.id}/${b.last_chapter}`} className="bg-white border border-gray-100 rounded-2xl p-3 shadow-sm hover:border-indigo-200 transition-all flex gap-4">
                                        {b.karya.cover_url ? (
                                            <img src={b.karya.cover_url} alt={b.karya.title} className="w-20 h-28 object-cover rounded-lg shrink-0 shadow-sm" />
                                        ) : (
                                            <CoverPlaceholder title={b.karya.title} />
                                        )}
                                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 mb-1">{b.karya.title}</h3>
                                                <p className="text-[10px] text-gray-500">Terakhir: Bab {b.last_chapter}</p>
                                            </div>
                                            <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-600" style={{ width: '45%' }}></div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>

                        {/* Semua Koleksi */}
                        <section>
                            <h2 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                                <BookMarked className="w-4 h-4 text-indigo-600" /> Semua Koleksi
                            </h2>
                            <div className="grid grid-cols-3 gap-3">
                                {bookmarks.map(b => (
                                    <Link key={b.id} href={`/novel/${b.karya.id}`} className="group">
                                        <div className="aspect-[2/3] relative rounded-xl overflow-hidden shadow-sm border border-gray-100 mb-2">
                                            {b.karya.cover_url ? (
                                                <img src={b.karya.cover_url} alt={b.karya.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center p-2 text-center text-[8px] text-gray-500">{b.karya.title}</div>
                                            )}
                                        </div>
                                        <h3 className="text-[10px] font-bold text-gray-900 line-clamp-1">{b.karya.title}</h3>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
}
