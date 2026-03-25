import { describe, it, expect } from 'vitest'
import { middlewareConfig } from '@/middleware'

describe('Middleware RBAC Security', () => {
    const { authorized } = middlewareConfig.callbacks

    it('allows access for admin role', () => {
        const token = { role: 'admin' }
        expect(authorized({ token } as any)).toBe(true)
    })

    it('allows access for author role', () => {
        const token = { role: 'author' }
        expect(authorized({ token } as any)).toBe(true)
    })

    it('denies access for reader role', () => {
        const token = { role: 'reader' }
        expect(authorized({ token } as any)).toBe(false)
    })

    it('denies access for unauthenticated users (no token)', () => {
        expect(authorized({ token: null } as any)).toBe(false)
    })
})
