import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, KeySquare, Trash2, ShieldAlert, UserCircle2 } from "lucide-react";
import LogoutSettingsButton from "./LogoutSettingsButton";
import ProfileSettingsForm from "./ProfileSettingsForm";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return redirect('/auth/login');

    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!userProfile) return notFound();

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-slate-950 pb-24 transition-colors duration-500">
            <header className="px-6 h-16 bg-bg-cream dark:bg-slate-950 border-b border-brown-dark/5 flex items-center justify-between sticky top-0 z-50 transition-colors">
                <Link href={`/profile/${userProfile.username}`} className="p-2 -ml-2 text-text-main dark:text-gray-100 hover:bg-brown-dark/5 rounded-full transition-all active:scale-95">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-open-sans font-black text-lg text-text-main dark:text-gray-100 italic absolute left-1/2 -translate-x-1/2">Pengaturan</h1>
                <div className="w-10"></div>
            </header>

            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-brown-dark/[0.02] dark:bg-slate-900/40 rounded-[2.5rem] border border-brown-dark/5 p-6 sm:p-8 mb-10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-tan-primary/10 flex items-center justify-center text-tan-primary shadow-sm border border-tan-primary/20">
                            <UserCircle2 className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-open-sans font-black text-text-main dark:text-gray-100 italic leading-tight">Identitas Publik</h2>
                            <p className="text-[9px] font-black text-tan-primary uppercase tracking-[0.2em] mt-1">Edit profil dan bio kamu</p>
                        </div>
                        <Link href="/profile/edit" className="px-6 py-3 bg-brown-dark hover:bg-brown-dark/90 text-text-accent text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-brown-dark/10 transition-all active:scale-95">
                            Edit Profil
                        </Link>
                    </div>
                </div>

                <h2 className="text-[10px] font-black text-tan-primary/30 uppercase tracking-[0.3em] mb-4 ml-4 flex items-center gap-3">
                    <KeySquare className="w-4 h-4 opacity-30" /> Keamanan Akun
                </h2>

                <div className="bg-brown-dark/[0.02] dark:bg-slate-900/40 rounded-[2rem] border border-brown-dark/5 overflow-hidden mb-12 shadow-sm">
                    <div className="p-5 flex items-center justify-between opacity-30 cursor-not-allowed grayscale group">
                        <div className="flex items-center gap-4 text-text-main dark:text-gray-100">
                            <div className="w-10 h-10 bg-brown-dark/5 rounded-xl flex items-center justify-center">
                                <KeySquare className="w-5 h-5 text-brown-dark/40" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-tight">Ganti Kata Sandi</span>
                        </div>
                        <span className="text-[8px] bg-brown-dark/10 text-brown-dark/60 px-2 py-1 rounded font-black uppercase tracking-widest">Coming Soon</span>
                    </div>
                </div>

                <h2 className="text-[10px] font-black text-red-500/30 uppercase tracking-[0.3em] mb-4 ml-4 flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 opacity-30" /> Zona Berbahaya
                </h2>

                <div className="bg-red-500/[0.02] dark:bg-red-900/10 rounded-[2rem] border border-red-500/5 overflow-hidden mb-10 shadow-sm">
                    <div className="p-5 flex items-center justify-between hover:bg-red-500/[0.05] transition-colors cursor-not-allowed opacity-30 group">
                        <div className="flex items-center gap-4 text-red-500">
                            <div className="w-10 h-10 bg-red-500/5 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-tight">Hapus Akun Permanen</span>
                        </div>
                        <span className="text-[8px] bg-red-500/10 text-red-500/60 px-2 py-1 rounded font-black uppercase tracking-widest">Segera Hadir</span>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <LogoutSettingsButton />
                </div>
            </div>
        </div>
    );
}
