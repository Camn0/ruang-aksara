"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <button className="w-9 h-9 flex items-center justify-center rounded-full text-gray-500 bg-gray-100 animate-pulse">
                <div className="w-5 h-5" />
            </button>
        );
    }

    return (
        <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-text-accent hover:bg-white/10 transition-colors"
            aria-label="Toggle Dark Mode"
        >
            {theme === "dark" ? <Sun className="w-5 h-5 shadow-sm" /> : <Moon className="w-5 h-5 shadow-sm" />}
        </button>
    );
}
