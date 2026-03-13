'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton({ expanded = true }: { expanded?: boolean }) {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className={`flex items-center gap-2.5 bg-[#2d2118] text-[#e8d5c0] hover:bg-[#3d2f22] active:scale-95 transition-all duration-200 rounded-full font-semibold text-sm ${expanded ? 'px-5 py-2.5 justify-start' : 'w-10 h-10 justify-center'}`}
            title={!expanded ? "Keluar Sesi" : ""}
        >
            <LogOut className="w-4 h-4 shrink-0" />
            {expanded && <span className="whitespace-nowrap">Keluar Sesi</span>}
        </button>
    );
}