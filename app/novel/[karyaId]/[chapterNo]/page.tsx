import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import ReadingInterface from "./ReadingInterface";
import CommentSection from "./CommentSection";
import { Search as SearchIcon, Star, TrendingUp, BookOpen, History } from "lucide-react";

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
        <div className="min-h-screen bg-parchment-light dark:bg-parchment-dark text-ink-deep pb-28 selection:bg-pine/30 transition-colors duration-500">
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

            <div className="max-w-2xl mx-auto px-6 mt-16 pt-16 border-t-4 border-ink/5 relative">
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 wobbly-border-sm bg-ink-deep flex items-center justify-center text-parchment rotate-[-6deg]">
                            <History className="w-5 h-5" />
                        </div>
                        <h2 className="text-3xl font-journal-title text-ink-deep">Goresan Pembaca</h2>
                    </div>
                    <span className="bg-gold text-ink-deep px-4 py-1 wobbly-border-sm text-xs font-marker uppercase tracking-widest shadow-sm rotate-2">
                        {allRawComments.length} Pesan
                    </span>
                </div>

                <div className="relative">
                    <CommentSection
                        babId={chapter.id}
                        initialComments={comments as any}
                        currentUserId={session?.user?.id}
                        currentUserRole={session?.user?.role}
                        authorId={(chapter as any).karya.uploader_id}
                    />
                </div>
            </div>
        </div>
    );
}
