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
        <div className="pb-32 bg-parchment-light min-h-screen">
            {/* Page Header: Title & Stats Counter */}
            <div className="px-8 pt-10 sm:pt-16 mb-10 sm:mb-16 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="font-journal-title text-3xl sm:text-5xl text-ink-deep italic leading-none">Interaksi Pembaca</h1>
                    <p className="font-marker text-pine text-xs uppercase tracking-[0.3em] mt-3">Catatan Komentar & Diskusi</p>
                </div>
                <div className="bg-paper wobbly-border-sm px-6 py-3 border-2 border-gold/20 -rotate-2 shadow-sm">
                    <span className="font-marker text-xs font-black text-gold uppercase tracking-widest">{comments.length} Suara</span>
                </div>
            </div>

            <main className="w-full mx-auto px-6 sm:px-8 transition-all">
                {/* Empty State: Jika belum ada pembaca yang berkomentar */}
                {comments.length === 0 ? (
                    <div className="text-center py-24 bg-paper wobbly-border paper-shadow px-8 max-w-2xl mx-auto rotate-1">
                        <MessageSquare className="w-16 h-16 text-ink/10 mx-auto mb-6 rotate-12" />
                        <h3 className="font-journal-title text-3xl text-ink-deep mb-3 italic">Hening di Kejauhan...</h3>
                        <p className="font-journal-body text-ink/40 italic text-lg leading-relaxed">Belum ada jejak bincang-bincang pada karyamu. Mungkin saatnya memancing imajinasi mereka?</p>
                    </div>
                ) : (
                    /* Grid Layout: Menampilkan komentar dalam kartu-kartu kecil */
                    <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-3 pb-20">
                        {comments.map((comment, i) => (
                            <div key={comment.id} className={`bg-paper wobbly-border paper-shadow p-6 transition-all hover:bg-parchment-light hover:-translate-y-1 group flex flex-col ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                                {/* Header Kartu: Profile Pengirim & Waktu */}
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 wobbly-border-sm bg-parchment flex items-center justify-center font-journal-title text-xl text-ink-deep italic border-2 border-paper shadow-md">
                                        {comment.user.display_name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-journal-title text-lg text-ink-deep italic leading-none">{comment.user.display_name}</p>
                                        <p className="font-marker text-[10px] text-ink/30 uppercase tracking-widest mt-1">
                                            {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                        </p>
                                    </div>
                                </div>
                                {/* Isi Komentar: Dibalut kontainer bergaya Gelembung (Bubble) */}
                                <div className="bg-parchment-light/50 wobbly-border-sm p-5 border-transparent group-hover:border-pine/5 transition-colors mb-6 flex-1 italic">
                                    <p className="font-journal-body text-lg text-ink-deep/80 leading-relaxed">"{comment.content}"</p>
                                </div>
                                {/* Metadata Footer: Menujukkan komentar masuk di bab mana */}
                                <div className="flex items-center gap-3 mt-auto pt-4 wobbly-border-t border-ink/5">
                                    <span className="font-marker text-[10px] text-ink/20 uppercase tracking-[0.2em]">Karya:</span>
                                    <span className="font-journal-title text-base text-pine truncate max-w-[180px] italic">{comment.bab.karya.title}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
