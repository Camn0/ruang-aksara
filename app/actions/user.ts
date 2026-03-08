'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mengapa: Instansiasi klien Prisma secara global untuk menekan over-connection akibat proses dev (hot reload)
import { prisma } from '@/lib/prisma';

// ==============================================================================
// 1. MUTASI USER (READER): MENGUNGGAH KOMENTAR
// ==============================================================================
// Mengapa: Server Action dikhususkan untuk Reader agar interaksi datanya terlindungi
// dari serangan injeksi XSS form klien langsung.
export async function submitComment(formData: FormData) {
    try {
        // [A] Validasi Autentikasi Level Server
        const session = await getServerSession(authOptions);

        // Mengapa: Tidak ada filter role eksplisit ('user'), karena di dunia nyata admin
        // mungkin saja ingin berpartisipasi dalam ruang komentar. Yang penting harus login.
        if (!session || !session.user?.id) {
            return { error: "Unauthorized: Anda harus login untuk memberikan komentar." };
        }

        // [B] Ekstraksi Input
        const bab_id = formData.get('bab_id') as string;
        let content = formData.get('content') as string;
        const parent_id = formData.get('parent_id') as string | null;

        // [C] Validasi Input Kosong
        if (!bab_id || !content || content.trim() === '') {
            return { error: "Bad Request: Komentar kosong tidak diizinkan." };
        }

        // [D] Sanitasi XSS
        const DOMPurify = (await import('isomorphic-dompurify')).default;
        content = DOMPurify.sanitize(content);

        // [E] Mutasi Database
        // Mengapa: Otomatis menghubungkan komentar ini ke `session.user.id` yang aman di server.
        // Jika parent_id ada, ini berarti balasan dari komentar lain (Threaded).
        const newComment = await prisma.comment.create({
            data: {
                user_id: session.user.id,
                bab_id,
                content,
                parent_id: parent_id || null
            }
        });

        // Mengembalikan object murni bagi React state
        return { success: true, data: newComment };

    } catch (error) {
        console.error("Database Error submitComment:", error);
        return { error: "Internal Server Error: Gagal menyimpan komentar." };
    }
}


// ==============================================================================
// 2. MUTASI USER (READER): MENGUBAH / MENAMBAH RATING (UPSERT)
// ==============================================================================
// Mengapa: Operasi Server Action ini paling krusial secara performa, karena melibatkan  
// transaksi (Transaction) atomik dua buah statement agar skor konsisten (tidak menggantung di proses parsing).
export async function submitRating(formData: FormData) {
    try {
        // [A] Validasi Autentikasi
        const session = await getServerSession(authOptions);

        if (!session || !session.user?.id) {
            return { error: "Unauthorized: Anda harus login untuk memberikan rating." };
        }

        // [B] Ekstraksi Variabel \& Konversi String -> Number (Score)
        const karya_id = formData.get('karya_id') as string;
        const score = Number(formData.get('score'));
        const userId = session.user.id;

        // [C] Security Boundary Skoring
        // Mengapa: Menghindari skenario form manipulasi DOM di klien
        // (Contoh: value dikirim 10.0 atau -20 lewat devtools browser, jadi harus kita cegah di backend).
        if (!karya_id || isNaN(score) || score < 1 || score > 5) {
            return { error: "Bad Request: Karya ID tidak valid atau skor berbohong (harus 1 sampai 5)." };
        }

        // [D] DB Transaction Logics 
        // Mengapa: Memakai `$transaction` agar tiga hal ini gagal-atau-sukses secara paralel (all-or-nothing).
        const resultTransaction = await prisma.$transaction(async (tx: any) => {

            // Tahap 1: UPSERT Data Rating
            // Mengapa: Memakai "Where komposit `[user_id, karya_id]`" milik skema rating.
            // Metode Upsert ini sangat efisien. UPDATE jika ada, CREATE baru jika user belum pernah rating.
            const ratingUpserted = await tx.rating.upsert({
                where: {
                    user_id_karya_id: {
                        user_id: userId,
                        karya_id: karya_id,
                    }
                },
                update: {
                    score: score, // Menimpa input baru
                },
                create: {
                    user_id: userId,
                    karya_id: karya_id,
                    score: score, // Baris initial
                }
            });

            // Tahap 2: MENGHITUNG ulang agregat di keseluruhan table
            // Mengapa: Agar aplikasi kencang di kemudian hari, server Next menghitung Rata-rata sekarang (_avg),
            // ketimbang membebani Client melakukan Array.reduce() atas memuat ratusan/ribuan baris dari request tunggal.
            const databaseAggregate = await tx.rating.aggregate({
                where: { karya_id: karya_id },
                _avg: { score: true } // True berarti perintahkan DB engine hanya me-return nilai float reratanya saja
            });

            const rerataNilai = databaseAggregate._avg.score || 0;

            // Tahap 3: SIMPAN Cache Value Denormalisasi (avg_rating) Karya Tersebut
            await tx.karya.update({
                where: { id: karya_id },
                data: { avg_rating: rerataNilai }
            });

            // Kita kembalikan hasil UPSERT 
            return ratingUpserted;
        });

        return { success: true, data: resultTransaction };

    } catch (error) {
        console.error("Database Rating Transaction Error:", error);
        return { error: "Internal Server Error: Sistem gagal memproses rating. Coba lagi." };
    }
}

// ==============================================================================
// 3. MUTASI USER: MENULIS REVIEW RESMI (EPIC 8)
// ==============================================================================
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
        if (rating !== null && (rating < 1 || rating > 5)) {
            return { error: "Isian rating tidak valid." };
        }

        const DOMPurify = (await import('isomorphic-dompurify')).default;
        const sanitizedContent = DOMPurify.sanitize(content);

        await prisma.$transaction(async (tx) => {
            // 1. Simpan Ulasan Teks
            await tx.review.upsert({
                where: { user_id_karya_id: { user_id: session.user.id, karya_id } },
                update: { content: sanitizedContent, rating },
                create: { user_id: session.user.id, karya_id, content: sanitizedContent, rating }
            });

            // 2. Jika ada rating, Sinkronkan dengan sistem Rating Cepat
            if (rating !== null) {
                const finalRating = Number(rating);
                await tx.rating.upsert({
                    where: { user_id_karya_id: { user_id: session.user.id, karya_id } },
                    update: { score: finalRating },
                    create: { user_id: session.user.id, karya_id, score: finalRating }
                });

                // Rekalkulasi Rata-Rata
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

        return { success: true };
    } catch (error) {
        console.error("Review Error:", error);
        return { error: "Sistem gagal menyimpan review." };
    }
}

// 4. MUTASI USER/ADMIN: HAPUS KOMENTAR (MODERASI)
// ==============================================================================
export async function deleteComment(id: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const existingComment = await prisma.comment.findUnique({ where: { id } });
        if (!existingComment) return { error: "Komentar tidak ditemukan." };

        // Hanya penulis komentar aslinya, atau admin, atau author (tapi MVP: author mungkin tidak bisa hapus komen unless he owns the work. we'll stick to admin & owner of comment)
        if (existingComment.user_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden: Anda tidak memiliki hak akses menghapus komentar ini." };
        }

        await prisma.comment.delete({ where: { id } });
        return { success: true };
    } catch (error) {
        console.error("Delete Comment Error:", error);
        return { error: "Sistem gagal menghapus komentar." };
    }
}
