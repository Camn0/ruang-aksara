import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mengapa: Kita menggunakan Server Component untuk mengecek session secara langsung
// guna menentukan UI mana yang harus ditampilkan (Login vs Dashboard).
export default async function Home() {
    const session = await getServerSession(authOptions);

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
            <div className="z-10 max-w-5xl w-full items-center justify-between font-sans text-sm lg:flex flex-col gap-8 text-center">
                <h1 className="text-7xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Ruang Aksara
                </h1>
                <p className="text-xl text-gray-500 max-w-[600px] leading-relaxed">
                    Platform Publikasi Sastra Digital Mahasiswa UI. <br />
                    Tempat keajaiban kata-kata bernaung \& bersemi.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                    {!session ? (
                        <>
                            {/* Mengapa: Jika belum login, arahkan ke halaman sign-in bawaan NextAuth */}
                            <Link
                                href="/api/auth/signin"
                                className="px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-xl font-bold text-lg"
                            >
                                Masuk ke Akun
                            </Link>
                            <Link
                                href="/auth/register"
                                className="px-8 py-4 bg-white text-gray-900 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-bold text-lg"
                            >
                                Daftar Akun Pembaca
                            </Link>
                        </>
                    ) : (
                        <>
                            {/* Mengapa: Jika sudah login, tampilkan akses sesuai role */}
                            <Link
                                href="/admin/dashboard"
                                className="px-8 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg font-bold text-lg"
                            >
                                Buka Dashboard {session.user.role === 'admin' ? 'God Account' : session.user.role === 'author' ? 'Penulis' : 'Reader'}
                            </Link>
                        </>
                    )}

                    <Link
                        href="/novel"
                        className="px-8 py-4 border-2 border-gray-200 bg-white text-gray-700 rounded-xl hover:border-gray-300 transition-all font-bold text-lg"
                    >
                        Telusuri Karya
                    </Link>
                </div>

                {!session && (
                    <p className="text-xs text-gray-400 mt-4">
                        Gunakan username: <code className="bg-gray-200 px-1 rounded">admin</code> \& password: <code className="bg-gray-200 px-1 rounded">adminpassword123</code> untuk testing.
                    </p>
                )}
            </div>
        </main>
    );
}
