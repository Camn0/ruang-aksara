'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';

// ==============================================================================
// 1. MUTASI USER (READER): MENGUNGGAH KOMENTAR PADA BAB
// ==============================================================================
/**
 * Server Action: Mengirim komentar baru atau balasan pada sebuah bab novel.
 * 
 * Fitur:
 *   - Mendukung threading (nested comments) lewat `parent_id`.
 *   - Terlindungi oleh autentikasi server-side.
 * 
 * @param formData - Objek FormData (bab_id, content, parent_id?).
 * @returns `{ success: true, data: Comment }` | `{ error: string }`.
 * 
 * DEBUG TIPS:
 *   - Jika komentar tidak muncul, pastikan `bab_id` valid dan bukan ID karya.
 *   - Jika `parent_id` tidak null, komentar akan dianggap sebagai balasan.
 */
export async function submitComment(formData: FormData) {
    try {
        // [A] Validasi Autentikasi Level Server
        // Mengapa: Kita menggunakan server action agar session dibaca langsung dari kuki terenkripsi.
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return { error: "Unauthorized: Anda harus login untuk memberikan komentar." };
        }

        // [B] Ekstraksi & Validasi Input
        const bab_id = formData.get('bab_id') as string;
        let content = formData.get('content') as string;
        const parent_id = formData.get('parent_id') as string | null;

        if (!bab_id || !content || content.trim() === '') {
            return { error: "Bad Request: Komentar kosong tidak diizinkan." };
        }

        // [C] Sanitasi Konten
        content = content.trim();

        // [D] Mutasi Database
        // Mengapa: Kita membiarkan Prisma menangani relasi parent_id secara opsional.
        const newComment = await prisma.comment.create({
            data: {
                user_id: session.user.id,
                bab_id,
                content,
                parent_id: parent_id || null
            }
        });

        // Mengembalikan object murni bagi sinkronisasi state React
        return { success: true, data: newComment };

    } catch (error) {
        console.error("[submitComment] Database Error:", error);
        return { error: "Internal Server Error: Gagal menyimpan komentar." };
    }
}


// ==============================================================================
// 2. MUTASI USER (READER): RATING CEPAT (UPSERT TRANSACTION)
// ==============================================================================
/**
 * Server Action: Mengirim rating (skor 1-5) untuk sebuah karya.
 * 
 * Logic Highlights:
 *   1. Menggunakan `upsert` untuk efisiensi (Update jika sudah ada, Create jika baru).
 *   2. Menjalankan `$transaction` atomik untuk sinkronisasi skor rata-rata (`avg_rating`) ke tabel Karya.
 * 
 * Mengapa Transaksi?: Agar tidak terjadi inkonsistensi data jika server mati di tengah proses update.
 * 
 * @param formData - Objek FormData (karya_id, score).
 * @returns `{ success: true, data: Rating }` | `{ error: string }`.
 * 
 * DEBUG TIPS:
 *   - 'score berbohong' muncul jika manipulasi DOM mengirim nilai di luar 1-5.
 *   - Periksa `avg_rating` di tabel Karya jika skor rata-rata tidak berubah.
 */
export async function submitRating(formData: FormData) {
    try {
        // [A] Validasi Autentikasi
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return { error: "Unauthorized: Anda harus login untuk memberikan rating." };
        }

        // [B] Ekstraksi & Konversi Tipe Data
        const karya_id = formData.get('karya_id') as string;
        const score = Number(formData.get('score'));
        const userId = session.user.id;

        // [C] Security Boundary: Skoring Berintegritas
        if (!karya_id || isNaN(score) || score < 1 || score > 5) {
            return { error: "Bad Request: Karya ID tidak valid atau skor berbohong (harus 1 sampai 5)." };
        }

        // [D] DB Transaction Logics 
        // Mengapa: Memakai `$transaction` agar tiga operasi ini berjalan sebagai satu unit kerja (atomic).
        const resultTransaction = await prisma.$transaction(async (tx: any) => {

            // Tahap 1: UPSERT Data Rating
            // Mengapa: Memakai composite key `[user_id, karya_id]` agar 1 user hanya punya 1 record rating per karya.
            const ratingUpserted = await tx.rating.upsert({
                where: {
                    user_id_karya_id: {
                        user_id: userId,
                        karya_id: karya_id,
                    }
                },
                update: { score: score },
                create: {
                    user_id: userId,
                    karya_id: karya_id,
                    score: score,
                }
            });

            // Tahap 2: MENGHITUNG ulang agregat di keseluruhan table
            // Mengapa: Melakukan rerata di DB (_avg) jauh lebih cepat daripada memuat semua baris ke Node.js.
            const databaseAggregate = await tx.rating.aggregate({
                where: { karya_id: karya_id },
                _avg: { score: true }
            });

            const rerataNilai = databaseAggregate._avg.score || 0;

            // Tahap 3: DENORMALISASI Caching Value
            // Mengapa: Menyimpan hasil rerata di tabel Karya agar pencarian/pengurutan 'Top Rated' instan.
            await tx.karya.update({
                where: { id: karya_id },
                data: { avg_rating: rerataNilai }
            });

            return ratingUpserted;
        });

        // Invalidate cache hlm detail agar rating terbaru muncul
        revalidateTag(`karya-${karya_id}`);

        return { success: true, data: resultTransaction };

    } catch (error) {
        console.error("[submitRating] Transaction Error:", error);
        return { error: "Internal Server Error: Sistem gagal memproses rating." };
    }
}

// ==============================================================================
// 3. MUTASI USER: MENULIS REVIEW RESMI (TEXT + RATING)
// ==============================================================================
/**
 * Server Action: Mengirim ulasan tekstual beserta rating.
 * 
 * Perbedaan dengan `submitRating`: 
 *   - Review berisi konten teks dan bersifat publik/terlihat di halaman detail.
 *   - Jika review membawa rating, sistem otomatis sinkron ke tabel Rating Cepat.
 * 
 * @param formData - Objek FormData (karya_id, content, rating).
 */
export async function submitReview(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const karya_id = formData.get('karya_id') as string;
        const content = formData.get('content') as string;
        const ratingStr = formData.get('rating') as string;
        const rating = ratingStr && ratingStr !== '0' ? parseInt(ratingStr, 10) : null;

        if (!karya_id || !content) {
            return { error: "Isian review tidak valid." };
        }

        // Validasi boundary rating jika ada
        if (rating !== null && (rating < 1 || rating > 5)) {
            return { error: "Isian rating tidak valid." };
        }

        const sanitizedContent = content.trim();

        await prisma.$transaction(async (tx) => {
            // 1. Simpan/Update Ulasan Teks
            await tx.review.upsert({
                where: { user_id_karya_id: { user_id: session.user.id, karya_id } },
                update: { content: sanitizedContent, rating: (rating as any) ?? undefined },
                create: { user_id: session.user.id, karya_id, content: sanitizedContent, rating: (rating as any) ?? undefined }
            });

            // 2. Sinkronisasi dengan Sistem Rating Global (jika user memberikan rating di form review)
            if (rating !== null) {
                const finalRating = Number(rating);
                await tx.rating.upsert({
                    where: { user_id_karya_id: { user_id: session.user.id, karya_id } },
                    update: { score: finalRating },
                    create: { user_id: session.user.id, karya_id, score: finalRating }
                });

                // Rekalkulasi denormalisasi rating di tabel Karya
                const aggr = await tx.rating.aggregate({
                    where: { karya_id },
                    _avg: { score: true }
                });
                await tx.karya.update({
                    where: { id: karya_id },
                    data: { avg_rating: aggr._avg.score || 0 }
                });
            }
        });

        revalidateTag(`karya-${karya_id}`);
        return { success: true };
    } catch (error) {
        console.error("[submitReview] Error:", error);
        return { error: "Sistem gagal menyimpan review." };
    }
}

// ==============================================================================
// 4. MUTASI USER/ADMIN: MODERASI KOMENTAR
// ==============================================================================
/**
 * Server Action: Menghapus komentar di bab.
 * 
 * Aturan Otorisasi:
 *   - Penulis komentar asli boleh menghapus.
 *   - Admin boleh menghapus (moderasi).
 */
export async function deleteComment(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const existingComment = await prisma.comment.findUnique({ where: { id } });
        if (!existingComment) return { error: "Komentar tidak ditemukan." };

        // [Security Check]
        if (existingComment.user_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden: Anda tidak memiliki hak akses menghapus komentar ini." };
        }

        await prisma.comment.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("[deleteComment] Error:", error);
        return { error: "Sistem gagal menghapus komentar." };
    }
}

// ==============================================================================
// 5. MUTASI USER: UPDATE PROGRES MEMBACA (BOOKMARK)
// ==============================================================================
/**
 * Server Action: Mencatat progres membaca terakhir pembaca.
 * 
 * Mengapa: Dipisahkan dari request GET halaman agar tidak memicu write DB
 * yang berlebihan saat sistem melakukan "prefetch" (automasi link).
 * 
 * @param karyaId - ID Karya yang sedang dibaca.
 * @param chapterNo - Nomor bab yang sedang dibaca.
 */
export async function updateReadingProgress(karyaId: string, chapterNo: number) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: "Unauthorized" };

        const userId = session.user.id;

        // [1] Optimisasi: Cek apakah data sudah sama sebelum update berat
        const existing = await prisma.bookmark.findUnique({
            where: {
                user_id_karya_id: {
                    user_id: userId,
                    karya_id: karyaId
                }
            }
        });

        if (existing && existing.last_chapter === chapterNo) {
            // Jika sudah di bab yang sama, tidak perlu update DB & Revalidate (Hemat Request)
            return { success: true, cached: true };
        }

        // [2] Lakukan Update (Upsert)
        await prisma.bookmark.upsert({
            where: {
                user_id_karya_id: {
                    user_id: userId,
                    karya_id: karyaId
                }
            },
            update: {
                last_chapter: chapterNo,
                updated_at: new Date()
            },
            create: {
                user_id: userId,
                karya_id: karyaId,
                last_chapter: chapterNo
            }
        });

        // [3] Revalidate library & dashboard agar history ter-update
        revalidateTag(`library-${userId}`);

        return { success: true };
    } catch (error) {
        console.error("[updateReadingProgress] Error:", error);
        return { success: false, error: "Database Error" };
    }
}
