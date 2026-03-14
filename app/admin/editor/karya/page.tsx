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
        <div className="bg-bg-cream/60 dark:bg-brown-dark min-h-screen transition-colors duration-500">
            <CreateKaryaFormModern genres={daftarGenre} />
        </div>
    );
}