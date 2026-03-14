'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

// Mengapa: Navbar ini adalah Client Component agar bisa mendeteksi state user 
// secara real-time via `useSession()` dan mengeksekusi aksi interaktif seperti `signOut()`.
export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-bg-cream/80 dark:bg-brown-dark/80 backdrop-blur-md border-b border-tan-primary/10 sticky top-0 z-40 transition-all duration-300 md:hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <Link href={session ? "/user/dashboard" : "/"} className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-white/10 rounded-lg overflow-hidden p-0.5 border border-tan-primary/10">
                            <img src="/logoRuangAksara.webp" alt="Logo" className="w-full h-full object-cover rounded" />
                        </div>
                        <span className="font-lobster text-xl text-brown-dark dark:text-text-accent group-hover:text-tan-primary transition-colors">
                            Ruang Aksara
                        </span>
                    </Link>

                    {/* Utils */}
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        {status === 'authenticated' && session ? (
                            <Link 
                                href={`/profile/${session.user.id}`}
                                className="w-9 h-9 rounded-full bg-tan-primary/20 flex items-center justify-center text-brown-dark border border-tan-primary/20"
                            >
                                <User className="w-5 h-5" />
                            </Link>
                        ) : status === 'unauthenticated' ? (
                            <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-widest text-brown-dark bg-tan-primary/20 px-4 py-2 rounded-xl">
                                Masuk
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
}
