import { withAuth } from "next-auth/middleware";

/**
 * Middleware Otorisasi (Edge Runtime).
 * 
 * Mengapa middleware?:
 * Memblokir akses ke rute administratif (`/admin/*`) sebelum request mencapai server/rendering logic.
 * Ini adalah layer keamanan tercepat dan paling efisien.
 * 
 * Mekanisme:
 * menggunakan `next-auth/middleware` untuk memeriksa keberadaan JWT/Session.
 */

export default withAuth(
    // Fungsi ini dipanggil hanya jika checkbox 'authorized' mengembalikan true
    function middleware(req) {
        // Bisa digunakan untuk logging audit request admin di sini
    },
    {
        callbacks: {
            /**
             * Kontrol akses utama.
             * @returns `true` jika diizinkan, `false` akan mere-direct ke login page.
             */
            authorized: ({ token }) => {
                // Rule: Hanya user dengan role 'admin' atau 'author' yang boleh masuk rute matcher.
                return token?.role === "admin" || token?.role === "author";
            },
        },
    }
);

/**
 * Konfigurasi Matcher: Membatasi jalannya middleware agar tidak membebani rute publik.
 */
export const config = { matcher: ["/admin/:path*"] };
