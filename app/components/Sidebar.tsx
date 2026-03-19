'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Search, Library, Menu, Info, User, ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle';
import LogoutButton from './LogoutButton';
import { useSidebar } from './SidebarContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isExpanded, setIsExpanded, toggleSidebar } = useSidebar();

    // Sembunyikan sidebar di halaman auth, onboarding, admin, reading page, atau error
    const hiddenRoutes = ["/onboarding", "/auth/login", "/auth/register", "/admin"];
    const isReadingPage = pathname.match(/^\/novel\/[^\/]+\/\d+$/);

    if (hiddenRoutes.some(route => pathname.startsWith(route)) || isReadingPage) {
        return null; // Tidak render
    }

    const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

    const navItems = [
        { name: 'Home', href: '/user/dashboard', icon: Home },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Library', href: '/library', icon: Library },
        { name: 'Profile', href: session ? `/profile/${session.user.id}` : '/auth/login', icon: User },
        { name: 'Tentang Kami', href: '/about', icon: Info },
    ];

    return (
        <>
            <aside
                className={`hidden md:flex flex-col h-full bg-tan-primary dark:bg-brown-dark fixed left-0 top-0 py-6 z-[70] transition-all duration-500 ease-in-out shadow-2xl ${isExpanded ? 'w-64 px-4' : 'w-20 px-2'}`}
            >
                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-10 w-6 h-6 bg-brown-dark dark:bg-tan-primary text-text-accent rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-[60]"
                >
                    {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Logo Section */}
                <Link href={session ? "/user/dashboard" : "/"} prefetch={false} className={`flex flex-col items-center mb-6 lg:mb-10 transition-all duration-500 group/logo shrink-0`}>
                    <div className={`transition-all duration-500 bg-tan-primary/5 dark:bg-brown-mid/20 rounded-3xl flex items-center justify-center overflow-hidden p-1 shadow-inner group-hover/logo:scale-105 ${isExpanded ? 'w-28 h-20 mb-2' : 'w-16 h-16 mb-0'}`}>
                        {/* New Brand Logo Placeholder */}
                        <Image
                            src="/logoRuangAksara.webp"
                            width={112}
                            height={80}
                            alt="Ruang Aksara Logo"
                            className="w-full h-full object-cover rounded-2xl"
                        />
                    </div>
                    {isExpanded && (
                        <div className="w-full px-2 mt-1 flex justify-center animate-in fade-in slide-in-from-top-2 duration-700">
                            <Image
                                src="/ruangAksaraText.webp"
                                width={120}
                                height={40}
                                alt="Ruang Aksara"
                                className="h-10 w-auto object-contain brightness-110"
                            />
                        </div>
                    )}
                </Link>

                {/* Navigation links - Distributed evenly in middle space */}
                <nav className={`flex-grow flex flex-col justify-evenly py-4 px-1 min-h-0 overflow-y-auto hide-scrollbar`}>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            prefetch={false}
                            title={!isExpanded ? item.name : ''}
                            className={`flex items-center gap-4 transition-all duration-300 rounded-xl p-1.5 ${isExpanded ? 'justify-end pr-4' : 'justify-center'} ${isActive(item.href) ? 'text-text-main font-bold' : 'text-text-accent hover:text-white'}`}
                        >
                            {isExpanded && <span className="font-open-sans text-xs whitespace-nowrap animate-in fade-in slide-in-from-right-2">{item.name}</span>}
                            <item.icon className={`shrink-0 transition-all duration-300 ${isExpanded ? 'w-4 h-4' : 'w-6 h-6'} ${isActive(item.href) ? 'text-text-accent scale-110' : 'text-text-accent'}`} />
                        </Link>
                    ))}
                    
                    {/* Studio Button - Moved inside centered nav to balance it better with items */}
                    {session?.user && ['admin', 'author'].includes((session.user as any).role) && (
                        <div className="">
                            <Link
                                href="/admin/dashboard"
                                prefetch={false}
                                className={`flex items-center gap-2 bg-brown-dark/95 text-white rounded-full hover:bg-brown-dark transition-all shadow-lg group ${isExpanded ? 'p-1' : 'p-1 justify-center'}`}
                                title={!isExpanded ? 'Studio Penulis' : ''}
                            >
                                <div className={`bg-[#7A553A] rounded-full flex items-center justify-center shrink-0 shadow-md transition-transform group-hover:scale-105 ${isExpanded ? 'w-10 h-10' : 'w-12 h-12'}`}>
                                    <Plus className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2.5} />
                                </div>
                                {isExpanded && <span className="font-open-sans text-[11px] font-bold uppercase tracking-wider whitespace-nowrap animate-in fade-in flex-grow text-center pr-3">Studio Penulis</span>}
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Bottom Section */}
                <div className={`mt-auto transition-all duration-500 shrink-0`}>

                    {/* Utils */}
                    <div className={`pt-6 border-t border-text-accent/20 space-y-4`}>
                    </div>
                </div>
            </aside>
            {/* Spacer to prevent content jump if not using fixed, but since we are using fixed with transition, we might need a placeholder or just let layout handle it. Specification 3 shows it overlays, so we don't need a spacer if it's always fixed. Actually, Specification 1 & 2 showed it pushing content. I'll use a spacer for the non-expanded state width. */}
            <div className={`hidden md:block transition-all duration-500 ease-in-out ${isExpanded ? 'w-0' : 'w-20'}`} />
        </>
    );
}
