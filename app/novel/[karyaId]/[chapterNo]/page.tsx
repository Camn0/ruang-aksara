/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { unstable_cache } from "next/cache";
import { Suspense } from "react";
import ReadingInterface from "./ReadingInterface";
import CommentSectionWrapper from "./CommentSectionWrapper";

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
                select: {
                    id: true,
                    chapter_no: true,
                    title: true,
                    content: true,
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

const getCachedReactionStats = (babId: string) =>
    unstable_cache(
        async () => {
            return (prisma as any).chapterReaction.groupBy({
                by: ['reaction_type'],
                where: { bab_id: babId },
                _count: { _all: true }
            });
        },
        [`reaction-stats-${babId}`],
        { revalidate: 3600, tags: [`chapter-reactions-${babId}`] }
    )();

const getCachedUserReaction = (babId: string, userId: string) =>
    unstable_cache(
        async () => {
            return (prisma as any).chapterReaction.findUnique({
                where: { user_id_bab_id: { user_id: userId, bab_id: babId } }
            });
        },
        [`user-reaction-${userId}-${babId}`],
        { revalidate: 3600, tags: [`user-reactions-${userId}`] }
    )();

export default async function ChapterPage({ params }: { params: { karyaId: string, chapterNo: string } }) {
    const chapterNoNum = Number(params.chapterNo);

    // [A] Data Fetching via Cache
    const [chapter, navigation, session] = await Promise.all([
        getCachedChapter(params.karyaId, chapterNoNum),
        getCachedNavigation(params.karyaId, chapterNoNum),
        getServerSession(authOptions),
    ]);

    if (!chapter) notFound();

    // [B] Analytics - Fire & Forget
    // (Actual tracking handled in ReadingProgressTracker client component inside ReadingInterface)

    const { next: nextBab, prev: prevBab } = navigation;

    const [userChapterReaction, chapterReactionStats] = await Promise.all([
        session?.user?.id ? getCachedUserReaction(chapter.id, session.user.id) : null,
        getCachedReactionStats(chapter.id)
    ]);


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
                userReaction={userChapterReaction?.reaction_type}
                reactionStats={chapterReactionStats as any}
            />

            <div className="max-w-2xl mx-auto px-6 mt-12 pt-12 border-t border-gray-100 dark:border-brown-mid">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black italic text-brown-dark dark:text-text-accent uppercase tracking-tight">Komentar</h2>
                    <span className="bg-tan-primary/10 dark:bg-brown-mid px-3 py-1 rounded-full text-[10px] font-black text-tan-primary uppercase tracking-widest">Goresan Diskusi</span>
                </div>

                <Suspense fallback={
                    <div className="py-24 text-center bg-bg-cream/40 dark:bg-brown-dark rounded-[3rem] border border-dashed border-tan-primary/20 animate-pulse">
                        <p className="text-tan-primary/30 dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Membuka Gulungan Diskusi...</p>
                    </div>
                }>
                    <CommentSectionWrapper
                        babId={chapter.id}
                        authorId={(chapter as any).karya.uploader_id}
                    />
                </Suspense>
            </div>
        </div>
    );
}
