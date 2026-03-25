import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitChapterReaction } from '@/app/actions/chapter'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('Chapter Server Actions - Reactions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('denies reactions for unauthenticated sessions', async () => {
        (getServerSession as any).mockResolvedValue(null)
        const result = await submitChapterReaction('chapter-1', 'LIKE', 'novel-1')
        expect(result.error).toContain('Unauthorized')
    })

    it('successfully upserts a reaction', async () => {
        (getServerSession as any).mockResolvedValue({ user: { id: 'user-1' } });
        
        (prisma.chapterReaction.upsert as any).mockResolvedValue({ id: 'react-1' })

        const result = await submitChapterReaction('chapter-1', 'LOVE', 'novel-1')
        
        expect(result.success).toBe(true)
        expect(prisma.chapterReaction.upsert).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({
                user_id_bab_id: { user_id: 'user-1', bab_id: 'chapter-1' }
            }),
            create: expect.objectContaining({ reaction_type: 'LOVE' })
        }))
    })
})
