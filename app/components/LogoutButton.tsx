/**
 * @file LogoutButton.tsx
 * @description Interactive UI trigger dedicated to terminating the active NextAuth session gracefully.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

/**
 * LogoutButton: Encapsulates the explicit React DOM lifecycle and state-management for the logout button interactive workflow.
 */
export default function LogoutButton({ expanded = true }: { expanded?: boolean }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`flex items-center gap-2.5 bg-brown-dark dark:bg-tan-primary text-text-accent dark:text-brown-dark hover:bg-brown-mid dark:hover:bg-tan-light active:scale-95 transition-all duration-200 rounded-full font-black text-xs uppercase tracking-widest ${expanded ? 'px-6 py-3 justify-start' : 'w-12 h-12 justify-center shadow-lg'}`}
            title={!expanded ? "Keluar Sesi" : ""}
        >
            <LogOut className="w-4 h-4 shrink-0" />
            {expanded && <span className="whitespace-nowrap">Keluar Sesi</span>}
        </button>
    );
}