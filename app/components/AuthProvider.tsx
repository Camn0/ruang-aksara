'use client';

import { SessionProvider } from 'next-auth/react';

// Mengapa: SessionProvider bawaan NextAuth HANYA bisa berjalan di Client Component.
// Karena app/layout.tsx di App Router by default adalah Server Component,
// kita membungkus SessionProvider ke dalam komponen klien terpisah (AuthProvider).
export default function AuthProvider({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider
            refetchOnWindowFocus={false}
            refetchInterval={0}
        >
            {children}
        </SessionProvider>
    );
}
