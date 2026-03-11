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
        <div className="min-h-screen bg-parchment-light pb-32 transition-all">
            <header className="px-6 h-16 bg-parchment border-b wobbly-border-b border-ink/5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <Link href={`/profile/${userProfile.username}`} className="p-3 -ml-3 text-ink-deep hover:bg-white wobbly-border-sm transition-all rotate-3 active:-rotate-3">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-journal-title text-2xl text-ink-deep absolute left-1/2 -translate-x-1/2 italic">Lembar Pengaturan</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-8 max-w-2xl mx-auto">
                <div className="bg-white wobbly-border paper-shadow p-8 mb-12 -rotate-1 transition-all hover:rotate-0">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 wobbly-border-sm bg-parchment-light flex items-center justify-center text-pine border-2 border-white shadow-md rotate-3 shrink-0">
                            <UserCircle2 className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-journal-title text-xl text-ink-deep italic leading-none">Identitas Publik</h2>
                            <p className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mt-2">Ukir bio dan profilmu</p>
                        </div>
                        <Link href="/profile/edit" className="px-6 py-3 bg-pine text-parchment font-journal-title text-lg italic wobbly-border-sm shadow-xl hover:rotate-2 transition-all active:scale-95">
                            Edit Profil
                        </Link>
                    </div>
                </div>

                <h2 className="font-marker text-xs text-ink/30 uppercase tracking-[0.3em] mb-6 ml-3 flex items-center gap-3">
                    <KeySquare className="w-4 h-4" /> Kunci Keamanan
                </h2>

                <div className="bg-white wobbly-border-sm paper-shadow p-6 mb-12 rotate-1 opacity-60">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-ink/40 italic">
                            <KeySquare className="w-6 h-6" />
                            <span className="font-journal-title text-lg">Ganti Kata Sandi</span>
                        </div>
                        <span className="font-marker text-[8px] bg-parchment-light text-ink/30 px-3 py-1.5 wobbly-border-sm uppercase tracking-widest">Segera Terukir</span>
                    </div>
                </div>

                <h2 className="font-marker text-xs text-dried-red/40 uppercase tracking-[0.3em] mb-6 ml-3 flex items-center gap-3 italic">
                    <ShieldAlert className="w-4 h-4" /> Zona Terlarang
                </h2>

                <div className="bg-dried-red/5 wobbly-border-sm p-6 mb-12 -rotate-1 opacity-50 border-2 border-dried-red/10">
                    <div className="flex items-center justify-between opacity-40">
                        <div className="flex items-center gap-4 text-dried-red">
                            <Trash2 className="w-6 h-6" />
                            <span className="font-journal-title text-lg italic">Hapus Jejak Akun</span>
                        </div>
                        <span className="font-marker text-[8px] bg-dried-red/10 text-dried-red px-3 py-1.5 wobbly-border-sm uppercase">Segera Hadir</span>
                    </div>
                </div>

                <div className="mt-12 flex justify-center">
                    <LogoutSettingsButton />
                </div>
            </div>
        </div>
    );
}
