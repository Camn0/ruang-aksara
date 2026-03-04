import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { GenreForm, DeleteGenreButton } from "./GenreClient";

const prisma = new PrismaClient();

export default async function AdminGenrePage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        redirect('/admin/dashboard');
    }

    const genres = await prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-8">
                <header className="mb-8 border-b pb-4">
                    <Link href="/admin/dashboard" className="text-indigo-600 hover:underline text-sm font-medium mb-4 inline-block">
                        &larr; Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 mt-2">Manajemen Genre</h1>
                    <p className="text-gray-500 mt-1">Kategori utama yang akan muncul di Pustaka Buku.</p>
                </header>

                <div className="mb-8">
                    <GenreForm />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Daftar Genre Aktif</h2>
                    {genres.length === 0 ? (
                        <p className="text-gray-500 italic">Belum ada genre yang ditambahkan.</p>
                    ) : (
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {genres.map(g => (
                                <li key={g.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                                    <span className="font-medium text-gray-700">{g.name}</span>
                                    <DeleteGenreButton id={g.id} />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
}
