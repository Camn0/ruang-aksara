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
        <div className="pb-32 bg-parchment-light min-h-screen transition-all">
            <div className="px-8 pt-10 mb-10 relative">
                <div className="absolute top-10 right-10 w-32 h-32 bg-ink/5 rounded-full blur-3xl -z-10" />
                <h1 className="font-journal-title text-4xl text-ink-deep italic uppercase tracking-tight">Menulis Mahakarya</h1>
                <p className="font-marker text-[10px] text-pine uppercase tracking-[0.2em] mt-2">Mulai Perjalanan Baru di Jurnal Jati Diri</p>
            </div>

            <div className="px-8">
                <div className="bg-paper wobbly-border paper-shadow p-8 sm:p-12 -rotate-1 transition-all hover:rotate-0">
                    <h2 className="font-journal-title text-3xl text-ink-deep mb-3 italic">Kerangka Dasar</h2>
                    <p className="font-journal-body text-lg text-ink/60 mb-10 leading-relaxed italic">
                        Tentukan fondasi utama dari hikayat Anda. Anda dapat mulai mengukir bab demi bab setelah kerangka ini tersimpan rapi.
                    </p>

                    <CreateKaryaFormModern genres={daftarGenre} />
                </div>
            </div>
        </div>
    );
}
