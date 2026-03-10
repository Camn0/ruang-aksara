import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
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
        <div className="pb-24">
            <div className="px-6 pt-6 sm:pt-10 mb-6 sm:mb-10">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none uppercase italic">Pengaturan Admin</h1>
                <p className="text-indigo-500 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest mt-2 leading-none">Kelola Genre & Penulis</p>
            </div>

            <div className="px-6">
                <div className="max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl shadow-gray-200/40 dark:shadow-none p-6 sm:p-10 border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                    <div className="mb-12">
                        <CreateAuthorForm />
                    </div>

                    <div className="mb-8 border-t border-gray-100 dark:border-slate-800 pt-10">
                        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-gray-100 mb-6 flex items-center gap-3">
                            <span className="w-2 h-8 bg-indigo-600 rounded-full"></span>
                            Penambahan Genre
                        </h2>
                        <GenreForm />
                    </div>

                    <div className="mt-12">
                        <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Daftar Genre Aktif</h2>
                        {genres.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400 italic font-bold">Belum ada genre yang ditambahkan.</p>
                        ) : (
                            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {genres.map(g => (
                                    <li key={g.id} className="bg-gray-50 dark:bg-slate-800/50 border border-transparent dark:border-slate-800 rounded-2xl p-4 flex justify-between items-center transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-lg group">
                                        <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tight text-sm">{g.name}</span>
                                        <DeleteGenreButton id={g.id} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
