/**
 * @file actions.ts
 * @description Headless logical module executing transactional dataflows or caching parameters within the Server Logic Backend.
 * @author Ruang Aksara Engineering Team
 */

'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { display_name: string; avatar_url: string }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) throw new Error("Not Authorized")

    if (!data.display_name.trim()) throw new Error("Display name must not be empty");

    await prisma.user.update({
        where: { id: session.user.id },
        data: {
            display_name: data.display_name.trim(),
            avatar_url: data.avatar_url.trim() || null,
        }
    })

    revalidatePath(`/profile/${session.user.id}`)
    revalidatePath('/profile/edit')

    return { success: true }
}
