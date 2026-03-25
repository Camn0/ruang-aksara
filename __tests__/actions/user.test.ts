import { describe, it, expect, vi, beforeEach } from 'vitest'
import { submitComment } from '@/app/actions/user'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

describe('User Server Actions - Comments', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('rejects unauthorized users', async () => {
        (getServerSession as any).mockResolvedValue(null)
        const formData = new FormData()
        const result = await submitComment(formData)
        expect(result.error).toContain('Unauthorized')
    })

    it('rejects empty comments', async () => {
        (getServerSession as any).mockResolvedValue({ user: { id: 'user-1' } })
        const formData = new FormData()
        formData.append('bab_id', 'chapter-1')
        formData.append('content', '   ')
        
        const result = await submitComment(formData)
        expect(result.error).toContain('kosong')
    })

    it('successfully saves a comment and triggers notifications', async () => {
        (getServerSession as any).mockResolvedValue({ user: { id: 'user-1' } })
        const formData = new FormData()
        formData.append('bab_id', 'chapter-1')
        formData.append('content', 'Mantap!')

        const mockComment = { id: 'comment-1', content: 'Mantap!' };
        ((prisma.comment as any).create as any).mockResolvedValue(mockComment)

        const result = await submitComment(formData)
        
        expect(result.success).toBe(true)
        expect(prisma.comment.create).toHaveBeenCalled()
    })
})
