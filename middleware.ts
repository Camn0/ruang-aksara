import { withAuth } from "next-auth/middleware";

// Mengapa: Kita menggunakan NextAuth middleware. Middleware ini berjalan *di Edge*
// sebelum React request/render cycle dimulai.
// Ini adalah layer pertahanan terkuat untuk memastikan halaman admin tidak bisa ditembus 
// pengakses anonim atau reader biasa.

export default withAuth(
    // `withAuth` meningkatkan (augments) objek `Request` dengan token user yang aktif.
    function middleware(req) {
        // Logging internal bisa ditambahkan di sini jika dibutuhkan
    },
    {
        callbacks: {
            authorized: ({ token }) => {
                // Return `true` jika diizinkan masuk rute yang di-protect.
                // Mengapa: Karena rute yang dicover matcher hanya rute `/admin`,
                // kita memblokir siapapun yang *role*-nya bukan 'admin' atau 'author'.
                return token?.role === "admin" || token?.role === "author";
            },
        },
    }
);

// Mengapa: Mengaktifkan middleware ini secara eksklusif hanya untuk path admin.
// Dengan begini performa reader biasa di halaman depan tidak terbebani pengecekan ini.
export const config = { matcher: ["/admin/:path*"] };
