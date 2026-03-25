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

export const middlewareConfig = {
    callbacks: {
        /**
         * Kontrol akses utama.
         * @returns `true` jika diizinkan, `false` akan mere-direct ke login page.
         */
        authorized: ({ token }: { token: any }) => {
            // Rule: Hanya user dengan role 'admin' atau 'author' yang boleh masuk rute matcher.
            return token?.role === "admin" || token?.role === "author";
        },
    },
};

export default withAuth(
    function middleware(req) {
        // Bisa digunakan untuk logging audit request admin di sini
    },
    middlewareConfig
);

/**
 * Konfigurasi Matcher: Membatasi jalannya middleware agar tidak membebani rute publik.
 */
export const config = { matcher: ["/admin/:path*"] };
