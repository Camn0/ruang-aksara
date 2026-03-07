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
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="px-6 h-14 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                <Link href="/admin/dashboard" className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 absolute left-1/2 -translate-x-1/2">Tulis Mahakarya</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-xl font-black text-gray-900 mb-2">Mulai Perjalanan Baru</h2>
                    <p className="text-sm text-gray-500 mb-8 leading-relaxed">Isi detail dasar dari buku Anda. Anda dapat merangkai bab-bab setelah menyimpan kerangka ini.</p>

                    <CreateKaryaFormModern genres={daftarGenre} />
                </div>
            </div>
        </div>
    );
}
