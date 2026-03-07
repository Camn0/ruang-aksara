"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, BookMarked, PenTool, User } from "lucide-react";

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
        <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
            {/* Wrapper menyesuaikan max-w-md dari global layout, dilonggarkan untuk desktop md:max-w-4xl */}
            <div className="w-full max-w-md md:max-w-4xl bg-white border-t border-gray-100 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)] pb-safe-area pt-2 px-6 pointer-events-auto">
                <div className="flex justify-between items-center h-14 md:px-12">
                    <Link
                        href={homeUrl}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${isActive(homeUrl) ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Home className="w-6 h-6" strokeWidth={isActive(homeUrl) ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">Home</span>
                    </Link>

                    <Link
                        href="/search"
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${isActive('/search') ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Search className="w-6 h-6" strokeWidth={isActive('/search') ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">Search</span>
                    </Link>

                    {isAdminOrAuthor && (
                        <div className="flex items-center justify-center relative z-10 -mt-6">
                            <Link
                                href={editUrl}
                                className="flex items-center justify-center w-14 h-14 bg-orange-500 rounded-full text-white shadow-xl shadow-orange-200 hover:bg-orange-600 transition-all hover:scale-105 active:scale-95"
                            >
                                <PenTool className="w-6 h-6" />
                            </Link>
                        </div>
                    )}

                    <Link
                        href={libraryUrl}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${isActive(libraryUrl) ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <BookMarked className="w-6 h-6" strokeWidth={isActive(libraryUrl) ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">Library</span>
                    </Link>

                    <Link
                        href={`/profile/${session.user.id}`}
                        className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all ${isActive('/profile') ? 'text-indigo-600 scale-110' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <User className="w-6 h-6" strokeWidth={isActive('/profile') ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium">Profile</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

