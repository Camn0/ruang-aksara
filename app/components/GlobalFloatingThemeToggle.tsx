"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun, Palette, X } from "lucide-react";
import { usePathname } from "next/navigation";

export default function GlobalFloatingThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Jangan tampilkan di halaman baca karena sudah ada setting di reading interface
    const isReadingPage = pathname?.includes("/novel/") && pathname?.split("/").length > 3;

    if (!mounted || isReadingPage) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col items-center gap-2">
            {/* Quick Toggle Menu */}
            {isOpen && (
                <div className="flex flex-col gap-2 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <button
                        onClick={() => { setTheme("light"); setIsOpen(false); }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border transition-all ${theme === 'light' ? 'bg-white border-tan-primary text-tan-primary' : 'bg-white dark:bg-slate-800 border-tan-light/20 text-gray-400'}`}
                        title="Light Mode"
                    >
                        <Sun className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setTheme("dark"); setIsOpen(false); }}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border transition-all ${theme === 'dark' ? 'bg-slate-900 border-tan-primary text-tan-primary' : 'bg-white dark:bg-slate-800 border-tan-light/20 text-gray-400'}`}
                        title="Dark Mode"
                    >
                        <Moon className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onDoubleClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`w-12 h-12 bg-brown-dark hover:bg-brown-mid text-text-accent rounded-full flex items-center justify-center shadow-xl transition-all active:scale-90 border-2 border-white dark:border-slate-950 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
                aria-label="Toggle Theme Menu"
            >
                {isOpen ? (
                    <X className="w-5 h-5 rotate-[-45deg]" />
                ) : (
                    theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />
                )}
            </button>
        </div>
    );
}
