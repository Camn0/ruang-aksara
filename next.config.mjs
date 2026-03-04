/** @type {import('next').NextConfig} */
const nextConfig = {
    // Mengapa: Optimasi transmisi data dengan mengaktifkan Gzip/Brotli compression bawaan server Next.js.
    // Membawa penghematan bandwidth yang signifikan bagi user dengan koneksi lambat.
    compress: true,
};

export default nextConfig;
