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
    const session = await getServerSession(authOptions);

    if (!session || !['admin', 'author'].includes(session.user?.role as string)) {
        redirect('/');
    }

    const navigation = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Karya', href: '/admin/editor/karya', icon: BookOpen },
        { name: 'Komunitas', href: '/admin/community', icon: MessageSquare },
        { name: 'Tips Studio', href: '/admin/editor/tips', icon: Sparkles },
    ];

    if (session.user.role === 'admin') {
        navigation.push({ name: 'Genre', href: '/admin/genre', icon: Settings });
    }

    return (
        <div className="flex min-h-screen bg-[#FDFBF7] dark:bg-slate-950 transition-colors duration-500 w-full">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 sticky top-0 h-screen z-30 transition-colors">
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl flex items-center justify-center text-white font-black italic shadow-lg shadow-indigo-100 dark:shadow-none transition-transform group-hover:scale-110">
                            RA
                        </div>
                        <span className="font-black text-xl tracking-tighter text-gray-900 dark:text-gray-100">STUDIO</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navigation.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-sm font-black uppercase tracking-widest text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-2xl transition-all group"
                        >
                            <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-50 dark:border-slate-800">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 shadow-sm">
                            <UserCircle2 className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-black text-gray-900 dark:text-gray-100 truncate uppercase tracking-tight">{session.user.name}</span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">{session.user.role}</span>
                        </div>
                    </div>
                    <LogoutButton />
                </div>
            </aside>

            {/* Mobile Header (Hidden on Desktop) */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="lg:hidden h-16 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between px-4 sticky top-0 z-30 transition-colors">
                    <Link href="/admin/dashboard" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-700 rounded-lg flex items-center justify-center text-white font-black italic shadow-md text-xs">
                            RA
                        </div>
                        <span className="font-black text-sm tracking-tighter text-gray-900 dark:text-gray-100 uppercase">Studio</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link href={`/profile/${session.user.id}`} className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-400 border border-gray-100 dark:border-slate-700">
                            <UserCircle2 className="w-5 h-5" />
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 w-full max-w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}
