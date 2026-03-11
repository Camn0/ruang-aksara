'use client';

import { signOut } from 'next-auth/react';

export default function LogoutSettingsButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/auth/login' })}
            className="w-full py-5 bg-ink-deep text-parchment font-journal-title text-xl italic wobbly-border paper-shadow shadow-xl hover:bg-black hover:rotate-1 active:scale-95 transition-all text-center"
        >
            Tinggalkan Catatan (Logout)
        </button>
    );
}
