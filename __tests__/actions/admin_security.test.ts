import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerAuthor, editKarya, createKarya } from '@/app/actions/admin'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'

vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            create: vi.fn(),
        },
        karya: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
        bab: {
            create: vi.fn(),
        },
        $transaction: vi.fn((callback) => callback(prisma)),
    },
}))
vi.mock('bcryptjs', () => ({
    default: { hash: vi.fn().mockResolvedValue('hashed_pw') }
}))
vi.mock('@/lib/imageKit', () => ({
    uploadToImageKit: vi.fn().mockResolvedValue('http://ik.imagekit/test.jpg')
}))
vi.mock('./notification', () => ({
    createNotification: vi.fn().mockResolvedValue({})
}))

describe('Admin Action Security (RBAC & Ownership)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('createKarya (Atomic Integrity)', () => {
        it('handles failures in chapter creation gracefully', async () => {
            (getServerSession as any).mockResolvedValue({ user: { id: 'admin-1', role: 'admin' } });
            (prisma.user.findUnique as any).mockResolvedValue({ id: 'admin-1', username: 'admin' });
            
            // Simulate inner transaction failure
            (prisma.karya.create as any).mockResolvedValue({ id: 'karya-1' });
            (prisma.bab.create as any).mockRejectedValue(new Error('Chapter creation failed'));

            const formData = new FormData()
            formData.append('title', 'Novel Gagal')
            formData.append('bab_content', 'Ini bab yang akan gagal')

            const result = await createKarya(formData)
            expect(result.error).toContain('kesalahan pada sistem')
        })
    })

    describe('registerAuthor', () => {
        it('blocks non-admin users from registering authors', async () => {
            (getServerSession as any).mockResolvedValue({ user: { role: 'author' } })
            const result = await registerAuthor(new FormData())
            expect(result.error).toContain('Unauthorized')
        })

        it('allows admin users to register authors', async () => {
            (getServerSession as any).mockResolvedValue({ user: { role: 'admin' } })
            const formData = new FormData()
            formData.append('username', 'newauthor')
            formData.append('display_name', 'New Author')
            formData.append('password', 'password123');
            
            (prisma.user.findUnique as any).mockResolvedValue(null);
            (prisma.user.create as any).mockResolvedValue({ id: '1' })

            const result = await registerAuthor(formData)
            expect(result.success).toBe(true)
        })
    })

    describe('editKarya (Ownership Gating)', () => {
        it('blocks authors from editing works they do not own', async () => {
            (getServerSession as any).mockResolvedValue({ user: { id: 'author-1', role: 'author' } });
            (prisma.karya.findUnique as any).mockResolvedValue({ id: 'karya-1', uploader_id: 'author-2' })

            const formData = new FormData()
            formData.append('id', 'karya-1')
            formData.append('title', 'Stolen Novel')

            const result = await editKarya(formData)
            expect(result.error).toContain('Forbidden')
        })

        it('allows authors to edit their own works', async () => {
            (getServerSession as any).mockResolvedValue({ user: { id: 'author-1', role: 'author' } });
            (prisma.karya.findUnique as any).mockResolvedValue({ id: 'karya-1', uploader_id: 'author-1' });
            (prisma.user.findUnique as any).mockResolvedValue({ username: 'author1' });
            (prisma.karya.update as any).mockResolvedValue({ id: 'karya-1' })

            const formData = new FormData()
            formData.append('id', 'karya-1')
            formData.append('title', 'My Novel Updated')

            const result = await editKarya(formData)
            expect(result.success).toBe(true)
        })
    })
})
