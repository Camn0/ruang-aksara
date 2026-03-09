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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            <header className="px-4 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
                <Link href={`/profile/${userProfile.username}`} className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2">Pengaturan</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 mb-8 transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <UserCircle2 className="w-7 h-7" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 italic">Identitas Publik</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Edit profil dan bio kamu</p>
                        </div>
                        <Link href="/profile/edit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">
                            Edit Profil
                        </Link>
                    </div>
                </div>

                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2">
                    <KeySquare className="w-4 h-4" /> Keamanan Akun
                </h2>

                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden mb-8 transition-colors duration-300">
                    <div className="p-4 flex items-center justify-between opacity-50 cursor-not-allowed grayscale">
                        <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                            <KeySquare className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                            <span className="font-bold text-sm">Ganti Kata Sandi</span>
                        </div>
                        <span className="text-[10px] bg-gray-200 dark:bg-slate-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded font-bold uppercase tracking-wider">Coming Soon</span>
                    </div>
                </div>

                <h2 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3 ml-2 flex items-center gap-2 text-red-500">
                    <ShieldAlert className="w-4 h-4" /> Zona Berbahaya
                </h2>

                <div className="bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden mb-6 transition-colors duration-300">
                    <div className="p-4 flex items-center justify-between hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors cursor-pointer cursor-not-allowed opacity-50">
                        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
                            <Trash2 className="w-5 h-5" />
                            <span className="font-bold text-sm">Hapus Akun Permanen</span>
                        </div>
                        <span className="text-[10px] bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-300 px-2 py-1 rounded font-bold uppercase">Segera Hadir</span>
                    </div>
                </div>

                <div className="mt-8">
                    <LogoutSettingsButton />
                </div>
            </div>
        </div>
    );
}
