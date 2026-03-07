'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center"
            title="Keluar"
        >
            <LogOut className="w-6 h-6" />
        </button>
    );
}
