import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Trash2, Clock, BookOpen, User } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export default async function ManajemenKomentarPage() {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

    // Fetch comments on the author's books
    const comments = await prisma.comment.findMany({
        where: {
            bab: {
                karya: {
                    uploader_id: session.user.id
                }
            }
        },
        include: {
            user: true,
            bab: {
                include: {
                    karya: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-20 transition-colors duration-300">
            <header className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 p-6 sticky top-0 z-10 shadow-sm">
                <div className="w-full px-8 mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/admin/dashboard" className="p-2 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-all">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 dark:text-gray-100">Manajemen Komentar</h1>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Interaksi Pembaca pada Karya Anda</p>
                        </div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{comments.length} Total Komentar</span>
                    </div>
                </div>
            </header>

            <main className="w-full mx-auto p-6 transition-all">
                {comments.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
                        <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada komentar masuk</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 overflow-hidden border border-gray-100 dark:border-slate-700">
                                            {comment.user.avatar_url ? <img src={comment.user.avatar_url} className="w-full h-full object-cover" alt="" /> : <User className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-tight">{comment.user.display_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">@{comment.user.username}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
                                        <Clock className="w-3 h-3" /> {new Date(comment.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="bg-gray-50/50 dark:bg-slate-800/50 p-4 rounded-2xl mb-4 border border-transparent group-hover:border-indigo-100 transition-colors">
                                    <p className="text-sm text-gray-700 dark:text-gray-400 italic">"{comment.content}"</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[200px]">
                                            {comment.bab.karya.title} — Bab {comment.bab.chapter_no}
                                        </p>
                                    </div>
                                    <Link href={`/novel/${comment.bab.karya.id}/${comment.bab.chapter_no}`} className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">
                                        Lihat Konteks
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
