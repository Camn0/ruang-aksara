'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, UserCircle2 } from 'lucide-react';
import SidebarNav from '@/app/components/SidebarNav';
import ThemeToggle from '@/app/components/ThemeToggle';

interface AdminMobileHeaderProps {
    session: any;
}

export default function AdminMobileHeader({ session }: AdminMobileHeaderProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <header className="lg:hidden h-20 bg-brown-dark border-b border-text-main/5 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors shadow-lg text-bg-cream">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setIsOpen(true)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <Link href="/admin/dashboard" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center p-0.5 shadow-inner">
                            <img src="/logoRuangAksara.webp" alt="Logo" className="w-full h-full object-cover rounded-lg" />
                        </div>
                        <span className="font-black text-sm tracking-[0.2em] uppercase italic">Studio</span>
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Link href={`/profile/${session.user.id}`} className="w-10 h-10 rounded-xl bg-bg-cream/10 dark:bg-bg-cream flex items-center justify-center text-bg-cream dark:text-brown-dark shadow-lg">
                        <UserCircle2 className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Sidebar Drawer */}
            <div className={`fixed top-0 left-0 h-full w-[280px] bg-brown-dark z-[80] shadow-2xl transition-transform duration-500 lg:hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-8 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] mb-1 italic">Ruang Aksara</span>
                        <span className="font-black text-xl tracking-tighter text-bg-cream italic uppercase">STUDIO</span>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-white/10 rounded-xl transition-colors text-bg-cream"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto" onClick={() => setIsOpen(false)}>
                    <SidebarNav userRole={session.user.role} />
                </div>

                <div className="p-6 mt-auto border-t border-white/5">
                     <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em] text-center italic">Ruang Aksara — 2024</p>
                </div>
            </div>
        </>
    );
}
