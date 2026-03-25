/**
 * @file route.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the REST Architecture.
 * @author Ruang Aksara Engineering Team
 */

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Di sini kita mendefinisikan fungsi POST untuk menghandle penambahan bab baru.
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { karya_id, chapter_no, content } = body;

        // Memeriksa keberadaan field krusial agar logika aliran data tetap valid sebelum menyentuh database.
        if (!karya_id || chapter_no === undefined || !content) {
            return NextResponse.json({ error: 'karya_id, chapter_no, \\& content wajib diisi' }, { status: 400 });
        }

        // Melakukan mutasi database untuk membuat record Bab baru.
        // Mengapa: Karena kita perlu menyimpan text berupa konten ke relasi karya yang tepat sesuai nomor chapter.
        const babBaru = await prisma.bab.create({
            data: {
                karya_id,
                chapter_no: Number(chapter_no),
                content,
            },
        });

        return NextResponse.json(babBaru, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal menambahkan bab' }, { status: 500 });
    }
}
