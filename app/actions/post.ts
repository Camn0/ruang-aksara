'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { uploadToImageKit } from "@/lib/imageKit";
import { createNotification, notifyMentions } from "./notification";

// ==============================================================================
// 1. MUTASI AUTHOR: MEMBUAT POSTINGAN / PENGUMUMAN BARU
// ==============================================================================
/**
 * Server Action: Membuat postingan baru oleh Author.
 *
 * Alur:
 *   1. Validasi sesi pengguna (harus sudah login).
 *   2. Ekstraksi `content` (wajib) dan `image_url` (opsional) dari FormData.
 *   3. Simpan ke tabel `AuthorPost` di database.
 *   4. Revalidate cache halaman profil agar postingan langsung muncul tanpa full reload.
 *
 * @param formData - objek FormData dari form klien (field: content, image_url).
 * @returns `{ success: true }` | `{ error: string }`.
 *
 * DEBUG TIPS:
 *   - Jika error "Unauthorized", pastikan cookie sesi valid (cek di DevTools > Application > Cookies).
 *   - Jika data tidak muncul setelah submit, periksa apakah `revalidatePath` sudah dipanggil dengan path yang benar.
 */
export async function createAuthorPost(formData: FormData) {
    try {
        // [A] Validasi Sesi — getServerSession membaca JWT dari cookie request
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Ekstraksi Input dari FormData
        const content = formData.get('content') as string;
        const image_url = formData.get('image_url') as string | null;

        // [C] Validasi: konten tidak boleh kosong atau hanya whitespace
        if (!content || content.trim().length === 0) {
            return { error: "Konten tidak boleh kosong." };
        }

        // [D] Ambil ID penulis dari sesi yang sudah tervalidasi
        const author_id = session.user.id;

        // [CDN Migration] Handle Post Image Upload
        let finalImageUrl = image_url;
        if (image_url && image_url.startsWith('data:image')) {
            try {
                finalImageUrl = await uploadToImageKit(
                    image_url,
                    `post-${author_id}-${Date.now()}`,
                    "/author-posts"
                );
            } catch (err) {
                console.error("Post image upload failed:", err);
                // In case of failure, we skip the image rather than storing Base64
                finalImageUrl = null;
            }
        }

        // [E] Mutasi Database — simpan postingan ke tabel AuthorPost
        // Mengapa `prisma as any`: model AuthorPost mungkin belum ter-generate di Prisma Client type stale.
        // Jika terjadi error runtime, jalankan `npx prisma generate` untuk menyinkronkan schema.
        await (prisma as any).authorPost.create({
            data: {
                content: content.trim(),
                author_id,
                // Spread conditional: hanya sertakan image_url jika ada dan tidak kosong
                ...(finalImageUrl && finalImageUrl.trim() ? { image_url: finalImageUrl.trim() } : {})
            }
        });

        // [F] Invalidasi Cache Next.js — memastikan halaman profil di-render ulang dengan data terbaru
        // Pattern '[id]' berarti semua halaman profil dinamis akan di-revalidate.
        revalidateTag(`posts-author-${author_id}`);
        revalidatePath('/profile/[id]', 'page');

        // Trigger Notification for all followers
        try {
            const followers = await prisma.follow.findMany({
                where: { following_id: author_id },
                select: { follower_id: true }
            });

            await Promise.all(followers.map(f => 
                createNotification({
                    userId: f.follower_id,
                    actorId: author_id,
                    type: 'AUTHOR_POST',
                    category: 'UPDATE',
                    content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
                    link: `/profile/${author_id}`
                })
            ));
        } catch (err) {
            console.error("Failed to trigger author post notifications:", err);
        }

        return { success: true };
    } catch (e) {
        // DEBUG: Periksa error di terminal server (bukan di browser console)
        console.error("[createAuthorPost] Error:", e);
        return { error: "Gagal membuat postingan." };
    }
}


// ==============================================================================
// 2. MUTASI USER: TOGGLE LIKE POSTINGAN AUTHOR
// ==============================================================================
/**
 * Server Action: Toggle (like/unlike) pada postingan Author.
 *
 * Alur:
 *   1. Cek sesi login.
 *   2. Cari apakah user sudah pernah like postingan ini (composite key: user_id + post_id).
 *   3. Jika sudah ada → DELETE (unlike). Jika belum → CREATE (like).
 *   4. Revalidate cache profil.
 *
 * @param postId - ID postingan yang akan di-toggle like-nya.
 * @returns `{ success: true }` | `{ error: string }`.
 *
 * DEBUG TIPS:
 *   - Jika toggle tidak bekerja, periksa composite unique constraint `user_id_post_id` di schema.prisma.
 *   - Jika error P2002 (unique constraint), artinya ada duplikasi data — perlu dibersihkan manual di DB.
 */
export async function togglePostLike(postId: string) {
    try {
        // [A] Validasi Sesi
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Cek apakah user sudah pernah like postingan ini
        // Menggunakan composite unique key (user_id + post_id) untuk lookup efisien
        const existingLike = await (prisma as any).postLike.findUnique({
            where: {
                user_id_post_id: {
                    user_id: session.user.id,
                    post_id: postId
                }
            },
            include: {
                post: { select: { author_id: true } }
            }
        });

        // [C] Toggle Logic: sudah like → unlike (delete), belum like → like (create)
        let author_id = existingLike?.post.author_id;

        if (existingLike) {
            await (prisma as any).postLike.delete({ where: { id: existingLike.id } });
        } else {
            // If it's a new like, we need to know the author_id for revalidation
            const post = await (prisma as any).authorPost.findUnique({
                where: { id: postId },
                select: { author_id: true }
            });
            if (!post) return { error: "Postingan tidak ditemukan." };
            author_id = post.author_id;

            await (prisma as any).postLike.create({
                data: {
                    user_id: session.user.id,
                    post_id: postId
                }
            });

            // Trigger Notification
            try {
                await createNotification({
                    userId: author_id!,
                    actorId: session.user.id,
                    type: 'LIKE',
                    category: 'SOCIAL',
                    link: `/profile/${author_id}`
                });
            } catch (err) {
                console.error("Failed to trigger post like notification:", err);
            }
        }

        // [D] Revalidate cache agar jumlah like ter-update di UI
        if (author_id) {
            revalidateTag(`posts-author-${author_id}`);
        }
        revalidatePath('/profile/[id]', 'page');
        return { success: true };
    } catch (e) {
        console.error("[togglePostLike] Error:", e);
        return { error: "Gagal memproses like." };
    }
}


// ==============================================================================
// 3. MUTASI USER: KOMENTAR PADA POSTINGAN AUTHOR
// ==============================================================================
/**
 * Server Action: Mengirim komentar pada postingan Author.
 *
 * Alur:
 *   1. Validasi sesi pengguna.
 *   2. Ekstraksi `post_id` dan `content` dari FormData.
 *   3. Validasi bahwa komentar tidak kosong.
 *   4. Simpan ke tabel `PostComment`, include relasi user untuk response langsung.
 *   5. Revalidate halaman profil.
 *
 * @param formData - FormData berisi field: post_id, content.
 * @returns `{ success: true, data: PostComment }` | `{ error: string }`.
 *
 * DEBUG TIPS:
 *   - Jika komentar tidak muncul setelah submit, cek apakah `include: { user: true }` sudah ada.
 *   - Jika error foreign key, pastikan `post_id` valid dan postingan belum dihapus.
 */
export async function submitPostComment(formData: FormData) {
    try {
        // [A] Validasi Sesi
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Ekstraksi Input
        const post_id = formData.get('post_id') as string;
        const content = formData.get('content') as string;

        // [C] Validasi: post_id wajib ada, konten tidak boleh kosong
        if (!post_id || !content || content.trim().length === 0) {
            return { error: "Komentar tidak boleh kosong." };
        }

        // [D] Mutasi Database — simpan komentar baru
        // `include: { user: true }` → agar response langsung berisi data user (untuk render optimistic di klien)
        const newComment = await (prisma as any).postComment.create({
            data: {
                user_id: session.user.id,
                post_id,
                content: content.trim()
            },
            select: {
                id: true,
                content: true,
                created_at: true,
                user: { select: { id: true, username: true, display_name: true, avatar_url: true } },
                post: { select: { author_id: true } }
            }
        });

        // [E] Revalidate cache
        revalidateTag(`posts-author-${newComment.post.author_id}`);
        revalidatePath('/profile/[id]', 'page');

        // Trigger Notification
        try {
            if (newComment.post.author_id !== session.user.id) {
                await createNotification({
                    userId: newComment.post.author_id,
                    actorId: session.user.id,
                    type: 'REPLY',
                    category: 'DIRECT',
                    content: content,
                    link: `/profile/${newComment.post.author_id}`
                });
            }
        } catch (err) {
            console.error("Failed to trigger post comment notification:", err);
        }

        // Trigger Mentions
        try {
            await notifyMentions(content, session.user.id, `/profile/${newComment.post.author_id}`);
        } catch (err) {
            console.error("Failed to trigger mention notification:", err);
        }

        return { success: true, data: newComment };
    } catch (e) {
        console.error("[submitPostComment] Error:", e);
        return { error: "Gagal mengirim komentar." };
    }
}


// ==============================================================================
// 4. MUTASI USER/ADMIN: HAPUS KOMENTAR PADA POSTINGAN AUTHOR
// ==============================================================================
/**
 * Server Action: Menghapus komentar pada postingan Author.
 *
 * Otorisasi:
 *   - Hanya pemilik komentar atau admin yang boleh menghapus.
 *
 * @param commentId - ID komentar yang akan dihapus.
 * @returns `{ success: true }` | `{ error: string }`.
 *
 * DEBUG TIPS:
 *   - Jika error "Forbidden", artinya user yang login bukan pemilik komentar dan bukan admin.
 *   - Jika error "Komentar tidak ditemukan", ID mungkin sudah expired/dihapus sebelumnya.
 */
export async function deletePostComment(commentId: string) {
    try {
        // [A] Validasi Sesi
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Cari komentar berdasarkan ID — pastikan masih ada di database
        const existing = await (prisma as any).postComment.findUnique({ 
            where: { id: commentId },
            select: { 
                id: true, 
                user_id: true,
                post: { select: { author_id: true } }
            }
        });
        if (!existing) return { error: "Komentar tidak ditemukan." };

        // [C] Otorisasi: hanya pemilik komentar atau admin yang boleh hapus
        if (existing.user_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden." };
        }

        // [D] Mutasi: hapus komentar dari database
        await (prisma as any).postComment.delete({ where: { id: commentId } });

        // [E] Revalidate cache profil
        revalidateTag(`posts-author-${existing.post.author_id}`);
        revalidatePath('/profile/[id]', 'page');
        return { success: true };
    } catch (e) {
        console.error("[deletePostComment] Error:", e);
        return { error: "Gagal menghapus komentar." };
    }
}

// ==============================================================================
// 5. MUTASI AUTHOR/ADMIN: HAPUS POSTINGAN AUTHOR
// ==============================================================================
/**
 * Server Action: Menghapus postingan Author.
 *
 * Otorisasi:
 *   - Hanya pemilik postingan atau admin yang boleh menghapus.
 *
 * @param postId - ID postingan yang akan dihapus.
 * @returns `{ success: true }` | `{ error: string }`.
 */
export async function deleteAuthorPost(postId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const existing = await (prisma as any).authorPost.findUnique({ 
            where: { id: postId },
            select: { author_id: true }
        });
        if (!existing) return { error: "Postingan tidak ditemukan." };

        if (existing.author_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden." };
        }

        await (prisma as any).authorPost.delete({ where: { id: postId } });

        revalidateTag(`posts-author-${existing.author_id}`);
        revalidatePath('/profile/[id]', 'page');
        return { success: true };
    } catch (e) {
        console.error("[deleteAuthorPost] Error:", e);
        return { error: "Gagal menghapus postingan." };
    }
}

// ==============================================================================
// 6. QUERY: AMBIL LEBIH BANYAK KOMENTAR POST (PAGINATION)
// ==============================================================================
/**
 * Server Action: Mengambil potongan komentar berikutnya untuk sebuah postingan.
 * @param postId - ID postingan.
 * @param skip - Jumlah record yang dilewati (offset).
 * @param take - Jumlah record yang diambil (chunk size).
 */
export async function getMorePostComments(postId: string, skip: number, take: number = 10) {
    try {
        const comments = await (prisma as any).postComment.findMany({
            where: { post_id: postId },
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
        console.error("[getMorePostComments] Error:", e);
        return { error: "Gagal memuat lebih banyak komentar." };
    }
}
