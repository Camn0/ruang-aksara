'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitChapterReaction(babId: string, reactionType: string, karyaId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        await (prisma as any).chapterReaction.upsert({
            where: {
                user_id_bab_id: {
                    user_id: session.user.id,
                    bab_id: babId
                }
            },
            update: { reaction_type: reactionType },
            create: {
                user_id: session.user.id,
                bab_id: babId,
                reaction_type: reactionType
            }
        });

        revalidatePath(`/novel/${karyaId}/[chapterNo]`);
        return { success: true };
    } catch (e) {
        console.error("[submitChapterReaction] Error:", e);
        return { error: "Gagal memproses reaksi bab." };
    }
}
