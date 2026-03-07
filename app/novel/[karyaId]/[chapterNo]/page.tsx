import { notFound } from 'next/navigation';
import CommentForm from './CommentForm';
import DeleteCommentButton from './DeleteCommentButton';
import { redis } from '@/lib/redis';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import { ArrowLeft, Settings, ChevronLeft, ChevronRight, List } from 'lucide-react';

import { prisma } from '@/lib/prisma';

export default async function NovelChapterPage({
    params,
}: {
    params: { karyaId: string; chapterNo: string };
}) {
    const bab = await prisma.bab.findUnique({
        where: {
            karya_id_chapter_no: {
                karya_id: params.karyaId,
                chapter_no: Number(params.chapterNo),
            },
        },
        include: {
            karya: true,
            comments: {
                where: { parent_id: null },
                include: {
                    user: true,
                    replies: {
                        include: { user: true },
                        orderBy: { created_at: 'asc' }
                    }
                },
                orderBy: { created_at: 'asc' },
            },
        },
    });

    if (!bab) {
        notFound();
    }

    try {
        await redis.incr(`views:karya:${params.karyaId}`);
    } catch (e) {
        console.error("Redis Error", e);
    }

    const currentNo = Number(params.chapterNo);

    const nextBab = await prisma.bab.findFirst({
        where: { karya_id: params.karyaId, chapter_no: { gt: currentNo } },
        orderBy: { chapter_no: 'asc' }
    });

    const prevBab = await prisma.bab.findFirst({
        where: { karya_id: params.karyaId, chapter_no: { lt: currentNo } },
        orderBy: { chapter_no: 'desc' }
    });

    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
        try {
            await prisma.bookmark.upsert({
                where: {
                    user_id_karya_id: {
                        user_id: session.user.id,
                        karya_id: params.karyaId
                    }
                },
                update: { last_chapter: currentNo },
                create: {
                    user_id: session.user.id,
                    karya_id: params.karyaId,
                    last_chapter: currentNo
                }
            });
        } catch (e) {
            console.error("Bookmark Error:", e);
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-900 pb-28">
            {/* Header Sticky Atas */}
            <header className="px-4 h-14 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                <Link href={`/novel/${params.karyaId}`} className="p-2 -ml-2 text-gray-900 active:bg-gray-200 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="text-center">
                    <h1 className="font-bold text-sm text-gray-900 leading-tight">Bab {bab.chapter_no}</h1>
                    <p className="text-[10px] text-gray-500 truncate max-w-[200px]">{bab.karya.title}</p>
                </div>
                <button className="p-2 -mr-2 text-gray-900 active:bg-gray-200 rounded-full transition-colors">
                    <Settings className="w-5 h-5" />
                </button>
            </header>

            {/* Konten Membaca Utama */}
            <main className="px-6 py-8 sm:px-12 md:max-w-2xl md:mx-auto">
                <article
                    className="prose prose-lg prose-indigo mx-auto text-justify leading-loose whitespace-pre-wrap text-[#2c2c2c] font-serif"
                    style={{ fontSize: '18px' }}
                >
                    {bab.content}
                </article>
            </main>

            {/* Navigasi Footer Tetap (Bottom Bar) */}
            <nav className="fixed bottom-0 inset-x-0 h-20 bg-white border-t border-gray-200 flex items-center justify-between px-6 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:max-w-md md:left-1/2 md:-translate-x-1/2 md:rounded-t-3xl md:border-x">
                {prevBab ? (
                    <Link href={`/novel/${params.karyaId}/${prevBab.chapter_no}`} className="flex flex-col items-center gap-1 p-2 text-indigo-600 hover:text-indigo-800 transition-colors active:scale-95">
                        <ChevronLeft className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Prev</span>
                    </Link>
                ) : (
                    <div className="flex flex-col items-center gap-1 p-2 text-gray-300">
                        <ChevronLeft className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Prev</span>
                    </div>
                )}

                <Link href={`/novel/${params.karyaId}`} className="flex flex-col items-center gap-1 p-4 bg-indigo-600 text-white rounded-full -mt-8 shadow-lg shadow-indigo-200 active:scale-95 transition-all border-4 border-[#FDFBF7]">
                    <List className="w-6 h-6" />
                </Link>

                {nextBab ? (
                    <Link href={`/novel/${params.karyaId}/${nextBab.chapter_no}`} className="flex flex-col items-center gap-1 p-2 text-indigo-600 hover:text-indigo-800 transition-colors active:scale-95">
                        <ChevronRight className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Next</span>
                    </Link>
                ) : (
                    <div className="flex flex-col items-center gap-1 p-2 text-gray-300">
                        <ChevronRight className="w-6 h-6" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Next</span>
                    </div>
                )}
            </nav>

            {/* Bagian Komentar */}
            <section className="px-6 py-8 bg-gray-50 border-t border-gray-200 md:max-w-2xl md:mx-auto md:rounded-t-3xl mt-8">
                <h3 className="font-bold text-lg mb-6 text-gray-900 border-b border-gray-200 pb-4">
                    Komentar Pembaca ({bab.comments.length})
                </h3>

                <div className="space-y-6">
                    {bab.comments.length === 0 ? (
                        <p className="text-gray-500 italic text-sm text-center py-8">
                            Jadilah yang pertama berkomentar di bab ini.
                        </p>
                    ) : (
                        bab.comments.map((rootComment) => (
                            <div key={rootComment.id} className="flex flex-col gap-3">
                                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 relative">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-[10px]">
                                                {rootComment.user.display_name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <strong className="text-gray-900 font-bold text-sm">{rootComment.user.display_name}</strong>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <time className="text-[10px] text-gray-400">
                                                {new Date(rootComment.created_at).toLocaleDateString('id-ID')}
                                            </time>
                                            {(session?.user?.id === rootComment.user_id || session?.user?.role === 'admin') && (
                                                <DeleteCommentButton commentId={rootComment.id} />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                                        {rootComment.content}
                                    </p>
                                    <div className="text-right">
                                        <CommentForm babId={bab.id} parentId={rootComment.id} isReply={true} />
                                    </div>
                                </div>

                                {rootComment.replies && rootComment.replies.length > 0 && (
                                    <div className="pl-6 border-l-2 border-indigo-100 space-y-3 ml-2">
                                        {rootComment.replies.map((reply: any) => (
                                            <div key={reply.id} className="bg-gray-100/50 p-3 rounded-xl border border-gray-100 flex flex-col gap-1.5 relative">
                                                <div className="flex justify-between items-center pb-1">
                                                    <strong className="text-gray-600 font-bold text-xs">↳ {reply.user.display_name}</strong>
                                                    <div className="flex items-center gap-2">
                                                        <time className="text-[10px] text-gray-400">
                                                            {new Date(reply.created_at).toLocaleDateString('id-ID')}
                                                        </time>
                                                        {(session?.user?.id === reply.user_id || session?.user?.role === 'admin') && (
                                                            <DeleteCommentButton commentId={reply.id} />
                                                        )}
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 whitespace-pre-wrap text-xs">
                                                    {reply.content}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {session ? (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h4 className="font-bold text-sm mb-4 text-gray-900">Tulis Komentar</h4>
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                            <CommentForm babId={bab.id} />
                        </div>
                    </div>
                ) : (
                    <div className="mt-8 p-4 bg-indigo-50 rounded-xl text-center text-sm text-indigo-700">
                        <Link href="/onboarding" className="font-bold underline">Masuk</Link> untuk ikut berdiskusi.
                    </div>
                )}
            </section>
        </div>
    );
}
