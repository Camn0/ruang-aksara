/**
 * @file LogoutSettingsButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { signOut } from 'next-auth/react';

/**
 * LogoutSettingsButton: Encapsulates the explicit React DOM lifecycle and state-management for the logout settings button interactive workflow.
 */
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
