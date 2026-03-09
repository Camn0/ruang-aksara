import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCircle2 } from "lucide-react";
import EditProfileForm from "./EditProfileForm";

export default async function EditProfilePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return redirect('/auth/login');

    const userProfile = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    if (!userProfile) return notFound();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            <header className="px-4 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
                <Link href={`/profile/${userProfile.id}`} className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100 absolute left-1/2 -translate-x-1/2">Edit Profil</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-6 mb-8 transition-colors duration-300">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <UserCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-base font-black text-gray-900 dark:text-gray-100 italic">Identitas Publik</h2>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Atur bagaimana orang lain melihatmu</p>
                        </div>
                    </div>

                    <EditProfileForm
                        initialDisplayName={userProfile.display_name}
                        initialBio={(userProfile as any).bio}
                        initialSocialLinks={(userProfile as any).social_links}
                        initialAvatarUrl={(userProfile as any).avatar_url}
                    />
                </div>
            </div>
        </div>
    );
}
