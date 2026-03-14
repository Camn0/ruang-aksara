/**
 * ADMIN LAYOUT (AUTHOR STUDIO)
 * ----------------------------
 * Ini adalah layout utama untuk seluruh area /admin (Author Studio).
 * Fungsi Utama:
 * 1. Proteksi Rute (RBAC): Memastikan hanya admin/author yang bisa masuk.
 * 2. Navigasi Terpadu: Menyediakan Sidebar (Desktop) dan Header (Mobile).
 * 3. User Context: Menampilkan profil user yang sedang login.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";
import SidebarNav from "../components/SidebarNav";
import AdminMobileHeader from "./AdminMobileHeader";
import ThemeToggle from "../components/ThemeToggle";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // [1] SECURITY CHECK: Server-side Session Validation
    // Menggunakan getServerSession untuk keamanan maksimal (bukan check client-side).
    const session = await getServerSession(authOptions);

    // [2] RBAC (Role Based Access Control)
    // Jika tidak login atau role bukan admin/author, tendang ke homepage.
    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

    return (
        <div className="flex min-h-screen bg-bg-cream dark:bg-brown-dark transition-colors duration-500 w-full">

            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden lg:flex flex-col w-64 bg-tan-primary dark:bg-brown-mid border-r border-text-main/5 dark:border-white/5 fixed left-0 top-0 h-screen z-30 transition-colors shadow-2xl">
                {/* Brand / Logo Section */}
                <div className="p-8">
                    <Link href="/admin/dashboard" className="flex flex-col items-center group/logo transition-all duration-500">
                        <div className="w-24 h-20 bg-text-main/10 dark:bg-white/10 rounded-3xl flex items-center justify-center overflow-hidden p-1 shadow-inner group-hover/logo:scale-105 transition-all">
                            <img
                                src="/logoRuangAksara.webp"
                                alt="Ruang Aksara Logo"
                                className="w-full h-full object-cover rounded-2xl"
                            />
                        </div>
                        <div className="mt-4 flex flex-col items-center">
                            <span className="text-[10px] font-black text-white/50 dark:text-tan-light uppercase tracking-[0.4em] mb-1 italic">Ruang Aksara</span>
                            <span className="font-black text-xl tracking-tighter text-text-main dark:text-bg-cream italic uppercase">STUDIO</span>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <SidebarNav userRole={session.user.role} />

                {/* Footer Sidebar: User Profile & Logout */}
                <div className="p-6 mt-auto space-y-4">
                    <div className="bg-text-main/5 dark:bg-white/5 rounded-[2.5rem] p-5 border border-text-main/5 dark:border-white/5">
                        <Link href={`/profile/${session.user.id}`} className="flex items-center gap-3 mb-4 group/profile">
                            <div className="w-10 h-10 rounded-2xl bg-text-main dark:bg-brown-dark flex items-center justify-center text-bg-cream shadow-lg transition-transform group-hover/profile:scale-110">
                                <UserCircle2 className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[10px] font-black text-text-main dark:text-bg-cream truncate uppercase tracking-tight italic group-hover/profile:text-brown-dark dark:group-hover/profile:text-tan-primary transition-colors">{session.user.name}</span>
                                <span className="text-[10px] text-text-main/50 dark:text-tan-light font-black uppercase tracking-[0.2em] leading-none">{session.user.role}</span>
                            </div>
                        </Link>
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            {/* SPACER for fixed sidebar */}
            <div className="hidden lg:block w-64 shrink-0" />

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* MOBILE HEADER: Hanya muncul di screen kecil (sm/md) */}
                <AdminMobileHeader session={session} />

                {/* Main Content Injector */}
                <main className="flex-1 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
