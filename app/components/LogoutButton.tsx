'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton({ expanded = true }: { expanded?: boolean }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`flex items-center gap-3 w-full p-3 rounded-2xl text-text-accent hover:bg-brown-dark/20 transition-all font-bold text-sm ${expanded ? 'justify-start' : 'justify-center'}`}
            title={!expanded ? "Keluar Sesi" : ""}
        >
            <div className="w-8 h-8 rounded-full bg-brown-dark/30 flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4" />
            </div>
            {expanded && <span className="whitespace-nowrap animate-in fade-in">Keluar Sesi</span>}
        </button>
    );
}
