import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development" && process.env.ENABLE_PWA_DEV !== "true",
    register: true,
    skipWaiting: true,
    customWorkerDir: "worker",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Mengapa: Optimasi transmisi data dengan mengaktifkan Gzip/Brotli compression bawaan server Next.js.
    // Membawa penghematan bandwidth yang signifikan bagi user dengan koneksi lambat.
    compress: true,
    // [New Polish] Origin Transfer Efficiency
    // Mengapa: Memaksa Next.js untuk melakukan tree-shaking agresif pada library besar.
    // Ini mengurangi ukuran 'Transfer' origin ke browser secara signifikan.
    experimental: {
        optimizePackageImports: ['lucide-react', 'date-fns', 'sonner'],
    },
    images: {
        loader: 'custom',
        loaderFile: './lib/imageLoader.ts',
        formats: ['image/avif', 'image/webp'],
        minimumCacheTTL: 31536000,
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'i.imgur.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                port: '',
                pathname: '/**',
            },
        ],
    },
};

export default withPWA(nextConfig);
