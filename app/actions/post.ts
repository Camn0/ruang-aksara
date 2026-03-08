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
        const image_url = formData.get('image_url') as string | null;

        if (!content || content.trim().length === 0) {
            return { error: "Konten tidak boleh kosong." };
        }

        const author_id = session.user.id;

        await (prisma as any).authorPost.create({
            data: {
                content: content.trim(),
                author_id,
                ...(image_url && image_url.trim() ? { image_url: image_url.trim() } : {})
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

// Komentar pada Author Post
export async function submitPostComment(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const post_id = formData.get('post_id') as string;
        const content = formData.get('content') as string;

        if (!post_id || !content || content.trim().length === 0) {
            return { error: "Komentar tidak boleh kosong." };
        }

        const newComment = await (prisma as any).postComment.create({
            data: {
                user_id: session.user.id,
                post_id,
                content: content.trim()
            },
            include: { user: true }
        });

        revalidatePath('/profile/[id]', 'page');
        return { success: true, data: newComment };
    } catch (e) {
        console.error(e);
        return { error: "Gagal mengirim komentar." };
    }
}

// Hapus Komentar pada Author Post
export async function deletePostComment(commentId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return { error: "Unauthorized." };

        const existing = await (prisma as any).postComment.findUnique({ where: { id: commentId } });
        if (!existing) return { error: "Komentar tidak ditemukan." };

        if (existing.user_id !== session.user.id && session.user.role !== 'admin') {
            return { error: "Forbidden." };
        }

        await (prisma as any).postComment.delete({ where: { id: commentId } });
        revalidatePath('/profile/[id]', 'page');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Gagal menghapus komentar." };
    }
}
