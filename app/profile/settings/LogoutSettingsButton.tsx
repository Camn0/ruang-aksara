'use client';

import { signOut } from 'next-auth/react';

export default function LogoutSettingsButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full py-4 bg-gray-900 text-white rounded-full font-bold text-sm tracking-widest uppercase shadow-xl shadow-gray-200 hover:bg-black active:scale-95 transition-all text-center"
        >
            Keluar dari Akun
        </button>
    );
}
