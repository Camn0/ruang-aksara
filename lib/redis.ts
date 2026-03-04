import { Redis } from 'ioredis';

// Mengapa: Konfigurasi Client Redis Singleton.
// Dalam mode development Next.js, HMR (Hot Module Replacement) sering merestart file,
// pembuatan koneksi berulang ke server Redis dapat menyebabkan "Too many connections".
// globalThis mencegah inisialisasi ulang koneksi pada setiap refresh dev-server.

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const globalForRedis = globalThis as unknown as {
    redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(redisUrl, {
    // Mengapa: Membatasi retry koneksi berlebih jika server Redis lokal mati.
    // Ini mencegah console spam "ECONNREFUSED" di mode development.
    retryStrategy(times) {
        if (times > 3) return null; // Berhenti retry setelah 3 kali gagal
        return Math.min(times * 200, 1000);
    },
    maxRetriesPerRequest: 1
});

// Tangkap event error secara eksplisit agar proses Node.js tidak *crash*
redis.on('error', (err: any) => {
    if (err.code === 'ECONNREFUSED') {
        console.warn('⚠️ [Redis] Koneksi gagal. Pastikan Redis berjalan di latar belakang (Fallback mode aktif).');
    } else {
        console.error('⚠️ [Redis] Error:', err.message);
    }
});

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;
