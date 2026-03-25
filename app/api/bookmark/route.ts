/**
 * @file route.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the REST Architecture.
 * @author Ruang Aksara Engineering Team
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { karyaId } = await req.json();
        if (!karyaId) return NextResponse.json({ error: 'karyaId is required' }, { status: 400 });

        // Cek apakah sudah di-bookmark
        const existing = await prisma.bookmark.findUnique({
            where: {
                user_id_karya_id: { user_id: session.user.id, karya_id: karyaId }
            }
        });

        if (existing) {
            await prisma.bookmark.delete({
                where: { user_id_karya_id: { user_id: session.user.id, karya_id: karyaId } }
            });
            return NextResponse.json({ bookmarked: false });
        } else {
            // Ambil bab 1 jika ada sebagai default
            const firstBab = await prisma.bab.findFirst({
                where: { karya_id: karyaId },
                orderBy: { chapter_no: 'asc' }
            });

            await prisma.bookmark.create({
                data: {
                    user_id: session.user.id,
                    karya_id: karyaId,
                    last_chapter: firstBab ? firstBab.chapter_no : 1
                }
            });
            return NextResponse.json({ bookmarked: true });
        }
    } catch (error) {
        console.error("Bookmark API Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
