"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, BookMarked, PenTool, User, PlusCircle } from "lucide-react";

export default function BottomNav() {
    const { data: session } = useSession();
    const pathname = usePathname();

    // Sembunyikan navbar di halaman auth, onboarding, atau error
    const hiddenRoutes = ["/onboarding", "/auth/login", "/auth/register"];
    if (hiddenRoutes.some(route => pathname.startsWith(route))) {
        return null; // Tidak render
    }

    // Sembunyikan BottomNav khusus saat sedang asik membaca bab (rute /novel/[id]/[no])
    if (pathname.match(/^\/novel\/[^\/]+\/\d+$/)) {
        return null;
    }

    // Jangan render jika belum ada sesi dan bukan di rute publik yg diizinkan (opsional)
    if (!session?.user) {
        return null;
    }

    const isAdminOrAuthor = session.user.role === 'admin' || session.user.role === 'author';

    // Tentukan rute aktif
    const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

    const homeUrl = isAdminOrAuthor ? "/admin/dashboard" : "/user/dashboard";
    const editUrl = "/admin/editor/karya";
    const libraryUrl = "/library"; // Kita akan buat hlmn library nanti sesuai task 12.6

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md md:hidden pointer-events-auto">
            <div className="bg-tan-light rounded-[30px] shadow-xl p-2 relative">
                <div className="flex justify-between items-center h-12 px-4 relative">
                    <Link
                        href={homeUrl}
                        className={`p-2 transition-all ${isActive(homeUrl) ? 'scale-110' : 'opacity-60'}`}
                    >
                        <Home className="w-6 h-6 text-brown-dark" strokeWidth={isActive(homeUrl) ? 2.5 : 2} />
                    </Link>

                    <Link
                        href="/search"
                        className={`p-2 transition-all ${isActive('/search') ? 'scale-110' : 'opacity-60'}`}
                    >
                        <Search className="w-6 h-6 text-brown-dark" strokeWidth={isActive('/search') ? 2.5 : 2} />
                    </Link>

                    {/* Central Add Button */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2">
                        <Link
                            href={editUrl}
                            className="bg-brown-dark w-16 h-16 rounded-full flex items-center justify-center text-text-accent shadow-2xl border-4 border-bg-cream transition-transform active:scale-90"
                        >
                            <PlusCircle className="w-10 h-10" />
                        </Link>
                    </div>

                    {/* Spacer for central button */}
                    <div className="w-16"></div>

                    <Link
                        href={libraryUrl}
                        className={`p-2 transition-all ${isActive(libraryUrl) ? 'scale-110' : 'opacity-60'}`}
                    >
                        <BookMarked className="w-6 h-6 text-brown-dark" strokeWidth={isActive(libraryUrl) ? 2.5 : 2} />
                    </Link>

                    <Link
                        href={`/profile/${session.user.id}`}
                        className={`p-2 transition-all ${isActive('/profile') ? 'scale-110' : 'opacity-60'}`}
                    >
                        <User className="w-6 h-6 text-brown-dark" strokeWidth={isActive('/profile') ? 2.5 : 2} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

