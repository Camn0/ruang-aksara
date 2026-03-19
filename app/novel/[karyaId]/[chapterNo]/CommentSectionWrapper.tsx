import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import CommentSection from "./CommentSection";

interface CommentSectionWrapperProps {
    babId: string;
    authorId: string;
}

export default async function CommentSectionWrapper({ babId, authorId }: CommentSectionWrapperProps) {
    const session = await getServerSession(authOptions);

    let allRawComments: any[] = [];
    let isError = false;

    try {
        allRawComments = await prisma.comment.findMany({
            where: { bab_id: babId },
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
                _count: { select: { votes: true } },
                votes: session?.user?.id ? { 
                    where: { user_id: session.user.id },
                    select: { type: true }
                } : false,
            },
            orderBy: { created_at: 'asc' }
        });
    } catch (error) {
        console.error("[CommentSectionWrapper] Database error:", error);
        isError = true;
    }

    // Helper: Build recursive tree structure
    function buildCommentTree(flatComments: any[], parentId: string | null = null, limit: number = 0): any[] {
        let roots = flatComments.filter(c => c.parent_id === parentId);
        
        // Apply limit only to top-level comments
        if (parentId === null && limit > 0) {
            roots = roots.slice(0, limit);
        }

        return roots
            .map(c => ({
                ...c,
                score: c._count?.votes || 0,
                userVote: c.votes?.[0]?.type || 0,
                replies: buildCommentTree(flatComments, c.id)
            }))
            .sort((a, b) => {
                const aTime = new Date(a.created_at).getTime();
                const bTime = new Date(b.created_at).getTime();
                if (parentId === null) return bTime - aTime;
                return aTime - bTime; // Replies chronological
            });
    }

    const comments = buildCommentTree(allRawComments, null, 10);

    return (
        <CommentSection
            babId={babId}
            initialComments={comments as any}
            currentUserId={session?.user?.id}
            currentUserRole={session?.user?.role}
            authorId={authorId}
            isError={isError}
        />
    );
}
