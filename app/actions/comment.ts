'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Toggle Pin Status on a Chapter Comment.
 * Only Author of the novel or Admin can pin/unpin comments.
 */
export async function toggleCommentPin(commentId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        // [A] Get comment and associated novel author
        const comment = await (prisma as any).comment.findUnique({
            where: { id: commentId },
            select: {
                id: true,
                is_pinned: true,
                bab: {
                    select: {
                        karya: { select: { uploader_id: true, id: true } }
                    }
                }
            }
        });

        if (!comment) return { error: "Komentar tidak ditemukan." };

        const authorId = comment.bab.karya.uploader_id;
        const karyaId = comment.bab.karya.id;

        // [B] Authorization: Author of the novel or Admin
        if (session.user.id !== authorId && session.user.role !== 'admin') {
            return { error: "Hanya penulis atau admin yang bisa menyematkan komentar." };
        }

        // [C] Toggle is_pinned
        await (prisma as any).comment.update({
            where: { id: commentId },
            data: { is_pinned: !(comment as any).is_pinned }
        });

        revalidatePath(`/novel/${karyaId}/[chapterNo]`, 'page');
        return { success: true };
    } catch (e) {
        console.error("[toggleCommentPin] Error:", e);
        return { error: "Gagal memproses sematan." };
    }
}

/**
 * Server Action: Delete a Chapter Comment.
 * Only Author of the comment or Admin can delete.
 */
export async function deleteComment(commentId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const comment = await (prisma as any).comment.findUnique({
            where: { id: commentId },
            select: {
                id: true,
                user_id: true,
                bab: {
                    select: {
                        karya: { select: { id: true } }
                    }
                }
            }
        });

        if (!comment) return { error: "Komentar tidak ditemukan." };

        // Authorization: Owner or Admin
        if (comment.user_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden." };
        }

        await (prisma as any).comment.delete({ where: { id: commentId } });

        revalidatePath(`/novel/${comment.bab.karya.id}/[chapterNo]`, 'page');
        return { success: true };
    } catch (e) {
        console.error("[deleteComment] Error:", e);
        return { error: "Gagal menghapus komentar." };
    }
}

/**
 * Server Action: Mengambil potongan komentar berikutnya untuk sebuah bab.
 * @param babId - ID bab.
 * @param skip - Jumlah record yang dilewati (offset untuk root comments).
 * @param take - Jumlah record yang diambil (chunk size).
 */
export async function getMoreChapterComments(babId: string, skip: number, take: number = 10) {
    try {
        const session = await getServerSession(authOptions);

        // Ambil root comments saja (karena pagination biasanya di level ini)
        const rootComments = await (prisma as any).comment.findMany({
            where: { 
                bab_id: babId,
                parent_id: null 
            },
            select: {
                id: true,
                content: true,
                created_at: true,
                parent_id: true,
                is_pinned: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        display_name: true,
                        avatar_url: true
                    }
                },
                score: true,
                userVote: session?.user?.id ? { 
                    where: { user_id: session.user.id },
                    select: { type: true }
                } : false,
            },
            orderBy: { created_at: 'asc' },
            skip,
            take
        });

        // Resolve replies for these root comments
        const commentsWithReplies = await Promise.all(rootComments.map(async (c: any) => {
            const replies = await (prisma as any).comment.findMany({
                where: { parent_id: c.id },
                select: {
                    id: true,
                    content: true,
                    created_at: true,
                    parent_id: true,
                    user: {
                        select: { id: true, username: true, display_name: true, avatar_url: true }
                    },
                    score: true,
                    userVote: session?.user?.id ? { 
                        where: { user_id: session.user.id },
                        select: { type: true }
                    } : false,
                },
                orderBy: { created_at: 'asc' }
            });

            return {
                ...c,
                score: c.score || 0,
                userVote: c.userVote?.[0]?.type || 0,
                replies: replies.map((r: any) => ({
                    ...r,
                    score: r.score || 0,
                    userVote: r.userVote?.[0]?.type || 0
                }))
            };
        }));

        return { success: true, data: commentsWithReplies };
    } catch (e) {
        console.error("[getMoreChapterComments] Error:", e);
        return { error: "Gagal memuat lebih banyak komentar." };
    }
}
