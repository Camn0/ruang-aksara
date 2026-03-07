'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';

// Mengapa: Navbar ini adalah Client Component agar bisa mendeteksi state user 
// secara real-time via `useSession()` dan mengeksekusi aksi interaktif seperti `signOut()`.
export default function Navbar() {
    const { data: session, status } = useSession();

    return (
        <nav className="bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-300">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo & Main Nav */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                RuangAksara
                            </Link>
                        </div>
                        <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                            <Link
                                href="/novel"
                                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
                            >
                                Jelajah Karya
                            </Link>
                        </div>
                    </div>

                    {/* Autentikasi Section */}
                    <div className="flex items-center space-x-4">
                        <ThemeToggle />

                        {status === 'loading' ? (
                            <span className="text-sm text-gray-400 dark:text-gray-500">Loading...</span>
                        ) : session ? (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-300 hidden md:block">
                                    Halo, <strong>{session.user.name}</strong>
                                    <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-300 py-1 px-2 rounded-full uppercase font-bold">
                                        {session.user.role}
                                    </span>
                                </span>

                                {/* Mengapa: Mengarahkan ke dashboard yang sesuai berdasarkan Role */}
                                <Link
                                    href={session.user.role === 'admin' || session.user.role === 'author'
                                        ? "/admin/dashboard"
                                        : "/user/dashboard"}
                                    className="text-sm font-semibold text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    Dashboard
                                </Link>

                                <button
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                    className="text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 font-medium py-2 px-4 rounded-md transition-colors"
                                >
                                    Keluar
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/api/auth/signin"
                                    className="text-sm text-gray-700 dark:text-gray-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href="/auth/register"
                                    className="text-sm bg-gray-900 dark:bg-slate-800 text-white px-5 py-2.5 rounded-md font-medium hover:bg-gray-800 dark:hover:bg-slate-700 transition-colors shadow-sm"
                                >
                                    Daftar Akun
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
