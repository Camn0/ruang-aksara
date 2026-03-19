"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, Search, Library, User, PenTool } from "lucide-react";
import './BottomNav.css';

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

    // Default to 0 if not found
    const currentActiveIndex = activeIndex === -1 ? 0 : activeIndex;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-[400px] md:hidden">
            <div className={`navigation relative ${isAuthor ? 'nav-author' : 'nav-reader'} active-${currentActiveIndex}-${menu.length}`}>
                {/* 1. Cutout Wings (Inside clipping container that matches bar perfectly) */}
                <div className="absolute inset-0 overflow-hidden rounded-[30px] pointer-events-none">
                    <div className="indicator-cutout"></div>
                </div>

                {/* 2. Floating Circle (Above everything, not clipped) */}
                <div className="indicator-circle flex items-center justify-center"></div>

                {/* 3. Navigation Items */}
                <ul className="flex w-full h-full relative z-10 translate-y-[-1px]">
                    {menu.map((item, index) => {
                        const isStudio = isAuthor && index === 2; // Middle item
                        const isActive = currentActiveIndex === index;
                        
                        return (
                             <li key={index} className={`flex-1 ${isActive ? 'active' : ''}`}>
                                <Link href={item.path} prefetch={false} className="flex justify-center items-center h-full w-full relative">
                                    {isStudio ? (
                                        <div className="relative flex items-center justify-center translate-y-[-24px]">
                                            {/* Ellipse 10 */}
                                            <div className="w-[58px] h-[58px] bg-[#3B2A22] dark:bg-tan-primary rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 border-[6px] border-bg-cream dark:border-brown-dark">
                                                <item.icon className="w-7 h-7 text-[#F2EAD7] dark:text-brown-dark transition-all" strokeWidth={3} />
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="icon flex items-center justify-center h-full">
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

