'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidateTag } from 'next/cache';

// ==============================================================================
// 1. MUTASI ADMIN/AUTHOR: MEMBUAT KARYA BARU
// ==============================================================================
/**
 * Server Action: Membuat entitas Karya (novel/buku) baru.
 * 
 * Otorisasi:
 *   - Hanya user dengan role 'admin' atau 'author' yang diizinkan.
 * 
 * Alur:
 *   1. Validasi Autentikasi & RBAC.
 *   2. Ekstraksi data dari FormData.
 *   3. Sinkronisasi identitas penulis (alias vs username).
 *   4. Operasi Database (Prisma build-in connect untuk genre).
 * 
 * @param formData - Objek FormData (title, penulis_alias, deskripsi, cover_url, genres).
 * @returns `{ success: true, data: Karya }` | `{ error: string }`.
 * 
 * DEBUG TIPS:
 *   - Jika error P2003 (Foreign Key), pastikan `session.user.id` masih ada di tabel User (cek DB reset).
 *   - Jika genre tidak tersimpan, pastikan `genreIds` adalah array string ID yang valid.
 */
export async function createKarya(formData: FormData) {
    try {
        // [A] Validasi Autentikasi & Otorisasi Level Server
        // Mengapa: Kita tidak boleh percaya pada state client. Role dicek langsung dari JWT Session yang aman.
        const session = await getServerSession(authOptions);

        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized: Hanya God Account atau Author yang diizinkan membuat Karya." };
        }

        // [B] Ekstraksi Data Input
        const title = formData.get('title') as string;
        const input_penulis_alias = formData.get('penulis_alias') as string;
        const deskripsi = formData.get('deskripsi') as string || null;
        const cover_url = formData.get('cover_url') as string || null;
        const genreIds = formData.getAll('genres') as string[];

        // [C] Validasi Kelengkapan Input
        if (!title) {
            return { error: "Bad Request: Judul karya wajib diisi." };
        }

        // [D] Sinkronisasi Sesi & Database
        // Mengapa: Jika database dideploy ulang (reset), cookie browser mungkin menyimpan ID user lama.
        const existingUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!existingUser) {
            return { error: "Sesi Anda sudah kedaluwarsa atau tidak valid (Terjadi indikasi reset database). Silakan Logout dan Login kembali." };
        }

        // [E] Logika Penanganan Alias Penulis
        // Format: "Alias (Username Asli)" untuk menjamin transparansi di aplikasi.
        const cleanAlias = input_penulis_alias?.replace(/\s\([^)]+\)$/, '').trim();
        const final_penulis_alias = cleanAlias
            ? `${cleanAlias} (${existingUser.username})`
            : existingUser.username;

        // [F] Mutasi Database
        // Mengapa: Menggunakan `connect` agar Prisma otomatis membuat mapping di table join (implicit m-n).
        const karyaBaru = await prisma.karya.create({
            data: {
                title,
                penulis_alias: final_penulis_alias,
                deskripsi,
                cover_url,
                uploader_id: session.user.id,
                genres: {
                    connect: genreIds.map((id) => ({ id }))
                }
            }
        });

        // Invalidate global list (Home/Dashboard)
        revalidateTag('karya-global');

        return { success: true, data: karyaBaru };

    } catch (error) {
        console.error("[createKarya] Database Error:", error);
        return { error: "Terjadi kesalahan pada sistem saat menyimpan Karya." };
    }
}


// ==============================================================================
// 2. MUTASI ADMIN/AUTHOR: MENAMBAH BAB BARU
// ==============================================================================
/**
 * Server Action: Menambahkan bab (chapter) baru ke dalam karya yang sudah ada.
 * 
 * Fitur:
 *   - Auto-increment penomoran bab berdasarkan nilai terakhir di DB.
 *   - Sanitasi konten dasar.
 * 
 * @param formData - Objek FormData (karya_id, content).
 * @returns `{ success: true, data: Bab }` | `{ error: string }`.
 * 
 * DEBUG TIPS:
 *   - Jika nomor bab melompat, cek apakah ada bab yang dihapus sebelumnya.
 *   - Error 'Conflict' (P2002) berarti kombinasi karya_id + chapter_no sudah ada.
 */
export async function createBab(formData: FormData) {
    try {
        // [A] Validasi Autentikasi & Otorisasi
        const session = await getServerSession(authOptions);

        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized: Hanya God Account atau Author yang diizinkan mengunggah Bab." };
        }

        // [B] Ekstraksi & Validasi Input
        const karya_id = formData.get('karya_id') as string;
        let content = formData.get('content') as string;
        const title = (formData.get('title') as string)?.trim() || null;

        if (!karya_id || !content) {
            return { error: "Bad Request: Karya ID dan Konten wajib diisi." };
        }

        // [C] Sanitasi & Formatting
        content = content.trim();

        // [D] Logika Penomoran Otomatis (Auto-Increment Terkontrol)
        // Mengapa: Kita menghitung MAX secara manual agar urutan bab tetap solid meskipun ada request paralel.
        const aggr = await prisma.bab.aggregate({
            where: { karya_id },
            _max: { chapter_no: true }
        });

        // Jika karya pertama (max = null), maka chapter_no = 1.
        const chapter_no = (aggr._max.chapter_no || 0) + 1;

        // [E] Mutasi Database
        const babBaru = await prisma.bab.create({
            data: {
                karya_id,
                chapter_no,
                title,
                content,
            }
        });

        // Invalidate cache detail karya agar daftar bab terbaru muncul instan
        revalidateTag(`karya-${karya_id}`);

        return { success: true, data: babBaru };

    } catch (error: any) {
        // Penanganan error spesifik Prisma: Unique Constraint (Bab nomor sama)
        if (error.code === 'P2002') {
            return { error: "Conflict: Nomor bab tersebut sudah ada pada karya ini. Gunakan nomor urut lain." };
        }

        console.error("[createBab] Database Error:", error);
        return { error: "Internal Server Error: Gagal menyimpan data bab." };
    }
}

// ==============================================================================
// 3. MUTASI ADMIN: PENDAFTARAN AUTHOR (MODERATED)
// ==============================================================================
/**
 * Server Action: Mendaftarkan akun baru dengan role 'author'.
 * 
 * Alur:
 *   1. Cek role pendaftar (Hanya Admin).
 *   2. Cek ketersediaan username.
 *   3. Enkripsi password menggunakan bcrypt.
 * 
 * DEBUG TIPS:
 *   - Gagal mendaftar biasanya karena duplikasi username.
 */
export async function registerAuthor(formData: FormData) {
    try {
        // [A] Otorisasi: Hanya Admin yang bisa "mengangkat" orang jadi Author di level ini.
        const session = await getServerSession(authOptions);
        if (!session || session.user?.role !== 'admin') {
            return { error: "Unauthorized: Hanya God Account yang diizinkan." };
        }

        // [B] Ekstraksi Input
        const username = formData.get('username') as string;
        const display_name = formData.get('display_name') as string;
        const password = formData.get('password') as string;

        if (!username || !display_name || !password) {
            return { error: "Semua kolom wajib diisi." };
        }

        // [C] Cek Duplikasi
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) {
            return { error: "Username sudah digunakan." };
        }

        // [D] Keamanan: Hashing Password
        const password_hash = await bcrypt.hash(password, 10);

        // [E] Mutasi DB
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
        console.error("[registerAuthor] Error:", error);
        return { error: "Gagal mendaftarkan author." };
    }
}

// ==============================================================================
// 4. MUTASI ADMIN: MANAJEMEN MASTER DATA GENRE
// ==============================================================================
/**
 * Server Action: Membuat genre baru.
 * 
 * Otorisasi: Admin Only.
 */
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

/**
 * Server Action: Menghapus genre.
 * 
 * CAUTION: Jika genre dihapus, semua karya dengan genre ini akan terputus relasinya.
 */
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
// 5. MUTASI ADMIN/AUTHOR: PENGELOLAAN KARYA (EDIT & DELETE)
// ==============================================================================
/**
 * Server Action: Memperbarui data karya yang sudah ada.
 * 
 * Otorisasi:
 *   - Admin bisa edit semua karya.
 *   - Author hanya bisa edit karya miliknya sendiri.
 * 
 * DEBUG TIPS:
 *   - 'Forbidden' muncul jika Author mencoba edit 'uploader_id' orang lain.
 */
export async function editKarya(formData: FormData) {
    try {
        // [A] Cek Sesi
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized." };
        }

        // [B] Ekstraksi Input
        const id = formData.get('id') as string;
        const title = formData.get('title') as string;
        const input_penulis_alias = formData.get('penulis_alias') as string;
        const deskripsi = formData.get('deskripsi') as string || null;
        const cover_url = formData.get('cover_url') as string || null;
        const is_completed = formData.get('is_completed') === 'true';
        const genreIds = formData.getAll('genres') as string[];

        if (!id || !title) {
            return { error: "Data tidak lengkap." };
        }

        // [C] Validasi Owner vs Admin
        const existingKarya = await prisma.karya.findUnique({ where: { id } });
        if (!existingKarya) return { error: "Karya tidak ditemukan." };

        if (session.user.role === 'author' && existingKarya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik karya ini." };
        }

        // [D] Sinkronisasi Alias Penulis
        const existingUser = await prisma.user.findUnique({ where: { id: session.user.id } });
        if (!existingUser) return { error: "Sesi tidak valid." };

        const cleanAlias = input_penulis_alias?.replace(/\s\([^)]+\)$/, '').trim();
        const final_penulis_alias = cleanAlias
            ? `${cleanAlias} (${existingUser.username})`
            : existingUser.username;

        // [E] Mutasi Update
        // Mengapa `set`: Menghapus relasi genre lama dan menggantinya dengan list baru secara atomik.
        await prisma.karya.update({
            where: { id },
            data: {
                title,
                penulis_alias: final_penulis_alias,
                deskripsi,
                cover_url,
                is_completed,
                genres: {
                    set: genreIds.map((gId) => ({ id: gId }))
                }
            }
        });

        revalidateTag(`karya-${id}`);

        return { success: true };
    } catch (error) {
        console.error("[editKarya] Error:", error);
        return { error: "Gagal mengedit karya." };
    }
}

/**
 * Server Action: Menghapus karya permanen.
 * 
 * CAUTION: Penghapusan karya akan menghapus semua BAB di dalamnya secara CASCADE (tergantung schema prisma).
 */
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

        revalidateTag(`karya-${id}`);

        return { success: true };
    } catch (error) {
        console.error("[deleteKarya] Error:", error);
        return { error: "Gagal menghapus karya." };
    }
}

// ==============================================================================
// 6. MUTASI ADMIN/AUTHOR: PENGELOLAAN BAB (EDIT & DELETE)
// ==============================================================================
/**
 * Server Action: Mengubah konten bab.
 * 
 * Otorisasi: Penulis karya induk atau Admin.
 */
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

        // Cek apakah user punya hak atas karya yang membawahi bab ini
        if (session.user.role === 'author' && existingBab.karya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik bab ini." };
        }

        await prisma.bab.update({
            where: { id },
            data: { content: content.trim() }
        });

        return { success: true };
    } catch (error) {
        console.error("[editBab] Error:", error);
        return { error: "Gagal mengedit bab." };
    }
}

/**
 * Server Action: Menghapus bab.
 */
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
        console.error("[deleteBab] Error:", error);
        return { error: "Gagal menghapus bab." };
    }
}

// ==============================================================================
// 7. MUTASI ADMIN/AUTHOR: PIN REVIEW
// ==============================================================================
/**
 * Server Action: Menyematkan (pin) ulasan agar tampil paling atas.
 */
export async function togglePinReview(reviewId: string, karyaId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized." };
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            include: { karya: true }
        });

        if (!review) return { error: "Review tidak ditemukan." };

        // Otorisasi: Admin atau Pemilik Karya
        if (session.user.role === 'author' && review.karya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik karya ini." };
        }

        // Toggle PIN
        await (prisma.review as any).update({
            where: { id: reviewId },
            data: { is_pinned: !(review as any).is_pinned }
        });

revalidateTag(`karya-${karyaId}`);
        return { success: true };
    } catch (error) {
        console.error("[togglePinReview] Error:", error);
        return { error: "Gagal memproses sematan ulasan." };
    }
}

// ==============================================================================
// 8. MUTASI ADMIN/AUTHOR: MODERASI KOMENTAR
// ==============================================================================
/**
 * Server Action: Menghapus komentar.
 * 
 * Otorisasi:
 *   - Admin bisa hapus semua komentar.
 *   - Author hanya bisa hapus komentar pada karya miliknya.
 */
export async function deleteComment(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || (session.user?.role !== 'admin' && session.user?.role !== 'author')) {
            return { error: "Unauthorized." };
        }

        const comment = await prisma.comment.findUnique({
            where: { id },
            include: {
                bab: {
                    include: {
                        karya: true
                    }
                }
            }
        });

        if (!comment) return { error: "Komentar tidak ditemukan." };

        // Otorisasi: Admin atau Pemilik Karya asal komentar
        if (session.user.role === 'author' && comment.bab.karya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda tidak memiliki hak untuk menghapus komentar ini." };
        }

        await prisma.comment.delete({ where: { id } });

        return { success: true };
    } catch (error) {
        console.error("[deleteComment] Error:", error);
        return { error: "Gagal menghapus komentar." };
    }
}
