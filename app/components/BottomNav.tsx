/**
 * @file BottomNav.tsx
 * @description Responsive mobile navigation bar, automatically hiding the desktop sidebar to preserve screen real estate.
 * @author Ruang Aksara Engineering Team
 */

"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Library, User, PenTool } from "lucide-react";
import './BottomNav.css';

/**
 * BottomNav: Encapsulates the explicit React DOM lifecycle and state-management for the bottom nav interactive workflow.
 */
export default function BottomNav() {
    const { data: session } = useSession();
    const pathname = usePathname();


    if (!session?.user) return null;

    const hiddenRoutes = ["/onboarding", "/auth/login", "/auth/register", "/admin"];
    if (hiddenRoutes.some(route => pathname.startsWith(route))) return null;
    if (pathname.match(/^\/novel\/[^\/]+\/\d+$/)) return null;

    const role = session.user.role;
    const isAuthor = role === 'admin' || role === 'author';

    const readerMenu = [
        { name: "Home", icon: Home, path: "/user/dashboard" },
        { name: "Search", icon: Search, path: "/search" },
        { name: "Library", icon: Library, path: "/library" },
        { name: "Profile", icon: User, path: `/profile/${session.user.id}` },
    ];

    const authorMenu = [
        { name: "Home", icon: Home, path: "/user/dashboard" },
        { name: "Search", icon: Search, path: "/search" },
        { name: "Studio", icon: PenTool, path: "/admin/dashboard" },
        { name: "Library", icon: Library, path: "/library" },
        { name: "Profile", icon: User, path: `/profile/${session.user.id}` },
    ];

    const menu = isAuthor ? authorMenu : readerMenu;
    const activeIndex = menu.findIndex(item =>
        pathname === item.path || (item.path !== "/" && pathname.startsWith(item.path))
    );

    // Neutral state: Only show indicator if we have a match
    const currentActiveIndex = activeIndex;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[400px] md:hidden">
            <div className={`navigation relative ${isAuthor ? 'nav-author' : 'nav-reader'} ${currentActiveIndex !== -1 ? `active-${currentActiveIndex}-${menu.length}` : 'nav-neutral'} shadow-2xl transition-all duration-300`}>
                <div className="absolute inset-0 overflow-hidden rounded-[30px] pointer-events-none">
                    <div className="indicator-cutout"></div>
                </div>

                {currentActiveIndex !== -1 && (
                    <div className="indicator-circle flex items-center justify-center"></div>
                )}

                <ul className="flex w-full h-full relative z-10 translate-y-[-1px]">
                    {menu.map((item, index) => {
                        const isStudio = isAuthor && index === 2;
                        const isProfile = item.name === "Profile";
                        const isActive = currentActiveIndex === index;

                        return (
                            <li key={index} className={`flex-1 ${isActive ? 'active' : ''}`}>
                                <Link href={item.path} prefetch={false} className="flex justify-center items-center h-full w-full relative">
                                    {isStudio ? (
                                        <div className="relative flex items-center justify-center translate-y-[-24px]">
                                            <div className="w-[58px] h-[58px] bg-brown-dark dark:bg-tan-primary rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 border-[6px] border-bg-cream dark:border-brown-dark transform-gpu will-change-transform">
                                                <item.icon className={`w-7 h-7 transition-all transform-gpu ${isActive ? 'text-text-accent dark:text-brown-dark' : 'text-text-accent/60 dark:text-brown-dark/60'}`} strokeWidth={2} />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="icon flex items-center justify-center h-full relative">
                                            <item.icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
}

