import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import CreateKaryaFormModern from './CreateKaryaFormModern';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { prisma } from '@/lib/prisma';

export default async function CreateKaryaPage() {
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

    const daftarGenre = await prisma.genre.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            <header className="px-6 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
                <Link href="/admin/dashboard" className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2">Tulis Mahakarya</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 transition-colors duration-300">
                    <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">Mulai Perjalanan Baru</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Isi detail dasar dari buku Anda. Anda dapat merangkai bab-bab setelah menyimpan kerangka ini.</p>

                    <CreateKaryaFormModern genres={daftarGenre} />
                </div>
            </div>
        </div>
    );
}
