import { PrismaClient } from '@prisma/client';
import { redis } from '@/lib/redis';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// Mengapa: Endpoint ini didesain sebagai "Cron Job" yang bisa dipanggil secara berkala
// (misal via Vercel Cron atau scheduler eksternal) untuk mensinkronkan data view dari Redis 
// kembali ke tabel PostgreSQL secara massal.
export async function GET(req: Request) {
    // Dalam realita produksi, Anda harus menambahkan proteksi otorisasi di sini menggunakan secret key
    // contoh: if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) ...

    try {
        // 1. Cari semua key di Redis yang mencatat views karya menggunakan skema yang tepat
        const keys = await redis.keys('views:karya:*');

        if (keys.length === 0) {
            return NextResponse.json({ message: "Tidak ada views baru untuk disinkronisasi." });
        }

        let syncedCount = 0;

        // 2. Loop setiap antrean view karya
        for (const key of keys) {
            const karyaId = key.replace('views:karya:', '');
            const viewsStr = await redis.get(key);
            const views = parseInt(viewsStr || '0', 10);

            if (views > 0) {
                // 3. Atomically increment value tersebut ke PostgreSQL
                await prisma.karya.update({
                    where: { id: karyaId },
                    data: {
                        total_views: {
                            increment: views
                        }
                    }
                });

                // 4. Setelah berhasil, HAPUS key dari Redis agar tidak di-count berulang
                await redis.del(key);
                syncedCount++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Berhasil mensinkronisasi ${syncedCount} log view karya ke database utama.`
        });

    } catch (error) {
        console.error("Cron Job Error:", error);
        return NextResponse.json({ error: "Gagal memproses sinkronisasi views." }, { status: 500 });
    }
}
