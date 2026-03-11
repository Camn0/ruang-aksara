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
        <div className="fixed bottom-24 right-6 z-50 flex flex-col items-center gap-3">
            {/* Quick Toggle Menu */}
            {isOpen && (
                <div className="flex flex-col gap-3 mb-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
                    <button
                        onClick={() => { setTheme("light"); setIsOpen(false); }}
                        className={`w-12 h-12 wobbly-border-sm flex items-center justify-center shadow-lg transition-all rotate-3 ${theme === 'light' ? 'bg-pine text-parchment border-pine' : 'bg-white text-ink/40 border-ink/10'}`}
                        title="Light Mode"
                    >
                        <Sun className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => { setTheme("dark"); setIsOpen(false); }}
                        className={`w-12 h-12 wobbly-border-sm flex items-center justify-center shadow-lg transition-all -rotate-3 ${theme === 'dark' ? 'bg-ink-deep text-parchment border-white/20' : 'bg-white text-ink/40 border-ink/10'}`}
                        title="Dark Mode"
                    >
                        <Moon className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Main Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                onDoubleClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`w-14 h-14 bg-pine hover:bg-pine-light text-parchment wobbly-border flex items-center justify-center shadow-xl transition-all active:scale-90 border-2 border-white/20 ${isOpen ? 'rotate-45' : 'hover:rotate-12'}`}
                aria-label="Toggle Theme Menu"
            >
                {isOpen ? (
                    <X className="w-6 h-6 rotate-[-45deg]" />
                ) : (
                    theme === "dark" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />
                )}
            </button>
        </div>
    );
}
