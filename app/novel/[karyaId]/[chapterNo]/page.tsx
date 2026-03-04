import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import CommentForm from './CommentForm';
import DeleteCommentButton from './DeleteCommentButton';
import { redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// Mengapa: Ini adalah halaman dinamis RSC (React Server Component).
// Di Next.js 14, props 'params' dikirim secara default untuk menangkap segmen URL.
export default async function NovelChapterPage({
    params,
}: {
    params: { karyaId: string; chapterNo: string };
}) {
    // [A] Fetching Data Paralel Lanjut (Pencarian Bab dan Relasinya)
    // Mengapa: Kita menggunakan include untuk *eager loading*, menarik 1 Bab lengkap
    // beserta parent (Karya-nya untuk judul) dan sekumpulan anaknya (Comment-nya).
    // Ini mencegah *N+1 query problem*, mengurangi beban komunikasi antara Node Server dan Database Server.
    const bab = await prisma.bab.findUnique({
        where: {
            karya_id_chapter_no: {
                karya_id: params.karyaId,
                chapter_no: Number(params.chapterNo),
            },
        },
        include: {
            karya: true,
            comments: {
                where: { parent_id: null }, // Mengapa: Hanya fetch Root Comments.
                include: {
                    user: true,
                    replies: {
                        include: { user: true },
                        orderBy: { created_at: 'asc' }
                    }
                },
                orderBy: { created_at: 'asc' },
            },
        },
    });

    // Mengapa: Pendekatan _Fail Fast_. Jika God Account belum mengunggah bab tersebut,
    // langsung tampilkan halaman 404 (Not Found) yang bersih.
    if (!bab) {
        notFound();
    }

    // [B] Background Job: Increment View Counter di Redis
    // Mengapa: Menambah view langsung ke PostgreSQL setiap kali dibaca akan membebani database.
    // Kita menampungnya sementara di Redis yang jauh lebih cepat untuk caching in-memory.
    try {
        await redis.incr(`views:karya:${params.karyaId}`);
    } catch (e) {
        console.error("Redis Error: Gagal increment views", e);
    }

    // [C] Navigasi Bab (Next/Prev)
    const currentNo = Number(params.chapterNo);

    // Cari bab selanjutnya (jika nomornya melompat misal 1 -> 3)
    const nextBab = await prisma.bab.findFirst({
        where: { karya_id: params.karyaId, chapter_no: { gt: currentNo } },
        orderBy: { chapter_no: 'asc' }
    });

    const prevBab = await prisma.bab.findFirst({
        where: { karya_id: params.karyaId, chapter_no: { lt: currentNo } },
        orderBy: { chapter_no: 'desc' }
    });

    // [D] Epic 7: Auto-Bookmark / Riwayat Baca
    // Mengapa: Saat user membaca halaman ini, kita langsung catat di database
    // sehingga riwayatnya akan muncul di dashboard mereka nanti.
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        try {
            await prisma.bookmark.upsert({
                where: {
                    user_id_karya_id: {
                        user_id: session.user.id,
                        karya_id: params.karyaId
                    }
                },
                update: { last_chapter: currentNo },
                create: {
                    user_id: session.user.id,
                    karya_id: params.karyaId,
                    last_chapter: currentNo
                }
            });
        } catch (e) {
            console.error("Bookmark Error:", e);
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-800 font-serif">
            <div className="max-w-3xl mx-auto px-6 py-12">

                {/* Header Bab */}
                <header className="mb-12 text-center border-b pb-8 relative">
                    <a href={`/novel/${params.karyaId}`} className="absolute left-0 top-0 text-gray-400 hover:text-indigo-600 text-sm font-sans tracking-wide">
                        &larr; Daftar Isi
                    </a>
                    <h1 className="text-sm tracking-widest text-gray-500 uppercase mb-3 mt-6 sm:mt-0">
                        {bab.karya.title}
                    </h1>
                    <h2 className="text-4xl font-bold font-sans text-gray-900 leading-tight">
                        Bab {bab.chapter_no}
                    </h2>
                </header>

                {/* Konten Utama Novel */}
                {/* Mengapa: text-xl (Epic 7) memberikan UX membaca yang lebih baik untuk mata, seperti e-reader profesional */}
                <article className="prose prose-xl prose-indigo mx-auto text-justify leading-relaxed whitespace-pre-wrap text-gray-800">
                    {bab.content}
                </article>

                {/* Navigasi Bab */}
                <div className="flex justify-between items-center mt-16 pt-8 border-t border-gray-200 font-sans">
                    {prevBab ? (
                        <a href={`/novel/${params.karyaId}/${prevBab.chapter_no}`} className="flex flex-col items-start hover:text-indigo-600 transition-colors">
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Bab Sebelumnya</span>
                            <span className="font-bold text-lg">Bab {prevBab.chapter_no}</span>
                        </a>
                    ) : (
                        <div></div>
                    )}

                    <a href={`/novel/${params.karyaId}`} className="px-6 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-full font-bold text-sm transition-colors">
                        Daftar Isi
                    </a>

                    {nextBab ? (
                        <a href={`/novel/${params.karyaId}/${nextBab.chapter_no}`} className="flex flex-col items-end hover:text-indigo-600 transition-colors">
                            <span className="text-xs text-gray-400 uppercase tracking-widest">Bab Selanjutnya</span>
                            <span className="font-bold text-lg">Bab {nextBab.chapter_no}</span>
                        </a>
                    ) : (
                        <div className="flex flex-col items-end text-gray-300 cursor-not-allowed">
                            <span className="text-xs uppercase tracking-widest">Bab Selanjutnya</span>
                            <span className="font-bold text-lg">Belum Tersedia</span>
                        </div>
                    )}
                </div>

                <hr className="my-16 border-gray-300" />

                {/* Bagian Komentar */}
                <section>
                    <h3 className="font-sans font-bold text-2xl mb-6 text-gray-800">
                        Ruang Diskusi Pembaca ({bab.comments.length})
                    </h3>

                    {/* Render List Komentar yang sudah ditarik secara Server-Side */}
                    <div className="space-y-6">
                        {bab.comments.length === 0 ? (
                            <p className="text-gray-500 italic font-sans text-sm pb-4">
                                Jadilah yang pertama memberikan apresiasi pada bab ini.
                            </p>
                        ) : (
                            bab.comments.map((rootComment) => (
                                <div key={rootComment.id} className="flex flex-col gap-4">
                                    {/* Root Comment */}
                                    <div className="bg-white p-5 rounded border shadow-sm font-sans flex flex-col gap-2">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                            <strong className="text-indigo-600 font-semibold">{rootComment.user.display_name}</strong>
                                            <div className="flex items-center">
                                                <time className="text-xs text-gray-400">
                                                    {new Date(rootComment.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                                                </time>
                                                {(session?.user?.id === rootComment.user_id || session?.user?.role === 'admin') && (
                                                    <DeleteCommentButton commentId={rootComment.id} />
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed mt-1">
                                            {rootComment.content}
                                        </p>
                                        <div className="mt-2 text-right">
                                            <CommentForm babId={bab.id} parentId={rootComment.id} isReply={true} />
                                        </div>
                                    </div>

                                    {/* Replies (Nested) */}
                                    {rootComment.replies && rootComment.replies.length > 0 && (
                                        <div className="pl-8 border-l-2 border-indigo-100 space-y-4">
                                            {rootComment.replies.map((reply: any) => (
                                                <div key={reply.id} className="bg-gray-50 p-4 rounded border border-gray-200 shadow-sm font-sans flex flex-col gap-2">
                                                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                                                        <strong className="text-gray-700 font-semibold text-sm">↳ {reply.user.display_name}</strong>
                                                        <div className="flex items-center">
                                                            <time className="text-xs text-gray-400">
                                                                {new Date(reply.created_at).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
                                                            </time>
                                                            {(session?.user?.id === reply.user_id || session?.user?.role === 'admin') && (
                                                                <DeleteCommentButton commentId={reply.id} />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-gray-600 whitespace-pre-wrap text-sm mt-1">
                                                        {reply.content}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    {/* Mengapa: Form Utama di Bawah */}
                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h4 className="font-bold font-sans text-lg mb-4">Tulis Komentar Baru</h4>
                        <CommentForm babId={bab.id} />
                    </div>
                </section>

            </div>
        </div>
    );
}
