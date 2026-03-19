'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidateTag } from 'next/cache';
import { uploadToImageKit } from '@/lib/imageKit';

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
        const rating = formData.get('rating') ? parseInt(formData.get('rating') as string, 10) : null;

        if (!bab_id || !content || content.trim() === '') {
            return { error: "Bad Request: Komentar kosong tidak diizinkan." };
        }

        // [C] Sanitasi Konten
        content = content.trim();

        // [D] Mutasi Database
        const newComment = await (prisma.comment as any).create({
            data: {
                user_id: session.user.id,
                bab_id,
                content,
                parent_id: parent_id || null
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        display_name: true,
                        avatar_url: true
                    }
                }
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
                where: { 
                    karya_id: karya_id,
                    score: { gt: 0 } // Exclude scores of 0 from average
                },
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
        revalidateTag(`user-ratings-${userId}`);
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
                    where: { 
                        karya_id,
                        score: { gt: 0 } // Exclude scores of 0 from average
                    },
                    _avg: { score: true }
                });
                await tx.karya.update({
                    where: { id: karya_id },
                    data: { avg_rating: aggr._avg.score || 0 }
                });
            }
        });

        revalidateTag(`user-reviews-${session.user.id}`);
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

        if (existing && existing.last_chapter >= chapterNo) {
            // Jika sudah di bab yang sama atau lebih tinggi, tidak perlu update DB (Hemat Request)
            return { success: true, cached: true };
        }

        // [2] Lakukan Update (Upsert) dalam Transaksi bersama UserStats
        await prisma.$transaction(async (tx) => {
            // [A] Update/Create Bookmark - Selalu simpan progres agar user tidak kehilangan posisi
            await tx.bookmark.upsert({
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

            // [B] Update UserStats (Gamification) + Anti-Cheat Speed
            const stats = await (tx as any).userStats.findUnique({ where: { user_id: userId } });
            const MIN_READ_TIME = 30 * 1000; // 30 Detik threshold anti-cheat
            const now = new Date();
            
            if (stats) {
                const lastRead = stats.last_read_at ? new Date(stats.last_read_at) : null;
                const timeDiff = lastRead ? now.getTime() - lastRead.getTime() : Infinity;

                // Cek Kecepatan: Jika terlalu cepat (< 30s), skip poin & total baca
                const isFastFlip = timeDiff < MIN_READ_TIME;

                if (!isFastFlip) {
                    let newStreak = stats.reading_streak;
                    if (lastRead) {
                        const diffDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 1) {
                            newStreak += 1;
                        } else if (diffDays > 1) {
                            newStreak = 1;
                        }
                    } else {
                        newStreak = 1;
                    }

                    await (tx as any).userStats.update({
                        where: { user_id: userId },
                        data: {
                            total_chapters_read: { increment: 1 },
                            points: { increment: 10 },
                            last_read_at: now,
                            reading_streak: newStreak
                        }
                    });
                }
                // Jika Fast Flip: Bookmark tetap terupdate (di step [A]), tapi stats User (Poin/Count) tidak berubah.
            } else {
                // Initial creation stats (First time use)
                await (tx as any).userStats.create({
                    data: {
                        user_id: userId,
                        total_chapters_read: 1,
                        points: 10,
                        last_read_at: now,
                        reading_streak: 1
                    }
                });
            }
        });

        // [3] Revalidate library & dashboard agar history ter-update
        revalidateTag(`library-${userId}`);
        revalidateTag(`stats-${userId}`);

        return { success: true };
    } catch (error) {
        console.error("[updateReadingProgress] Error:", error);
        return { success: false, error: "Database Error" };
    }
}
// = [6] MUTASI USER: UPDATE PROFIL (DISPLAY NAME & BIO)
// ==============================================================================
/**
 * Server Action: Melakukan update profil dasar pengguna.
 */
export async function updateUserProfile(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { error: "Unauthorized" };

        const displayName = formData.get('displayName') as string;
        const bio = formData.get('bio') as string;
        const avatarUrl = formData.get('avatarUrl') as string | null;
        const bannerUrl = formData.get('bannerUrl') as string | null;
        const socialLinksStr = formData.get('socialLinks') as string;

        let socialLinks = null;
        try {
            if (socialLinksStr) {
                socialLinks = JSON.parse(socialLinksStr);
            }
        } catch (e) {
            console.error("Invalid socialLinks JSON:", e);
        }

        // [CDN Migration] Handle Avatar Upload
        let finalAvatarUrl = avatarUrl;
        if (avatarUrl && avatarUrl.startsWith('data:image')) {
            try {
                finalAvatarUrl = await uploadToImageKit(
                    avatarUrl,
                    `avatar-${session.user.id}-${Date.now()}`,
                    "/profile-avatars"
                );
            } catch (err) {
                console.error("Avatar upload failed:", err);
                return { error: "Gagal mengunggah foto profil ke CDN. Silakan coba lagi." };
            }
        }

        // [CDN Migration] Handle Banner Upload
        let finalBannerUrl = bannerUrl;
        if (bannerUrl && bannerUrl.startsWith('data:image')) {
            try {
                finalBannerUrl = await uploadToImageKit(
                    bannerUrl,
                    `banner-${session.user.id}-${Date.now()}`,
                    "/profile-banners"
                );
            } catch (err) {
                console.error("Banner upload failed:", err);
                return { error: "Gagal mengunggah banner ke CDN. Silakan coba lagi." };
            }
        }

        const updatedUser = await (prisma as any).user.update({
            where: { id: session.user.id },
            data: {
                display_name: displayName,
                bio: bio,
                avatar_url: finalAvatarUrl || undefined,
                banner_url: finalBannerUrl || undefined,
                social_links: socialLinks
            },
            select: { username: true }
        });

        revalidateTag(`profile-${session.user.id}`);
        // Canonical revalidation by username
        if (updatedUser.username) {
            revalidateTag(`profile-${updatedUser.username}`);
        }
        return { success: true };
    } catch (error) {
        console.error("[updateUserProfile] Error:", error);
        return { error: "Gagal memperbarui profil." };
    }
}
// = [7] MUTASI USER: FOLLOW / UNFOLLOW
// ==============================================================================
export async function toggleFollow(targetUserId: string, revalidatePathStr?: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Unauthorized");

    const followerId = session.user.id;
    if (followerId === targetUserId) throw new Error("Cannot follow yourself");

    const existing = await prisma.follow.findFirst({
        where: {
            follower_id: followerId,
            following_id: targetUserId
        }
    });

    if (existing) {
        await prisma.follow.delete({ where: { id: existing.id } });
    } else {
        await prisma.follow.create({
            data: {
                follower_id: followerId,
                following_id: targetUserId
            }
        });
    }

    if (revalidatePathStr) {
        revalidateTag(revalidatePathStr);
    }
    // Revalidate target user profile anyway
    revalidateTag(`profile-${targetUserId}`);
    revalidateTag(`following-${followerId}`);
}
