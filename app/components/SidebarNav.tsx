'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, MessageSquare, Sparkles, Settings, LucideIcon, ArrowLeft } from 'lucide-react';

interface SidebarNavProps {
    userRole: string;
}

export default function SidebarNav({ userRole }: SidebarNavProps) {
    const pathname = usePathname();

    const navigation = [
        { name: 'Karya', href: '/admin/editor/karya', icon: BookOpen },
        { name: 'Komunitas', href: '/admin/community', icon: MessageSquare },
        { name: 'Tips Studio', href: '/admin/editor/tips', icon: Sparkles },
    ];

    if (userRole === 'admin') {
        navigation.push({ name: 'Pengaturan Admin', href: '/admin/genre', icon: Settings });
    }

    return (
        <nav className="flex-1 px-4 mt-4 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] lg:max-h-none">
            {/* Back to Reader Mode Section */}
            <div className="mb-8 px-2">
                <p className="text-[9px] font-black text-[#3B2A22]/30 uppercase tracking-[0.3em] mb-4 pl-4">Navigasi Utama</p>
                <Link
                    href="/user/dashboard"
                    className="flex items-center gap-3 px-6 py-4 rounded-[2rem] text-[#3B2A22] bg-white/20 hover:bg-white/40 transition-all group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Ke Beranda</span>
                </Link>
            </div>

            <div className="space-y-3 pb-8">
                <p className="text-[9px] font-black text-[#3B2A22]/30 uppercase tracking-[0.3em] mb-4 pl-6">Studio Menu</p>
                {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center justify-between px-6 py-4 rounded-[2rem] transition-all duration-300 group ${
                            active 
                                ? 'bg-[#3B2A22] text-[#F2EAD7] shadow-xl translate-x-1' 
                                : 'text-[#3B2A22]/60 hover:text-[#3B2A22] hover:bg-white/10'
                        }`}
                    >
                        <span className={`text-[11px] font-black uppercase tracking-[0.2em] italic transition-all ${active ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`}>
                            {item.name}
                        </span>
                        <item.icon className={`w-4 h-4 transition-all duration-500 ${active ? 'scale-110 rotate-3' : 'group-hover:translate-x-1'}`} />
                    </Link>
                );
            })}
            </div>
        </nav>
    );
}
