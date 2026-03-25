import { describe, it, expect, vi, beforeEach } from 'vitest'
import { registerUser } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

vi.mock('bcryptjs', () => ({
    default: {
        hash: vi.fn(() => Promise.resolve('hashed_password'))
    }
}))

describe('Auth Server Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns error if fields are missing', async () => {
        const formData = new FormData()
        const result = await registerUser(formData)
        expect(result.error).toBeDefined()
        expect(result.error).toContain('wajib diisi')
    })

    it('blocks short passwords', async () => {
        const formData = new FormData()
        formData.append('username', 'testuser')
        formData.append('password', '123')
        formData.append('display_name', 'Test User')
        
        const result = await registerUser(formData)
        expect(result.error).toBe('Password minimal 6 karakter.')
    })

    it('prevents duplicate usernames', async () => {
        const formData = new FormData()
        formData.append('username', 'existing_user')
        formData.append('password', 'password123')
        formData.append('display_name', 'Test User');

        (prisma.user.findUnique as any).mockResolvedValue({ id: '1', username: 'existing_user' })

        const result = await registerUser(formData)
        expect(result.error).toContain('sudah terdaftar')
    })

    it('successfully creates a user with role "user"', async () => {
        const formData = new FormData()
        formData.append('username', 'new_user')
        formData.append('password', 'password123')
        formData.append('display_name', 'New User');

        (prisma.user.findUnique as any).mockResolvedValue(null);
        (prisma.user.create as any).mockResolvedValue({ username: 'new_user' })

        const result = await registerUser(formData)
        
        expect(result.success).toBe(true)
        expect(prisma.user.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({
                username: 'new_user',
                role: 'user'
            })
        }))
    })
})
