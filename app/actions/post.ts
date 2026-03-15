'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { marked } from "marked";

const PostSchema = z.object({
    content: z.string().min(1, "Konten tidak boleh kosong").max(5000),
    image_url: z.string().url("URL Gambar tidak valid").nullable().or(z.literal("")).optional(),
});

const PostIdSchema = z.string().uuid();

const PostCommentSchema = z.object({
    post_id: z.string().uuid(),
    content: z.string().min(1, "Komentar tidak boleh kosong").max(1000),
});

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

        const validation = PostSchema.safeParse({ content, image_url });
        if (!validation.success) {
            return { error: `Validasi gagal: ${validation.error.issues[0].message}` };
        }

        // [D] Ambil ID penulis dari sesi yang sudah tervalidasi
        const author_id = session.user.id;

        // [E] Mutasi Database — simpan postingan ke tabel AuthorPost
        // Mengapa `prisma as any`: model AuthorPost mungkin belum ter-generate di Prisma Client type stale.
        // Jika terjadi error runtime, jalankan `npx prisma generate` untuk menyinkronkan schema.
        await (prisma as any).authorPost.create({
            data: {
                content: content.trim(),
                content_html: marked.parse(content.trim()) as string,
                author_id,
                // Spread conditional: hanya sertakan image_url jika ada dan tidak kosong
                ...(image_url && image_url.trim() ? { image_url: image_url.trim() } : {})
            }
        });

        // [F] Invalidasi Cache Next.js — memastikan halaman profil di-render ulang dengan data terbaru
        // Pattern '[id]' berarti semua halaman profil dinamis akan di-revalidate.
        revalidatePath('/profile/[id]', 'page');
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
            }
        });

        // [C] Toggle Logic: sudah like → unlike (delete), belum like → like (create)
        if (existingLike) {
            await (prisma as any).postLike.delete({ where: { id: existingLike.id } });
        } else {
            await (prisma as any).postLike.create({
                data: {
                    user_id: session.user.id,
                    post_id: postId
                }
            });
        }

        // [D] Revalidate cache agar jumlah like ter-update di UI
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

        const validation = PostCommentSchema.safeParse({ post_id, content });
        if (!validation.success) {
            return { error: `Validasi gagal: ${validation.error.issues[0].message}` };
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
                user: { select: { id: true, username: true, display_name: true, avatar_url: true } }
            }
        });

        // [E] Revalidate cache
        revalidatePath('/profile/[id]', 'page');
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
        const validation = PostIdSchema.safeParse(commentId);
        if (!validation.success) return { error: "ID Komentar tidak valid." };

        // [A] Validasi Sesi
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Cari komentar berdasarkan ID — pastikan masih ada di database
        const existing = await (prisma as any).postComment.findUnique({ 
            where: { id: commentId },
            select: { id: true, user_id: true }
        });
        if (!existing) return { error: "Komentar tidak ditemukan." };

        // [C] Otorisasi: hanya pemilik komentar atau admin yang boleh hapus
        if (existing.user_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden." };
        }

        // [D] Mutasi: hapus komentar dari database
        await (prisma as any).postComment.delete({ where: { id: commentId } });

        // [E] Revalidate cache profil
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

        const validation = PostIdSchema.safeParse(postId);
        if (!validation.success) return { error: "ID Post tidak valid." };

        const existing = await (prisma as any).authorPost.findUnique({ 
            where: { id: postId },
            select: { author_id: true }
        });
        if (!existing) return { error: "Postingan tidak ditemukan." };

        if (existing.author_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden." };
        }

        await (prisma as any).authorPost.delete({ where: { id: postId } });

        revalidatePath('/profile/[id]', 'page');
        return { success: true };
    } catch (e) {
        console.error("[deleteAuthorPost] Error:", e);
        return { error: "Gagal menghapus postingan." };
    }
}
