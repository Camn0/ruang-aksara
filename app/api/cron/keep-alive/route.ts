/**
 * @file route.ts
 * @description Vercel Cron endpoint ensuring the Supabase PostgreSQL database connection pool never enters cold-start sleep.
 * @author Ruang Aksara Engineering Team
 */

import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * Keep-Alive Cron Job
 * 
 * Mengapa: 
 * 1. Mencegah database Supabase di-pause otomatis oleh sistem (setelah 7 hari tidak ada aktifitas).
 * 2. Menjaga koneksi Redis tetap "hangat" (warm-up).
 * 3. Mengurangi efek "Cold Start" pada instance Vercel.
 */
export async function GET(req: Request) {
    const authHeader = req.headers.get('Authorization');
    
    // Proteksi: Hanya jalankan jika dipanggil oleh Vercel Cron atau memiliki secret yang benar
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const timestamp = new Date().toISOString();
        
        // 1. Database Ping (Supabase)
        // Query teringan: menghitung jumlah genre (tabel kecil)
        const genreCount = await prisma.genre.count();
        
        // 2. Redis Ping (Upstash)
        // Menyimpan timestamp terakhir keep-alive untuk monitoring
        await redis.setex('keep-alive:last_ping', 86400, timestamp); // Expire in 24h
        
        return NextResponse.json({
            success: true,
            timestamp,
            services: {
                supabase: `Active (Found ${genreCount} genres)`,
                redis: 'Active (Ping updated)',
                vercel: 'Active (Function triggered)'
            }
        });
    } catch (error: any) {
        console.error('Keep-alive failed:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message || 'Internal Server Error' 
        }, { status: 500 });
    }
}
