'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import DOMPurify from 'isomorphic-dompurify';
import bcrypt from 'bcryptjs';

// ==============================================================================
// 1. MUTASI ADMIN: MEMBUAT KARYA BARU
// ==============================================================================
// Mengapa: Fungsi ini berjalan sepenuhnya di lingkungan server Node.js. 
// Ini menjamin keamanan logika otorisasi dan langsung berinteraksi dengan DB tanpa terekspos ke klien (browser).
export async function createKarya(formData: FormData) {
    try {
        // [A] Validasi Autentikasi \& Otorisasi Level Server
        // Mengapa: getServerSession membaca token JWT request untuk memastikan siapa yang memanggil action ini.
        const session = await getServerSession(authOptions);

        // Mengapa: RBAC (Role-Based Access Control). Kita cek spesifik properti `role` dari session
        // yang sudah di-*inject* tadi di route authentikasi. Reader biasa tidak bisa menembus fungsi ini.
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized: Hanya God Account atau Author yang diizinkan membuat Karya." };
        }

        // [B] Ekstraksi Data Input
        // Mengapa: Membaca isi objek FormData bawaan web API standar.
        const title = formData.get('title') as string;
        const penulis_alias = formData.get('penulis_alias') as string;
        const deskripsi = formData.get('deskripsi') as string || null;
        const cover_url = formData.get('cover_url') as string || null;
        const genreIds = formData.getAll('genres') as string[]; // Menerima array genre dari HTML checkboxes

        // [C] Validasi Kelengkapan Input
        if (!title || !penulis_alias) {
            return { error: "Bad Request: Judul dan Penulis Alias wajib diisi." };
        }

        // [C.2] Validasi Sesi Stale (Mencegah Error P2003 / Foreign Key Constraint)
        // Mengapa: Jika DB baru saja di-reset, cookie sesi di browser masih menyimpan UUID lama
        // yang sudah tidak ada di DB, menyebabkan error saat insert.
        const existingUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!existingUser) {
            return { error: "Sesi Anda sudah kedaluwarsa atau tidak valid (Terjadi indikasi reset database). Silakan Logout dan Login kembali." };
        }

        // [D] Mutasi Database
        // Mengapa: relasi foreign key disambungkan berdasarkan ID user pelog-in 
        const karyaBaru = await prisma.karya.create({
            data: {
                title,
                penulis_alias,
                deskripsi,
                cover_url,
                uploader_id: session.user.id,
                genres: {
                    connect: genreIds.map((id) => ({ id }))
                }
            }
        });

        return { success: true, data: karyaBaru };

    } catch (error) {
        console.error("Database Error createKarya:", error);
        return { error: "Terjadi kesalahan pada sistem saat menyimpan Karya." };
    }
}


// ==============================================================================
// 2. MUTASI ADMIN: MENAMBAH BAB BARU
// ==============================================================================
export async function createBab(formData: FormData) {
    try {
        // [A] Validasi Autentikasi \& Otorisasi
        const session = await getServerSession(authOptions);

        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized: Hanya God Account atau Author yang diizinkan mengunggah Bab." };
        }

        // [B] Ekstraksi Input
        const karya_id = formData.get('karya_id') as string;
        let content = formData.get('content') as string;

        // [C] Validasi Kelengkapan Input Dasar
        if (!karya_id || !content) {
            return { error: "Bad Request: Karya ID dan Konten wajib diisi." };
        }

        // [D] Sanitasi Input (XSS Prevention)
        // Mengapa: Menggunakan DOMPurify di sisi Server (isomorphic) untuk membersihkan
        // elemen HTML berbahaya (seperti <script>) dari teks konten sebelum masuk ke database.
        const DOMPurify = (await import('isomorphic-dompurify')).default;
        content = DOMPurify.sanitize(content);

        // [E] Logika Penomoran Otomatis (Auto-Increment)
        // Mengapa: Menghitung manual Bab terakhir yang masuk ke Karya ini.
        // Prisma Aggregate akan mengeksekusi `SELECT MAX(chapter_no) ...` yang sangat ringan.
        const aggr = await prisma.bab.aggregate({
            where: { karya_id },
            _max: { chapter_no: true }
        });

        // Bab baru adalah MAX + 1. Jika belum ada bab, otomatis jadi Bab 1.
        const chapter_no = (aggr._max.chapter_no || 0) + 1;

        // [F] Mutasi Database
        const babBaru = await prisma.bab.create({
            data: {
                karya_id,
                chapter_no,
                content,
            }
        });

        return { success: true, data: babBaru };

    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "Conflict: Nomor bab tersebut sudah ada pada karya ini. Gunakan nomor urut lain." };
        }

        console.error("Database Error createBab:", error);
        return { error: "Internal Server Error: Gagal menyimpan data bab." };
    }
}

// ==============================================================================
// 3. MUTASI ADMIN: MENAMBAH AUTHOR BARU
// ==============================================================================
export async function registerAuthor(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return { error: "Unauthorized: Hanya God Account yang diizinkan." };
        }

        const username = formData.get('username') as string;
        const display_name = formData.get('display_name') as string;
        const password = formData.get('password') as string;

        if (!username || !display_name || !password) {
            return { error: "Semua kolom wajib diisi." };
        }

        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return { error: "Username sudah digunakan." };
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                display_name,
                password_hash,
                role: 'author'
            }
        });

        return { success: true, data: newUser };
    } catch (error) {
        console.error("Database Error registerAuthor:", error);
        return { error: "Gagal mendaftarkan author." };
    }
}

// ==============================================================================
// 4. MUTASI ADMIN: MANAJEMEN GENRE
// ==============================================================================
export async function createGenre(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return { error: "Unauthorized." };
        }

        const name = formData.get('name') as string;
        if (!name) return { error: "Nama genre wajib diisi." };

        await prisma.genre.create({ data: { name } });
        return { success: true };
    } catch (error) {
        return { error: "Gagal menambah genre atau genre sudah ada." };
    }
}

export async function deleteGenre(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return { error: "Unauthorized." };
        }

        if (!id) return { error: "ID genre tidak valid." };

        await prisma.genre.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        return { error: "Gagal menghapus genre." };
    }
}

// ==============================================================================
// 5. MUTASI ADMIN/AUTHOR: EDIT & HAPUS KARYA
// ==============================================================================
export async function editKarya(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized." };
        }

        const id = formData.get('id') as string;
        const title = formData.get('title') as string;
        const penulis_alias = formData.get('penulis_alias') as string;
        const deskripsi = formData.get('deskripsi') as string || null;
        const cover_url = formData.get('cover_url') as string || null;
        const is_completed = formData.get('is_completed') === 'true'; // Toggle Selesai
        const genreIds = formData.getAll('genres') as string[];

        if (!id || !title || !penulis_alias) {
            return { error: "Data tidak lengkap." };
        }

        // Cek Kepemilikan Jika Author
        const existingKarya = await prisma.karya.findUnique({ where: { id } });
        if (!existingKarya) return { error: "Karya tidak ditemukan." };

        if (session.user.role === 'author' && existingKarya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik karya ini." };
        }

        await prisma.karya.update({
            where: { id },
            data: {
                title,
                penulis_alias,
                deskripsi,
                cover_url,
                is_completed,
                genres: {
                    set: genreIds.map((gId) => ({ id: gId }))
                }
            }
        });

        return { success: true };
    } catch (error) {
        console.error("Error Edit Karya:", error);
        return { error: "Gagal mengedit karya." };
    }
}

export async function deleteKarya(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized." };
        }

        const existingKarya = await prisma.karya.findUnique({ where: { id } });
        if (!existingKarya) return { error: "Karya tidak ditemukan." };

        if (session.user.role === 'author' && existingKarya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik karya ini." };
        }

        await prisma.karya.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Error Delete Karya:", error);
        return { error: "Gagal menghapus karya." };
    }
}

// ==============================================================================
// 6. MUTASI ADMIN/AUTHOR: EDIT & HAPUS BAB
// ==============================================================================
export async function editBab(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized." };
        }

        const id = formData.get('id') as string;
        let content = formData.get('content') as string;

        if (!id || !content) return { error: "Data tidak lengkap." };

        const existingBab = await prisma.bab.findUnique({
            where: { id },
            include: { karya: true }
        });
        if (!existingBab) return { error: "Bab tidak ditemukan." };

        if (session.user.role === 'author' && existingBab.karya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik bab ini." };
        }

        const DOMPurify = (await import('isomorphic-dompurify')).default;
        content = DOMPurify.sanitize(content);

        await prisma.bab.update({
            where: { id },
            data: { content }
        });

        return { success: true };
    } catch (error) {
        console.error("Error Edit Bab:", error);
        return { error: "Gagal mengedit bab." };
    }
}

export async function deleteBab(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized." };
        }

        const existingBab = await prisma.bab.findUnique({
            where: { id },
            include: { karya: true }
        });
        if (!existingBab) return { error: "Bab tidak ditemukan." };

        if (session.user.role === 'author' && existingBab.karya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik bab ini." };
        }

        await prisma.bab.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Error Delete Bab:", error);
        return { error: "Gagal menghapus bab." };
    }
}

