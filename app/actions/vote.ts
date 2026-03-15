'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const VoteSchema = z.object({
    commentId: z.string().uuid(),
    type: z.union([z.literal(1), z.literal(-1)]),
    path: z.string().min(1).startsWith("/"),
});

export async function voteComment(commentId: string, type: 1 | -1, path: string) {
    try {
        // [New] Early Zod Validation (#80 Golden Optimization)
        const validation = VoteSchema.safeParse({ commentId, type, path });
        if (!validation.success) return { error: "Invalid voting data." };

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
            await prisma.$transaction([
                prisma.commentVote.create({
                    data: {
                        user_id: session.user.id,
                        comment_id: commentId,
                        type
                    }
                }),
                prisma.comment.update({
                    where: { id: commentId },
                    data: { score: { increment: type } }
                })
            ]);
        }

        revalidatePath(path);
        return { success: true };
    } catch (e) {
        console.error("[voteComment] Error:", e);
        return { error: "Gagal memproses voting." };
    }
}
