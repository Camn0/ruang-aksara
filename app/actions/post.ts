'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

        // [E] Mutasi Database — simpan postingan ke tabel AuthorPost
        // Mengapa `prisma as any`: model AuthorPost mungkin belum ter-generate di Prisma Client type stale.
        // Jika terjadi error runtime, jalankan `npx prisma generate` untuk menyinkronkan schema.
        await (prisma as any).authorPost.create({
            data: {
                content: content.trim(),
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
            include: { user: true }
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
        // [A] Validasi Sesi
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [B] Cari komentar berdasarkan ID — pastikan masih ada di database
        const existing = await (prisma as any).postComment.findUnique({ where: { id: commentId } });
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
