import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Fungsi GET dengan dynamic routing args untuk mengambil spesifik SATU bab.
// Mengapa: Fetch per bab sangat krusial untuk optimasi performa agar server tidak membebani memori dengan mengambil ratusan bab sekaligus.
export async function GET(
    request: Request,
    { params }: { params: { karyaId: string; chapterNo: string } }
) {
    try {
        const { karyaId, chapterNo } = params;

        const bab = await prisma.bab.findFirst({
            where: {
                karya_id: karyaId,
                chapter_no: Number(chapterNo),
            },
            select: {
                id: true,
                chapter_no: true,
                title: true,
                content: true,
                comments: {
                    select: {
                        id: true,
                        content: true,
                        created_at: true,
                        user: {
                            select: { display_name: true }
                        }
                    },
                    orderBy: { created_at: 'desc' },
                },
                karya: {
                    select: { title: true, penulis_alias: true }
                }
            },
        });

        // Validasi penanganan jika bab tidak ditemukan.
        if (!bab) {
            return NextResponse.json({ error: 'Bab tidak ditemukan' }, { status: 404 });
        }

        return NextResponse.json(bab, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil data bab' }, { status: 500 });
    }
}
