'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createAuthorPost(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const content = formData.get('content') as string;
        if (!content || content.trim().length === 0) {
            return { error: "Konten tidak boleh kosong." };
        }

        const author_id = session.user.id;

        await (prisma as any).authorPost.create({
            data: {
                content,
                author_id
            }
        });

        revalidatePath('/profile/[id]', 'page');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Gagal membuat postingan." };
    }
}

export async function togglePostLike(postId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const existingLike = await (prisma as any).postLike.findUnique({
            where: {
                user_id_post_id: {
                    user_id: session.user.id,
                    post_id: postId
                }
            }
        });

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

        revalidatePath('/profile/[id]', 'page');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Gagal memproses like." };
    }
}
