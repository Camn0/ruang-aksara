'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Home, Search, BookMarked, Info, User, PlusCircle, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LogoutButton from './LogoutButton';
import { useSidebar } from './SidebarContext';

export default function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { isExpanded, setIsExpanded, toggleSidebar } = useSidebar();

    // Sembunyikan sidebar di halaman auth, onboarding, atau error
    const hiddenRoutes = ["/onboarding", "/auth/login", "/auth/register"];
    if (hiddenRoutes.some(route => pathname.startsWith(route))) {
        return null; // Tidak render
    }

    const isActive = (path: string) => pathname === path || (path !== "/" && pathname.startsWith(path));

    const navItems = [
        { name: 'Profile', href: session ? `/profile/${session.user.id}` : '/auth/login', icon: User },
        { name: 'Home', href: '/', icon: Home },
        { name: 'Search', href: '/search', icon: Search },
        { name: 'Library', href: '/library', icon: BookMarked },
        { name: 'Tentang Kami', href: '/about', icon: Info },
    ];

    return (
        <>
            <aside 
                className={`hidden md:flex flex-col h-full bg-tan-primary fixed left-0 top-0 py-8 z-30 transition-all duration-500 ease-in-out shadow-2xl ${isExpanded ? 'w-72 px-6' : 'w-20 px-2'}`}
            >
                {/* Toggle Button */}
                <button 
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-10 w-6 h-6 bg-brown-dark text-text-accent rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-40"
                >
                    {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Logo Section */}
                <div className={`flex flex-col items-center mb-10 transition-all duration-500 overflow-hidden ${isExpanded ? 'opacity-100' : 'opacity-100'}`}>
                    <div className={`transition-all duration-500 bg-white/10 rounded-xl flex items-center justify-center p-2 mb-2 ${isExpanded ? 'w-16 h-16' : 'w-12 h-12'}`}>
                        <div className="w-full h-full bg-text-accent rounded shadow-inner flex items-center justify-center">
                             <BookMarked className="text-tan-primary w-6 h-6" />
                        </div>
                    </div>
                    {isExpanded && <h1 className="font-lobster text-2xl text-text-accent whitespace-nowrap animate-in fade-in slide-in-from-left-2">Ruang Aksara</h1>}
                </div>

                {/* Navigation links */}
                <nav className="flex-grow space-y-4">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            title={!isExpanded ? item.name : ''}
                            className={`flex items-center gap-3 transition-all duration-300 rounded-xl p-3 ${isExpanded ? 'justify-end' : 'justify-center'} ${isActive(item.href) ? 'bg-brown-dark/20 text-text-main font-bold ring-1 ring-brown-dark/10' : 'text-text-accent hover:bg-white/5'}`}
                        >
                            {isExpanded && <span className="font-open-sans text-lg whitespace-nowrap animate-in fade-in slide-in-from-right-2">{item.name}</span>}
                            <item.icon className={`shrink-0 transition-all duration-300 ${isExpanded ? 'w-6 h-6' : 'w-7 h-7'} ${isActive(item.href) ? 'text-text-accent fill-text-accent scale-110' : 'text-text-accent'}`} />
                        </Link>
                    ))}
                </nav>

                {/* Bottom Section */}
                <div className={`mt-auto space-y-6 transition-all duration-500 ${isExpanded ? 'opacity-100' : 'opacity-100'}`}>
                    {/* Unggah Button */}
                    <Link
                        href="/admin/editor/upload"
                        className={`flex items-center gap-3 bg-brown-dark text-white rounded-2xl hover:bg-brown-mid transition-all shadow-lg group overflow-hidden ${isExpanded ? 'p-3' : 'p-3 justify-center'}`}
                        title={!isExpanded ? 'Unggah Cerita' : ''}
                    >
                        <div className={`bg-brown-mid rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform ${isExpanded ? 'w-10 h-10' : 'w-8 h-8'}`}>
                            <PlusCircle className="w-6 h-6 text-white" />
                        </div>
                        {isExpanded && <span className="font-open-sans text-sm font-bold whitespace-nowrap animate-in fade-in">Unggah Cerita</span>}
                    </Link>

                    {/* Utils */}
                    <div className={`pt-6 border-t border-text-accent/20 space-y-4 overflow-hidden`}>
                        <div className={`flex items-center justify-between transition-all duration-500 ${isExpanded ? 'px-2' : 'px-0 justify-center'}`}>
                            {isExpanded && <span className="text-[10px] font-bold uppercase tracking-widest text-text-accent opacity-60 animate-in fade-in">Tema</span>}
                            <ThemeToggle />
                        </div>
                        <div className={`${isExpanded ? 'px-2' : 'px-0 flex justify-center'}`}>
                            <LogoutButton expanded={isExpanded} />
                        </div>
                    </div>
                </div>
            </aside>
            {/* Spacer to prevent content jump if not using fixed, but since we are using fixed with transition, we might need a placeholder or just let layout handle it. Specification 3 shows it overlays, so we don't need a spacer if it's always fixed. Actually, Specification 1 & 2 showed it pushing content. I'll use a spacer for the non-expanded state width. */}
            <div className={`hidden md:block transition-all duration-500 ease-in-out ${isExpanded ? 'w-0' : 'w-20'}`} />
        </>
    );
}
