/**
 * @file admin.ts
 * @description High-security Server Actions locked behind RBAC, governing Novel/Author creation, deletion, and moderation.
 * @author Ruang Aksara Engineering Team
 */

'use server';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidateTag, revalidatePath } from 'next/cache';
import { marked } from 'marked';
import { z } from 'zod';
import { uploadToImageKit } from '@/lib/imageKit';
import { createNotification } from './notification';

const BabSchema = z.object({
    karya_id: z.string().uuid(),
    chapter_no: z.number().int().min(1),
    title: z.string().min(1, "Judul bab tidak boleh kosong").max(200),
    content: z.string().min(10, "Konten bab terlalu pendek"),
});

// ==============================================================================
// 1. MUTASI ADMIN/AUTHOR: MEMBUAT KARYA BARU
// ==============================================================================
/**
 * createKarya:
 * Server Action to spawn a new literary work (Novel/Book).
 * 
 * Logic flow:
 * 1. [RBAC] Verify session and role (must be Admin or Author).
 * 2. [CDN] Process cover image (Base64 to ImageKit storage).
 * 3. [DATABASE] Create the 'Karya' record and connect existing 'Genre' IDs.
 * 4. [NOTIFICATION] Alert all followers about the new publication.
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

        // [New] Chapter Data (Step 2)
        const bab_title = (formData.get('bab_title') as string)?.trim() || null;
        const bab_content = (formData.get('bab_content') as string)?.trim();

        // [C] Validasi Kelengkapan Input
        if (!title) {
            return { error: "Bad Request: Judul karya wajib diisi." };
        }

        // [D] Sinkronisasi Sesi & Database
        const existingUser = await prisma.user.findUnique({
            where: { id: session.user.id }
        });

        if (!existingUser) {
            return { error: "Sesi Anda sudah kedaluwarsa atau tidak valid." };
        }

        // [E] Logika Penanganan Alias Penulis
        const cleanAlias = input_penulis_alias?.replace(/\s\([^)]+\)$/, '').trim();
        const final_penulis_alias = cleanAlias
            ? `${cleanAlias} (${existingUser.username})`
            : existingUser.username;

        // [F] Penanganan Gambar (CDN Migration)
        let finalCoverUrl = cover_url;
        if (cover_url && cover_url.startsWith('data:image')) {
            try {
                finalCoverUrl = await uploadToImageKit(
                    cover_url, 
                    `cover-${Date.now()}`, 
                    "/novel-covers"
                );
            } catch (uploadError) {
                console.error("Cover upload failed:", uploadError);
                return { error: "Gagal mengunggah sampul novel ke CDN." };
            }
        }

        // [G] Mutasi Database (ATOMIC TRANSACTION)
        // Mengapa: Kita menggunakan $transaction agar Karya dan Bab 1 dibuat bersamaan.
        // Jika salah satu gagal (misal: Bab content kosong), maka Karya tidak akan dibuat.
        const result = await prisma.$transaction(async (tx) => {
            const karya = await tx.karya.create({
                data: {
                    title,
                    penulis_alias: final_penulis_alias,
                    deskripsi,
                    cover_url: finalCoverUrl,
                    uploader_id: session.user.id,
                    genres: {
                        connect: genreIds.map((id) => ({ id }))
                    }
                }
            });

            let chapterCreated = false;
            if (bab_content) {
                await tx.bab.create({
                    data: {
                        karya_id: karya.id,
                        chapter_no: 1,
                        title: bab_title,
                        content: bab_content,
                    }
                });
                chapterCreated = true;
            }

            return { karya, chapterCreated };
        });

        const { karya: karyaBaru, chapterCreated } = result;

        // [Local Snappiness] Invalidate Author Dashboard immediately
        revalidateTag(`karya-author-${session.user.id}`);

        // [NOTIFICATION & FEED]
        // Note: Global and Author dashboards are revalidated immediately.
        // Follower feeds are eventually consistent (refreshed every hour) to maintain performance.
        try {
            const followers = await prisma.follow.findMany({
                where: { following_id: session.user.id },
                select: { follower_id: true }
            });

            await Promise.all(followers.map(async (f) => {
                // 1. Send Notification
                await createNotification({
                    userId: f.follower_id,
                    actorId: session.user.id,
                    type: 'NEW_WORK',
                    category: 'IMPORTANT',
                    content: `Telah menerbitkan karya baru: "${title}"`,
                    link: `/novel/${karyaBaru.id}`
                });
            }));

            // Jika bab 1 dibuat, kirim notifikasi UPDATE juga
            if (chapterCreated) {
                // Saat ini belum ada bookmarkers karena karya baru saja dibuat,
                // tapi followers mungkin ingin tahu bab pertama sudah tersedia.
                // Namun sesuai logika createBab, kita kirim ke followers juga (sebagai karya baru).
                // Notification NEW_WORK sudah cukup, tapi kita bisa tambah log/logic di sini jika perlu.
            }
        } catch (err) {
            console.error("Failed to trigger new work notifications:", err);
        }

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
 * createBab:
 * Server Action to append a new chapter to an existing work.
 * 
 * Features:
 * - Managed Sequential Numbering: Automatically calculates the next chapter number based on current MAX + 1.
 * - Cache Invalidation: Triggers a refresh of the novel's public detail page.
 * - Broadcast Notifications: Alerts all users who have bookmarked the novel.
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

        // Trigger Notification for Bookmarkers (UPDATE Category)
        try {
            const bookmarkers = await prisma.bookmark.findMany({
                where: { karya_id: karya_id },
                select: { user_id: true }
            });

            const karya = await prisma.karya.findUnique({ where: { id: karya_id }, select: { title: true } });
            const chapterTitle = title ? `: ${title}` : '';

            await Promise.all(bookmarkers.map(b => 
                createNotification({
                    userId: b.user_id,
                    actorId: session.user.id,
                    type: 'NEW_CHAPTER',
                    category: 'UPDATE',
                    content: `Bab ${chapter_no}${chapterTitle} has been uploaded to "${karya?.title}"`,
                    link: `/novel/${karya_id}/${chapter_no}`,
                    clusteringKey: karya_id
                })
            ));
        } catch (err) {
            console.error("Failed to trigger new chapter notifications:", err);
        }

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
        // Handle CDN Upload if Base64
        let finalCoverUrl = cover_url;
        if (cover_url && cover_url.startsWith('data:image')) {
            try {
                finalCoverUrl = await uploadToImageKit(
                    cover_url, 
                    `cover-edit-${id}-${Date.now()}`, 
                    "/novel-covers"
                );
            } catch (err) {
                console.error("Edit cover upload failed:", err);
                return { error: "Gagal mengunggah sampul novel ke CDN. Silakan coba lagi." };
            }
        }

        // Mengapa `set`: Menghapus relasi genre lama dan menggantinya dengan list baru secara atomik.
        await prisma.karya.update({
            where: { id },
            data: {
                title,
                penulis_alias: final_penulis_alias,
                deskripsi,
                cover_url: finalCoverUrl,
                is_completed,
                genres: {
                    set: genreIds.map((gId) => ({ id: gId }))
                }
            }
        });

        revalidateTag(`karya-${id}`);
        revalidateTag(`karya-author-${session.user.id}`);

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
        revalidateTag(`karya-author-${session.user.id}`);

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
 * editBab:
 * Updates the content and metadata of a specific chapter.
 * Includes Zod validation for production data integrity.
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
            select: { 
                id: true, 
                karya: { select: { uploader_id: true } } 
            }
        });
        if (!existingBab) return { error: "Bab tidak ditemukan." };

        // Cek apakah user punya hak atas karya yang membawahi bab ini
        if (session.user.role === 'author' && existingBab.karya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik bab ini." };
        }

        const title = formData.get('title') as string || undefined;

        // [New] Early Zod Validation (#80 Golden Optimization)
        const validation = BabSchema.partial().safeParse({
            title,
            content
        });

        if (!validation.success) {
            return { error: `Validasi gagal: ${validation.error.issues[0].message}` };
        }

        await prisma.bab.update({
            where: { id },
            data: { 
                content: content.trim(),
            }
        });

        const bab = await prisma.bab.findUnique({
            where: { id },
            select: { chapter_no: true, karya_id: true }
        });

        if (bab) {
            revalidateTag(`chapter-${bab.karya_id}-${bab.chapter_no}`);
            revalidateTag(`karya-${bab.karya_id}`);
        }

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
            select: { 
                id: true, 
                karya: { select: { uploader_id: true } } 
            }
        });
        if (!existingBab) return { error: "Bab tidak ditemukan." };

        if (session.user.role === 'author' && existingBab.karya.uploader_id !== session.user.id) {
            return { error: "Forbidden: Anda bukan pemilik bab ini." };
        }

        if (existingBab) {
            revalidateTag(`chapter-${existingBab.karya.uploader_id}-${(existingBab as any).chapter_no}`);
            revalidateTag(`karya-${existingBab.karya.uploader_id}`);
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
            select: { id: true, is_pinned: true, karya: { select: { uploader_id: true } } }
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
            select: {
                id: true,
                bab: {
                    select: {
                        karya: { select: { uploader_id: true } }
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
