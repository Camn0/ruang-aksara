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
import { LayoutDashboard, BookOpen, MessageSquare, Sparkles, Settings, ArrowLeft, LogOut, UserCircle2 } from "lucide-react";
import LogoutButton from "@/app/components/LogoutButton";

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

    // [3] DYNAMIC NAVIGATION
    // Menu dasar yang tersedia untuk Author maupun Admin.
    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Karya', href: '/admin/editor/karya', icon: BookOpen },
        { name: 'Komunitas', href: '/admin/community', icon: MessageSquare },
        { name: 'Tips Studio', href: '/admin/editor/tips', icon: Sparkles },
    ];

    // Menu khusus Administrator (Kelola Genre/User platform).
    if (session.user.role === 'admin') {
        navigation.push({ name: 'Genre', href: '/admin/genre', icon: Settings });
    }

    return (
        <div className="flex min-h-screen bg-parchment-light pb-32 selection:bg-pine/20 w-full relative">
            {/* Vignette Overlay (Internal) */}
            <div className="fixed inset-0 pointer-events-none z-[100] shadow-[inset_0_0_150px_rgba(0,0,0,0.05)]" />

            {/* --- DESKTOP SIDEBAR --- */}
            <aside className="hidden lg:flex flex-col w-72 bg-parchment wobbly-border-r border-ink/5 sticky top-0 h-screen z-50 transition-colors">
                {/* Brand / Logo Section */}
                <div className="p-10">
                    <Link href="/" className="flex flex-col gap-1 group">
                        <span className="font-journal-title text-3xl tracking-tight text-ink-deep group-hover:rotate-[-2deg] transition-transform italic">STUDIO</span>
                        <span className="font-marker text-xs text-pine uppercase tracking-[0.3em] font-black">Ruang Aksara</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-6 space-y-4">
                    {navigation.map((item, i) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-4 px-6 py-4 wobbly-border-sm transition-all group ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'} hover:rotate-0 hover:bg-gold/10 hover:border-pine/30 ${item.href === '/admin/dashboard' ? 'bg-pine text-parchment shadow-md' : 'bg-white/40 text-ink/40'}`}
                        >
                            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            <span className="font-journal-title text-xl italic">{item.name}</span>
                        </Link>
                    ))}
                </nav>

                {/* Footer Sidebar: User Profile & Logout */}
                <div className="p-8 border-t-2 border-ink/5 wobbly-border-t">
                    <div className="flex items-center gap-4 mb-8 px-2 rotate-1">
                        <div className="w-12 h-12 wobbly-border border-2 border-white bg-white shadow-sm flex items-center justify-center text-ink/30">
                            <UserCircle2 className="w-7 h-7" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-journal-title text-lg text-ink-deep underline decoration-dotted decoration-ink/20 italic truncate">{session.user.name}</span>
                            <span className="font-special text-[9px] text-pine font-black uppercase tracking-[0.2em]">{session.user.role}</span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* --- MAIN CONTENT AREA --- */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* MOBILE HEADER: Hanya muncul di screen kecil (sm/md) */}
                <header className="lg:hidden h-20 bg-parchment wobbly-border-b border-ink/5 flex items-center justify-between px-6 sticky top-0 z-[110] transition-colors">
                    <Link href="/admin/dashboard" className="flex flex-col">
                        <span className="font-journal-title text-xl text-ink-deep italic leading-none">STUDIO</span>
                        <span className="font-marker text-[8px] text-pine uppercase tracking-widest font-black">Ruang Aksara</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href={`/profile/${session.user.id}`} className="w-10 h-10 wobbly-border-sm bg-white flex items-center justify-center text-ink/20 shadow-sm">
                            <UserCircle2 className="w-6 h-6" />
                        </Link>
                    </div>
                </header>

                {/* Main Content Injector */}
                <main className="flex-1 w-full max-w-full overflow-x-hidden p-6 sm:p-10">
                    {children}
                </main>
            </div>
        </div>
    );
}
