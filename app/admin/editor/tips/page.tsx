import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, Sparkles, Book, PenTool, TrendingUp, Heart, Star, Zap, Clock } from "lucide-react";
import { redirect } from "next/navigation";

export default async function TipsStudioPage() {
    const session = await getServerSession(authOptions);
    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

    const tips = [
        {
            title: "Pancing dengan Bab Pertama",
            content: "Buat pembaca penasaran dari bab pertama. Konflik harus diperkenalkan sejak dini untuk menarik minat pembaca.",
            icon: <Zap className="w-6 h-6 text-yellow-500" />,
            color: "yellow"
        },
        {
            title: "Konsistensi adalah Kunci",
            content: "Update secara rutin (misal: 2x seminggu) membantu membangun basis pembaca yang setia dan meningkatkan peringkat karya.",
            icon: <Clock className="w-6 h-6 text-indigo-500" />,
            color: "indigo"
        },
        {
            title: "Deskripsi yang Menghidupkan",
            content: "Gunakan 'Show, Don't Tell'. Alih-alih mengatakan 'Dia marah', deskripsikan bagaimana tangannya mengepal dan wajahnya memerah.",
            icon: <PenTool className="w-6 h-6 text-rose-500" />,
            color: "rose"
        },
        {
            title: "Interaksi dengan Pembaca",
            content: "Luangkan waktu untuk membalas komentar. Pembaca yang dihargai cenderung memberikan dukungan lebih banyak.",
            icon: <Heart className="w-6 h-6 text-pink-500" />,
            color: "pink"
        },
        {
            title: "Tanda Baca & Tata Bahasa",
            content: "Kualitas tulisan sangat dipengaruhi oleh kerapian PUEBI. Jangan ragu untuk melakukan proofread sebelum publish.",
            icon: <Book className="w-6 h-6 text-emerald-500" />,
            color: "emerald"
        },
        {
            title: "Gunakan Metadata yang Tepat",
            content: "Pilih genre dan tag yang relevan. Cover yang menarik juga sangat membantu menarik klik pertama pembaca.",
            icon: <Sparkles className="w-6 h-6 text-violet-500" />,
            color: "violet"
        }
    ];

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-slate-950 pb-20 transition-colors duration-300">
            <header className="bg-indigo-900 border-b border-indigo-800 p-8 text-white relative overflow-hidden text-left">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="w-full px-4 sm:px-8 mx-auto relative z-10">
                    <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-indigo-300 hover:text-white transition-colors text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6">
                        <ArrowLeft className="w-4 h-4" /> Kembali
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-black italic mb-2">Tips Studio</h1>
                    <p className="text-indigo-300 font-bold text-[10px] sm:text-sm uppercase tracking-widest">Panduan Mengasah Pena</p>
                </div>
            </header>

            <main className="w-full mx-auto p-4 sm:p-8 -mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {tips.map((tip, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2.5rem] sm:rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-100/50 dark:shadow-none hover:scale-[1.02] transition-all">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-5 sm:mb-6 ${tip.color === 'yellow' ? 'bg-amber-50 dark:bg-amber-900/20' :
                                tip.color === 'indigo' ? 'bg-indigo-50 dark:bg-indigo-900/20' :
                                    tip.color === 'rose' ? 'bg-rose-50 dark:bg-rose-900/20' :
                                        tip.color === 'pink' ? 'bg-pink-50 dark:bg-pink-900/20' :
                                            tip.color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                                                'bg-violet-50 dark:bg-violet-900/20'
                                }`}>
                                {tip.icon}
                            </div>
                            <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 mb-3 uppercase tracking-tight">{tip.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{tip.content}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 bg-indigo-600 rounded-[3rem] p-10 text-white text-center shadow-2xl shadow-indigo-100 dark:shadow-none">
                    <h2 className="text-2xl font-black italic mb-4">Butuh Inspirasi Lebih?</h2>
                    <p className="text-indigo-100 font-bold text-xs uppercase tracking-widest mb-8 px-10">Jangan takut untuk bereksperimen dengan berbagai aliran cerita. Teruslah menulis, karena setiap kata adalah progres.</p>
                    <Link href="/admin/editor/karya" className="inline-block bg-white text-indigo-600 px-10 py-4 rounded-full font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all shadow-xl">
                        Ayo Mulai Menulis Sekarang
                    </Link>
                </div>
            </main>
        </div>
    );
}
