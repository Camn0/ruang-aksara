/**
 * COMMENT MANAGEMENT PAGE (COMMUNITY)
 * -----------------------------------
 * Halaman untuk mengelola seluruh interaksi pembaca (komentar).
 * Fitur:
 * 1. Security: Hanya menampilkan komentar pada karya milik Author tersebut.
 * 2. Context: Menunjukkan asal usul komentar (Bab & Judul Karya).
 * 3. UI: Layout grid responsif dengan gaya kartu Studio yang premium.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { MessageSquare } from "lucide-react";

export default async function CommentManagementPage() {
    // [1] AUTHENTICATION & SECURITY
    // Memastikan user yang login divalidasi dan sesi tidak null.
    const session = (await getServerSession(authOptions))!;

    // [2] DATA FETCHING: Comments per Author
    // SQL Logic: Ambil komentar dimana Bab tersebut tertaut pada Karya milik Uploader_ID user saat ini.
    const comments = await prisma.comment.findMany({
        where: {
            bab: {
                karya: {
                    uploader_id: session.user.id
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        },
        include: {
            user: true, // Ambil info pengirim komentar
            bab: {
                include: {
                    karya: true // Ambil info judul karya asal komentar
                }
            }
        }
    });

    return (
        <div className="pb-20">
            {/* Page Header: Title & Stats Counter */}
            <div className="px-4 sm:px-8 pt-6 sm:pt-10 mb-6 sm:mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl sm:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-none uppercase italic">Komentar</h1>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <span className="text-[10px] sm:text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{comments.length} Total</span>
                </div>
            </div>

            <main className="w-full mx-auto px-4 sm:px-8 transition-all">
                {/* Empty State: Jika belum ada pembaca yang berkomentar */}
                {comments.length === 0 ? (
                    <div className="text-center py-16 sm:py-20 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800 px-4 sm:px-6">
                        <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 text-gray-200 mx-auto mb-3 sm:mb-4" />
                        <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-1">Belum Ada Komentar</h3>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-4">Interaksi pembaca pada karya Anda akan muncul di sini.</p>
                    </div>
                ) : (
                    /* Grid Layout: Menampilkan komentar dalam kartu-kartu kecil */
                    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {comments.map((comment) => (
                            <div key={comment.id} className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-gray-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all shadow-sm group flex flex-col">
                                {/* Header Kartu: Profile Pengirim & Waktu */}
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-indigo-600">
                                        {comment.user.display_name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase truncate">{comment.user.display_name}</p>
                                        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                                            {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                {/* Isi Komentar: Dibalut kontainer bergaya Gelembung (Bubble) */}
                                <div className="bg-gray-50/50 dark:bg-slate-800/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-transparent group-hover:border-indigo-50 transition-colors mb-3 flex-1">
                                    <p className="text-[12px] text-gray-600 dark:text-gray-400 leading-relaxed italic line-clamp-3">"{comment.content}"</p>
                                </div>
                                {/* Metadata Footer: Menujukkan komentar masuk di bab mana */}
                                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50 dark:border-slate-800/50">
                                    <span className="text-[8px] font-black text-gray-300 dark:text-gray-600 uppercase tracking-widest">Pada:</span>
                                    <span className="text-[9px] font-black text-indigo-500 truncate max-w-[150px] uppercase tracking-tight italic">{comment.bab.karya.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
