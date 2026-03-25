/**
 * @file route.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the REST Architecture.
 * @author Ruang Aksara Engineering Team
 */

import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

// Di sini kita mendefinisikan metode POST untuk API Route Next.js (App Router)
// Mengapa: Kita menggunakan POST karena ini adalah operasi Create dalam CRUD untuk menyimpan data karya baru ke dalam database.
export async function POST(request: Request) {
    try {
        // Mengekstrak payload JSON dari request body.
        const body = await request.json();
        const { title, penulis_alias, uploader_id } = body;

        // Validasi sederhana: memastikan semua field wajib ada sebelum melakukan query database.
        // Mengapa: Menghindari error constraint dari database yang bisa membuat server crash.
        if (!title || !penulis_alias || !uploader_id) {
            return NextResponse.json({ error: 'Title, penulis_alias, \\& uploader_id wajib diisi' }, { status: 400 });
        }

        // Menggunakan Prisma untuk mencatat data baru ke dalam tabel Karya.
        // Mengapa: Prisma ORM memberikan eksekusi asynchronous yang aman dan strongly-typed.
        const novelBaru = await prisma.karya.create({
            data: {
                title,
                penulis_alias,
                uploader_id, // Ini adalah relasi uploader (God Account)
            },
        });

        // Mengembalikan data JSON dari record yang berhasil dibuat dengan HTTP status 201 (Created).
        return NextResponse.json(novelBaru, { status: 201 });
    } catch (error) {
        // Menangkap error jika ada kegagalan query, dsb.
        return NextResponse.json({ error: 'Gagal menambahkan karya' }, { status: 500 });
    }
}

// Menambahkan metode GET untuk mengambil daftar semua karya
export async function GET() {
    try {
        const daftarKarya = await prisma.karya.findMany({
            orderBy: { title: 'asc' }
        });
        return NextResponse.json(daftarKarya, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Gagal mengambil daftar karya' }, { status: 500 });
    }
}
