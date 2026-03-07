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
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="px-4 h-14 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                <Link href={`/profile/${userProfile.id}`} className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 absolute left-1/2 -translate-x-1/2">Edit Profil</h1>
                <div className="w-10"></div>
            </header>

            <div className="bg-white px-6 py-8 border-b border-gray-100 mb-2 text-center">
                <div className="w-24 h-24 mx-auto bg-gradient-to-tr from-indigo-100 to-indigo-50 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-lg shadow-indigo-100/50 mb-4">
                    <UserCircle2 className="w-16 h-16 text-indigo-300" strokeWidth={1} />
                </div>
                <p className="text-xs text-gray-500 font-medium">Ubah Foto Profil (Hanya purwarupa)</p>
            </div>

            <div className="bg-white px-6 py-6 border-y border-gray-100">
                <EditProfileForm initialData={{ display_name: userProfile.display_name, avatar_url: userProfile.avatar_url }} />
            </div>
        </div>
    );
}
