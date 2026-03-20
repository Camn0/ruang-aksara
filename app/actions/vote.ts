'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function voteComment(commentId: string, type: 1 | -1, path: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const existingVote = await (prisma as any).commentVote.findUnique({
            where: {
                user_id_comment_id: {
                    user_id: session.user.id,
                    comment_id: commentId
                }
            }
        });

        if (existingVote) {
            if (existingVote.type === type) {
                // Remove vote if clicking the same one
                await prisma.$transaction([
                    prisma.commentVote.delete({ where: { id: existingVote.id } }),
                    prisma.comment.update({
                        where: { id: commentId },
                        data: { score: { decrement: type } }
                    })
                ]);
            } else {
                // Update vote if changing between upvote/downvote
                // Diff is (new - old), e.g., (1 - (-1)) = 2, (-1 - 1) = -2
                const diff = type - existingVote.type;
                await prisma.$transaction([
                    prisma.commentVote.update({
                        where: { id: existingVote.id },
                        data: { type }
                    }),
                    prisma.comment.update({
                        where: { id: commentId },
                        data: { score: { increment: diff } }
                    })
                ]);
            }
        } else {
            // New vote
            const [newVote] = await prisma.$transaction([
                prisma.commentVote.create({
                    data: {
                        user_id: session.user.id,
                        comment_id: commentId,
                        type
                    },
                    include: {
                        comment: { select: { user_id: true, bab: { select: { karya_id: true, chapter_no: true } } } }
                    }
                }),
                prisma.comment.update({
                    where: { id: commentId },
                    data: { score: { increment: type } }
                })
            ]);

            // Trigger Notification for UPVOTE only
            if (type === 1) {
                const { createNotification } = await import("./notification");
                try {
                    await createNotification({
                        userId: (newVote as any).comment.user_id,
                        actorId: session.user.id,
                        type: 'LIKE',
                        category: 'SOCIAL',
                        link: `/novel/${(newVote as any).comment.bab.karya_id}/${(newVote as any).comment.bab.chapter_no}#comment-${commentId}`,
                        clusteringKey: commentId
                    });
                } catch (err) {
                    console.error("Failed to trigger comment vote notification:", err);
                }
            }
        }

        revalidatePath(path);
        return { success: true };
    } catch (e) {
        console.error("[voteComment] Error:", e);
        return { error: "Gagal memproses voting." };
    }
}
