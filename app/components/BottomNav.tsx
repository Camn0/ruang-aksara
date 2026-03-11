"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, BookMarked, PenTool, User } from "lucide-react";

export default function BottomNav() {
    const { data: session } = useSession();
    const pathname = usePathname();

    const hiddenRoutes = ["/onboarding", "/auth/login", "/auth/register"];
    if (hiddenRoutes.some(route => pathname.startsWith(route))) {
        return null;
    }

    if (pathname.match(/^\/novel\/[^\/]+\/\d+$/)) {
        return null;
    }

    if (!session?.user) {
        return null;
    }

    const isAdminOrAuthor = session.user.role === 'admin' || session.user.role === 'author';
    const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

    const homeUrl = isAdminOrAuthor ? "/admin/dashboard" : "/user/dashboard";
    const editUrl = "/admin/editor/karya";
    const libraryUrl = "/library";

    return (
        <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none transition-transform duration-300">
            {/* Wrapper: Wobbly Paper Scrap feeling */}
            <div className="w-[92%] max-w-lg bg-parchment border-4 border-ink wobbly-border paper-shadow pb-2 pt-2 px-4 pointer-events-auto transition-colors duration-300">
                <div className="flex justify-between items-center h-16 relative">
                    <Link
                        href={homeUrl}
                        className={`flex flex-col items-center justify-center w-16 h-14 transition-all ${isActive(homeUrl) ? 'text-ink-deep bg-gold/40 wobbly-border-sm scale-110' : 'text-ink/60 hover:text-ink'}`}
                    >
                        <Home className="w-6 h-6 rotate-[-5deg]" strokeWidth={2} />
                        <span className="text-[10px] mt-1 font-marker">Beranda</span>
                    </Link>

                    <Link
                        href="/search"
                        className={`flex flex-col items-center justify-center w-16 h-14 transition-all ${isActive('/search') ? 'text-ink-deep bg-gold/40 wobbly-border-sm scale-110' : 'text-ink/60 hover:text-ink'}`}
                    >
                        <Search className="w-6 h-6 rotate-[3deg]" strokeWidth={2} />
                        <span className="text-[10px] mt-1 font-marker">Cari</span>
                    </Link>

                    {isAdminOrAuthor && (
                        <div className="flex items-center justify-center relative -mt-10">
                            <Link
                                href={editUrl}
                                className="flex items-center justify-center w-14 h-14 bg-dried-red text-white wobbly-border paper-shadow hover:scale-110 active:scale-95 transition-all"
                                title="Tulis Karya Baru"
                            >
                                <PenTool className="w-6 h-6 rotate-[-12deg]" />
                            </Link>
                        </div>
                    )}

                    <Link
                        href={libraryUrl}
                        className={`flex flex-col items-center justify-center w-16 h-14 transition-all ${isActive(libraryUrl) ? 'text-ink-deep bg-gold/40 wobbly-border-sm scale-110' : 'text-ink/60 hover:text-ink'}`}
                    >
                        <BookMarked className="w-6 h-6 rotate-[5deg]" strokeWidth={2} />
                        <span className="text-[10px] mt-1 font-marker">Koleksi</span>
                    </Link>

                    <Link
                        href={`/profile/${session.user.id}`}
                        className={`flex flex-col items-center justify-center w-16 h-14 transition-all ${isActive('/profile') ? 'text-ink-deep bg-gold/40 wobbly-border-sm scale-110' : 'text-ink/60 hover:text-ink'}`}
                    >
                        <User className="w-6 h-6 rotate-[-3deg]" strokeWidth={2} />
                        <span className="text-[10px] mt-1 font-marker">Profil</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

