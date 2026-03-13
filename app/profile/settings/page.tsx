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
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark pb-24 transition-colors duration-500">
            <header className="px-6 h-16 bg-bg-cream dark:bg-brown-dark border-b border-tan-light/30 dark:border-tan-light/10 flex items-center justify-between sticky top-0 z-50 transition-colors">
                <Link href={`/profile/${userProfile.username}`} className="p-2 -ml-2 text-text-main dark:text-text-accent hover:bg-tan-light/30 dark:hover:bg-brown-mid/20 rounded-full transition-all active:scale-95">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-open-sans font-black text-lg text-text-main dark:text-text-accent italic absolute left-1/2 -translate-x-1/2">Pengaturan</h1>
                <div className="w-10"></div>
            </header>

            <div className="max-w-2xl mx-auto p-6">
                {/* Identitas Publik */}
                <div className="bg-tan-light/20 dark:bg-brown-mid/20 rounded-[2.5rem] border border-tan-light/40 dark:border-tan-light/10 p-6 sm:p-8 mb-10 transition-colors">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-tan-light/50 dark:bg-brown-mid/40 flex items-center justify-center text-brown-mid dark:text-tan-light shadow-sm border border-tan-light/40 dark:border-tan-light/10">
                            <UserCircle2 className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-open-sans font-black text-text-main dark:text-text-accent italic leading-tight">Identitas Publik</h2>
                            <p className="text-[9px] font-black text-tan-primary dark:text-tan-light/60 uppercase tracking-[0.2em] mt-1">Edit profil dan bio kamu</p>
                        </div>
                        <Link href="/profile/edit" className="px-6 py-3 bg-brown-dark dark:bg-text-accent hover:bg-brown-mid dark:hover:bg-tan-light text-text-accent dark:text-brown-dark text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">
                            Edit Profil
                        </Link>
                    </div>
                </div>

                {/* Keamanan Akun */}
                <h2 className="text-[10px] font-black text-brown-mid/50 dark:text-tan-light/40 uppercase tracking-[0.3em] mb-4 ml-4 flex items-center gap-3">
                    <KeySquare className="w-4 h-4" /> Keamanan Akun
                </h2>

                <div className="bg-tan-light/20 dark:bg-brown-mid/20 rounded-[2rem] border border-tan-light/40 dark:border-tan-light/10 overflow-hidden mb-12 shadow-sm">
                    <div className="p-5 flex items-center justify-between opacity-40 cursor-not-allowed grayscale group">
                        <div className="flex items-center gap-4 text-text-main dark:text-text-accent">
                            <div className="w-10 h-10 bg-tan-light/40 dark:bg-brown-mid/30 rounded-xl flex items-center justify-center">
                                <KeySquare className="w-5 h-5 text-brown-mid dark:text-tan-light" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-tight">Ganti Kata Sandi</span>
                        </div>
                        <span className="text-[8px] bg-tan-light/50 dark:bg-brown-mid/40 text-brown-mid dark:text-tan-light px-2 py-1 rounded font-black uppercase tracking-widest">Coming Soon</span>
                    </div>
                </div>

                {/* Zona Berbahaya */}
                <h2 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] mb-4 ml-4 flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4" /> Zona Berbahaya
                </h2>

                <div className="bg-red-500/[0.04] dark:bg-red-900/10 rounded-[2rem] border border-red-500/10 dark:border-red-500/10 overflow-hidden mb-10 shadow-sm">
                    <div className="p-5 flex items-center justify-between hover:bg-red-500/[0.05] transition-colors cursor-not-allowed opacity-40 group">
                        <div className="flex items-center gap-4 text-red-500">
                            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <Trash2 className="w-5 h-5" />
                            </div>
                            <span className="font-black text-sm uppercase tracking-tight">Hapus Akun Permanen</span>
                        </div>
                        <span className="text-[8px] bg-red-500/10 text-red-500/70 px-2 py-1 rounded font-black uppercase tracking-widest">Segera Hadir</span>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <LogoutSettingsButton />
                </div>
            </div>
        </div>
    );
}