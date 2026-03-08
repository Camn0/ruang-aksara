import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    // Mengapa: Optimasi transmisi data dengan mengaktifkan Gzip/Brotli compression bawaan server Next.js.
    // Membawa penghematan bandwidth yang signifikan bagi user dengan koneksi lambat.
    compress: true,
};

export default withPWA(nextConfig);
