/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/onboarding');
    }

    // Arahkan ke dashboard masing-masing sesuai role
    if (session.user.role === 'admin' || session.user.role === 'author') {
        redirect('/admin/dashboard');
    } else {
        redirect('/user/dashboard');
    }

    return null; // Tidak akan pernah dirender
}
