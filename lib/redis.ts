/**
 * @file redis.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the Platform Infrastructure.
 * @author Ruang Aksara Engineering Team
 */

/**
 * Redis client wrapper — dirancang untuk performa dan portabilitas (Edge compatibility).
 * 
 * Mengapa custom wrapper?:
 * 1. Menggunakan REST API @upstash/redis secara langsung via `fetch`.
 * 2. Menghindari library `ioredis` yang tidak jalan di Next.js Edge Runtime.
 * 3. Stateless: Tidak ada koneksi TCP yang menggantung.
 * 
 * Fallback Mode:
 * Jika variabel lingkungan Upstash tidak di-set, klien beralih ke `noopRedis` 
 * agar aplikasi tidak error saat dijalankan di lokal tanpa Redis.
 */

interface RedisLike {
    get(key: string): Promise<string | null>;
    setex(key: string, seconds: number, value: string): Promise<void>;
    keys(pattern: string): Promise<string[]>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
}

/**
 * No-op Fallback: Klien "palsu" yang digunakan jika Redis tidak aktif.
 */
const noopRedis: RedisLike = {
    get: async () => null,
    setex: async () => { },
    keys: async () => [],
    del: async () => { },
    incr: async () => 0,
};

/**
 * Factory untuk membuat klien Redis berbasis Fetch/REST.
 */
function createRedisClient(): RedisLike {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    // [A] Cek Konfigurasi
    if (!url || !token) {
        // Logging peringatan agar developer tahu statistik tidak akan jalan
        if (process.env.NODE_ENV !== 'production') {
            console.warn('⚠️ [Redis] No configuration found. Analytics features are disabled (No-op mode).');
        }
        return noopRedis;
    }

    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

    /**
     * Helper internal untuk mengirim perintah Redis via HTTP POST.
     */
    async function command(...args: string[]): Promise<any> {
        try {
            const res = await fetch(`${url}`, {
                method: 'POST',
                headers,
                body: JSON.stringify(args),
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.result;
        } catch (e) {
            console.warn('⚠️ [Redis] HTTP Request failed, using fallback.');
            return null;
        }
    }

    // [B] Return Implementasi Interface
    return {
        get: (key) => command('GET', key),
        setex: async (key, seconds, value) => { await command('SETEX', key, String(seconds), value); },
        keys: async (pattern) => (await command('KEYS', pattern)) || [],
        del: async (key) => { await command('DEL', key); },
        incr: async (key) => (await command('INCR', key)) || 0,
    };
}

// Ekspor istansi singleton
export const redis = createRedisClient();
