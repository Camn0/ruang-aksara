/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Administrator Dashboard architecture.
 * @author Ruang Aksara Engineering Team
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from '@/lib/prisma';

import CreateBabForm from "./CreateBabForm";
import EditBabForm from "./EditBabForm";
import EditKaryaForm from "./EditKaryaForm";
// Opsional: Jika Anda punya komponen hapus, bisa dipertahankan di luar struktur ini jika dibutuhkan nanti
// import DeleteKaryaButton from "./DeleteKaryaButton";
// import DeleteBabButton from "./DeleteBabButton";

export default async function AdminManageKaryaPage({ params }: { params: { karyaId: string } }) {
    const session = (await getServerSession(authOptions))!;

    const karya = await prisma.karya.findUnique({
        where: { id: params.karyaId },
        select: {
            id: true,
            uploader_id: true,
            title: true,
            penulis_alias: true,
            deskripsi: true,
            cover_url: true,
            is_completed: true,
            genres: { select: { id: true, name: true } },
            bab: {
                orderBy: { chapter_no: 'asc' },
                select: { id: true, title: true, content: true, chapter_no: true }
            }
        }
    });

    const allGenres = await prisma.genre.findMany({ orderBy: { name: 'asc' } });

    if (!karya) {
        notFound();
    }

    if (karya.uploader_id !== session.user.id && session.user.role !== 'admin') {
        return (
            <div className="p-8 text-center text-red-600 font-bold bg-bg-cream min-h-screen">
                Unauthorized: Anda tidak memiliki akses ke karya ini.
            </div>
        );
    }

    return (
        <div className="bg-bg-cream min-h-screen transition-colors duration-300">
            <EditKaryaForm karya={karya} allGenres={allGenres}>
                
                {/* List Bab */}
                {karya.bab?.map((bab: any) => (
                    <EditBabForm 
                        key={bab.id} 
                        babId={bab.id} 
                        initialContent={bab.content} 
                        title={bab.title} 
                    />
                ))}

                {/* Tombol Buat Bab */}
                <CreateBabForm karyaId={karya.id} />

            </EditKaryaForm>
        </div>
    );
}