import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Mengapa: Kita inisialisasi PrismaClient internal di sini khusus untuk pencarian user saat login.
// Ini terpisah dari singleton global di lib/prisma.ts untuk menghindari circular dependency saat startup.
const prisma = new PrismaClient();

/**
 * Konfigurasi Utama NextAuth.
 * 
 * Strategy: JSON Web Token (JWT).
 * Role: Memberikan akses ke `role` dan `id` user baik di token maupun session object.
 */
export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt", // Menggunakan JWT agar stateless dan cepat di lingkungan serverless
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "e.g. admin" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // [A] Validasi Input
                if (!credentials?.username || !credentials?.password) { return null; }

                // [B] Mencari User di Database
                const user = await prisma.user.findUnique({
                    where: { username: credentials.username }
                });

                // [C] Validasi Eksistensi & Password
                if (!user) { return null; }
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

                if (!isPasswordValid) { return null; }

                // [D] Return Object User (Akan dienkripsi ke dalam JWT)
                return {
                    id: user.id,
                    name: user.display_name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        /**
         * JWT Callback: Dipanggil setiap kali JWT dibuat/diperbarui.
         * Mengapa: Kita memindahkan 'role' dari database object ke token agar role tersedia di middleware.
         */
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore - Injeksi custom property ke token
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        /**
         * Session Callback: Menyinkronkan data dari Token ke Session Object yang diakses oleh Client/Server components.
         */
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.id = token.id;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/login', // Redirect kustom jika user mencoba akses halaman terproteksi
    }
};
