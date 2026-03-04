import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";

const prisma = new PrismaClient();

// Mengapa: Dashboard khusus untuk user/pembaca biasa. Menampilkan riwayat baca (bookmark) mereka.
export default async function UserDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/api/auth/signin');
    }

    // Ambil riwayat bookmark (karya yang pernah dibaca beserta bab terakhirnya)
    const bookmarks = await prisma.bookmark.findMany({
        where: { user_id: session.user.id },
        include: {
            karya: {
                select: { title: true, penulis_alias: true, id: true }
            }
        },
        orderBy: { updated_at: 'desc' }
    });

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8">

                <header className="flex justify-between items-center mb-8 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">Dashboard Pembaca</h1>
                        <p className="text-gray-500 mt-1">Selamat datang, {session.user.name}</p>
                    </div>
                </header>

                <section>
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>📚</span> Riwayat Bacaan Terakhir
                    </h2>

                    {bookmarks.length === 0 ? (
                        <div className="text-center p-12 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                            <p className="text-gray-500 italic mb-4">Anda belum mulai membaca mahakarya apapun.</p>
                            <Link href="/novel" className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition">
                                Mulai Eksplorasi
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {bookmarks.map(b => (
                                <div key={b.id} className="p-5 border border-gray-200 rounded-xl hover:shadow-md transition bg-white flex flex-col h-full">
                                    <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight line-clamp-1">
                                        {b.karya.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4">Oleh {b.karya.penulis_alias}</p>

                                    <div className="mt-auto pt-4 border-t flex items-center justify-between">
                                        <span className="text-sm font-medium text-gray-600">
                                            Terakhir: <span className="text-gray-900">Bab {b.last_chapter}</span>
                                        </span>
                                        <Link
                                            href={`/novel/${b.karya.id}/${b.last_chapter}`}
                                            className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition"
                                        >
                                            Lanjutkan &rarr;
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

            </div>
        </div>
    );
}
