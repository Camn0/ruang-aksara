'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

// ==============================================================================
// 1. MUTASI USER: TOGGLE UPVOTE PADA REVIEW
// ==============================================================================
/**
 * Server Action: Toggle (upvote/un-upvote) pada sebuah Review.
 *
 * Alur:
 *   1. Cek sesi login.
 *   2. Cari apakah user sudah pernah upvote review ini (composite key: user_id + review_id).
 *   3. Jika sudah ada → DELETE (un-upvote). Jika belum → CREATE (upvote).
 *   4. Revalidate cache di path yang diberikan.
 *
 * @param reviewId - ID review yang akan di-toggle upvote-nya.
 * @param path - Path halaman yang perlu di-revalidate (e.g., '/novel/[karyaId]').
 * @returns `{ success: true }` | `{ error: string }`.
 *
 * DEBUG TIPS:
 *   - Jika toggle tidak bekerja, periksa composite unique constraint `user_id_review_id` di schema.prisma.
 *   - Perhatikan parameter `path` — jika salah, cache tidak akan di-invalidasi dan UI tidak update.
 */
export async function toggleReviewUpvote(reviewId: string, path: string) {
    try {
        // [A] Validasi Sesi — harus login untuk bisa upvote
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Cek apakah user sudah pernah upvote review ini
        // Menggunakan composite unique key (user_id + review_id) untuk lookup efisien
        const existingUpvote = await (prisma as any).reviewUpvote.findUnique({
            where: {
                user_id_review_id: {
                    user_id: session.user.id,
                    review_id: reviewId
                }
            }
        });

        // [C] Toggle Logic: sudah upvote → un-upvote (delete), belum upvote → upvote (create)
        if (existingUpvote) {
            await (prisma as any).reviewUpvote.delete({ where: { id: existingUpvote.id } });
        } else {
            await (prisma as any).reviewUpvote.create({
                data: {
                    user_id: session.user.id,
                    review_id: reviewId
                }
            });
        }

        // [D] Revalidate cache di path spesifik (halaman novel detail)
        // Mengapa parameter `path`: agar fungsi ini fleksibel, bisa dipanggil dari berbagai halaman.
        revalidateTag(`user-upvotes-${session.user.id}`);
        revalidatePath(path);
        return { success: true };
    } catch (e) {
        console.error("[toggleReviewUpvote] Error:", e);
        return { error: "Gagal memproses upvote ulasan." };
    }
}


// ==============================================================================
// 2. MUTASI USER: KOMENTAR PADA REVIEW
// ==============================================================================
/**
 * Server Action: Mengirim komentar pada sebuah Review.
 *
 * Alur:
 *   1. Validasi sesi pengguna.
 *   2. Ekstraksi `review_id` dan `content` dari FormData.
 *   3. Validasi bahwa komentar tidak kosong.
 *   4. Simpan ke tabel `ReviewComment`.
 *   5. Revalidate halaman novel detail.
 *
 * @param formData - FormData berisi field: review_id, content.
 * @returns `{ success: true }` | `{ error: string }`.
 *
 * DEBUG TIPS:
 *   - Jika error foreign key (P2003), pastikan `review_id` masih valid (review belum dihapus).
 *   - Jika komentar tidak muncul, pastikan `revalidatePath` cocok dengan halaman yang menampilkan komentar.
 */
export async function submitReviewComment(formData: FormData) {
    try {
        // [A] Validasi Sesi
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Ekstraksi Input dari FormData
        const review_id = formData.get('review_id') as string;
        const content = formData.get('content') as string;

        // [C] Validasi Input — review_id dan content wajib ada
        if (!review_id || !content || content.trim().length === 0) {
            return { error: "Komentar tidak boleh kosong." };
        }

        // [D] Mutasi Database — simpan komentar review baru
        const newComment = await (prisma as any).reviewComment.create({
            data: {
                user_id: session.user.id,
                review_id,
                content: content.trim()
            },
            select: {
                review: { select: { karya_id: true } }
            }
        });

        // [E] Revalidate cache halaman novel detail
        // Menggunakan karya_id spesifik agar path revalidation akurat
        const karyaId = newComment.review.karya_id;
        revalidateTag(`karya-${karyaId}`);
        revalidateTag(`user-reviews-${session.user.id}`);
        revalidatePath(`/novel/${karyaId}`);
        return { success: true };
    } catch (e) {
        console.error("[submitReviewComment] Error:", e);
        return { error: "Gagal mengirim komentar." };
    }
}

/**
 * Server Action: Menghapus sebuah Review.
 */
export async function deleteReview(reviewId: string, path: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
            select: {
                id: true,
                user_id: true,
                karya: { select: { uploader_id: true } }
            }
        });

        if (!review) return { error: "Ulasan tidak ditemukan." };

        // Cek izin: Creator ulasan, Uploader karya, atau Admin
        const isAdmin = session.user.role === 'admin';
        const isCreator = session.user.id === review.user_id;
        const isAuthor = session.user.id === (review as any).karya.uploader_id;

        if (!isAdmin && !isCreator && !isAuthor) {
            return { error: "Tidak memiliki izin untuk menghapus ulasan ini." };
        }

        await prisma.review.delete({ where: { id: reviewId } });

        revalidatePath(path);
        return { success: true };
    } catch (e) {
        console.error("[deleteReview] Error:", e);
        return { error: "Gagal menghapus ulasan." };
    }
}

/**
 * Server Action: Menghapus komentar pada Review.
 */
export async function deleteReviewComment(commentId: string, path: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const comment = await (prisma as any).reviewComment.findUnique({
            where: { id: commentId },
            select: {
                id: true,
                user_id: true,
                review: {
                    select: {
                        karya: { select: { uploader_id: true } }
                    }
                }
            }
        });

        if (!comment) return { error: "Komentaran tidak ditemukan." };

        // Cek izin: Creator komentar, Uploader karya, atau Admin
        const isAdmin = session.user.role === 'admin';
        const isCreator = session.user.id === comment.user_id;
        const isAuthor = session.user.id === comment.review.karya.uploader_id;

        if (!isAdmin && !isCreator && !isAuthor) {
            return { error: "Tidak memiliki izin untuk menghapus komentar ini." };
        }

        await (prisma as any).reviewComment.delete({ where: { id: commentId } });

        revalidatePath(path);
        return { success: true };
    } catch (e) {
        console.error("[deleteReviewComment] Error:", e);
        return { error: "Gagal menghapus komentar." };
    }
}

// ==============================================================================
// 3. QUERY: AMBIL LEBIH BANYAK KOMENTAR REVIEW (PAGINATION)
// ==============================================================================
/**
 * Server Action: Mengambil potongan komentar berikutnya untuk sebuah review.
 * @param reviewId - ID review.
 * @param skip - Jumlah record yang dilewati (offset).
 * @param take - Jumlah record yang diambil (chunk size).
 */
export async function getMoreReviewComments(reviewId: string, skip: number, take: number = 10) {
    try {
        const comments = await (prisma as any).reviewComment.findMany({
            where: { review_id: reviewId },
            select: {
                id: true,
                content: true,
                created_at: true,
                user_id: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        display_name: true,
                        avatar_url: true
                    }
                }
            },
            orderBy: { created_at: 'asc' },
            skip,
            take
        });

        return { success: true, data: comments };
    } catch (e) {
        console.error("[getMoreReviewComments] Error:", e);
        return { error: "Gagal memuat lebih banyak komentar." };
    }
}
