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

        // Di sini kita pakai include untuk eager loading agar terhindar dari N+1 query problem,
        // khususnya ketika kita butuh meload relasi 'comments' sekaligus dengan bab-nya.
        // Tujuannya agar kita bisa merender konten bab beserta daftar komputernya dalam satu request.
        const bab = await prisma.bab.findFirst({
            where: {
                karya_id: karyaId,
                chapter_no: Number(chapterNo),
            },
            include: {
                comments: {
                    include: {
                        user: {
                            select: { display_name: true } // Hanya ambil display_name untuk privasi
                        }
                    },
                    orderBy: { created_at: 'desc' }, // Mengurutkan dari komentar terbaru
                },
                karya: {
                    select: { title: true, penulis_alias: true } // Mengambil metadata karya
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
