'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleReviewUpvote(reviewId: string, path: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const existingUpvote = await (prisma as any).reviewUpvote.findUnique({
            where: {
                user_id_review_id: {
                    user_id: session.user.id,
                    review_id: reviewId
                }
            }
        });

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

        revalidatePath(path);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Gagal memproses upvote ulasan." };
    }
}

// Komentar pada Review
export async function submitReviewComment(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const review_id = formData.get('review_id') as string;
        const content = formData.get('content') as string;

        if (!review_id || !content || content.trim().length === 0) {
            return { error: "Komentar tidak boleh kosong." };
        }

        await (prisma as any).reviewComment.create({
            data: {
                user_id: session.user.id,
                review_id,
                content: content.trim()
            }
        });

        revalidatePath('/novel/[karyaId]');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Gagal mengirim komentar." };
    }
}
