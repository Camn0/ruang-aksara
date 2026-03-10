import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import CreateKaryaFormModern from './CreateKaryaFormModern';

export default async function CreateKaryaPage() {
    await getServerSession(authOptions);

    const daftarGenre = await prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="pb-24 transition-colors duration-300">
            <div className="px-6 pt-6 sm:pt-10 mb-6 sm:mb-10">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none uppercase italic">Tulis Mahakarya</h1>
                <p className="text-indigo-500 font-extrabold text-[10px] sm:text-xs uppercase tracking-widest mt-2 leading-none">Mulai Perjalanan Baru</p>
            </div>

            <div className="px-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">Kerangka Dasar</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Isi detail dasar dari buku Anda. Anda dapat merangkai bab-bab setelah menyimpan kerangka ini.</p>

                    <CreateKaryaFormModern genres={daftarGenre} />
                </div>
            </div>
        </div>
    );
}
