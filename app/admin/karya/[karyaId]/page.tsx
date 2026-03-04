import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import CreateBabForm from "./CreateBabForm";
import DeleteKaryaButton from "./DeleteKaryaButton";
import DeleteBabButton from "./DeleteBabButton";
import EditBabForm from "./EditBabForm";
import EditKaryaForm from "./EditKaryaForm";

const prisma = new PrismaClient();

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
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8 space-y-8">

                {/* Header \& Navigasi */}
                <header>
                    <Link href="/admin/dashboard" className="text-indigo-600 hover:underline text-sm font-medium mb-4 inline-block">
                        &larr; Kembali ke Dashboard
                    </Link>
                    <div className="flex justify-between items-start mt-2 border-b pb-6">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
                                Kelola: {karya.title}
                            </h1>
                            <p className="text-gray-500 mt-1">Penulis: <span className="font-semibold text-gray-800">{karya.penulis_alias}</span></p>
                        </div>
                        <div className="text-right text-sm flex flex-col items-end gap-2">
                            <span className="block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg">
                                ID: {karya.id}
                            </span>
                            <DeleteKaryaButton karyaId={karya.id} />
                        </div>
                    </div>
                </header>

                {/* Form Edit Meta Karya */}
                <EditKaryaForm karya={karya} allGenres={allGenres} />

                {/* Form Tambah Bab */}
                {/* Mengapa: Form di-*render* secara lokal lewat Client Component */}
                <CreateBabForm karyaId={karya.id} />

                {/* Daftar Bab yang sudah ada */}
                <section className="pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Daftar Bab Tersedia</h2>

                    {karya.bab.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500 italic">Belum ada bab yang dipublikasikan.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {karya.bab.map((chapter) => (
                                <div key={chapter.id} className="bg-white border text-sm border-gray-200 rounded-lg p-5 flex justify-between items-center hover:shadow-md transition">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-indigo-100 text-indigo-800 font-bold rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0">
                                            {chapter.chapter_no}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-800">Bab {chapter.chapter_no}</h3>
                                            <p className="text-gray-500 line-clamp-1 mt-1 max-w-lg">
                                                {chapter.content.substring(0, 100)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex gap-2">
                                        <EditBabForm babId={chapter.id} initialContent={chapter.content} />
                                        <Link
                                            href={`/novel/${karya.id}/${chapter.chapter_no}`}
                                            className="px-4 py-2 border border-blue-200 text-blue-600 rounded bg-blue-50 hover:bg-blue-100 font-medium transition"
                                        >
                                            Pratinjau
                                        </Link>
                                        <DeleteBabButton babId={chapter.id} />
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
