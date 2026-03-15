'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CommentIdSchema = z.string().uuid();

/**
 * Server Action: Toggle Pin Status on a Chapter Comment.
 * Only Author of the novel or Admin can pin/unpin comments.
 */
export async function toggleCommentPin(commentId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const validation = CommentIdSchema.safeParse(commentId);
        if (!validation.success) return { error: "ID Komentar tidak valid." };

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

        const validation = CommentIdSchema.safeParse(commentId);
        if (!validation.success) return { error: "ID Komentar tidak valid." };

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
