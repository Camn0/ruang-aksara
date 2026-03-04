import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import CreateKaryaForm from "./CreateKaryaForm";
import CreateAuthorForm from "./CreateAuthorForm";
import Link from "next/link";

const prisma = new PrismaClient();

// Mengapa: Ini adalah React Server Component (RSC), secara *default* Next.js me-render 
// eksekusi Async di sisi peladen, membuatnya ideal untuk Query Database Database tanpa mengekspos API.
export default async function AdminDashboardPage() {

    // [1] VALIDASI ROUTE \& AUTENTIKASI (PROTEKSI HALAMAN)
    // Mengapa: Session JWT divalidasi langsung di server Node.js *sebelum* merender HTML.
    const session = await getServerSession(authOptions);

    // Mengapa: Jika pengunjung belum login ATAU tidak punya izin panel, kita "paksa"
    // browser untuk Redirect (HTTP 307/308) ke halaman Beranda agar dasbor tidak bocor.
    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

    // [2] FETCH DATA LANGSUNG MENGGUNAKAN PRISMA
    // Mengapa: Karena kita berada di Server Component, tidak perlu fetch('/api/...').
    // Kita langsung menembak database secara _strongly-typed_. Aman dan efisien!
    const daftarKarya = await prisma.karya.findMany({
        // Mengapa: Admin bisa melihat semua novel. Author hanya novel unggahannya sendiri.
        where: session.user.role === 'admin' ? undefined : { uploader_id: session.user.id },
        orderBy: { title: 'asc' },
    });

    const daftarGenre = await prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-8">

                <header className="flex justify-between items-center mb-8 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900">
                            Dashboard {session.user.role === 'admin' ? 'Sang Dewa' : 'Penulis'}
                        </h1>
                        <p className="text-gray-500 mt-1">Selamat datang, {session.user.name}</p>
                    </div>
                    {session.user.role === 'admin' && (
                        <Link
                            href="/admin/genre"
                            className="bg-gray-100 text-gray-800 px-4 py-2 border border-gray-300 rounded font-semibold hover:bg-gray-200 transition text-sm"
                        >
                            Manajemen Genre
                        </Link>
                    )}
                </header>

                {/* 
                  Mengapa: Form interaktif ditaruh di Client Component secara terpisah. 
                  Dengan cara ini kita mempertahankan performa rendering dan keamanan Server Component 
                  sementara formnya punya onClick/onUpload event interaktif browser. 
                */}
                {session.user.role === 'admin' && (
                    <CreateAuthorForm />
                )}

                {/* Mengirim daftarGenre ke form untuk keperluan checklist genre */}
                <CreateKaryaForm genres={daftarGenre} />

                {/* TAMPILAN DAFTAR KARYA (SERVER RENDERED) */}
                <section>
                    <h2 className="font-semibold text-xl mb-4 text-gray-800">Koleksi Karya Saya</h2>

                    {daftarKarya.length === 0 ? (
                        <div className="text-center p-8 bg-gray-50 border border-dashed border-gray-300 rounded-lg">
                            <p className="text-gray-500">Koleksi masih kosong. Silakan publikasikan mahakarya pertama Anda.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {daftarKarya.map((item) => (
                                <div key={item.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50 flex flex-col justify-between hover:shadow-md transition">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{item.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">Penulis: <span className="font-medium">{item.penulis_alias}</span></p>

                                        <div className="flex gap-4 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                            <span>⭐ {item.avg_rating.toFixed(1)}</span>
                                            <span>👁 {item.total_views} Views</span>
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-200 flex flex-col gap-2">
                                        <Link
                                            href={`/novel/${item.id}`}
                                            className="text-center w-full bg-white border border-gray-300 text-gray-700 py-2 rounded font-medium hover:bg-gray-50 transition text-sm"
                                        >
                                            Lihat Etalase (Prototipe)
                                        </Link>
                                        <Link
                                            href={`/admin/karya/${item.id}`}
                                            className="text-center w-full bg-indigo-50 text-indigo-700 py-2 rounded font-medium hover:bg-indigo-100 transition text-sm"
                                        >
                                            Tambah Bab / Kelola Karya
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
