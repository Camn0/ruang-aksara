import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
import BookmarksTabs from "./BookmarksTabs";
import LibraryContentWrapper from "./LibraryContentWrapper";
import { unstable_cache } from "next/cache";

const getCachedLibrary = (userId: string) => unstable_cache(
    async () => prisma.bookmark.findMany({
        where: { user_id: userId },
        select: {
            id: true,
            last_chapter: true,
            updated_at: true,
            karya: {
                select: {
                    id: true,
                    title: true,
                    cover_url: true,
                    penulis_alias: true,
                    avg_rating: true,
                    is_completed: true,
                    deskripsi: true,
                    _count: { select: { bab: true } },
                    bab: {
                        select: { chapter_no: true, title: true }
                    }
                }
            }
        },
        orderBy: { updated_at: 'desc' }
    }),
    [`user-library-full-${userId}`],
    { revalidate: 60, tags: [`library-${userId}`] }
)();

async function LibraryStream({ userId, activeTab }: { userId: string, activeTab: string }) {
    const bookmarksRaw = await getCachedLibrary(userId);
    const bookmarks = bookmarksRaw as any[];

    const filteredBookmarks = activeTab === 'tamat'
        ? bookmarks.filter(b => b.karya.is_completed)
        : bookmarks;

    return <LibraryContentWrapper filteredBookmarks={filteredBookmarks} activeTab={activeTab} />;
}

export default async function LibraryPage({ searchParams }: { searchParams: { tab?: string } }) {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/onboarding');

    const activeTab = searchParams.tab || 'riwayat';

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark transition-colors duration-500 pb-32">
            {/* Header / Navigation Section */}
            <div className="bg-white/80 dark:bg-brown-dark/80 backdrop-blur-xl border-b border-tan-light dark:border-brown-mid sticky top-0 z-40 transition-all">
                <div className="max-w-7xl mx-auto px-6 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href="/user/dashboard" prefetch={false} className="w-10 h-10 rounded-full bg-tan-light/30 dark:bg-brown-mid flex items-center justify-center text-tan-primary hover:bg-tan-primary hover:text-text-accent transition-all group active:scale-95 border border-tan-light dark:border-brown-mid">
                            <svg className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                        </Link>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-open-sans font-black text-text-main dark:text-text-accent leading-tight tracking-tight italic">Perpustakaan</h1>
                            <p className="text-[10px] font-bold text-tan-primary uppercase tracking-[0.2em] mt-1">Koleksi Bacaanmu</p>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-6 pb-2">
                    <BookmarksTabs activeTab={activeTab} />
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
                <Suspense fallback={
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12 animate-pulse">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[3/4.2] bg-tan-light/20 dark:bg-brown-mid/30 rounded-[2rem]" />
                                <div className="h-4 bg-tan-light/20 dark:bg-brown-mid/30 rounded-md w-3/4" />
                                <div className="h-3 bg-tan-light/10 dark:bg-brown-mid/20 rounded-md w-1/2" />
                            </div>
                        ))}
                    </div>
                }>
                    <LibraryStream userId={session.user.id} activeTab={activeTab} />
                </Suspense>
            </main>
        </div>
    );
}