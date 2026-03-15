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
import CommentModerationClient from "./CommentModerationClient";

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
        select: {
            id: true,
            content: true,
            created_at: true,
            user: { select: { display_name: true, id: true, avatar_url: true } },
            bab: {
                select: {
                    id: true,
                    chapter_no: true,
                    karya: { select: { title: true, id: true } }
                }
            },
            parent: {
                select: {
                    id: true,
                    content: true,
                    user: { select: { display_name: true, id: true } }
                }
            },
            _count: {
                select: { votes: true }
            }
        }
    });

    return (
        <div className="pb-20 p-4 sm:p-8 max-w-7xl mx-auto min-h-screen">
            {/* Page Header: Title & Context */}
            <div className="mb-10 sm:mb-16">
                <div className="flex items-center gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-brown-dark rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-lg shadow-brown-dark/20 rotate-3 group hover:rotate-0 transition-transform duration-500">
                        <MessageSquare className="w-5 h-5 sm:w-7 sm:h-7 text-tan-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-4xl font-black text-brown-dark dark:text-tan-primary uppercase tracking-tighter italic leading-none">Diskusi Komunitas</h1>
                        <p className="text-[9px] sm:text-[11px] font-black text-brown-dark/40 dark:text-bg-cream/40 uppercase tracking-[0.3em] mt-1 sm:mt-2">Suara dari Pembaca Ruang Aksara</p>
                    </div>
                </div>
                <div className="h-1 sm:h-2 w-24 sm:w-32 bg-brown-mid rounded-full mb-6 sm:mb-10 opacity-20" />
            </div>

            <main className="w-full">
                {/* Client Side Moderation Hub (Sorting & Filtering) */}
                <CommentModerationClient initialComments={JSON.parse(JSON.stringify(comments))} />
            </main>
        </div>
    );
}
