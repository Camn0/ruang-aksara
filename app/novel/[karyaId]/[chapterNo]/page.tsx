import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import ReadingInterface from "./ReadingInterface";
import CommentSection from "./CommentSection";

/**
 * Halaman Baca Bab (Reading Page).
 */

const getCachedChapter = (karyaId: string, chapterNo: number) =>
    unstable_cache(
        async () => {
            return prisma.bab.findUnique({
                where: {
                    karya_id_chapter_no: {
                        karya_id: karyaId,
                        chapter_no: chapterNo
                    }
                },
                include: {
                    karya: {
                        select: {
                            id: true,
                            title: true,
                            uploader_id: true,
                        }
                    }
                }
            });
        },
        [`chapter-${karyaId}-${chapterNo}`],
        { revalidate: 3600, tags: [`chapter-${karyaId}-${chapterNo}`] }
    )();

const getCachedNavigation = (karyaId: string, chapterNo: number) =>
    unstable_cache(
        async () => {
            const [prev, next] = await Promise.all([
                prisma.bab.findFirst({
                    where: { karya_id: karyaId, chapter_no: { lt: chapterNo } },
                    orderBy: { chapter_no: 'desc' },
                    select: { chapter_no: true }
                }),
                prisma.bab.findFirst({
                    where: { karya_id: karyaId, chapter_no: { gt: chapterNo } },
                    orderBy: { chapter_no: 'asc' },
                    select: { chapter_no: true }
                })
            ]);
            return { prev, next };
        },
        [`nav-${karyaId}-${chapterNo}`],
        { revalidate: 3600, tags: [`karya-${karyaId}`] }
    )();

export default async function ChapterPage({ params }: { params: { karyaId: string, chapterNo: string } }) {
    const chapterNoNum = Number(params.chapterNo);

    // [A] Data Fetching via Cache & All Chapters for Picker
    const [chapter, navigation, session, allChapters] = await Promise.all([
        getCachedChapter(params.karyaId, chapterNoNum),
        getCachedNavigation(params.karyaId, chapterNoNum),
        getServerSession(authOptions),
        prisma.bab.findMany({
            where: { karya_id: params.karyaId },
            orderBy: { chapter_no: 'asc' },
            select: { chapter_no: true, title: true }
        })
    ]);

    if (!chapter) notFound();

    // [B] Analytics - Fire & Forget
    // (Actual tracking handled in ReadingProgressTracker client component inside ReadingInterface)

    const { next: nextBab, prev: prevBab } = navigation;

    // [C] Social Data: Reactions
    const [userChapterReaction, chapterReactionStats] = await Promise.all([
        session?.user?.id ? (prisma as any).chapterReaction.findUnique({
            where: { user_id_bab_id: { user_id: session.user.id, bab_id: chapter.id } }
        }) : null,
        (prisma as any).chapterReaction.groupBy({
            by: ['reaction_type'],
            where: { bab_id: chapter.id },
            _count: { _all: true }
        })
    ]);

    // Fetch ALL comments for the chapter to build a recursive tree
    const allRawComments = await prisma.comment.findMany({
        where: { bab_id: chapter.id },
        include: {
            user: true,
            _count: { select: { votes: true } },
            votes: session?.user?.id ? { where: { user_id: session.user.id } } : false,
        },
        orderBy: { created_at: 'asc' }
    });

    // Helper: Build recursive tree structure
    function buildCommentTree(flatComments: any[], parentId: string | null = null): any[] {
        return flatComments
            .filter(c => c.parent_id === parentId)
            .map(c => ({
                ...c,
                userVote: c.votes?.[0]?.type || 0,
                replies: buildCommentTree(flatComments, c.id)
            }))
            // Sort top-level comments by newest/score if needed, root comments sorted by newest here
            .sort((a, b) => {
                if (parentId === null) return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); // Replies chronological
            });
    }

    const comments = buildCommentTree(allRawComments);

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark text-brown-dark dark:text-text-accent pb-28 transition-colors duration-300">
            <ReadingInterface
                karyaId={params.karyaId}
                babId={chapter.id}
                chapterNo={chapter.chapter_no}
                novelTitle={(chapter as any).karya.title}
                chapterTitle={(chapter as any).title}
                content={chapter.content}
                nextChapter={nextBab?.chapter_no}
                prevChapter={prevBab?.chapter_no}
                allChapters={allChapters as any}
                userReaction={userChapterReaction?.reaction_type}
                reactionStats={chapterReactionStats as any}
            />

            <div className="max-w-2xl mx-auto px-6 mt-12 pt-12 border-t border-gray-100 dark:border-brown-mid">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black italic text-brown-dark dark:text-text-accent uppercase tracking-tight">Komentar</h2>
                    <span className="bg-tan-primary/10 dark:bg-brown-mid px-3 py-1 rounded-full text-[10px] font-black text-tan-primary uppercase tracking-widest">
                        {allRawComments.length} Goresan
                    </span>
                </div>

                <CommentSection
                    babId={chapter.id}
                    initialComments={comments as any}
                    currentUserId={session?.user?.id}
                    currentUserRole={session?.user?.role}
                    authorId={(chapter as any).karya.uploader_id}
                />
            </div>
        </div>
    );
}
