'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

// Mengapa: Navbar ini adalah Client Component agar bisa mendeteksi state user 
// secara real-time via `useSession()` dan mengeksekusi aksi interaktif seperti `signOut()`.
export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-parchment-light dark:bg-parchment border-b-2 border-ink-deep sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20 items-center">
                    {/* Logo & Main Nav */}
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-3xl font-journal-title text-ink-deep hover:rotate-1 transition-transform">
                                Ruang Aksara
                            </Link>
                        </div>
                        <div className="hidden sm:ml-10 sm:flex sm:space-x-8">
                            <Link
                                href="/novel"
                                className="inline-flex items-center px-4 py-1 text-lg font-journal-body text-ink hover:text-pine hover:scale-105 transition-all"
                            >
                                <span className="border-b-2 border-transparent hover:border-pine">Jelajah Karya</span>
                            </Link>
                        </div>
                    </div>

                    {/* Autentikasi Section */}
                    <div className="flex items-center space-x-6">
                        <ThemeToggle />

                        {status === 'loading' ? (
                            <span className="text-sm font-journal-body text-ink/50 italic animate-pulse">Menulis...</span>
                        ) : session ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-lg font-journal-body text-ink hidden md:flex items-center gap-2">
                                    Halo, <span className="font-marker">{session.user.name}</span>
                                    <span className="text-xs bg-pine text-parchment-light py-1 px-3 wobbly-border-sm font-special uppercase leading-none">
                                        {session.user.role}
                                    </span>
                                </span>

                                <Link
                                    href={session.user.role === 'admin' || session.user.role === 'author'
                                        ? "/admin/dashboard"
                                        : "/user/dashboard"}
                                    className="text-lg font-marker text-ink hover:text-gold transition-colors underline decoration-gold/50 decoration-2 underline-offset-4"
                                >
                                    Papan Kerja
                                </Link>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-base font-special text-dried-red hover:bg-dried-red hover:text-white border-2 border-ink px-4 py-1 wobbly-border-sm transition-all active:scale-95"
                                >
                                    Keluar
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/api/auth/signin"
                                    className="text-lg font-journal-body text-ink hover:text-pine transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="text-lg font-journal-title bg-gold text-ink-deep px-6 py-2 wobbly-border paper-shadow hover:scale-105 transition-all active:scale-95"
                                >
                                    Daftar
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
