'use client';

import { useSidebar } from "./SidebarContext";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";
import Navbar from "./Navbar";
import AuthProvider from "./AuthProvider";
import { usePathname } from "next/navigation";

export default function LayoutContent({ children }: { children: React.ReactNode }) {
    const { isExpanded, setIsExpanded } = useSidebar();
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <div className="flex w-full min-h-screen transition-colors duration-300">
            <AuthProvider>
                {/* Sidebar desktop */}
                <Sidebar />

                {/* Overlay for expanded sidebar */}
                {isExpanded && (
                    <div 
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-all duration-500 ease-in-out md:block hidden animate-in fade-in"
                        onClick={() => setIsExpanded(false)}
                    />
                )}

                <div className="flex-1 flex flex-col relative min-h-screen overflow-x-hidden">
                    <main className={`flex-grow flex flex-col relative ${isAdmin ? '' : 'pb-20 md:pb-0'}`}>
                        {children}
                    </main>
                    <BottomNav />
                </div>
            </AuthProvider>
        </div>
    );
}
