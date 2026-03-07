import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { GenreForm, DeleteGenreButton } from "./GenreClient";
import CreateAuthorForm from "../dashboard/CreateAuthorForm";

import { prisma } from '@/lib/prisma';

export default async function AdminGenrePage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
        redirect('/admin/dashboard');
    }

    const genres = await prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-slate-950 p-8 transition-colors duration-300">
            <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow p-8 border border-transparent dark:border-slate-800 transition-colors duration-300">
                <header className="mb-8 border-b border-gray-100 dark:border-slate-800 pb-4">
                    <Link href="/admin/dashboard" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline text-sm font-medium mb-4 inline-block transition-colors">
                        &larr; Kembali ke Dashboard
                    </Link>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mt-2">Pengaturan Admin</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola Genre dan Akun Penulis yang beroperasi di platform.</p>
                </header>

                <div className="mb-12">
                    <CreateAuthorForm />
                </div>

                <div className="mb-8 border-t border-gray-100 dark:border-slate-800 pt-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Penambahan Genre</h2>
                    <GenreForm />
                </div>

                <div>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Daftar Genre Aktif</h2>
                    {genres.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 italic">Belum ada genre yang ditambahkan.</p>
                    ) : (
                        <ul className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {genres.map(g => (
                                <li key={g.id} className="bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center transition-colors">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">{g.name}</span>
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
