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
        <div className="min-h-screen bg-bg-cream dark:bg-brown-dark pb-24 transition-colors duration-500">
            <header className="px-6 h-16 bg-bg-cream dark:bg-brown-dark border-b border-brown-dark/5 flex items-center justify-between sticky top-0 z-50 transition-colors">
                <Link href={`/profile/${userProfile.username}`} prefetch={false} className="p-2 -ml-2 text-text-main dark:text-text-accent hover:bg-brown-dark/5 rounded-full transition-all active:scale-95">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-open-sans font-black text-lg text-text-main dark:text-text-accent italic absolute left-1/2 -translate-x-1/2">Edit Profil</h1>
                <div className="w-10"></div>
            </header>

            <div className="max-w-2xl mx-auto p-6">
                <div className="bg-brown-dark/[0.02] dark:bg-brown-dark/40 rounded-[2.5rem] border border-brown-dark/5 p-6 sm:p-8 mb-8">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 rounded-2xl bg-tan-primary/10 flex items-center justify-center text-tan-primary shadow-sm border border-tan-primary/20">
                            <UserCircle2 className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-lg font-open-sans font-black text-text-main dark:text-text-accent italic leading-tight">Identitas Publik</h2>
                            <p className="text-[9px] font-black text-tan-primary uppercase tracking-[0.2em] mt-1">Atur bagaimana dunia melihatmu</p>
                        </div>
                    </div>

                    <EditProfileForm
                        initialDisplayName={userProfile.display_name}
                        initialBio={(userProfile as any).bio}
                        initialSocialLinks={(userProfile as any).social_links}
                        initialAvatarUrl={(userProfile as any).avatar_url}
                        initialBannerUrl={(userProfile as any).banner_url}
                    />
                </div>
            </div>
        </div>
    );
}
