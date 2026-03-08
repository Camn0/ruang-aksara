// Redis client — gracefully optional.
// Jika REDIS_URL di-set, gunakan @upstash/redis (REST, ~8KB, edge-compatible).
// Jika tidak di-set, semua operasi jadi no-op (return null, tidak error).

interface RedisLike {
    get(key: string): Promise<string | null>;
    setex(key: string, seconds: number, value: string): Promise<void>;
    keys(pattern: string): Promise<string[]>;
    del(key: string): Promise<void>;
    incr(key: string): Promise<number>;
}

const noopRedis: RedisLike = {
    get: async () => null,
    setex: async () => { },
    keys: async () => [],
    del: async () => { },
    incr: async () => 0,
};

function createRedisClient(): RedisLike {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        // Tidak ada Redis yang dikonfigurasi — semua operasi jadi no-op
        return noopRedis;
    }

    // Lightweight REST wrapper — tidak perlu library eksternal
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

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
            console.warn('⚠️ [Redis] Request failed, using fallback.');
            return null;
        }
    }

    return {
        get: (key) => command('GET', key),
        setex: async (key, seconds, value) => { await command('SETEX', key, String(seconds), value); },
        keys: async (pattern) => (await command('KEYS', pattern)) || [],
        del: async (key) => { await command('DEL', key); },
        incr: async (key) => (await command('INCR', key)) || 0,
    };
}

export const redis = createRedisClient();
