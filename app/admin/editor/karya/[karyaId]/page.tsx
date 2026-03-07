import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import CreateBabForm from "./CreateBabForm";
import DeleteKaryaButton from "./DeleteKaryaButton";
import DeleteBabButton from "./DeleteBabButton";
import EditBabForm from "./EditBabForm";
import EditKaryaForm from "./EditKaryaForm";

import { prisma } from '@/lib/prisma';

export default async function AdminManageKaryaPage({ params }: { params: { karyaId: string } }) {
    // [1] VALIDASI ROUTE \& AUTENTIKASI (PROTEKSI HALAMAN)
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

    // [2] Fetch Data Karya & Daftar Bab Terkait
    const karya = await prisma.karya.findUnique({
        where: { id: params.karyaId },
        include: {
            genres: true,
            bab: {
                orderBy: { chapter_no: 'asc' }
            }
        }
    });

    const allGenres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });

    if (!karya) {
        notFound();
    }

    // Mengapa: Memastikan author hanya bisa mengelola karyanya sendiri. Admin God Account bebas merubah.
    if (karya.uploader_id !== session.user.id && session.user.role !== 'admin') {
        return (
            <div className="p-8 text-center text-red-600 font-bold">
                Unauthorized: Anda tidak memiliki akses ke karya ini.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Header / Navigasi */}
            <header className="px-6 h-14 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                <Link href="/admin/dashboard" className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
                    <span className="font-bold text-lg">&larr;</span>
                </Link>
                <h1 className="font-bold text-lg text-gray-900 absolute left-1/2 -translate-x-1/2 w-48 text-center truncate">
                    {karya.title}
                </h1>
                <DeleteKaryaButton karyaId={karya.id} />
            </header>

            <div className="p-6 space-y-6">
                {/* Info Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <p className="text-xs text-gray-500 uppercase font-black tracking-wider mb-2">Manajemen Karya</p>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">{karya.title}</h2>
                    <p className="text-sm text-gray-600 mb-4">Oleh {karya.penulis_alias}</p>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {karya.genres.map(g => (
                            <span key={g.id} className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold px-2 py-1 rounded">{g.name}</span>
                        ))}
                        {karya.is_completed && <span className="bg-green-100 text-green-700 text-[10px] uppercase font-bold px-2 py-1 rounded">Tamat</span>}
                    </div>

                    {/* Form Kelola Meta & Gambar */}
                    <EditKaryaForm karya={karya} allGenres={allGenres} />
                </div>

                {/* Section Bab */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="font-black text-lg text-gray-900 mb-4">Daftar Isi Lengkap</h3>
                        <CreateBabForm karyaId={karya.id} />
                    </div>

                    <div className="p-6">
                        {karya.bab.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">Belum ada bab yang dirilis.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {karya.bab.map((chapter) => (
                                    <div key={chapter.id} className="border border-gray-100 bg-gray-50 rounded-2xl p-4 flex flex-col gap-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-indigo-600 text-white font-black rounded-lg w-10 h-10 flex items-center justify-center shrink-0">
                                                    {chapter.chapter_no}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-900">Bab {chapter.chapter_no}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                                        {chapter.content.replace(/<[^>]*>?/gm, '').substring(0, 50)}...
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <DeleteBabButton babId={chapter.id} />
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <div className="flex-1">
                                                <EditBabForm babId={chapter.id} initialContent={chapter.content} />
                                            </div>
                                            <Link
                                                href={`/novel/${karya.id}/${chapter.chapter_no}`}
                                                className="px-4 py-2 border border-gray-200 text-gray-700 bg-white rounded-xl font-bold text-sm hover:bg-gray-50 transition flex items-center justify-center shrink-0 shadow-sm"
                                            >
                                                Baca
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
