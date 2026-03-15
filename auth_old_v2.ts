'use server';

import bcrypt from 'bcryptjs';

import { prisma } from '@/lib/prisma';

// ==============================================================================
// 1. MUTASI PUBLIK: REGISTRASI USER BARU (READER)
// ==============================================================================
/**
 * Server Action: Mendaftarkan user baru dengan role 'user' (Reader).
 *
 * Alur:
 *   1. Ekstraksi `username`, `password`, `display_name` dari FormData.
 *   2. Validasi kelengkapan field dan panjang password minimal 6 karakter.
 *   3. Cek duplikasi username di database.
 *   4. Hash password menggunakan bcrypt (cost factor 10).
 *   5. Simpan user baru ke tabel `User` dengan role default 'user'.
 *
 * Mengapa bcrypt salt round 10:
 *   - Angka 10 menyeimbangkan keamanan vs performa. Semakin tinggi, semakin lambat hash
 *     tetapi semakin sulit di-brute-force. 10 adalah standar industri yang aman.
 *
 * @param formData - FormData berisi field: username, password, display_name.
 * @returns `{ success: true, data: { username } }` | `{ error: string }`.
 *
 * DEBUG TIPS:
 *   - Jika registrasi gagal tanpa error message, periksa koneksi database (`DATABASE_URL` di .env).
 *   - Jika error P2002 (unique constraint violation), username sudah terdaftar.
 *   - Password hash disimpan di kolom `password_hash`, BUKAN `password`. Jangan bingung.
 */
export async function registerUser(formData: FormData) {
    try {
        // [A] Ekstraksi field dari FormData
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const display_name = formData.get('display_name') as string;

        // [B] Validasi Kelengkapan ΓÇö semua field wajib diisi
        if (!username || !password || !display_name) {
            return { error: "Semua field (Username, Password, Display Name) wajib diisi." };
        }

        // [C] Validasi Panjang Password ΓÇö minimal 6 karakter
        if (password.length < 6) {
            return { error: "Password minimal 6 karakter." };
        }

        // [D] Cek Duplikasi Username di Database
        // Mengapa findUnique: username memiliki unique constraint di schema,
        // sehingga findUnique lebih optimal daripada findFirst.
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return { error: "Username sudah terdaftar. Silakan pilih username lain." };
        }

        // [E] Hash Password ΓÇö bcrypt dengan salt round 10
        const password_hash = await bcrypt.hash(password, 10);

        // [F] Mutasi Database ΓÇö simpan user baru
        const newUser = await prisma.user.create({
            data: {
                username,
                password_hash,
                display_name,
                role: 'user', // Default role: Reader (bukan admin atau author)
            }
        });

        // Mengembalikan username saja (bukan seluruh objek user) untuk keamanan
        return { success: true, data: { username: newUser.username } };

    } catch (error) {
        // DEBUG: Error ini muncul di terminal server, bukan di browser console
        console.error("[registerUser] Error:", error);
        return { error: "Terjadi kesalahan sistem saat mendaftar." };
    }
}
