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
        <div className="min-h-screen bg-parchment-light pb-32 transition-all">
            <header className="px-6 h-16 bg-parchment border-b wobbly-border-b border-ink/5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                <Link href={`/profile/${userProfile.username}`} className="p-3 -ml-3 text-ink-deep hover:bg-white wobbly-border-sm transition-all rotate-3 active:-rotate-3">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-journal-title text-2xl text-ink-deep absolute left-1/2 -translate-x-1/2 italic">Gubahan Identitas</h1>
                <div className="w-10"></div>
            </header>

            <div className="p-8 max-w-2xl mx-auto">
                <div className="bg-white wobbly-border paper-shadow p-8 mb-12 -rotate-1 transition-all hover:rotate-0">
                    <div className="flex items-center gap-5 mb-10">
                        <div className="w-16 h-16 wobbly-border-sm bg-parchment-light flex items-center justify-center text-pine border-2 border-white shadow-md rotate-3 shrink-0">
                            <UserCircle2 className="w-10 h-10" />
                        </div>
                        <div>
                            <h2 className="font-journal-title text-xl text-ink-deep italic leading-none">Informasi Publik</h2>
                            <p className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mt-2">Bagaimana dunia akan mengenalmu</p>
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
