import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import Link from "next/link";
import RatingForm from "./RatingForm";
import ReviewForm from "./ReviewForm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

// Mengapa: Ini adalah halaman Detail Karya berbasis RSC.
// Di sinilah pembaca bisa melihat daftar isi sebelum memutuskan membaca baris per baris teks novel.
export default async function KaryaDetailsPage({ params }: { params: { karyaId: string } }) {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Fetch karya spesifik beserta agregat bab dan relasi
    const karya = await prisma.karya.findUnique({
        where: { id: params.karyaId },
        include: {
            bab: {
                orderBy: { chapter_no: 'asc' }, // Urutkan bab dari 1,2,3 dst.
            },
            genres: true, // Ambil relasi genre karya
            reviews: {
                include: { user: true },
                orderBy: { created_at: 'desc' }
            }
        }
    });

    if (!karya) {
        notFound();
    }

    // Mengapa: Cek apakah user (jika sedang login) sudah pernah rating karya ini sebelumnya.
    let userPreviousRating = 0;
    let userPreviousReview = null;

    if (userId) {
        const ratingContext = await prisma.rating.findUnique({
            where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
        });
        if (ratingContext) userPreviousRating = ratingContext.score;

        userPreviousReview = await prisma.review.findUnique({
            where: { user_id_karya_id: { user_id: userId, karya_id: karya.id } }
        });
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Bagian Atas: Metadata Karya */}
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                    {/* Placeholder sampul buku (Bisa diganti image Next/Image nanti) */}
                    <div className="w-48 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg flex-shrink-0 flex items-center justify-center text-white/20">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path></svg>
                    </div>

                    <div className="flex-1 w-full">
                        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight">
                            {karya.title}
                        </h1>
                        <p className="text-xl text-gray-600 font-medium mb-6 uppercase tracking-widest text-sm">
                            Karya <span className="text-indigo-600">{karya.penulis_alias}</span>
                        </p>

                        <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-6 text-sm font-semibold tracking-wide">
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full flex items-center shadow-sm">
                                ★ {karya.avg_rating.toFixed(1)} / 5.0
                            </span>
                            <span className="bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full flex items-center shadow-sm">
                                📚 {karya.bab.length} Bab
                            </span>
                            <span className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full flex items-center shadow-sm">
                                👁 {karya.total_views} Pembaca
                            </span>
                        </div>

                        {/* Menampilkan Tag Genre */}
                        {karya.genres && karya.genres.length > 0 && (
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                                {karya.genres.map((g) => (
                                    <span key={g.id} className="text-sm bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-md font-medium">
                                        {g.name}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Mengapa: Memberi pembaca komponen rating di level halaman utama bukan per bab. */}
                        {session ? (
                            <div className="flex flex-col gap-4">
                                <RatingForm karyaId={karya.id} defaultScore={userPreviousRating} />
                            </div>
                        ) : (
                            <div className="bg-indigo-50 text-indigo-700 p-4 rounded-xl border border-indigo-100 text-sm">
                                <Link href="/api/auth/signin" className="font-bold underline">Masuk</Link> untuk memberikan dukungan rating dan ulasan pada karya ini.
                            </div>
                        )}
                    </div>
                </div>

                {/* Epic 8: Kolom Tulis Ulasan (Hanya muncul jika login) */}
                {session && (
                    <ReviewForm karyaId={karya.id} existingReview={userPreviousReview} />
                )}

                {/* Epic 8: Tampilan Daftar Ulasan (Reviews) */}
                {karya.reviews.length > 0 && (
                    <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Ulasan Pembaca Pilihan</h2>
                        <div className="space-y-6">
                            {karya.reviews.map(r => (
                                <div key={r.id} className="p-6 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-indigo-700">{r.user.display_name}</span>
                                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded flex gap-1 font-bold">
                                                ★ {r.rating}
                                            </span>
                                        </div>
                                        <time className="text-xs text-gray-400">
                                            {r.created_at.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </time>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                        {r.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bagian Bawah: Daftar Bab / Daftar Isi */}
                <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">Daftar Isi</h2>

                    {karya.bab.length === 0 ? (
                        <p className="text-gray-500 italic py-8 text-center bg-gray-50 rounded-lg">
                            Penulis belum mempublikasikan bab apapun untuk karya ini.
                        </p>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {karya.bab.map((chapter: any) => (
                                <Link
                                    key={chapter.id}
                                    href={`/novel/${karya.id}/${chapter.chapter_no}`}
                                    className="group relative flex items-center p-4 rounded-xl border border-gray-200 hover:border-indigo-400 hover:shadow-md bg-gray-50 hover:bg-white transition-all overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 transform scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom"></div>
                                    <div className="pl-4">
                                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                                            Bab {chapter.chapter_no}
                                        </h3>
                                        {/* Menampilkan sedikit snippet konten agar menarik (Max 30 karakter) */}
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                                            {chapter.content.substring(0, 40)}...
                                        </p>
                                    </div>
                                    <div className="ml-auto text-indigo-300 group-hover:text-indigo-600 transition-colors">
                                        ➔
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
